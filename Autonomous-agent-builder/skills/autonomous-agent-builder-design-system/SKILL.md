# Autonomous Agent Builder — Design System Skill

You are applying the **Autonomous Agent Builder design system v0.5** to the `autonomous-agent-builder` codebase. This skill bundles the locked tokens, themes, primitive APIs, page patterns, and status language into a deterministic playbook.

## When to invoke

Use this skill when the user asks you to:
- Build a new page or surface in the agent-builder app
- Restyle an existing page to match the system
- Add or audit a primitive component
- Generate a new theme preset
- Validate that a screen conforms to the system

## What's in this skill

| File | Use |
|---|---|
| `tokens.css` | Single source of truth for color, type, spacing, radii, shadows, status colors. Drop into `frontend/src/index.css` or import alongside it. |
| `themes.json` | Six locked theme presets — `calm`, `operator`, `sage`, `ember`, `midnight`, `paper`. Each declares hue, density, radius, mode. |
| `components.md` | Primitive component API contracts — core (`StatusPill`, `Surface`, `Eyebrow`, `Tabs`, `Button`, `StatusDot`, `Code`, `Kbd`, `Meter`, `Stat`, `Input`, `BrandMark`) + editorial (`EditorialContent`, `KnowledgeCard`, `KnowledgeEditorialSummary`, `MemorySidebar`, `RelatedSidebar`, `TagCloud`, `EmptyState`, `SectionLabel`). |
| `patterns.md` | Page-level patterns — page intro, three-column chrome, condense-on-scroll, settings drawer, command palette, status pill rules, **Motion choreography (GSAP)** with named recipes and `data-*` hooks. |
| `status-language.md` | Status taxonomy + tone mapping, plus the **memory-type tones** (`decision` / `pattern` / `correction`). |

## Operating rules

1. **Never invent colors.** Use `var(--*)` tokens or `oklch()` with the system's hue/lightness scale. New accents must be one of the 9 hues in `themes.json`.
2. **Never invent statuses.** Every state-bearing UI must use a status string from `status-language.md` and the `StatusPill` / `StatusDot` primitives.
3. **Always use the primitives** in `components.md` for buttons, surfaces, tabs, dots, pills, eyebrows, code, kbd, editorial blocks, knowledge cards, tag clouds, drawers, empty states, section labels. Never hand-roll equivalents.
3a. **Motion is part of the contract.** When building a List+Detail, Stream, or Dashboard page, attach the right `data-*` hooks (`data-board-section`, `data-agent-stage`, `data-kpi`, `data-cost-bar`, `data-stagger`) so the page picks up the system's choreography automatically. Every new tween must respect `prefers-reduced-motion` and `clearProps: "all"`.
4. **Page intros follow the pattern** in `patterns.md` — Eyebrow + display heading + 60ch lede paragraph + content. No exceptions on top-level pages.
5. **Status pills are read-only.** Don't make them buttons or links — they describe state, they don't change it.
6. **Density is a multiplier**, not a category. Read `--density` and multiply paddings/heights inside primitives. Don't fork primitives per density.
7. **Dark mode is data-driven.** Set `data-theme="dark"` on `<html>` — never hard-code dark hex values in components.

## Standard workflow

When asked to build or modify a page in the codebase:

1. **Read the locked system.** Open `tokens.css`, `components.md`, `patterns.md`. Don't guess.
2. **Identify the page archetype.** Most pages are one of:
   - **List + detail** (Board, Backlog, Inbox)
   - **Stream** (Agent, SDK events)
   - **Dashboard** (Metrics, Observability)
   - **Reference** (Knowledge, Memory)
3. **Wrap in the standard page intro** (Eyebrow + heading + lede).
4. **Compose with primitives** — never `<div>` a button, never bare-color a status.
5. **Wire status strings** to the lookup in `status-language.md`.
6. **Audit before finishing** — run the checklist at the bottom of `patterns.md`.

## Theme application

The user picks a theme via the Settings drawer. The selected theme writes:

```css
:root {
  --accent-hue: <hue>;
  --density: <density>;
  --radius-base: <radius>px;
}
:root[data-theme="dark"] { /* dark token overrides */ }
```

All primitives derive every visual from these four knobs + the static token base. To add a new theme: append to `themes.json` with a unique `id`, `name`, `tagline`, `hue`, `density`, `radius`, `mode`. No code changes required.

## Generating a new component

If you must add a new primitive (rare):

1. Confirm an existing primitive doesn't already cover it.
2. Use only `var(--*)` tokens for color, spacing, radius, shadow.
3. Honor `--density` for any vertical padding or height.
4. Honor `data-theme="dark"` automatically by using semantic tokens (`--fg`, `--bg`, `--surface`, `--line`) — never raw hex.
5. Add it to `components.md` with its API contract before merging.

## Done criteria

A page or component is done when:
- All colors come from tokens
- All statuses come from `status-language.md` (and memory types from the memory-type tones table)
- All shells, buttons, pills, tabs, dots come from primitives
- All long-form markdown renders through `EditorialContent`
- All list rows on knowledge surfaces use `KnowledgeCard`; all drawers use `MemorySidebar` / `RelatedSidebar`
- The page renders correctly in all 6 themes (light + dark)
- The page has a proper intro block
- The page declares the correct motion hooks (see `patterns.md` → Motion choreography) and respects `prefers-reduced-motion`
- No raw hex codes in the diff (search the diff for `#[0-9a-f]{3,8}` — should be empty)
- `--density` is respected on any custom height/padding

## Out of scope

- Backend / SDK changes
- Routing changes
- New nav entries (those are owned by `App.tsx` and require a product decision)

If a user asks for one of the above, complete the design work and clearly call out the non-design changes for them to handle separately.
