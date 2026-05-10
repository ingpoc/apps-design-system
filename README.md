# Apps Design System

A multi-app design system monorepo containing locked tokens, themes, primitive components, page patterns, and status language for each app in the workspace.

## Structure

```
Autonomous-agent-builder/
├── tokens.css                              # Design tokens (color, type, spacing, radius, shadow, status)
├── Autonomous Agent Builder - Design System.html  # Visual reference (standalone)
├── skills/builder-design-system/
│   ├── SKILL.md                            # Skill invocation rules & workflow
│   ├── components.md                       # Primitive component API contracts
│   ├── patterns.md                         # Page-level layout patterns & conformance checklist
│   ├── status-language.md                  # Status taxonomy & tone mapping
│   ├── themes.json                         # 6 locked theme presets
│   └── tokens.css                          # Mirrored tokens (single source of truth)
└── src/
    ├── app.jsx                             # App shell, routing, settings drawer
    ├── primitives.jsx                      # Primitive components (StatusPill, Surface, Button, etc.)
    ├── agent-components.jsx                # App-specific composite components
    ├── pages.jsx                           # Page compositions (Board, Agent, Metrics, etc.)
    ├── observability-page.jsx              # Observability dashboard page
    ├── extra-pages.jsx                     # Inbox, Compare, Onboarding pages
    ├── data.jsx                            # Mock data & seed fixtures
    ├── flows.jsx                           # User flow definitions
    └── tweaks.jsx                          # Theme/customization panel
```

## Design Tokens

The token system (`tokens.css`) uses **OKLCH color** with 4 runtime knobs:

| Knob | Purpose |
|---|---|
| `--accent-hue` | Rotates the entire accent palette (252 = cobalt default) |
| `--density` | Multiplier for spacing/padding (0.82 compact, 1.0 comfortable, 1.15 cozy) |
| `--radius-base` | Cascades to xs/sm/md/lg/xl/full radius scale |
| `data-theme` | Switches between light/dark token sets |

Dark mode is designed first-class — not inverted. All status colors share unified chroma (0.12–0.17) and matched lightness so they harmonize on screen.

## Theme Presets

Six locked themes in `themes.json`:

| Theme | Hue | Mode | Best for |
|---|---|---|---|
| **Calm Paper** | 252 cobalt | Light | Default — long reading, planning, knowledge surfaces |
| **Operator** | 212 azure | Dark | Live ops, observability, dense traces |
| **Sage Studio** | 180 teal | Light | Backwards-compatible legacy palette |
| **Ember** | 28 amber | Light | Onboarding, marketing, celebratory states |
| **Midnight** | 264 iris | Dark | Demo & presentation — high contrast |
| **Paper Mono** | 0 neutral | Light | Print, PDF export, accessibility-first |

New themes require only a new entry in `themes.json` — no code changes.

## Primitives

All screens compose from these primitives only:

| Component | Purpose |
|---|---|
| `StatusPill` | Read-only status badge (label + tone from status key) |
| `StatusDot` | Colored dot with optional pulse animation |
| `Surface` | Standard card/panel with optional raised shadow |
| `Eyebrow` | Mono uppercase section header |
| `Button` | Primary/secondary/ghost/danger, density-aware |
| `Tabs` | Pill-style tab strip (`items` prop) |
| `Input` | Form input with system radius & focus ring |
| `Code` / `Kbd` | Inline monospace / keyboard cap |
| `Meter` | Horizontal progress bar |
| `Stat` | Big number + label + trend |
| `BrandMark` | Bot tile branding mark |

See `components.md` for full API contracts.

## Status Language

The product uses a fixed set of status keys mapped to tones:

| Tone | OKLCH variable | Meaning |
|---|---|---|
| `active` | `--status-active` | Currently happening, live |
| `done` | `--status-done` | Completed, success |
| `review` | `--status-review` | Needs human attention |
| `pending` | `--status-pending` | Queued, not started |
| `blocked` | `--status-blocked` | Cannot proceed, error |
| `muted` | `--fg-muted` | Informational only |

Never invent new statuses — use only the keys defined in `status-language.md`.

## Page Patterns

Four archetypes cover all surfaces:

| Archetype | Examples | Layout |
|---|---|---|
| **List + detail** | Board, Backlog, Inbox | Left rail + right detail pane |
| **Stream** | Agent, SDK events | Vertical scrolling thread |
| **Dashboard** | Metrics, Observability | Health bands + tabbed drill-down |
| **Reference** | Knowledge, Memory | Card grid or filterable list |

Every page opens with the standard intro block: `Eyebrow` + display heading + 60ch lede paragraph.

## Adding a New App's Design System

To add a design system for a new app:

1. Create `<app-name>/` at the repo root
2. Add a `tokens.css` with the app's token definitions
3. Add a `skills/<app-name>-design-system/` directory containing:
   - `SKILL.md` — invocation rules & workflow
   - `components.md` — primitive component APIs
   - `patterns.md` — page-level patterns
   - `status-language.md` — status taxonomy (or reference shared one)
   - `themes.json` — theme presets
   - `tokens.css` — mirrored tokens
4. Add `src/` with component source files
5. Update this README with the new app's section

## Skills

Each app ships a self-contained skill that bundles tokens, components, patterns, and status language into a deterministic playbook for AI-assisted development.

| App | Skill | Path |
|---|---|---|
| Autonomous Agent Builder | `builder-design-system` | `Autonomous-agent-builder/skills/builder-design-system/` |

### Skill Usage

Invoke a skill when you need to:
- Build a new page or surface
- Restyle an existing page to match the system
- Add or audit a primitive component
- Generate a new theme preset
- Validate conformance

### Skill Rules

1. **Never invent colors.** Use `var(--*)` tokens or `oklch()` with the system's hue/lightness scale.
2. **Never invent statuses.** Use keys from `status-language.md`.
3. **Always use primitives.** Never hand-roll equivalents of `Button`, `Surface`, `StatusPill`, `Tabs`, etc.
4. **Page intros follow the pattern.** Eyebrow + display heading + 60ch lede — no exceptions.
5. **Density is a multiplier**, not a category. Read `--density` and multiply.
6. **Dark mode is data-driven.** Set `data-theme="dark"` — never hard-code dark values.

## Conformance Checklist

Before considering a page done:

- [ ] Page intro with Eyebrow + display heading + 60ch lede
- [ ] All colors are `var(--*)` tokens — no raw hex
- [ ] Every status uses a key from `status-language.md`
- [ ] Every button is `<Button variant=…>`, never a styled `<div>`
- [ ] Every panel is `<Surface>`, never ad-hoc `<div className="rounded border">`
- [ ] Every pill is `<StatusPill>` — no custom badges
- [ ] Every tab strip is `<Tabs items=…>`
- [ ] `data-stagger` on hero blocks for entrance animation
- [ ] `data-screen-label` on page root for analytics
- [ ] Renders correctly in all themes (light + dark)
- [ ] Mobile: nav collapses, layout reflows at `<lg`
- [ ] Keyboard: focus visible, Esc closes overlays

## License

Proprietary — internal use only.