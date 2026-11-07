"use client";

import {
  ArrowDown,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Braces,
  CircleUserRound,
  Check,
  Crown,
  Rocket,
  RotateCcw,
  Save,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { LevelCurve, PlayerConfig, PlayerState } from "xp-level-system";
import {
  buildLeaderboard,
  levelAchievement,
  Player,
  XPSystem,
} from "xp-level-system";
import { Code, HighlightedCode } from "./Code";
import Link from "next/link";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { XPSlider } from "./XPSlider";
import { XPLogo } from "./XPLogo";
import { StateInspector } from "./StateInspector";

const config: PlayerConfig = {
  xpSystem: {
    baseXP: 100,
    curve: "quadratic",
    maxLevel: 6,
    ranks: [
      { name: "Explorer", minLevel: 1 },
      { name: "Maker", minLevel: 3 },
      { name: "Legend", minLevel: 6 },
    ],
  },
  achievements: [
    levelAchievement("start", 2, { name: "First leap" }),
    levelAchievement("maker", 3, { name: "In orbit" }),
    levelAchievement("legend", 6, { name: "Beyond the limit" }),
  ],
  prestige: { enabled: true, requiredLevel: 6, bonusPerPrestige: 0.1 },
};
const missions = [
  {
    name: "Complete a lesson",
    detail: "Education · reward learning",
    xp: 100,
    icon: BookOpen,
    reason: "lesson:complete",
  },
  {
    name: "Ship a project",
    detail: "Community · celebrate contributions",
    xp: 350,
    icon: Rocket,
    reason: "project:ship",
  },
  {
    name: "Defeat the boss",
    detail: "Games · reward big achievements",
    xp: 900,
    icon: Swords,
    reason: "boss:defeat",
  },
];
const recipes = [
  {
    title: "Start with the essentials",
    label: "XPSystem",
    description:
      "Already have users and a database? XPSystem calculates progression while your application stores the accumulated XP.",
    code: `import { XPSystem } from "xp-level-system";\n\nconst system = new XPSystem({\n  baseXP: 100,\n  curve: "quadratic",\n  maxLevel: 20,\n});\n\nconst result = system.addXP(350, 100);\nresult.levelInfo.level; // 3\nresult.didLevelUp;      // true\n\n// Save result.levelInfo.totalXP to your database.`,
  },
  {
    title: "A complete player",
    label: "Player",
    description:
      "Player keeps state in memory and connects levels, ranks, achievements, and prestige. Build a complete progression experience with just a few lines.",
    code: `import { Player, levelAchievement } from "xp-level-system";\n\nconst player = new Player({\n  xpSystem: { baseXP: 100, curve: "quadratic" },\n  achievements: [\n    levelAchievement("first", 2, { name: "First leap" }),\n  ],\n});\n\nplayer.gainXP(100, { reason: "lesson:complete" });\nplayer.level; // 2\nplayer.getUnlockedAchievements(); // [First leap]`,
  },
  {
    title: "Turn events into feedback",
    label: "Events",
    description:
      "Listen for changes to update your UI, play a sound, or track a metric. Keep the unsubscribe function and call it when your React component unmounts.",
    code: `const unsubscribe = player.on("levelUp", (result) => {\n  console.log("New level:", result.levelInfo.level);\n});\n\nplayer.on("achievementUnlocked", (achievement) => {\n  console.log("Achievement:", achievement.name);\n});\n\nplayer.gainXP(250, { multiplier: 2, reason: "weekend" });\n\n// In your useEffect cleanup:\nunsubscribe();`,
  },
  {
    title: "Save the journey, restore the state",
    label: "Persistence",
    description:
      "The package does not access your database or localStorage. Serialize the player after an action, then restore with the same configuration and achievement definitions.",
    code: `// After gainXP(), persist the updated state.\nconst snapshot = player.toJSON();\nlocalStorage.setItem("progress", JSON.stringify(snapshot));\n\n// In the browser, after the component mounts:\nconst raw = localStorage.getItem("progress");\nconst restored = raw\n  ? Player.fromJSON(JSON.parse(raw), config)\n  : new Player(config);\n\n// On the server, store the same snapshot in your database.\n// Validate external data before restoring.`,
  },
];
export default function Dashboard() {
  const [player, setPlayer] = useState(() => new Player(config));
  const [, render] = useState(0);
  const [reward, setReward] = useState<{
    id: number;
    xp: number;
    levelUp: boolean;
  } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [lastCode, setLastCode] = useState(
    'player.gainXP(100, { reason: "lesson:complete" });',
  );
  const [recipe, setRecipe] = useState(0);
  const [curve, setCurve] = useState<LevelCurve>("quadratic");
  const [base, setBase] = useState(100);
  const [doubleXP, setDoubleXP] = useState(false);
  const rewardMultiplier =
    (doubleXP ? 2 : 1) * (1 + player.prestigeLevel * 0.1);
  const [saved, setSaved] = useState<PlayerState | null>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  const system = useMemo(
    () => new XPSystem({ baseXP: base, curve, multiplier: 2, maxLevel: 6 }),
    [base, curve],
  );
  const info = player.progress;
  const thresholds = Array.from({ length: 6 }, (_, i) =>
    system.xpForLevel(i + 1),
  );
  const board = buildLeaderboard(
    [
      { id: "you", name: "You", totalXP: player.totalXP },
      { id: "luna", name: "Luna", totalXP: 1600 },
      { id: "nico", name: "Nico", totalXP: 400 },
    ],
    player.xp,
  );
  function add(amount: number, reason: string) {
    const notices: string[] = [];
    const off = player.on("achievementUnlocked", (a) =>
      notices.push(`achievementUnlocked → ${a.name}`),
    );
    const result = player.gainXP(amount, {
      reason,
      multiplier: doubleXP ? 2 : 1,
    });
    off();
    setReward((previous) => ({
      id: (previous?.id ?? 0) + 1,
      xp: result.xpDelta,
      levelUp: result.didLevelUp,
    }));
    setLogs((previous) =>
      [
        `xpGained → +${result.xpDelta} XP`,
        ...(result.didLevelUp ? [`levelUp → level ${player.level}`] : []),
        ...notices,
        ...previous,
      ].slice(0, 7),
    );
    setLastCode(
      `player.gainXP(${amount}, { reason: "${reason}"${doubleXP ? ", multiplier: 2" : ""} });`,
    );
    render((v) => v + 1);
  }
  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <SiteHeader />
      <main id="content">
        <section className="hero wrap">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" /> YOUR NEXT LEVEL STARTS HERE
            </p>
            <h1>
              Small actions.
              <br />
              Big{" "}
              <span className="headline-accent">
                progress
                <svg viewBox="0 0 500 25" aria-hidden="true">
                  <path d="M3 18 Q230 -4 490 13" />
                </svg>
              </span>
              .
            </h1>
            <p className="hero-description">
              Turn progress into a reason to keep going. XP, levels, ranks, and
              achievements in one TypeScript package — from the very first point
              to the next big milestone.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#playground">
                Try it live <ArrowDown aria-hidden="true" />
              </a>
              <a className="text-link" href="#recipes">
                Start building <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
            <div className="package-facts">
              <span>
                <Check aria-hidden="true" />
                Zero dependencies
              </span>
              <span>
                <Check aria-hidden="true" />
                100% TypeScript
              </span>
              <span>
                <Check aria-hidden="true" />
                MIT license
              </span>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label={`Your explorer is at level ${info.level}`}
          >
            <span className="art-grid" aria-hidden="true" />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="art-note">
              <span className="status-dot" /> CONNECTED TO YOUR PLAYGROUND
            </span>
            <div className="level-token">
              <span>LEVEL</span>
              <strong key={info.level}>
                {String(info.level).padStart(2, "0")}
              </strong>
              <span>✦ {player.rank?.name.toUpperCase()} ✦</span>
            </div>
            <span className="floating-tag tag-one">
              <Trophy aria-hidden="true" />{" "}
              {player.getUnlockedAchievements().length} / 3 achievements
            </span>
            <span className="floating-tag tag-two">
              <Zap aria-hidden="true" />{" "}
              {player.totalXP.toLocaleString("en-US")} total XP
            </span>
            <div className="art-caption">
              <span>YOUR JOURNEY, IN REAL TIME</span>
              <a href="#playground">
                TAKE THE FIRST STEP <ArrowDown aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
        <div className="quick-install wrap">
          <span>
            <Braces aria-hidden="true" /> One package. Your entire progression
            loop.
          </span>
          <a href="#recipes">
            <code>npm install xp-level-system</code>
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
        <div className="feature-strip">
          <div className="wrap">
            <span>XP & levels</span>
            <b>✳</b>
            <span>Customizable curves</span>
            <b>✳</b>
            <span>Achievements</span>
            <b>✳</b>
            <span>Ranks & prestige</span>
            <b>✳</b>
            <span>Typed events</span>
          </div>
        </div>
        <section id="playground" className="wrap section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LEARN BY DOING</p>
              <h2>One click. A new level.</h2>
            </div>
            <p>
              Complete actions and watch the package work.
              <br />
              Demo data, just for this session.
            </p>
          </div>
          <div className="journey" aria-label="Progression milestones">
            {[
              { level: 1, name: "Explorer", detail: "Your first step" },
              { level: 3, name: "Maker", detail: "400 total XP" },
              { level: 6, name: "Legend", detail: "2,500 total XP" },
            ].map((milestone) => (
              <div
                className={`journey-stop ${info.level >= milestone.level ? "reached" : ""}`}
                key={milestone.level}
              >
                <span className="journey-marker">
                  {info.level >= milestone.level ? (
                    <Check aria-hidden="true" />
                  ) : (
                    milestone.level
                  )}
                </span>
                <span>
                  <strong>{milestone.name}</strong>
                  <small>{milestone.detail}</small>
                </span>
                <span className="journey-level">
                  LV {String(milestone.level).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
          <div className="playground-grid">
            <div className="mission-panel">
              <p className="mission-intro">
                Pick a small win.
                <br />
                <strong>Make the progress tangible.</strong>
              </p>
              <div
                className={`boost-control ${doubleXP ? "boost-active" : ""}`}
              >
                <span className="boost-icon">
                  <Zap aria-hidden="true" />
                </span>
                <label htmlFor="double-xp">
                  <strong>Double XP</strong>
                  <small>
                    {doubleXP
                      ? "2× rewards. Same small actions."
                      : "Try a reward multiplier."}
                  </small>
                </label>
                <input
                  id="double-xp"
                  className="boost-switch"
                  type="checkbox"
                  role="switch"
                  checked={doubleXP}
                  onChange={(event) => setDoubleXP(event.target.checked)}
                />
              </div>
              {player.prestigeLevel > 0 && (
                <p className="prestige-note">
                  Rewards include your +{player.prestigeLevel * 10}% prestige
                  bonus.
                </p>
              )}
              <div className="panel-label">
                <span>CHOOSE YOUR NEXT ACTION</span>
                <ArrowDownLeft aria-hidden="true" />
              </div>
              {missions.map((m) => (
                <button
                  className="mission"
                  key={m.reason}
                  onClick={() => add(m.xp, m.reason)}
                >
                  <span className="mission-icon">
                    <m.icon aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{m.name}</strong>
                    <small>{m.detail}</small>
                  </span>
                  <b>
                    +
                    {Math.floor(m.xp * rewardMultiplier).toLocaleString(
                      "en-US",
                    )}{" "}
                    <small>XP</small>
                  </b>
                </button>
              ))}
              <div className="call-preview">
                <span>THE CODE BEHIND THE CLICK</span>
                <HighlightedCode code={lastCode} />
              </div>
            </div>
            <div className="player-panel">
              <div className="reward-slot" role="status" aria-live="polite">
                {reward ? (
                  <span key={reward.id} className="reward-message">
                    <Sparkles aria-hidden="true" /> +{reward.xp} XP{" "}
                    {reward.levelUp
                      ? `· Level ${info.level} unlocked!`
                      : "· Keep the momentum going"}
                  </span>
                ) : (
                  <span>
                    <Sparkles aria-hidden="true" /> Your next achievement starts
                    with one action.
                  </span>
                )}
              </div>
              <div className="player-top">
                <span className="eyebrow">YOUR EXPLORER</span>
                <span className="rank-pill">
                  <Crown aria-hidden="true" /> {player.rank?.name}
                </span>
              </div>
              <div className="level-display">
                <span className="avatar">
                  <Sparkles aria-hidden="true" />
                </span>
                <div>
                  <span>CURRENT LEVEL</span>
                  <strong key={info.level}>
                    {String(info.level).padStart(2, "0")}
                    <small>/ 06</small>
                  </strong>
                </div>
                <span className="total-xp">
                  {player.totalXP.toLocaleString("en-US")}
                  <small>TOTAL XP</small>
                </span>
              </div>
              <div className="progress-label">
                <span>
                  {info.isMaxLevel
                    ? "You reached the top!"
                    : `${Math.max(0, info.xpToNextLevel - info.currentXP).toLocaleString("en-US")} XP to the next level`}
                </span>
                <b>{info.progressPercent}%</b>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Level progress"
                aria-valuenow={info.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div style={{ width: `${info.progressPercent}%` }} />
              </div>
              <div className="achievement-row">
                {config.achievements?.map((a, i) => {
                  const unlocked = player
                    .getUnlockedAchievements()
                    .some((u) => u.id === a.id);
                  return (
                    <div
                      key={a.id}
                      className={
                        unlocked ? "achievement unlocked" : "achievement"
                      }
                    >
                      <span>
                        {i === 0 ? (
                          <Rocket aria-hidden="true" />
                        ) : i === 1 ? (
                          <Sparkles aria-hidden="true" />
                        ) : (
                          <Trophy aria-hidden="true" />
                        )}
                      </span>
                      <small>{a.name}</small>
                      <b>{unlocked ? "Unlocked" : `Level ${[2, 3, 6][i]}`}</b>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                className="button prestige"
                disabled={!player.canPrestige()}
                onClick={() => {
                  player.prestige();
                  setReward(null);
                  render((v) => v + 1);
                  setLogs((p) =>
                    ["prestige → XP reset; permanent bonus +10%", ...p].slice(
                      0,
                      7,
                    ),
                  );
                }}
              >
                <Crown aria-hidden="true" /> Start prestige{" "}
                {player.prestigeLevel > 0 && `(${player.prestigeLevel})`}
              </button>
              <p className="helper">
                At level 6, start again with +10% XP per prestige. Your
                achievements stay with you.
              </p>
            </div>
          </div>
          <div className="under-grid">
            <div className="event-panel">
              <div className="panel-label">
                <span>LIVE EVENTS</span>
                <span className="status-dot" />
              </div>
              <div className="event-log" role="log" aria-live="polite">
                {logs.length ? (
                  logs.map((log, i) => (
                    <p key={`${log}-${i}`}>
                      <span>›</span> {log}
                    </p>
                  ))
                ) : (
                  <p className="muted">
                    Waiting for your first action. Try a mission above.
                  </p>
                )}
              </div>
            </div>
            <div className="leader-panel">
              <div className="panel-label">
                <span>LEADERBOARD · buildLeaderboard()</span>
                <span>↓ XP</span>
              </div>
              {board.map((p) => (
                <div
                  className={`leader-row ${p.id === "you" ? "is-you" : ""}`}
                  key={p.id}
                >
                  <span>0{p.position}</span>
                  <strong>{p.name}</strong>
                  <small>LV {p.level}</small>
                  <b>{p.totalXP.toLocaleString("en-US")} XP</b>
                </div>
              ))}
              <p className="helper">
                Ranked by XP. Tied players share a position.
              </p>
            </div>
          </div>
          <div className="save-panel">
            <div>
              <strong>Your progression fits in a JSON snapshot.</strong>
              <p>
                Save a snapshot in memory, keep playing, then restore it to
                compare.
              </p>
            </div>
            <button
              type="button"
              ref={saveRef}
              className="button secondary"
              onClick={() => {
                setSaved(player.toJSON());
                setLogs((p) =>
                  ["toJSON → snapshot saved in memory", ...p].slice(0, 7),
                );
              }}
            >
              <Save aria-hidden="true" />
              Save snapshot
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={!saved}
              onClick={() => {
                if (saved) {
                  setPlayer(Player.fromJSON(saved, config));
                  setReward(null);
                  setLogs((p) =>
                    ["fromJSON → snapshot restored", ...p].slice(0, 7),
                  );
                  saveRef.current?.focus();
                }
              }}
            >
              <RotateCcw aria-hidden="true" />
              Restore
            </button>
            {saved && (
              <code>
                {saved.totalXP} XP · prestige {saved.prestige}
              </code>
            )}
          </div>
          <StateInspector player={player} />
        </section>
        <section id="recipes" className="guide-section">
          <div className="wrap section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">FROM PLAYGROUND TO YOUR PROJECT</p>
                <h2>
                  Less setup.
                  <br />
                  More possibilities.
                </h2>
              </div>
              <p>
                Start with one install.
                <br />
                Then choose how much control you need.
              </p>
            </div>
            <div className="starting-points">
              <a
                href="#integration-example"
                className={`starting-point ${recipe === 0 ? "selected" : ""}`}
                onClick={() => setRecipe(0)}
              >
                <Braces aria-hidden="true" />
                <span>
                  <small>I ALREADY HAVE MY OWN STATE</small>
                  <strong>Give me the engine.</strong>
                  <p>Pure calculations. Your database. Full control.</p>
                </span>
                <ArrowUpRight aria-hidden="true" />
              </a>
              <a
                href="#integration-example"
                className={`starting-point ${recipe === 1 ? "selected" : ""}`}
                onClick={() => setRecipe(1)}
              >
                <CircleUserRound aria-hidden="true" />
                <span>
                  <small>I WANT THE WHOLE EXPERIENCE</small>
                  <strong>Build me a player.</strong>
                  <p>State, achievements, ranks, and prestige together.</p>
                </span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
            <Code name="terminal" code="npm install xp-level-system" />
            <div className="recipe-layout" id="integration-example">
              <div>
                <div
                  className="recipe-options"
                  aria-label="Integration examples"
                >
                  {recipes.map((r, i) => (
                    <button
                      type="button"
                      key={r.label}
                      aria-pressed={recipe === i}
                      onClick={() => setRecipe(i)}
                    >
                      <span>0{i + 1}</span>
                      {r.label}
                      <ArrowUpRight aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <h3>{recipes[recipe].title}</h3>
                <p>{recipes[recipe].description}</p>
                <aside className="tip">
                  ↳ In React, keep your Player instance in a ref or state and
                  trigger a render after each mutation. The package itself does
                  not depend on React.
                </aside>
              </div>
              <Code code={recipes[recipe].code} />
            </div>
          </div>
        </section>
        <section id="curves" className="wrap section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SET THE PACE OF THE JOURNEY</p>
              <h2>Every experience has its curve.</h2>
            </div>
            <p>
              Compare the total XP needed for each level.
              <br />
              This simulator is independent of the player above.
            </p>
          </div>
          <div className="curve-layout">
            <div>
              <div className="curve-options" aria-label="Progression curve">
                {(["linear", "quadratic", "exponential"] as const).map((c) => (
                  <button
                    type="button"
                    key={c}
                    aria-pressed={curve === c}
                    onClick={() => setCurve(c)}
                  >
                    {
                      {
                        linear: "Linear",
                        quadratic: "Quadratic",
                        exponential: "Exponential",
                      }[c]
                    }
                  </button>
                ))}
              </div>
              <p>
                {curve === "linear"
                  ? "Steady steps: the same amount of XP for every new level."
                  : curve === "quadratic"
                    ? "A growing challenge: each level takes a little more dedication."
                    : "Accelerating growth: with a multiplier of 2, each new level is further away."}
              </p>
              <XPSlider value={base} onValueChange={setBase} />
              <code className="formula">
                {curve === "linear"
                  ? "baseXP × (level − 1)"
                  : curve === "quadratic"
                    ? "baseXP × (level − 1)²"
                    : "baseXP × (2^(level − 1) − 1)"}
              </code>
              <p className="helper">
                Need a different formula? Use curve: &quot;custom&quot; with
                customFormula(level), returning the total XP for that level.
              </p>
            </div>
            <div className="chart" aria-label="Total XP required per level">
              {thresholds.map((xp, i) => (
                <div className="chart-column" key={i}>
                  <span>{xp.toLocaleString("en-US")}</span>
                  <div
                    style={{
                      height: `${Math.max(3, (xp / thresholds[5]) * 170)}px`,
                    }}
                  />
                  <small>LV {i + 1}</small>
                </div>
              ))}
            </div>
          </div>
          <Code
            name="curve.ts"
            code={`const system = new XPSystem({\n  baseXP: ${base}, curve: "${curve}",${curve === "exponential" ? " multiplier: 2," : ""}\n});\nsystem.xpForLevel(6); // ${thresholds[5]} total XP\nsystem.xpRequiredForLevel(5); // ${system.xpRequiredForLevel(5)} XP from level 5 to 6`}
          />
        </section>
        <section className="wrap closing">
          <span className="closing-symbol">
            <XPLogo aria-hidden="true" />
          </span>
          <h2>
            The next level
            <br />
            is yours to create.
          </h2>
          <p>
            A learning path, a community, or an entire universe.
            <br />
            The package handles progression. You build the experience.
          </p>
          <Link className="button primary" href="/docs">
            Explore the docs <ArrowUpRight aria-hidden="true" />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
