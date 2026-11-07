"use client";

import { ChevronDown, Database, Workflow } from "lucide-react";
import type { Player } from "xp-level-system";
import { Code } from "./Code";

export function StateInspector({ player }: { player: Player }) {
  const info = player.progress;
  return (
    <details className="state-inspector">
      <summary>
        <span className="inspector-icon">
          <Database aria-hidden="true" />
        </span>
        <span>
          <strong>Under the hood</strong>
          <small>
            Inspect the live state. See exactly what you need to save.
          </small>
        </span>
        <span className="live-indicator">
          <i /> LIVE
        </span>
        <ChevronDown className="inspector-chevron" aria-hidden="true" />
      </summary>
      <div className="inspector-content">
        <div>
          <p className="eyebrow">PERSIST THIS · player.toJSON()</p>
          <p className="inspector-description">
            This is the complete save state. Store it after an action and
            restore it with <code>Player.fromJSON(state, config)</code>.
          </p>
          <Code
            name="player-state.json"
            code={JSON.stringify(player.toJSON(), null, 2)}
          />
        </div>
        <div className="derived-state">
          <span className="derived-icon">
            <Workflow aria-hidden="true" />
          </span>
          <h3>One state. Everything derived.</h3>
          <p>
            Your level, rank, and progress come from the saved XP and
            configuration. You do not need to store them separately.
          </p>
          <dl>
            <div>
              <dt>player.level</dt>
              <dd>{info.level}</dd>
            </div>
            <div>
              <dt>player.rank.name</dt>
              <dd>{player.rank?.name ?? "No rank"}</dd>
            </div>
            <div>
              <dt>progress.currentXP</dt>
              <dd>{info.currentXP.toLocaleString("en-US")}</dd>
            </div>
            <div>
              <dt>progress.progressPercent</dt>
              <dd>{info.progressPercent}%</dd>
            </div>
            <div>
              <dt>player.canPrestige()</dt>
              <dd>{String(player.canPrestige())}</dd>
            </div>
          </dl>
          <p className="helper">
            Snapshot timestamps are created by the package when achievements
            unlock. Everything here stays in this browser session.
          </p>
        </div>
      </div>
    </details>
  );
}
