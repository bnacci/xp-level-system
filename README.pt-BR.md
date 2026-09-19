# xp-level-system

Um pacote TypeScript totalmente tipado e sem dependências para sistemas de progressão baseados em XP.

🌎 Idioma:
- 🇺🇸 English: [README.md](./README.md)
- 🇧🇷 Português (este documento)

---

## Instalação

```bash
npm install xp-level-system
# or
yarn add xp-level-system
```

---

## Início rápido

```ts
import { XPSystem } from "xp-level-system";

const sys = new XPSystem({ baseXP: 100, curve: "quadratic" });

// XP → Nível
const info = sys.getLevelInfo(1000);
console.log(info.level);           // 4
console.log(info.progressPercent); // 14%

// Nível → XP total necessário
console.log(sys.xpForLevel(3));    // 400
```

---

## Configuração (`XPSystemConfig`)

| Opção           | Tipo                   | Padrão        | Descrição                                               |
|-----------------|------------------------|---------------|---------------------------------------------------------|
| `baseXP`        | `number`               | `100`         | XP base usado nas fórmulas                              |
| `multiplier`    | `number`               | `1.5`         | Multiplicador para a curva `exponential`                |
| `curve`         | `LevelCurve`           | `"quadratic"` | Fórmula de crescimento                                  |
| `customFormula` | `(level) => number`    | —             | Fórmula própria (obrigatória quando `curve = "custom"`) |
| `minLevel`      | `number`               | `1`           | Nível mínimo                                            |
| `maxLevel`      | `number`               | `Infinity`    | Nível máximo (cap)                                      |

### Curvas disponíveis

| Curva          | Fórmula (XP acumulado para atingir `level`)          |
|----------------|------------------------------------------------------|
| `linear`       | `baseXP × (level − 1)`                               |
| `quadratic`    | `baseXP × (level − 1)²`                              |
| `exponential`  | `baseXP × (multiplier^(level−1) − 1)`               |
| `custom`       | `customFormula(level)`                               |

---

## API

### `getLevelInfo(totalXP): LevelInfo`

Retorna um snapshot completo da progressão baseado no XP total acumulado.

```ts
const info = sys.getLevelInfo(1000);

info.level           // 4      — nível atual
info.nextLevel       // 5      — próximo nível
info.totalXP         // 1000   — XP total acumulado
info.currentXP       // 100    — XP dentro do nível atual
info.xpToNextLevel   // 700    — XP necessário para passar de nível
info.progressPercent // 14     — porcentagem (0–100)
info.isMaxLevel      // false  — se está no nível máximo
```

### `xpForLevel(level): number`

Retorna o XP **total acumulado** necessário para *estar* em `level`.

```ts
sys.xpForLevel(1) // 0
sys.xpForLevel(3) // 400
sys.xpForLevel(5) // 1600
```

### `levelFromXP(totalXP): number`

Converte XP total em nível.

```ts
sys.levelFromXP(1000) // 4
sys.levelFromXP(400)  // 3
```

### `addXP(currentTotalXP, amount): XPChangeResult`

Adiciona XP e retorna o resultado, incluindo quantos níveis foram ganhos.

```ts
const result = sys.addXP(350, 500);

result.levelInfo      // LevelInfo atualizado
result.levelsChanged  // +2 (subiu 2 níveis)
result.didLevelUp     // true
result.xpDelta        // 500
```

### `removeXP(currentTotalXP, amount): XPChangeResult`

Remove XP e retorna o resultado, incluindo quantos níveis foram perdidos.

```ts
const result = sys.removeXP(1500, 700);

result.levelInfo      // LevelInfo atualizado
result.levelsChanged  // -1 (desceu 1 nível)
result.didLevelDown   // true
result.xpDelta        // -700
```

### `levelUp(currentTotalXP): XPChangeResult`

Promove diretamente o jogador para o próximo nível (útil para ação admin).
Retorna estado inalterado se já estiver no `maxLevel`.

```ts
const result = sys.levelUp(450);
result.levelInfo.level // 4 (estava em 3)
```

### `xpRequiredForLevel(level): number`

XP necessário **dentro** de um nível específico (delta entre dois thresholds).

