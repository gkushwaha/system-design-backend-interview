import { DeploymentStrategies } from "@/components/visualizations/DeploymentStrategies";
import type { TopicContent } from "./types";

export const deploymentStrategies: TopicContent = {
  visual: DeploymentStrategies,
  howItWorks: [
    {
      title: "Blue-green: two full environments, instant cutover",
      description:
        "Two identical production environments exist — Blue (current) and Green (new). Traffic is instantly switched from Blue to Green at the load balancer/router level once Green is verified.",
    },
    {
      title: "Blue-green: instant rollback",
      description:
        "If something goes wrong, rollback is just flipping the router back to Blue — no redeploy needed. The cost is running two full production-sized environments simultaneously.",
    },
    {
      title: "Canary: gradual traffic ramp",
      description:
        "A new version receives a small percentage of real traffic first (e.g. 5%), while the rest continues to the stable version. If metrics look healthy, the percentage is gradually increased until it reaches 100%.",
    },
    {
      title: "Canary: limits blast radius",
      description:
        "Because only a fraction of users hit the new version at any point, a bug's impact is proportionally limited — and automated rollback can trigger the moment error rates spike, before most users are affected.",
    },
    {
      title: "Shadow deployment: risk-free real traffic validation",
      description:
        "100% of real traffic continues to be served by the current version. Every request is also mirrored to the new version in parallel, but its response is only logged/compared — never shown to users, so it's true zero user-facing risk while validating against real production traffic patterns.",
    },
  ],
  tradeoffs: {
    pros: [
      "Blue-green: instant rollback capability, simple mental model",
      "Canary: limits blast radius of a bad deploy to a small percentage of users",
      "Shadow: validates new code against real traffic with zero user-facing risk",
    ],
    cons: [
      "Blue-green: requires running two full-sized environments, doubling infrastructure cost during the switch",
      "Canary: requires solid metrics/monitoring to make automated go/no-go decisions, and takes longer to fully roll out",
      "Shadow: doesn't validate real user-facing behavior (responses are discarded) and can't test side-effecting operations easily (e.g. actually charging a payment twice)",
    ],
    whenToUse: [
      "Blue-green — when instant rollback matters more than infrastructure cost, and testing is thorough pre-cutover",
      "Canary — high-traffic, well-monitored systems where gradual, automated rollout reduces risk",
      "Shadow — validating a rewrite's behavior/performance against real traffic before it ever serves real users",
    ],
    whenNotToUse: [
      "Blue-green for cost-constrained environments that can't afford double infrastructure, even briefly",
      "Shadow for validating operations with real side effects (payments, sending emails) without careful isolation",
    ],
    alternatives: [
      { name: "Rolling deployment", note: "Gradually replaces old instances with new ones without a full second environment, common default in Kubernetes" },
      { name: "Feature flags", note: "Decouples deployment from release entirely — new code ships dark, then is turned on by flag independent of the deploy" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd pick the strategy based on risk tolerance and infrastructure budget. For a change I'm fairly confident in but want instant rollback for, I'd use blue-green — cut traffic over all at once, and roll back by flipping the router if needed. For a riskier change on a high-traffic system, I'd use a canary rollout — start at a small percentage, watch error rates and latency, and ramp up automatically only if metrics stay healthy, limiting the blast radius of a bad deploy. For validating a rewrite or performance-sensitive change without any user-facing risk at all, I'd use shadow deployment — mirror real traffic to the new version and compare its behavior, discarding its actual responses.",
    mistakes: [
      "Confusing canary with blue-green — canary is about a gradual traffic percentage, blue-green is an instant full cutover",
      "Not mentioning that shadow deployments can't easily validate operations with real side effects",
      "Assuming any of these replaces the need for automated monitoring and rollback triggers",
    ],
    followUps: [
      "How would you automate the decision to roll back a canary deployment?",
      "Why might shadow deployment struggle with testing a payment processing change?",
      "What's the cost tradeoff of blue-green vs canary?",
    ],
    redFlags: [
      "Not knowing the difference between these three strategies",
      "Suggesting shadow deployment is safe for anything with real side effects, without caveats",
    ],
  },
  challenge: [
    {
      question: "What is the defining characteristic of a canary deployment, as opposed to blue-green?",
      options: [
        "It uses two completely separate database instances",
        "Traffic is gradually ramped to the new version by percentage, rather than switched all at once",
        "It never actually deploys new code",
        "It's identical to blue-green in every way",
      ],
      correctIndex: 1,
      explanation:
        "Canary deployments gradually increase the traffic percentage sent to the new version based on observed health, unlike blue-green's instant all-or-nothing cutover.",
    },
    {
      question: "Why can't a shadow deployment easily validate a change to a payment-charging endpoint?",
      options: [
        "Shadow deployments don't support any endpoint types",
        "The new version's response is discarded, but if it actually executes the side effect (charging a card), that side effect would happen for real, duplicating it",
        "Payment endpoints can't receive HTTP traffic",
        "It works perfectly fine for payments with no caveats",
      ],
      correctIndex: 1,
      explanation:
        "While the shadowed response is discarded, the underlying operation may still execute for real — so any real side effect (like an actual charge) would happen twice unless carefully isolated or mocked.",
    },
  ],
};
