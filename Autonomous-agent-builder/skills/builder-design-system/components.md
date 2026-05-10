# Component primitives

Every screen in the agent-builder app composes from this set. Never hand-roll equivalents.

## StatusPill

```tsx
<StatusPill status="running" />
```

| Prop | Type | Notes |
|---|---|---|
| `status` | one of `status-language.md` keys | Required |
| `withDot` | boolean | Default `true` |
| `className` | string | |

**Rules:** read-only; never wrap in `<button>` or `<a>`; the label is automatic from the status key.

## StatusDot

```tsx
<StatusDot tone="active" pulse size={6} />
```

| Prop | Notes |
|---|---|
| `tone` | `active` `done` `review` `pending` `blocked` `muted` |
| `pulse` | adds the live-ping ring. Use only for actively-running states |
| `size` | px diameter, default 6 |

## Surface

```tsx
<Surface raised className="p-5 space-y-4">…</Surface>
```

The standard card/panel. `raised` adds the elevated shadow. Pads itself by default; override with `className`.

## Eyebrow

```tsx
<Eyebrow>Section title · subtitle</Eyebrow>
```

Mono uppercase 10px tracking-[0.2em] muted. Use as section headers above content.

## Button

```tsx
<Button variant="default" size="md">Run</Button>
```

| variant | use |
|---|---|
| `default` | Primary action, accent fill |
| `secondary` | Surface fill with border |
| `ghost` | Hover-only background |
| `danger` | Destructive — red tone |

`size`: `sm` `md` `lg`. Density-aware via `--density`.

## Tabs

```tsx
<Tabs
  value={tab}
  onChange={setTab}
  items={[{ value: "trace", label: "Trace" }, { value: "events", label: "SDK events" }]}
/>
```

Pill-style tabs. **Note:** prop is `items`, not `options`.

## Input

Standard form input. Inherits `--radius-sm`, density, focus ring uses `--accent`.

## Code / Kbd

`<Code>` for inline monospace strings. `<Kbd>⌘K</Kbd>` for keyboard hints — small key cap with subtle border.

## Meter

```tsx
<Meter value={0.62} tone="done" />
```

Horizontal progress bar. Tone controls fill color.

## Stat

Big number + label + optional trend. Use in dashboard headers (Metrics, Observability health bands).

## BrandMark

The autonomous-agent-builder bot tile. Don't recreate — import this.

---

## Page-level composition

A typical page body looks like:

```tsx
<div className="space-y-6" data-screen-label="Pagename">
  <div data-stagger>
    <Eyebrow>Surface · short subtitle</Eyebrow>
    <h1 className="mt-2 …display heading…">Headline.</h1>
    <p className="mt-3 max-w-[60ch] …lede…">One-paragraph framing.</p>
  </div>

  <div data-stagger>{/* primary content */}</div>
</div>
```

`data-stagger` gets picked up by the GSAP entrance animation in `App.tsx`.
