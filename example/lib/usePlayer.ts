"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Player } from "xp-level-system";
import type {
  PlayerState,
  UnlockedAchievement,
  PrestigeResult,
  XPChangeResult,
} from "xp-level-system";
import { GAME_CONFIG } from "./gameConfig";

const STORAGE_KEY = "xp-level-system-demo:player:v1";

export interface GameEvent {
  id: string;
  type: "xp" | "levelUp" | "achievement" | "prestige" | "maxLevel";
  message: string;
  icon: string;
  timestamp: number;
}

function loadSavedState(): PlayerState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlayerState) : null;
  } catch {
    return null;
  }
}

function createPlayer(): Player {
  // NOTE: this module is only ever imported in a client-only component
  // (see app/page.tsx `dynamic(..., { ssr: false })`), so `window` always
  // exists here — no hydration-mismatch risk from reading localStorage.
  const saved = loadSavedState();
  return saved ? Player.fromJSON(saved, GAME_CONFIG) : new Player(GAME_CONFIG);
}

/**
 * Wires a stateful `xp-level-system` `Player` into React: subscribes to its
 * events, mirrors its state into re-renderable React state, persists every
 * change to `localStorage`, and keeps a short rolling feed of recent events
 * for the toast/log UI.
 */
export function usePlayer() {
  const playerRef = useRef<Player>();
  if (!playerRef.current) playerRef.current = createPlayer();
  const player = playerRef.current;

  const [version, setVersion] = useState(0);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const rerender = useCallback(() => setVersion((v) => v + 1), []);

  const pushEvent = useCallback((type: GameEvent["type"], icon: string, message: string) => {
    setEvents((prev) =>
      [{ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, type, icon, message, timestamp: Date.now() }, ...prev].slice(0, 6)
    );
  }, []);

  const persist = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(player.toJSON()));
    } catch {
      // localStorage may be unavailable (private mode, quota) — the demo
      // still works in-memory for the session.
    }
  }, [player]);

  useEffect(() => {
    const offXpGained = player.on("xpGained", (_r: XPChangeResult) => {
      rerender();
      persist();
    });
    const offLevelUp = player.on("levelUp", (r) => {
      pushEvent("levelUp", "⬆️", `Level up! You reached level ${r.levelInfo.level}.`);
    });
    const offMax = player.on("maxLevelReached", () => {
      pushEvent("maxLevel", "🏁", "Max level reached — you can now prestige!");
    });
    const offAchievement = player.on("achievementUnlocked", (a: UnlockedAchievement) => {
      pushEvent("achievement", a.icon ?? "🏆", `Achievement unlocked: ${a.name}`);
    });
    const offPrestige = player.on("prestige", (p: PrestigeResult) => {
      pushEvent("prestige", "⭐", `Prestige ${p.prestige}! Permanent XP bonus increased.`);
      rerender();
      persist();
    });

    return () => {
      offXpGained();
      offLevelUp();
      offMax();
      offAchievement();
      offPrestige();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  const gainXP = useCallback(
    (amount: number, reason?: string) => {
      player.gainXP(amount, { reason });
    },
    [player]
  );

  const doPrestige = useCallback(() => {
    player.prestige();
  }, [player]);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    playerRef.current = new Player(GAME_CONFIG);
    setEvents([]);
    rerender();
  }, [rerender]);

  return {
    player,
    version, // included so consumers can put it in dependency arrays if needed
    events,
    gainXP,
    prestige: doPrestige,
    canPrestige: player.canPrestige(),
    reset,
  };
}
