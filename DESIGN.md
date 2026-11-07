# Design context

## North Star

A progression laboratory for developers exploring xp-level-system. English content connects live actions to real API calls. An ascending stair mark unifies the SVG favicon, header and closing. A live arcade token mirrors the demo player; surrounding documentation remains quiet and readable.

## Audience and register

English developer documentation with an interactive, session-only playground. No accounts, remote writes or automatic browser persistence. The double-XP switch applies a real multiplier and composes with prestige bonuses; displayed rewards include both.

## Color

Runtime source: example/app/globals.css :root and Tailwind CSS 4 @theme. Fonts, legacy ink colors, shadows, and animations are exposed as CSS-first theme tokens; PostCSS uses @tailwindcss/postcss. Paper #f7f8fc, ink #202442, muted #626780, line #dde0ed, purple #6246d9, lime #dbf59b, pink #f5bdd5. Purple identifies actions; lime highlights earned progress. Text labels accompany state colors.

## Typography

Display: Arial Black, Trebuchet MS fallback. Body: Trebuchet MS, Arial fallback. Code and utility captions: monospace. System fonts avoid network dependencies and loading shifts.

## Layout

1180px maximum content width; 64px desktop outer spacing, 40px narrow spacing. Desktop pairs actions and player state, then explanatory prose and code. At 650px all paired regions stack. Code scrolls locally.

## Elevation

Flat panels with subtle borders. Hard offset shadows reserved for the hero token, earned achievements, brand mark, and primary links. Code surfaces use a faint soft shadow.

## Shapes

20px panel radius, 9px buttons, 14px code windows. The tilted hero token is the only large decorative object. Milestone stops show actual rank thresholds; engine/player cards guide integration choices.

## Iconography

Lucide icons for controls and feature illustrations; typographic symbols remain decorative in the hero. XPLogo owns the original ascending steps mark, mirrored in app/icon.svg. Original Triooo SVG reused in the footer. Interactive icons have adjacent text.

## Motion

One floating hero token, progression width transitions, and short action-triggered level/reward entrances. Reduced motion disables animation and transitions.

## Canonical owners

Dashboard owns the in-memory demo player and event log; Code owns Prism syntax highlighting, non-selectable line numbers, language badges, and clipboard feedback. StateInspector exposes the actual serialized state separately from derived values. SiteHeader owns the fixed, centered floating navigation shared by home and /docs; SectionNavigation owns home scroll tracking. Body spacing and scroll padding reserve the header geometry. SiteFooter shares branding and internal docs links. Documentation is a server-rendered reading surface with a sticky desktop topic list and horizontally scrollable mobile topics. Code remains the shared syntax/copy owner. XPSlider owns the custom Radix slider, with keyboard, pointer, and touch support. globals.css owns tokens, focus, scrollbar, responsive styles. Snapshot replacement is explicitly reversible: saved state stays available. The curve explorer never changes the live player's configuration.

## Verification

TypeScript and Next production build; package tests. Browser checks when a browser runtime is available. No external fonts or images required.

## Versioned documentation

DocsSidebar owns scroll-aware topic selection (aria-current=location) and follows header geometry and document scroll padding. VersionSelector uses the shared shadcn/ui Radix Select in components/ui/select.tsx and navigates to a version-specific server-rendered document via the version query parameter. The maintained release catalog is lib/releases.ts, grounded in CHANGELOG.md and source commits. lib/versioned-docs.ts explicitly removes unavailable 1.1 APIs from the 1.0 snapshot. The changelog route compares source/target feature availability, supports downgrades and identical versions, and persists comparison parameters in the URL. CompareVersions reuses the same shadcn selectors and owns swap and pending feedback. Popups use a portal, align with the trigger, match its width and radius, and inherit the theme tokens. No registry request or release date is inferred.
