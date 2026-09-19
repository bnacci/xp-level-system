"use client";

import { useState } from "react";
import { QUESTS } from "@/lib/gameConfig";

export function QuestList({ onComplete }: { onComplete: (amount: number, reason: string) => void }) {
  const [cooldownUntil, setCooldownUntil] = useState<Record<string, number>>({});

  const handleClick = (id: string, xp: number, label: string, cooldownMs = 0) => {
    onComplete(xp, label);
    if (cooldownMs) {
      const until = Date.now() + cooldownMs;
      setCooldownUntil((c) => ({ ...c, [id]: until }));
      setTimeout(() => setCooldownUntil((c) => ({ ...c, [id]: 0 })), cooldownMs);
    }
  };

  return (
    <div className="panel rounded-2xl p-6">
      <h3 className="font-display text-lg font-semibold text-slate-100">Quests</h3>
      <p className="mt-1 text-sm text-slate-400">Complete quests to earn XP and level up.</p>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {QUESTS.map((quest) => {
          const onCooldown = (cooldownUntil[quest.id] ?? 0) > Date.now();
          return (
            <button
              key={quest.id}
              type="button"
              disabled={onCooldown}
              onClick={() => handleClick(quest.id, quest.xp, quest.label, quest.cooldownMs)}
              className="btn-secondary justify-between"
            >
              <span className="flex items-center gap-2">
                <span>{quest.icon}</span>
                <span>{onCooldown ? "On cooldown…" : quest.label}</span>
              </span>
              <span className="text-violet-300">+{quest.xp.toLocaleString()} XP</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