```ts
sys.xpRequiredForLevel(3) // 500  (de 400 até 900)
```

### `format(info): string`

Formata um `LevelInfo` para exibição amigável.

```ts
sys.format(info) // "Level 4 (100 / 700 XP — 14%)"
```

---

## Eventos

`XPSystem` (e `Player`, abaixo) emitem eventos a cada mutação, então você consegue
disparar feedback de UI — toasts, sons, confete — sem precisar ficar checando o estado.

```ts
const sys = new XPSystem({ baseXP: 100, curve: "quadratic" });

sys.on("xpGained", (result) => console.log(`+${result.xpDelta} XP`));
sys.on("levelUp", (result) => console.log(`🎉 Nível ${result.levelInfo.level}!`));
sys.on("maxLevelReached", (info) => console.log(`Nível máximo atingido: ${info.level}`));

sys.addXP(0, 500);
```

Eventos disponíveis: `xpGained`, `xpLost`, `levelUp`, `levelDown`, `maxLevelReached`.
Toda chamada `on()` retorna uma função para cancelar a inscrição; `once()` e
`removeAllListeners()` também estão disponíveis.

### Multiplicadores de XP & tags de motivo

```ts
// Evento de XP em dobro no fim de semana
sys.addXP(currentXP, 100, { multiplier: 2, reason: "event:double-xp" });

// Recompensa de missão, marcada para analytics/log
sys.addXP(currentXP, 250, { reason: "quest:dragon-slay" });
```

---

## Ranks & Tiers

Configure tiers nomeados (Bronze/Silver/Gold, ou o que quiser) e resolva o tier atual —
além do próximo e o progresso até ele — a partir de um nível:

```ts
const sys = new XPSystem({
  baseXP: 100,
  curve: "quadratic",
  ranks: [
    { name: "Bronze", minLevel: 1, color: "#cd7f32" },
    { name: "Silver", minLevel: 5, color: "#c0c0c0" },
    { name: "Gold", minLevel: 10, color: "#ffd700" },
    { name: "Diamond", minLevel: 20, color: "#b9f2ff" },
  ],
});

const rank = sys.getRank(7);
rank.name             // "Silver"
rank.next.name         // "Gold"
rank.progressToNext    // 40  (2 de 5 níveis até Gold)
```

---

## Conquistas (Achievements)

`AchievementTracker` é um motor de conquistas/badges independente e fácil de persistir —
use diretamente, ou deixe o `Player` (abaixo) controlá-lo automaticamente.

```ts
import { AchievementTracker, levelAchievement, xpAchievement } from "xp-level-system";

const tracker = new AchievementTracker([
  levelAchievement("veteran", 10, { name: "Veterano", icon: "🎖️" }),
  xpAchievement("grinder", 10_000, { name: "Grinder", icon: "⚔️" }),
  { id: "secret", name: "???", hidden: true, condition: (ctx) => ctx.totalXP > 99_999 },
]);

const unlocked = tracker.evaluate({ level: 10, totalXP: 900 });
// → [{ id: "veteran", name: "Veterano", icon: "🎖️", unlockedAt: 1699999999999 }]

tracker.getCompletionPercent(); // 33
tracker.getLocked();            // conquistas restantes (as "hidden" aparecem como "???")

// Persistir / restaurar
const saved = tracker.toJSON();
const restored = AchievementTracker.fromJSON(saved, definitions);
```

---

## `Player` — um personagem de jogo completo e com estado

`XPSystem` é propositalmente stateless (você controla a persistência). `Player` é a
alternativa "com baterias inclusas": ele guarda o `totalXP` internamente, já integra
ranks/conquistas/prestígio e emite eventos automaticamente — a forma mais rápida de
modelar um personagem de jogo.

