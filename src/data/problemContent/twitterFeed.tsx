import type { ProblemContent } from "./types";

export const twitterFeed: ProblemContent = {
  requirements: {
    functional: [
      "Post a tweet (text, up to a fixed character limit)",
      "Follow / unfollow other users",
      "View a home timeline of tweets from followed users, ordered roughly by recency",
      "Like and retweet a post",
    ],
    nonFunctional: [
      "Home timeline reads must be fast (this is the most frequent operation by far)",
      "Must handle celebrity accounts with tens of millions of followers without a write storm",
      "Eventual consistency is acceptable — a tweet appearing a second late in followers' feeds is fine",
      "High write throughput for tweet creation at global scale",
    ],
  },
  diagramNodes: [
    { id: "client", label: "Client", x: 6, y: 50, kind: "client" },
    { id: "tweetService", label: "Tweet Service", x: 32, y: 20, kind: "server" },
    { id: "fanoutService", label: "Fan-out Service", x: 32, y: 80, kind: "server" },
    { id: "timelineCache", label: "Timeline Cache (Redis)", x: 62, y: 50, kind: "cache" },
    { id: "tweetDb", label: "Tweet Store", x: 90, y: 20, kind: "db" },
    { id: "followGraph", label: "Follow Graph DB", x: 90, y: 80, kind: "db" },
  ],
  diagramEdges: [
    { id: "e1", from: "client", to: "tweetService" },
    { id: "e2", from: "tweetService", to: "tweetDb" },
    { id: "e3", from: "tweetService", to: "fanoutService" },
    { id: "e4", from: "fanoutService", to: "followGraph" },
    { id: "e5", from: "fanoutService", to: "timelineCache" },
  ],
  solutionSteps: [
    {
      title: "A user posts a tweet",
      description:
        "The tweet service receives the new tweet and durably stores its content in the tweet store, independent of who needs to see it.",
      revealNodeIds: ["client", "tweetService", "tweetDb"],
      revealEdgeIds: ["e1", "e2"],
    },
    {
      title: "The fan-out service looks up followers",
      description:
        "The tweet is handed off to a fan-out service, which queries the follow graph to find everyone who follows this author.",
      revealNodeIds: ["fanoutService", "followGraph"],
      revealEdgeIds: ["e3", "e4"],
    },
    {
      title: "Push the tweet ID into each follower's precomputed timeline",
      description:
        "For a typical user, the fan-out service pushes the new tweet's ID into every follower's precomputed timeline list in Redis — this is fan-out on write.",
      revealNodeIds: ["timelineCache"],
      revealEdgeIds: ["e5"],
    },
    {
      title: "Celebrities skip fan-out on write",
      description:
        "For an account with millions of followers, pushing to every follower's timeline instantly would be a massive write storm. Instead, their tweets are merged into followers' timelines at read time — fan-out on read.",
      revealNodeIds: [],
      revealEdgeIds: [],
    },
    {
      title: "Reading the timeline is O(1)",
      description:
        "Viewing the home timeline just reads the precomputed list from Redis (merging in any followed celebrities' recent tweets), instead of querying every followed user's tweets live — the read path stays fast regardless of follow count.",
      revealNodeIds: [],
      revealEdgeIds: [],
    },
  ],
  capacity: {
    inputs: [
      { key: "dau", label: "Daily active users", min: 1_000_000, max: 500_000_000, step: 1_000_000, default: 200_000_000, unit: "" },
      { key: "avgFollowers", label: "Avg followers per user", min: 10, max: 2_000, step: 10, default: 200, unit: "" },
      { key: "tweetsPerUserPerDay", label: "Tweets per user per day", min: 0.1, max: 5, step: 0.1, default: 0.5, unit: "" },
    ],
    compute: (v) => {
      const tweetsPerDay = v.dau * v.tweetsPerUserPerDay;
      const fanoutWritesPerDay = tweetsPerDay * v.avgFollowers;
      const fanoutWritesPerSec = fanoutWritesPerDay / 86_400;
      return [
        { label: "Tweets / day", value: (tweetsPerDay / 1e6).toFixed(1) + "M" },
        { label: "Fan-out writes / day", value: (fanoutWritesPerDay / 1e9).toFixed(2) + "B" },
        { label: "Fan-out writes / sec", value: fanoutWritesPerSec.toFixed(0) },
      ];
    },
    chartData: (v) => {
      const tweetsPerDay = v.dau * v.tweetsPerUserPerDay;
      const fanoutWritesPerSec = (tweetsPerDay * v.avgFollowers) / 86_400;
      return [
        { name: "Tweets/sec", value: Math.round(tweetsPerDay / 86_400) },
        { name: "Fan-out writes/sec", value: Math.round(fanoutWritesPerSec) },
      ];
    },
    chartUnit: "",
  },
  keyDecisions: [
    {
      decision: "Hybrid fan-out: push for normal users, pull for celebrities",
      why: "Fan-out on write gives O(1) fast reads for the common case, but naively applying it to a celebrity with 50M followers would mean 50M writes for a single tweet. Merging celebrity tweets at read time avoids that write storm entirely.",
    },
    {
      decision: "Timeline cache stores tweet IDs, not full content",
      why: "Keeping the precomputed timeline lightweight (just IDs) makes fan-out writes cheap and keeps Redis memory usage manageable; full tweet content is fetched from the tweet store in bulk when rendering.",
    },
    {
      decision: "Accept eventual consistency for feed delivery",
      why: "A tweet appearing in a follower's feed a second or two late is an acceptable tradeoff for the massive throughput gains of asynchronous fan-out.",
    },
  ],
  commonMistakes: [
    "Applying pure fan-out-on-write to every account, causing a write storm on celebrity tweets",
    "Recomputing the entire timeline live on every read by querying all followed users' tweets",
    "Not recognizing that timeline reads vastly outnumber tweet writes — optimizing for the wrong path",
    "Storing full tweet content inside the timeline cache instead of just IDs",
  ],
  companyNote: {
    company: "Twitter / X",
    note: "Twitter's real timeline architecture uses exactly this hybrid fan-out model — precomputed, cached timelines for the vast majority of accounts, with celebrity tweets merged in at read time to sidestep the 'celebrity problem' of fanning out a single tweet to tens of millions of followers instantly.",
  },
};
