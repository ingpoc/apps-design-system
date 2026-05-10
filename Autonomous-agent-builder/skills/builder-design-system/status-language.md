# Status language

Status is the primary signal in this product. Use **only** these keys; map them to the matching tone via `STATUS_TONE`. Never invent new statuses without a product decision.

| Key | Label | Tone | Pulse | Use for |
|---|---|---|---|---|
| `running` | Running | `active` | yes | Agent or task currently executing |
| `active` | Active | `active` | yes | Live session, live lane, live pulse |
| `implementation` | Implementation | `active` | yes | Phase 4 of the agent loop |
| `planning` | Planning | `active` | yes | Phase 1–2 of the agent loop |
| `design` | Designing | `active` | yes | Design phase |
| `review` | In review | `review` | no | Awaiting human review |
| `review_pending` | Needs review | `review` | no | Stronger framing — review is overdue |
| `design_review` | Design review | `review` | no | Design phase review gate |
| `pending` | Queued | `pending` | no | Not started |
| `done` | Shipped | `done` | no | Completed and merged |
| `success` | Success | `done` | no | Generic positive outcome |
| `pass` | Pass | `done` | no | Gate passed |
| `blocked` | Blocked | `blocked` | no | Cannot proceed |
| `failed` | Failed | `blocked` | no | Errored out |
| `fail` | Fail | `blocked` | no | Gate failed |
| `warn` | Warn | `review` | no | Soft warning, not blocking |

## Tone meanings

| Tone | OKLCH role | Semantic |
|---|---|---|
| `active` | `--status-active` | currently happening, live |
| `done` | `--status-done` | completed, success |
| `review` | `--status-review` | needs human attention |
| `pending` | `--status-pending` | queued, not yet started |
| `blocked` | `--status-blocked` | cannot proceed, error |
| `muted` | `--fg-muted` | informational only |

## Copy rules

- **Operator voice** — declarative, present tense, no apologies.
- **Numbers always tabular** (`tabular-nums`) when they sit next to a label.
- **No emoji** in status text. Reserve emoji for celebratory empty states only.
- **Past tense for terminal states** ("Shipped", "Failed"). Present continuous for live ("Running", "Designing").

## Examples

✅ `Running · 14 turns · $0.42`
✅ `Needs review · gate.lint · 12 warnings`
✅ `Blocked · awaiting redis connection`
❌ `🎉 All done!` (in a status pill — celebratory framing belongs in empty states)
❌ `Loading...` (use `Running` or `pending`, not loading)
❌ `Error 500` (translate to `Failed` + a one-line operator message)
