# Laboratório de progressão

App Next.js em português que demonstra o pacote `xp-level-system` com exemplos executáveis e um guia de integração.

## Executar

```bash
cd example
pnpm install
pnpm dev
```

Abra http://localhost:3000/xplevelsystem (o prefixo está definido em `next.config.mjs`). Para produção, execute `pnpm build` e `pnpm start`. O projeto usa a versão publicada do pacote especificada em `package.json`.

## O que explorar

- **Missões:** concedem 100, 350 ou 900 XP por meio de `Player.gainXP`, com uma tag `reason`. Ações são repetíveis para facilitar os testes.
- **Progressão:** curva quadrática, base 100, limite no nível 6; ranks nos níveis 1, 3 e 6 e conquistas nos níveis 2, 3 e 6.
- **Eventos:** o log mostra XP concedido, mudanças de nível e conquistas emitidas pelo jogador.
- **Prestígio:** disponível no nível 6; zera XP, mantém conquistas e adiciona 10% de bônus permanente por prestígio.
- **Leaderboard:** `buildLeaderboard` compara o jogador com dois participantes fictícios. Empates compartilham posição.
- **Snapshot:** `toJSON()` salva em memória e `Player.fromJSON()` restaura usando a mesma configuração. Recarregar a página limpa toda a sessão.
- **Guia:** exemplos copiáveis de XPSystem, Player, eventos e persistência. O exemplo de localStorage é uma receita; o playground não grava no navegador.
- **Curvas:** simulador independente para comparar os limites acumulados de curvas linear, quadrática e exponencial, alterando o XP base.

## Organização

`components/Dashboard.tsx` concentra a experiência e o componente compartilhado de código. `app/globals.css` define o sistema visual documentado em `../DESIGN.md`. Componentes anteriores permanecem disponíveis no repositório, mas não compõem esta página.

Para conceder recompensas reais, valide a ação e persista a progressão no servidor. O estado desta demonstração serve somente para exploração local.

## UI components

The site uses English for visible copy, code comments, status messages, and accessibility labels. `components/Code.tsx` highlights TypeScript and shell examples with `prism-react-renderer`; `components/XPSlider.tsx` styles the Radix Slider primitive and provides keyboard, touch, and step-button controls. UI icons come from `lucide-react`. The footer reuses the original Triooo SVG from `components/triooo-logo.tsx`.

## Tailwind CSS 4

Styles use `@import "tailwindcss"` and a CSS-first `@theme` in `app/globals.css`. Sources are scanned relative to `example/`, including when the build runs elsewhere. PostCSS uses `@tailwindcss/postcss`; no JavaScript Tailwind config or separate autoprefixer plugin is required.

## Brand and progression feedback

`components/XPLogo.tsx` and `app/icon.svg` share the ascending-step mark. The hero reflects the live player's level, rank, XP, and achievement count. Milestones track ranks at levels 1, 3, and 6; reward feedback announces each mission result. The integration cards select the corresponding XPSystem or Player recipe.

The Double XP switch passes `multiplier: 2` to `gainXP`; mission reward previews also include the current prestige bonus. Open **Under the hood** to inspect `player.toJSON()` and compare the saved data with derived level/rank/progress values. Code blocks support TypeScript, shell, and JSON, with line numbers excluded from the copy action.

## Website documentation

Open `/xplevelsystem/docs` for the built-in English documentation: installation, quick start, configuration, API reference, ranks, achievements, events, prestige, persistence, React, leaderboard, and TypeScript exports. Content lives in `lib/docs.ts`; `app/docs/page.tsx` renders it with the shared header, footer, and code components. Internal links use Next Link so the configured basePath is preserved.

Versioned documentation uses `?version=1.0.0` or `?version=1.1.0`. The previous version is curated against the initial source snapshot and excludes newer APIs. `/xplevelsystem/docs/changelog?from=1.0.0&to=1.1.0` lists release notes and compares availability, including reverse and identical-version comparisons. Add future versions in `lib/releases.ts` and maintain their documentation in `lib/versioned-docs.ts`; the catalog is based on repository history, not fetched from npm at runtime. Version menus use the shared shadcn/ui Radix Select in `components/ui/select.tsx`, manually installed from the official registry and adapted to the existing Tailwind 4 theme. `components.json` records the shadcn aliases and theme setup.
