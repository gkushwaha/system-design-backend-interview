import type { ProblemContent } from "./types";

export const uber: ProblemContent = {
  requirements: {
    functional: [
      "Rider requests a ride and is matched with a nearby available driver",
      "Both rider and driver see real-time location updates during the trip",
      "Estimate fare and ETA before and during the ride",
      "Driver can accept or decline a ride request",
    ],
    nonFunctional: [
      "Very low latency matching — riders expect a driver match within seconds",
      "Handle millions of concurrent, continuous driver location updates",
      "Geographically partitioned — a match only ever needs drivers in the same city/region",
      "High availability — this is the core revenue-generating path",
    ],
  },
  diagramNodes: [
    { id: "rider", label: "Rider App", x: 6, y: 25, kind: "client" },
    { id: "driver", label: "Driver App", x: 6, y: 80, kind: "client" },
    { id: "location", label: "Location Service", x: 32, y: 80, kind: "server" },
    { id: "matching", label: "Matching Service", x: 58, y: 25, kind: "server" },
    { id: "geoindex", label: "Geospatial Index (Redis/H3)", x: 58, y: 80, kind: "cache" },
    { id: "trips", label: "Trip Store", x: 90, y: 50, kind: "db" },
  ],
  diagramEdges: [
    { id: "e1", from: "driver", to: "location" },
    { id: "e2", from: "location", to: "geoindex" },
    { id: "e3", from: "rider", to: "matching" },
    { id: "e4", from: "matching", to: "geoindex" },
    { id: "e5", from: "matching", to: "trips" },
  ],
  solutionSteps: [
    {
      title: "Drivers continuously stream their location",
      description:
        "Every few seconds, the driver app sends its current GPS coordinates to a location service — a lightweight, high-frequency write path, separate from the durable trip data.",
      revealNodeIds: ["driver", "location"],
      revealEdgeIds: ["e1"],
    },
    {
      title: "Locations are written into a geospatial index",
      description:
        "The location service updates a geospatial index (e.g. Redis with H3 hexagonal cells) mapping regions to currently-available drivers — optimized for fast 'who's nearby' queries, not durability.",
      revealNodeIds: ["geoindex"],
      revealEdgeIds: ["e2"],
    },
    {
      title: "Rider requests a ride",
      description:
        "The rider app sends a ride request with pickup location to the matching service.",
      revealNodeIds: ["rider", "matching"],
      revealEdgeIds: ["e3"],
    },
    {
      title: "Matching service queries nearby available drivers",
      description:
        "The matching service queries the geospatial index for available drivers in the rider's cell (and neighboring cells), then ranks candidates by distance, ETA, and driver rating.",
      revealNodeIds: [],
      revealEdgeIds: ["e4"],
    },
    {
      title: "A trip record is created once a driver accepts",
      description:
        "Once a driver accepts, a durable trip record is created in the trip store, and both apps switch to real-time bidirectional updates (WebSocket) for the duration of the ride.",
      revealNodeIds: ["trips"],
      revealEdgeIds: ["e5"],
    },
  ],
  capacity: {
    inputs: [
      { key: "activeDrivers", label: "Concurrently active drivers", min: 10_000, max: 5_000_000, step: 10_000, default: 1_000_000, unit: "" },
      { key: "updateIntervalSec", label: "Location update interval", min: 1, max: 10, step: 1, default: 4, unit: "s" },
    ],
    compute: (v) => {
      const updatesPerSec = v.activeDrivers / v.updateIntervalSec;
      const dailyWrites = updatesPerSec * 86_400;
      return [
        { label: "Location updates / sec", value: updatesPerSec.toFixed(0) },
        { label: "Location writes / day", value: (dailyWrites / 1e9).toFixed(2) + "B" },
        { label: "Update interval", value: `${v.updateIntervalSec}s` },
      ];
    },
    chartData: (v) => {
      const updatesPerSec = v.activeDrivers / v.updateIntervalSec;
      return [{ name: "Location updates/sec", value: Math.round(updatesPerSec) }];
    },
    chartUnit: "",
  },
  keyDecisions: [
    {
      decision: "A geospatial index (H3 hexagonal cells) separate from durable trip storage",
      why: "Location lookups need to be extremely fast and are ephemeral (only the latest position matters) — this doesn't belong in the same durable, transactional store as trip records.",
    },
    {
      decision: "Location updates are fire-and-forget, not strongly consistent writes",
      why: "A slightly stale driver position is harmless; treating every update as a durable, strongly consistent write would add unnecessary latency and cost at this volume.",
    },
    {
      decision: "Switch to WebSocket for real-time updates once a trip starts",
      why: "During an active trip, both rider and driver need continuous low-latency position updates — a persistent connection avoids the overhead of repeated polling.",
    },
  ],
  commonMistakes: [
    "Proposing a full table scan or naive distance calculation over all drivers instead of a geospatial index",
    "Treating every location ping as a durable, strongly consistent database write",
    "Forgetting real-time bidirectional updates are needed once a trip is active, not just for initial matching",
    "Not handling a driver going offline or declining mid-match",
  ],
  companyNote: {
    company: "Uber",
    note: "Uber built and open-sourced H3, a hexagonal hierarchical geospatial indexing system, specifically to make 'find nearby drivers' queries fast and evenly distributed at global scale — a direct answer to this exact design problem.",
  },
};
