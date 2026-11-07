import { docs, type DocSection } from "./docs";
import type { DocsVersion } from "./releases";

// Core calculations are shared; 1.1-only APIs are explicitly removed below.
export function getDocs(version: DocsVersion): DocSection[] {
  if (version === "1.1.0") return docs;
  const quickStart = docs.find((section) => section.id === "quick-start")!;
  const config = docs.find((section) => section.id === "configuration")!;
  const api = docs.find((section) => section.id === "xp-system")!;
  return [
    {
      id: "installation",
      title: "Installation",
      group: "Getting started",
      paragraphs: [
        "Version 1.0.0 provides the stateless XPSystem engine: level calculations, four progression curves, level bounds, and TypeScript types. Player, ranks, achievements, events, prestige, and leaderboards arrive in 1.1.0.",
        "This reference is based on the initial source revision. Install the exact version to follow these examples.",
      ],
      examples: [
        { name: "terminal", code: "npm install xp-level-system@1.0.0" },
      ],
    },
    quickStart,
    {
      ...config,
      paragraphs: [
        "Curves define the cumulative XP needed to reach a level. In 1.0.0, multiplier controls exponential curve growth; per-reward multipliers are not available.",
      ],
      table: {
        ...config.table!,
        rows: config.table!.rows.filter((row) => row[0] !== "ranks"),
      },
    },
    {
      ...api,
      paragraphs: [
        "XPSystem does not retain player state. Pass totalXP into each operation and save result.levelInfo.totalXP afterward. XPChangeResult contains levelInfo, xpDelta, levelsChanged, didLevelUp, and didLevelDown. Version 1.0.0 does not emit events or accept reward options.",
      ],
      table: {
        ...api.table!,
        rows: api
          .table!.rows.filter((row) => row[0] !== "getRank(level)")
          .map((row) => [row[0].replace(", options?", ""), row[1]]),
      },
      examples: [
        {
          name: "rewards.ts",
          code: `import { XPSystem } from "xp-level-system";
const system = new XPSystem({ baseXP: 100 });
const reward = system.addXP(400, 100);
reward.levelInfo.totalXP; // 500
const penalty = system.removeXP(500, 50);
penalty.levelInfo.totalXP; // 450
system.xpForLevel(3); // 400
system.xpRequiredForLevel(3); // 500`,
        },
      ],
      note: "Reward options, reason tags, events, and getRank are added in 1.1.0. In 1.0.0, calculate any reward bonus in your own application before calling addXP.",
    },
    {
      id: "persistence",
      title: "Save & restore",
      group: "Integrations",
      paragraphs: [
        "Store totalXP in your database. XPSystem derives the rest when you load it; there is no Player snapshot API in 1.0.0.",
      ],
      examples: [
        {
          name: "persistence.ts",
          code: `import { XPSystem } from "xp-level-system";
const system = new XPSystem({ baseXP: 100 });
const savedTotalXP = 450; // Read from your database.
const progress = system.getLevelInfo(savedTotalXP);
progress.level; // 3
const result = system.addXP(savedTotalXP, 100);
const totalXPToSave = result.levelInfo.totalXP; // 550`,
        },
      ],
    },
    {
      id: "react",
      title: "React & Next.js",
      group: "Integrations",
      paragraphs: [
        "Store the XP total in React state and derive the progress snapshot. Use a client component in Next.js for event handlers. This pattern works without Player.",
      ],
      examples: [
        {
          name: "Progress.tsx",
          code: `"use client";
import { useState } from "react";
import { XPSystem } from "xp-level-system";
const system = new XPSystem({ baseXP: 100, maxLevel: 10 });

export function Progress() {
  const [totalXP, setTotalXP] = useState(0);
  const progress = system.getLevelInfo(totalXP);
  return <section>
    <p>Level {progress.level} · {totalXP} XP</p>
    <button onClick={() => setTotalXP(current =>
      system.addXP(current, 100).levelInfo.totalXP
    )}>Complete a lesson</button>
  </section>;
}`,
        },
      ],
    },
    {
      id: "types",
      title: "TypeScript exports",
      group: "Integrations",
      paragraphs: [
        "Version 1.0.0 exports XPSystem and the following four public types. Other classes, helpers, and types in the current documentation require 1.1.0.",
      ],
      examples: [
        {
          name: "types.ts",
          code: `import { XPSystem } from "xp-level-system";
import type {
  XPSystemConfig, LevelCurve, LevelInfo, XPChangeResult,
} from "xp-level-system";`,
        },
      ],
    },
  ];
}
