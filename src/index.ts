export { XPSystem } from "./XPSystem";
export { Player } from "./Player";
export {
  AchievementTracker,
  levelAchievement,
  xpAchievement,
  prestigeAchievement,
} from "./AchievementTracker";
export { buildLeaderboard } from "./leaderboard";
export { TypedEmitter } from "./EventEmitter";

export type {
  XPSystemConfig,
  LevelCurve,
  LevelInfo,
  XPChangeResult,
  XPChangeOptions,
  XPSystemEvents,
  RankDefinition,
  RankInfo,
  AchievementContext,
  AchievementDefinition,
  UnlockedAchievement,
  AchievementTrackerState,
  PrestigeConfig,
  PlayerConfig,
  PlayerState,
  PrestigeResult,
  PlayerEvents,
  LeaderboardEntry,
  RankedLeaderboardEntry,
} from "./types";
