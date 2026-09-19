"use client";

export function ControlPanel({
  canPrestige,
  onPrestige,
  onReset,
}: {
  canPrestige: boolean;
  onPrestige: () => void;
  onReset: () => void;
}) {
  return (
    <div className="panel flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
      <div>
        <h3 className="font-display text-lg font-semibold text-slate-100">Prestige</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-400">
          Reset to level 1 in exchange for a permanent +10% XP bonus. Requires reaching max
          level first.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className={`btn-gold ${canPrestige ? "animate-pulse-ring" : ""}`}
          disabled={!canPrestige}
          onClick={onPrestige}
        >
          ⭐ Prestige
        </button>
        <button type="button" className="btn-danger" onClick={onReset}>
          Reset progress
        </button>
      </div>
    </div>
  );
}
