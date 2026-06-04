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
  XPSystemConfig,
  LevelCurve,
  LevelInfo,
  XPChangeResult,
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

## Licença

[MIT](./LICENSE)