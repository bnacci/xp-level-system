export const versions = ["1.1.0", "1.0.0"] as const;
export type DocsVersion = (typeof versions)[number];
export const latestVersion: DocsVersion = versions[0];
export function resolveVersion(value?: string): DocsVersion {
  return versions.find((version) => version === value) ?? latestVersion;
}

export const features = [
  {
    name: "XPSystem",
    since: "1.0.0",
    description:
      "XP calculations and level-change results without owning player state.",
    topic: "xp-system",
  },
  {
    name: "Progression curves",
    since: "1.0.0",
    description:
      "Linear, quadratic, exponential, and custom cumulative XP thresholds.",
    topic: "configuration",
  },
  {
    name: "Level bounds & progress",
    since: "1.0.0",
    description:
      "Minimum/maximum levels, progress snapshots, and XP formatting.",
    topic: "quick-start",
  },
  {
    name: "TypeScript / CJS / ESM",
    since: "1.0.0",
    description: "Typed public API and dual JavaScript builds.",
    topic: "types",
  },
  {
    name: "Typed events",
    since: "1.1.0",
    description:
      "XP and level events with subscriptions, one-time listeners, and cleanup.",
    topic: "events",
  },
  {
    name: "Ranks & tiers",
    since: "1.1.0",
    description: "Named rank definitions, next tier, and progress toward it.",
    topic: "ranks",
  },
  {
    name: "Reward multipliers & reasons",
    since: "1.1.0",
    description: "Reward options for boosted XP and source tags on XP changes.",
    topic: "events",
  },
  {
    name: "AchievementTracker",
    since: "1.1.0",
    description:
      "Custom badge conditions, hidden achievements, helpers, and serialization.",
    topic: "achievements",
  },
  {
    name: "Player",
    since: "1.1.0",
    description:
      "A stateful player connecting XP, ranks, achievements, events, and persistence.",
    topic: "player",
  },
  {
    name: "Prestige",
    since: "1.1.0",
    description:
      "New progression runs with permanent reward bonuses and retained achievements.",
    topic: "prestige",
  },
  {
    name: "Leaderboard",
    since: "1.1.0",
    description:
      "Pure XP ranking with shared positions for ties and derived levels.",
    topic: "leaderboard",
  },
] as const;

export function hasFeature(version: DocsVersion, since: string) {
  const target = version.split(".").map(Number);
  const introduced = since.split(".").map(Number);
  for (let index = 0; index < 3; index++) {
    if (target[index] !== introduced[index])
      return target[index] > introduced[index];
  }
  return true;
}

export const releases = [
  {
    version: "1.1.0" as const,
    date: "September 19, 2026",
    title: "From XP engine to progression toolkit",
    description:
      "Adds events, ranks, reward modifiers, achievements, Player, prestige, and leaderboard helpers. The changelog declares this release backward-compatible with 1.0.0.",
    changed: [
      "Package description and keywords updated to reflect the broader progression toolkit.",
    ],
    source:
      "https://github.com/bnacci/xp-level-system/blob/e91b47a1b66aa112b38fa8c587ba55dfbc6626e6/CHANGELOG.md",
  },
  {
    version: "1.0.0" as const,
    date: "Initial version · repository snapshot",
    title: "The core XP engine",
    description:
      "The initial package includes XPSystem, configurable curves, level bounds, progress snapshots, TypeScript types, and CJS/ESM builds. This entry is reconstructed from the initial source revision; no publication date is inferred.",
    changed: [],
    source: "https://github.com/bnacci/xp-level-system/tree/9e750b6",
  },
];
