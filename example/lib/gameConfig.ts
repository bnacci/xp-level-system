import type { PlayerConfig, RankDefinition } from "xp-level-system";
import { levelAchievement, xpAchievement, prestigeAchievement } from "xp-level-system";

export const RANKS: RankDefinition[] = [
  { name: "Recruit", minLevel: 1, color: "#9aa3c2", icon: "🔰" },
  { name: "Bronze", minLevel: 3, color: "#cd7f32", icon: "🥉" },
  { name: "Silver", minLevel: 6, color: "#c7d0e0", icon: "🥈" },
  { name: "Gold", minLevel: 10, color: "#ffd257", icon: "🥇" },
  { name: "Platinum", minLevel: 15, color: "#7fe7d8", icon: "💠" },
  { name: "Diamond", minLevel: 20, color: "#8fd3ff", icon: "💎" },
  { name: "Legend", minLevel: 25, color: "#ff8ad8", icon: "👑" },
];

export const MAX_LEVEL = 25;

export const GAME_CONFIG: PlayerConfig = {
  xpSystem: {
    baseXP: 120,
    curve: "quadratic",
    maxLevel: MAX_LEVEL,
    ranks: RANKS,
  },
  achievements: [
    levelAchievement("first-blood", 2, {
      name: "First Blood",
      description: "Reach level 2.",
      icon: "🗡️",
    }),
    levelAchievement("bronze-tier", 3, {
      name: "Bronze Tier",
      description: "Promote to the Bronze rank.",
      icon: "🥉",
    }),
    levelAchievement("silver-tier", 6, {
      name: "Silver Tier",
      description: "Promote to the Silver rank.",
      icon: "🥈",
    }),
    levelAchievement("gold-tier", 10, {
      name: "Gold Tier",
      description: "Promote to the Gold rank.",
      icon: "🥇",
    }),
    xpAchievement("grinder", 2_000, {
      name: "Grinder",
      description: "Earn a total of 2,000 XP.",
      icon: "⚔️",
    }),
    xpAchievement("no-life", 8_000, {
      name: "No-Life",
      description: "Earn a total of 8,000 XP.",
      icon: "🔥",
    }),
    levelAchievement("max-level", MAX_LEVEL, {
      name: "Ascended",
      description: `Reach the maximum level (${MAX_LEVEL}).`,
      icon: "🌟",
    }),
    prestigeAchievement("reborn", 1, {
      name: "Reborn",
      description: "Prestige for the first time.",
      icon: "♻️",
    }),
    {
      id: "secret-hoarder",
      name: "???",
      description: "???",
      hidden: true,
      icon: "🎭",
      condition: (ctx) => ctx.totalXP >= 20_000,
    },
  ],
  prestige: {
    enabled: true,
    requiredLevel: MAX_LEVEL,
    bonusPerPrestige: 0.1,
    maxPrestige: 5,
  },
};

export interface QuestDefinition {
  id: string;
  label: string;
  xp: number;
  icon: string;
  cooldownMs?: number;
}

export const QUESTS: QuestDefinition[] = [
  { id: "daily-login", label: "Daily Login", xp: 40, icon: "📅", cooldownMs: 4000 },
  { id: "side-quest", label: "Complete Side Quest", xp: 120, icon: "🗺️", cooldownMs: 2000 },
  { id: "dungeon-clear", label: "Clear Dungeon", xp: 350, icon: "🏰", cooldownMs: 3000 },
  { id: "boss-kill", label: "Defeat World Boss", xp: 900, icon: "🐉", cooldownMs: 6000 },
];

/** Simulated rival players so the leaderboard doesn't feel empty on first load. */
export const RIVAL_PLAYERS = [
  { id: "shadowfox", name: "ShadowFox", totalXP: 18_400, avatar: "🦊" },
  { id: "ironclad", name: "IronClad", totalXP: 12_950, avatar: "🛡️" },
  { id: "nyx", name: "Nyx", totalXP: 9_200, avatar: "🌙" },
  { id: "brambleking", name: "BrambleKing", totalXP: 4_100, avatar: "🌳" },
  { id: "pixie", name: "Pixie", totalXP: 1_450, avatar: "🧚" },
];
