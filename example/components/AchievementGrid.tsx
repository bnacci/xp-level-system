import type { AchievementDefinition, UnlockedAchievement } from "xp-level-system";

export function AchievementGrid({
  unlocked,
  locked,
  completionPercent,
}: {
  unlocked: UnlockedAchievement[];
  locked: AchievementDefinition[];
  completionPercent: number;
}) {
  return (
    <div className="panel rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-slate-100">Achievements</h3>
        <span className="text-xs text-slate-400">{completionPercent}% complete</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {unlocked.map((achievement) => (
          <div
            key={achievement.id}
            className="animate-pop-in rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-center"
            title={achievement.description}
          >
            <div className="text-2xl">{achievement.icon ?? "🏆"}</div>
            <div className="mt-1 text-xs font-semibold text-emerald-200">{achievement.name}</div>
          </div>
        ))}

        {locked.map((achievement) => (
          <div
            key={achievement.id}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center opacity-50"
            title={achievement.description}
          >
            <div className="text-2xl grayscale">{achievement.icon ?? "🔒"}</div>
            <div className="mt-1 text-xs font-semibold text-slate-400">{achievement.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
