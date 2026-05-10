# Page patterns

## 1. Page intro

Every top-level page opens with the same three-line block:

1. `<Eyebrow>` — surface + subtitle, mono uppercase
2. Display heading — Newsreader 36px, weight 400, letter-spacing -0.025em, line-height 1.08
3. Lede paragraph — 15px, leading 1.7, color `--fg-3`, max-width 60ch

```tsx
<div data-stagger>
  <Eyebrow>Observability · traces · spans · evidence</Eyebrow>
  <h1 className="mt-2 …">Every run, every span, every gate.</h1>
  <p className="mt-3 max-w-[60ch] …">One-paragraph framing.</p>
</div>
```

## 2. App chrome

Three-column grid, sticky, blurred backdrop, condenses on scroll.

| Column | Content |
|---|---|
| Left | `<BotTile />` + brand wordmark |
| Center | Pill-shaped nav: Agent · Board · Metrics · Observability · Knowledge · Memory · Backlog |
| Right | Icon-only utility cluster: ✨ runs · 🔍 ⌘K · 📥 Inbox(badge) · ⇄ Compare · ⊞ Settings · ☀/☾ |

On scroll past 24px, brand and utilities fade out, nav pill stays.

## 3. Settings — side drawer

Right-anchored 420px drawer with three sections:

- **Design** — Presets / Advanced (themes from `themes.json`)
- **Preferences** — runtime SDK, board density, agent inspector default, transcript default, transcript layout, compare display, notifications
- **Runtime** — read-only SDK state, MCP servers, MCP tools

Soft overlay (not opaque) so the underlying app remains visible while the user previews design changes.

## 4. Command palette

⌘K opens a centered modal with grouped, fuzzy-searched results: Actions · Routes · Tasks · Knowledge. ↑↓↵ keyboard nav, Esc closes. Mono IDs in the right column.

## 5. Page archetypes

| Archetype | Examples | Layout |
|---|---|---|
| **List + detail** | Board, Backlog, Inbox | Left rail of items, right pane for selected detail. Selected row highlighted with accent-tint background. |
| **Stream** | Agent, SDK events | Single vertical scrolling thread. Newest at the bottom. Sticky composer / filter bar at top. |
| **Dashboard** | Metrics, Observability | Health-bands strip across the top, then tabs for drill-down. Stat cards use `<Stat>` primitive. |
| **Reference** | Knowledge, Memory | Card grid or filterable list. No hover-to-edit — these are records. |

## 6. Status pills

Use `<StatusPill status="…" />`. The label and tone come from the status key. Never hand-roll these.

## 7. Empty states

Pattern: small `<Eyebrow>` + one sentence in `--fg-3` + optional ghost button. Never use illustrations.

## 8. Error states

Same as empty state but eyebrow is `Error · <code>` and the sentence describes the failure in operator language. Don't apologize. Offer the next action.

---

## Conformance checklist

Run through this before considering a page done:

- [ ] Page intro with Eyebrow + display heading + 60ch lede
- [ ] All colors are `var(--*)` tokens or themed `oklch()` — no raw hex
- [ ] Every status uses a key from `status-language.md`
- [ ] Every button is `<Button variant=…>`, never a styled `<div>`
- [ ] Every panel is `<Surface>`, never an ad-hoc `<div className="rounded border">`
- [ ] Every pill is `<StatusPill>` — no custom badges
- [ ] Every tab strip is `<Tabs items=…>`
- [ ] `data-stagger` on hero blocks for entrance animation
- [ ] `data-screen-label` on the page root for analytics + comments
- [ ] Renders correctly in all 6 themes (light + dark)
- [ ] Mobile: nav row collapses, layout reflows at <lg
- [ ] Keyboard: focus visible, Esc closes overlays
