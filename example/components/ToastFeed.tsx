"use client";

import type { GameEvent } from "@/lib/usePlayer";

export function ToastFeed({ events }: { events: GameEvent[] }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-xs flex-col gap-2">
      {events.slice(0, 4).map((event) => (
        <div
          key={event.id}
          className="animate-toast-in panel rounded-xl px-4 py-3 text-sm text-slate-100 shadow-lg"
        >
          <span className="mr-2">{event.icon}</span>
          {event.message}
        </div>
      ))}
    </div>
  );
}