```ts
import { Player, levelAchievement } from "xp-level-system";

const player = new Player({
  xpSystem: {
    baseXP: 100,
    curve: "quadratic",
    ranks: [
      { name: "Bronze", minLevel: 1 },
      { name: "Silver", minLevel: 5 },
      { name: "Gold", minLevel: 10 },
    ],
  },
  achievements: [levelAchievement("veteran", 10, { name: "Veterano" })],
  prestige: { enabled: true, requiredLevel: 10, bonusPerPrestige: 0.1 },
});

player.on("levelUp", (r) => console.log(`Nível ${r.levelInfo.level}!`));
player.on("achievementUnlocked", (a) => console.log(`Desbloqueado: ${a.name}`));
player.on("prestige", (p) => console.log(`Prestígio ${p.prestige}!`));

player.gainXP(500);              // concede XP e checa conquistas automaticamente
player.level;                    // nível atual
player.rank;                     // RankInfo atual | null
player.progress;                 // snapshot completo de LevelInfo
player.canPrestige();            // true assim que atinge requiredLevel
player.prestige();               // zera o XP, +1 prestígio, bônus permanente de XP

// Persistência — salve `player.toJSON()` no seu banco, restaure depois:
const saved = player.toJSON();   // { totalXP, prestige, unlockedAchievements }
const restored = Player.fromJSON(saved, mesmaConfig);
```

---

## Leaderboard

Função pura para ranquear jogadores por XP (ranqueamento de competição padrão — empates
compartilham a mesma posição):

```ts
import { buildLeaderboard } from "xp-level-system";

const board = buildLeaderboard(
  [
    { id: "alice", totalXP: 1600, name: "Alice" },
    { id: "bob", totalXP: 900, name: "Bob" },
  ],
  sys
);
// [{ id: "alice", ..., position: 1, level: 5 },
//  { id: "bob",   ..., position: 2, level: 4 }]
```

---

## Exemplos de curvas

### Quadratic (padrão)

```
Level 1 →      0 XP
Level 2 →    100 XP
Level 3 →    400 XP
Level 4 →    900 XP
Level 5 →  1,600 XP
```

### Linear (`baseXP: 500`)

```
Level 1 →      0 XP
Level 2 →    500 XP
Level 3 →  1,000 XP
Level 4 →  1,500 XP
```

### Exponential (`baseXP: 100, multiplier: 2`)

```
Level 1 →      0 XP
Level 2 →    100 XP
Level 3 →    300 XP
Level 4 →    700 XP
Level 5 →  1,500 XP
Level 6 →  3,100 XP
```

### Custom

```ts
const sys = new XPSystem({
  curve: "custom",
  customFormula: (level) => level * (level + 1) * 50,
});
```

---

## Tipos exportados

```ts
import type {
  // Core
  XPSystemConfig,
  LevelCurve,
  LevelInfo,
  XPChangeResult,
  XPChangeOptions,
  XPSystemEvents,
  // Ranks
  RankDefinition,
  RankInfo,
  // Conquistas
  AchievementContext,
  AchievementDefinition,
  UnlockedAchievement,
  AchievementTrackerState,
  // Player
  PlayerConfig,
  PlayerState,
  PrestigeConfig,
  PrestigeResult,
  PlayerEvents,
  // Leaderboard
  LeaderboardEntry,
  RankedLeaderboardEntry,
} from "xp-level-system";
```

---

## Integração com banco de dados

Persista apenas o `totalXP` — todos os outros campos são derivados:

```ts
// Salvar
await db.user.update({ totalXP: result.levelInfo.totalXP });

// Carregar
const user = await db.user.findUnique({ where: { id } });
const info = sys.getLevelInfo(user.totalXP);
```

Ao usar `Player`, persista `player.toJSON()` em vez disso (também captura prestígio e
conquistas desbloqueadas):

```ts
// Salvar
await db.user.update({ progression: player.toJSON() });

// Carregar
const user = await db.user.findUnique({ where: { id } });
const player = Player.fromJSON(user.progression, config);
```

---

## Demo ao vivo

A pasta [`example/`](./example) contém um "painel de jogo" completo em Next.js — barra
de XP animada, badges de rank, grade de conquistas, botão de prestígio e um leaderboard —
construído inteiramente sobre este pacote. Deploy na Vercel em um clique:

```bash
cd example
npm install
npm run dev
```

Veja [`example/README.md`](./example/README.md) para instruções de deploy na Vercel.

---

## Licença

[MIT](./LICENSE)