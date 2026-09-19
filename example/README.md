# xp-level-system — Quest Board Demo

A live, interactive "game dashboard" built entirely on top of the
[`xp-level-system`](https://www.npmjs.com/package/xp-level-system) npm package — XP bar,
level-up animations, rank badges, an achievement grid, a prestige system, and a
leaderboard, all driven by the package's `Player` class.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bnacci/xp-level-system&root-directory=example&project-name=xp-level-system-demo)

Or manually:

1. Push this repository to your own GitHub account (or fork it).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Set **Root Directory** to `example`.
4. Deploy — no environment variables required.

This example depends on `xp-level-system` via `file:..` (the parent package in this same
repo) rather than the npm registry, so it always builds against the current source —
including before a new version has been published. [`vercel.json`](./vercel.json) handles
this automatically by building the parent package (`npm install && npm run build`) before
installing the example's own dependencies; you don't need to configure anything manually.
Once you've published your own version to npm, feel free to switch the dependency back to
a semver range (e.g. `"xp-level-system": "^1.1.0"`) and drop `vercel.json`.

## What it demonstrates

| Feature | Package API used |
|---|---|
| XP bar, level, progress % | `player.progress` (`LevelInfo`) |
| Rank badges (Bronze → Legend) | `player.rank`, `XPSystemConfig.ranks` |
| Quests granting XP | `player.gainXP(amount, { reason })` |
| Level-up / achievement toasts | `player.on("levelUp" \| "achievementUnlocked", ...)` |
| Achievement grid | `player.getUnlockedAchievements()` / `getLockedAchievements()` |
| Prestige button | `player.canPrestige()` / `player.prestige()` |
| Leaderboard | `buildLeaderboard()` |
| Save/load progress | `player.toJSON()` / `Player.fromJSON()` (persisted to `localStorage`) |

See [`lib/gameConfig.ts`](./lib/gameConfig.ts) for the full ranks/achievements/prestige
configuration, and [`lib/usePlayer.ts`](./lib/usePlayer.ts) for the React hook that wires
the `Player` instance's events into the UI.
