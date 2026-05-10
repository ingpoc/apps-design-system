/* Memory and Backlog pages — same visual grammar as the rest */

const {
  cn, StatusDot, StatusPill, Button, Surface, Eyebrow, Kbd, Code, Input,
  LivePulse, TaskCard,
} = window;

const MEMORY_ENTRIES = [
  { id: "m_001", type: "decision", title: "Prefer async tool-handler over thread-pool", phase: "design", entity: "runtime", tags: ["runtime", "tools"], date: "2d", status: "accepted",
    excerpt: "After benchmarking, we adopt asyncio.gather with per-tool timeouts. Thread pool had GIL contention when tool counts exceeded eight." },
  { id: "m_002", type: "pattern", title: "Gate feedback always flows through the approval store", phase: "quality_gates", entity: "gates", tags: ["gates", "approvals"], date: "5d", status: "applied",
    excerpt: "No gate writes directly to task.status. It writes a finding to approval_gate, and the orchestrator consumes it. Keeps audit trail intact." },
  { id: "m_003", type: "correction", title: "Don't fetch KB docs from the orchestrator — use the knowledge service", phase: "implementation", entity: "kb", tags: ["kb", "orchestrator"], date: "1w", status: "applied",
    excerpt: "Previously the orchestrator SELECTed directly against the docs table during task setup, which broke when we split the KB into its own schema." },
  { id: "m_004", type: "decision", title: "Quality-gate timeouts are soft by default", phase: "quality_gates", entity: "gates", tags: ["gates", "ops"], date: "1w", status: "accepted",
    excerpt: "A timed-out gate produces a warn finding rather than auto-failing the task. Timeouts are often transient; humans can retry." },
  { id: "m_005", type: "pattern", title: "Cost caps are enforced at dispatch, not at execution", phase: "planning", entity: "runtime", tags: ["cost", "runtime"], date: "2w", status: "applied",
    excerpt: "The dispatcher rejects a run if estimated cost > remaining budget. Checking mid-run creates surprising cancellations." },
  { id: "m_006", type: "correction", title: "Never encode tool args as positional — always keyword", phase: "implementation", entity: "tools", tags: ["tools"], date: "3w", status: "applied",
    excerpt: "Agent occasionally emitted [\"src/x.py\"] vs {path: \"src/x.py\"}; registry now rejects positional args at registration time." },
];

const MEMORY_TYPE_META = {
  decision:   { label: "Decision",   hue: 212 },
  pattern:    { label: "Pattern",    hue: 155 },
  correction: { label: "Correction", hue: 28 },
};

function MemoryPage() {
  const [type, setType] = React.useState("all");
  const [selected, setSelected] = React.useState(MEMORY_ENTRIES[0]);
  const filtered = type === "all" ? MEMORY_ENTRIES : MEMORY_ENTRIES.filter(e => e.type === type);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Memory · corrections · decisions · patterns"
        kicker="The agent's working notes."
        title={<>What we <span className="display-serif italic">learned</span> — and what we won't repeat.</>}
        description="Structured, durable lessons captured during runs. Decisions record commitments. Patterns are reusable solutions. Corrections are mistakes we refuse to repeat."
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "320px minmax(0,1fr)" }}>
        <Surface className="p-3 space-y-2">
          <Input placeholder="Search memory…" />
          <div className="flex gap-1 pt-1 pb-1">
            {[
              { v: "all",        label: "All",         count: MEMORY_ENTRIES.length },
              { v: "decision",   label: "Decisions",   count: MEMORY_ENTRIES.filter(e => e.type === "decision").length },
              { v: "pattern",    label: "Patterns",    count: MEMORY_ENTRIES.filter(e => e.type === "pattern").length },
              { v: "correction", label: "Corrections", count: MEMORY_ENTRIES.filter(e => e.type === "correction").length },
            ].map((t) => (
              <button
                key={t.v}
                onClick={() => setType(t.v)}
                className={cn(
                  "flex-1 h-7 rounded-[var(--radius-sm)] text-[11px] font-medium transition-colors inline-flex items-center justify-center gap-1",
                  type === t.v ? "text-[var(--fg-on-accent)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"
                )}
                style={{
                  background: type === t.v ? "var(--accent)" : "var(--surface-2)",
                  border: "1px solid var(--line)",
                }}
              >
                <span>{t.label}</span>
                <span className="font-mono text-[9.5px] opacity-70">{t.count}</span>
              </button>
            ))}
          </div>
          <div className="space-y-1 pt-1">
            {filtered.map((e) => {
              const meta = MEMORY_TYPE_META[e.type];
              return (
                <button
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] border transition-colors",
                    selected.id === e.id ? "bg-[color-mix(in_oklab,var(--accent)_6%,var(--surface))]" : "hover:bg-[var(--surface-2)]"
                  )}
                  style={{ borderColor: selected.id === e.id ? "color-mix(in oklab, var(--accent) 30%, var(--line))" : "transparent" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MemoryTypeBadge type={e.type} />
                    <span className="font-mono text-[10px] text-[var(--fg-muted)] ml-auto">{e.date}</span>
                  </div>
                  <h4 className="text-[13px] font-medium text-[var(--fg)] leading-[1.35]">{e.title}</h4>
                </button>
              );
            })}
          </div>
        </Surface>

        <Surface className="p-7 space-y-5">
          <div className="flex items-center gap-2">
            <MemoryTypeBadge type={selected.type} />
            <span className="font-mono text-[11px] text-[var(--fg-muted)]">{selected.id}</span>
            <span className="font-mono text-[11px] text-[var(--fg-muted)] ml-auto">{selected.date} ago</span>
          </div>
          <h2
            className="display-serif text-[var(--fg)]"
            style={{ fontSize: 30, lineHeight: 1.12, letterSpacing: "-0.02em" }}
          >
            {selected.title}
          </h2>

          <div className="flex flex-wrap gap-3 text-[11.5px]">
            <Field label="Phase"  value={<Code>{selected.phase}</Code>} />
            <Field label="Entity" value={<Code>{selected.entity}</Code>} />
            <Field label="Status" value={<StatusPill status={selected.status === "accepted" || selected.status === "applied" ? "done" : "pending"} />} />
          </div>

          <p className="text-[15px] leading-[1.72] text-[var(--fg-2)] font-serif">{selected.excerpt}</p>

          <div className="pt-3 space-y-3">
            <h3 className="text-[13px] font-medium text-[var(--fg)]">Context</h3>
            <p className="text-[13.5px] leading-[1.72] text-[var(--fg-2)]">
              Observed during the {selected.phase} phase while working on <Code>{selected.entity}</Code>. The note was promoted to long-term memory after three recurrences across independent runs.
            </p>
            <h3 className="text-[13px] font-medium text-[var(--fg)]">Referenced by</h3>
            <ul className="space-y-1.5">
              {["t_9f21 — Add rate-limit retry", "t_5e44 — Evidence graph schema", "t_4a18 — Async tool-handler"].map((r) => (
                <li key={r} className="flex items-center gap-2 text-[12.5px] text-[var(--fg-2)]">
                  <span className="w-1 h-1 rounded-full bg-[var(--fg-muted)]" />
                  <span className="font-mono">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3 flex flex-wrap gap-1.5">
            {selected.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-2 h-6 rounded-[var(--radius-full)] font-mono text-[10.5px] text-[var(--fg-3)]"
                style={{ border: "1px solid var(--line)" }}
              >#{t}</span>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}

function MemoryTypeBadge({ type }) {
  const m = MEMORY_TYPE_META[type];
  return (
    <span
      className="inline-flex items-center px-1.5 h-5 rounded-[5px] font-mono text-[10px] uppercase tracking-[0.14em]"
      style={{
        background: `oklch(0.96 0.02 ${m.hue})`,
        color: `oklch(0.4 0.12 ${m.hue})`,
        border: `1px solid oklch(0.9 0.04 ${m.hue})`,
      }}
    >
      {m.label}
    </span>
  );
}

function Field({ label, value }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-muted)]">{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ---------------- Backlog — Feature Ledger (aligned with SetupPage) ----------------
   Matches the real app: features grouped by status (implementation first, then
   planning/design/gates/pending/done/blocked), with a selected-feature detail
   panel containing Summary, Acceptance criteria, Dependencies.
   ---------------------------------------------------------------------------------- */

const BACKLOG_FEATURES = [
  {
    id: "f_100", title: "Resilient public API surface", priority: 1, status: "implementation",
    description: "Harden /v1/* endpoints against retries, rate limits, and idempotency edge cases. The public surface is now used by three internal teams; we want it to degrade gracefully under load instead of failing loudly.",
    acceptance_criteria: [
      "Retry-After (integer and HTTP-date) parsing is respected by the client SDK",
      "Idempotency keys cached for 15 minutes; duplicate POSTs return the original response",
      "/v1/runs passes a synthetic load test at 200 RPS with p99 < 600ms",
    ],
    dependencies: ["f_101"],
  },
  {
    id: "f_101", title: "Runtime consolidation", priority: 1, status: "design",
    description: "Unify the tool-handler contract and remove the legacy synchronous path. The async model has been in review for a sprint; once accepted it unblocks runtime-wide cost and latency improvements.",
    acceptance_criteria: [
      "All tools implement async def handle(req) -> Result",
      "Legacy sync shim emits a deprecation warning; removed after 90d",
      "Registry rejects positional-args tools at registration time",
    ],
    dependencies: [],
  },
  {
    id: "f_102", title: "Observability mesh", priority: 2, status: "planning",
    description: "Trace every subagent tool call and surface them on the dashboards plus any external OTEL collector the operator configures.",
    acceptance_criteria: [
      "Every tool call emits an OTEL span with parent=run_id",
      "Dashboards render spans under the existing gate-stream widget",
      "Operator can opt in per-project via the onboarding step",
    ],
    dependencies: ["f_101"],
  },
  {
    id: "f_103", title: "Runaway-cost protection", priority: 2, status: "pending",
    description: "Per-agent and per-feature budget caps with pre-dispatch enforcement so a runaway planner can never eat a day's budget before the operator sees it.",
    acceptance_criteria: [
      "Dispatcher rejects a run if estimated cost > remaining budget",
      "Cost forecast surfaces on dispatch, with a human-readable breakdown",
      "Alerts fire to the inbox when a cap is 80% consumed",
    ],
    dependencies: [],
  },
  {
    id: "f_104", title: "Eval throughput", priority: 3, status: "blocked",
    description: "Move nightly eval to a batch path so costs drop ~40% and latency is no longer on the critical path for release decisions.",
    acceptance_criteria: [
      "Anthropic batch API integrated for the nightly eval harness",
      "Cost drops from ~$3.80/night to <$2.30/night",
      "Eval artifact references stable batch IDs",
    ],
    dependencies: [],
    blocked_reason: "Upstream SDK v0.42 required — currently pinned to 0.38",
  },
  {
    id: "f_105", title: "Knowledge graph", priority: 3, status: "quality_gates",
    description: "Link evidence sources to every knowledge document so the agent can cite its reasoning, and reviewers can audit what context produced a decision.",
    acceptance_criteria: [
      "Evidence graph schema v2 merged",
      "Every ADR produced in the last 30d is backfilled with evidence nodes",
      "Reviewer UI shows the supporting evidence inline on a KB doc",
    ],
    dependencies: [],
  },
  {
    id: "f_106", title: "Observability dashboard polish", priority: 2, status: "done",
    description: "Shipped the quality-gate streaming widget with a failure-breakdown view and a 24h rolling sparkline.",
    acceptance_criteria: [
      "Streaming widget shows the last 50 gates with live updates",
      "Failure-breakdown drills down to the offending gate finding",
    ],
    dependencies: [],
  },
];

/* status groups in the order the real SetupPage uses */
const STATUS_GROUP_ORDER = [
  { key: "implementation", label: "In implementation", tone: "active" },
  { key: "planning",       label: "Planning",           tone: "review"  },
  { key: "design",         label: "Design",             tone: "review"  },
  { key: "quality_gates",  label: "Quality gates",      tone: "review"  },
  { key: "pending",        label: "Queued",             tone: "pending" },
  { key: "done",           label: "Done",               tone: "done"    },
  { key: "blocked",        label: "Blocked",            tone: "blocked" },
];

function BacklogPage() {
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedId, setSelectedId] = React.useState(BACKLOG_FEATURES[0].id);

  const filtered = statusFilter === "all"
    ? BACKLOG_FEATURES
    : BACKLOG_FEATURES.filter(f => f.status === statusFilter);

  const selected = filtered.find(f => f.id === selectedId) || filtered[0] || null;

  const grouped = STATUS_GROUP_ORDER
    .map(g => ({ ...g, items: filtered.filter(f => f.status === g.key) }))
    .filter(g => g.items.length > 0);

  const stats = {
    total: BACKLOG_FEATURES.length,
    done: BACKLOG_FEATURES.filter(f => f.status === "done").length,
    pending: BACKLOG_FEATURES.filter(f => f.status === "pending").length,
    active: BACKLOG_FEATURES.filter(f => ["implementation", "planning", "design", "quality_gates"].includes(f.status)).length,
  };

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Backlog · ledger"
        kicker="Program scope, phase by phase."
        title={<>The <span className="display-serif italic">feature ledger.</span></>}
        description="Every feature the agents are working toward, grouped by the phase it currently sits in. Select any entry to inspect its scope, acceptance criteria, and dependencies."
        meta={
          <div className="flex items-center gap-2 flex-wrap">
            <StatPillInline label="Total" value={stats.total} tone="muted" />
            <StatPillInline label="Active" value={stats.active} tone="active" />
            <StatPillInline label="Queued" value={stats.pending} tone="pending" />
            <StatPillInline label="Done" value={stats.done} tone="done" />
          </div>
        }
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "minmax(0,1fr) 420px" }}>
        {/* LEDGER */}
        <Surface className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 h-12 border-b" style={{ borderColor: "var(--line-2)" }}>
            <div className="flex items-center gap-3">
              <Eyebrow>Ledger · {filtered.length} features</Eyebrow>
            </div>
            <div
              className="inline-flex items-center p-0.5 rounded-[var(--radius-full)] gap-0.5"
              style={{ background: "var(--bg-sunk)", border: "1px solid var(--line)" }}
            >
              {[["all","All"], ...STATUS_GROUP_ORDER.slice(0, 4).map(g => [g.key, g.label.split(" ")[0]])].map(([v, l]) => {
                const active = statusFilter === v;
                return (
                  <button
                    key={v}
                    onClick={() => setStatusFilter(v)}
                    className={cn(
                      "h-7 px-3 rounded-[var(--radius-full)] text-[11.5px] font-medium transition-colors",
                      active ? "text-[var(--fg)]" : "text-[var(--fg-3)] hover:text-[var(--fg-2)]"
                    )}
                    style={{
                      background: active ? "var(--surface-raised)" : "transparent",
                      boxShadow: active ? "var(--shadow-sm)" : "none",
                    }}
                  >{l}</button>
                );
              })}
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: "var(--line-2)" }}>
            {grouped.map(group => (
              <div key={group.key} className="py-2">
                <div className="flex items-center gap-2 px-5 py-2">
                  <StatusDot tone={group.tone} pulse={group.tone === "active"} size={7} />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--fg-3)]">
                    {group.label}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--fg-muted)]">· {group.items.length}</span>
                </div>
                <div>
                  {group.items.map(f => (
                    <FeatureRow
                      key={f.id}
                      feature={f}
                      selected={selected?.id === f.id}
                      onClick={() => setSelectedId(f.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Surface>

        {/* DETAIL PANEL */}
        {selected && <FeatureDetail feature={selected} />}
      </div>
    </div>
  );
}

function StatPillInline({ label, value, tone }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full h-7 px-3"
      style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
    >
      <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--fg-muted)]">{label}</span>
      <StatusDot tone={tone} size={6} />
      <span className="font-mono text-[11px] tabular-nums text-[var(--fg)]">{value}</span>
    </span>
  );
}

function FeatureRow({ feature, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-5 py-3 flex items-center gap-4 transition-colors",
        selected ? "bg-[color-mix(in_oklab,var(--accent)_5%,transparent)]" : "hover:bg-[color-mix(in_oklab,var(--fg)_2%,transparent)]"
      )}
    >
      <span className="font-mono text-[10px] text-[var(--fg-muted)] w-12 shrink-0 tabular-nums">{feature.id}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-medium text-[var(--fg)] tracking-[-0.005em] truncate">{feature.title}</div>
        <div className="font-mono text-[10.5px] text-[var(--fg-muted)] mt-0.5">Priority {feature.priority}</div>
      </div>
      <StatusPill status={feature.status} />
    </button>
  );
}

function FeatureDetail({ feature }) {
  return (
    <Surface className="p-6 space-y-5 self-start sticky top-[140px]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] px-1.5 h-5 rounded-[5px] inline-flex items-center text-[var(--fg-3)]" style={{ border: "1px solid var(--line-strong)" }}>
            {feature.id}
          </span>
          <StatusPill status={feature.status} />
          <span className="font-mono text-[10px] text-[var(--fg-muted)] ml-auto">Priority {feature.priority}</span>
        </div>
        <h2
          className="display-serif text-[var(--fg)]"
          style={{ fontSize: 26, lineHeight: 1.12, letterSpacing: "-0.02em" }}
        >
          {feature.title}
        </h2>
      </div>

      <div className="space-y-2">
        <Eyebrow>Summary</Eyebrow>
        <p className="text-[13.5px] leading-[1.72] text-[var(--fg-2)] font-serif">
          {feature.description}
        </p>
      </div>

      <div className="space-y-2">
        <Eyebrow>Acceptance criteria</Eyebrow>
        <ul className="space-y-2">
          {feature.acceptance_criteria.map((c, i) => (
            <li key={i} className="flex gap-2 text-[13px] leading-[1.55] text-[var(--fg-2)]">
              <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--status-active)" }} />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <Eyebrow>Dependencies</Eyebrow>
        {feature.dependencies.length ? (
          <div className="flex flex-wrap gap-1.5">
            {feature.dependencies.map(d => (
              <span
                key={d}
                className="inline-flex items-center px-2 h-6 rounded-[var(--radius-full)] font-mono text-[10.5px] text-[var(--fg-3)]"
                style={{ border: "1px solid var(--line)" }}
              >{d}</span>
            ))}
          </div>
        ) : (
          <p className="text-[12.5px] text-[var(--fg-muted)] italic">Independent — no blocking dependencies.</p>
        )}
      </div>

      {feature.blocked_reason && (
        <div
          className="rounded-[var(--radius-md)] p-3 space-y-1"
          style={{
            background: "color-mix(in oklab, var(--status-blocked) 6%, transparent)",
            border: "1px solid color-mix(in oklab, var(--status-blocked) 30%, var(--line))",
          }}
        >
          <Eyebrow>Blocked</Eyebrow>
          <p className="text-[12.5px] text-[var(--fg-2)]">{feature.blocked_reason}</p>
        </div>
      )}
    </Surface>
  );
}

/* ---------------- Onboarding ---------------- */
const ONBOARDING_PHASES = [
  { id: "clone",   label: "Clone repository",       status: "passed" },
  { id: "index",   label: "Index codebase",         status: "passed" },
  { id: "seed",    label: "Seed knowledge base",    status: "running" },
  { id: "agents",  label: "Register subagents",     status: "pending" },
  { id: "gates",   label: "Verify quality gates",   status: "pending" },
  { id: "ready",   label: "Studio ready",           status: "pending" },
];

const PHASE_TONE_MAP = {
  passed:  { tone: "done",    label: "passed"  },
  running: { tone: "active",  label: "running" },
  failed:  { tone: "blocked", label: "failed"  },
  blocked: { tone: "blocked", label: "blocked" },
  pending: { tone: "muted",   label: "pending" },
};

function OnboardingPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Onboarding · bootstrap"
        kicker="Let's spin up your studio."
        title={<>A few <span className="display-serif italic">opinionated steps</span> before your agents start shipping.</>}
        description="The builder needs a repository, a knowledge seed, and a subagent roster before it can dispatch work. Each step is idempotent — retry freely."
        meta={
          <div className="flex items-center gap-2">
            <LivePulse running label="Bootstrapping · 48%" />
            <Button variant="outline" size="md">Retry phase</Button>
            <Button size="md">Continue</Button>
          </div>
        }
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "minmax(0,1fr) 360px" }}>
        <Surface className="p-5 space-y-3">
          <Eyebrow>Pipeline</Eyebrow>
          <div className="space-y-2">
            {ONBOARDING_PHASES.map((p, i) => {
              const meta = PHASE_TONE_MAP[p.status];
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] border transition-all",
                    p.status === "running" && "breathe"
                  )}
                  style={{
                    background: p.status === "running"
                      ? "color-mix(in oklab, var(--accent) 5%, var(--surface))"
                      : "var(--surface)",
                    borderColor: p.status === "running"
                      ? "color-mix(in oklab, var(--accent) 30%, var(--line))"
                      : "var(--line)",
                  }}
                >
                  <span className="font-mono text-[10px] text-[var(--fg-muted)] w-4 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <StatusDot tone={meta.tone} pulse={p.status === "running"} size={8} />
                  <span className="text-[13.5px] text-[var(--fg)] flex-1">{p.label}</span>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.18em] px-2 h-5 rounded-full inline-flex items-center"
                    style={{
                      background: `color-mix(in oklab, var(--status-${meta.tone}) 12%, transparent)`,
                      color: `var(--status-${meta.tone === "muted" ? "pending" : meta.tone})`,
                    }}
                  >{meta.label}</span>
                </div>
              );
            })}
          </div>
        </Surface>

        <div className="space-y-4">
          <Surface className="p-5 space-y-3">
            <Eyebrow>What we're doing</Eyebrow>
            <p className="text-[13px] leading-[1.7] text-[var(--fg-2)]">
              Seeding the knowledge base from your repo's <Code>docs/</Code> directory. ADRs, runbooks, and API contracts are imported and cross-linked into the evidence graph.
            </p>
            <div className="font-mono text-[11px] text-[var(--fg-3)] space-y-0.5 pt-2">
              <div>imported <span className="text-[var(--fg-2)]">18</span> ADRs</div>
              <div>imported <span className="text-[var(--fg-2)]">6</span> runbooks</div>
              <div>indexed <span className="text-[var(--fg-2)]">2,184</span> source files</div>
            </div>
          </Surface>

          <Surface className="p-5 space-y-3">
            <Eyebrow>What happens next</Eyebrow>
            <ul className="space-y-2 text-[12.5px] text-[var(--fg-2)]">
              <li className="flex gap-2"><span className="w-1 h-1 rounded-full bg-[var(--fg-muted)] mt-[7px] shrink-0" />Register your subagents (planner / designer / implementer).</li>
              <li className="flex gap-2"><span className="w-1 h-1 rounded-full bg-[var(--fg-muted)] mt-[7px] shrink-0" />Verify your quality gates can run end-to-end.</li>
              <li className="flex gap-2"><span className="w-1 h-1 rounded-full bg-[var(--fg-muted)] mt-[7px] shrink-0" />Open the Agent view and dispatch your first task.</li>
            </ul>
          </Surface>
        </div>
      </div>
    </div>
  );
}

/* PageIntro re-imported from pages.jsx via window */
const PageIntro = (props) => {
  const _PageIntro = window.__PageIntro;
  if (_PageIntro) return <_PageIntro {...props} />;
  // fallback minimal
  return (
    <header className="pb-5 border-b border-[var(--line-2)] space-y-2">
      <Eyebrow>{props.eyebrow}</Eyebrow>
      <h1 className="display-serif" style={{ fontSize: 32, lineHeight: 1.08 }}>{props.title}</h1>
      {props.description && <p className="text-[14px] text-[var(--fg-3)]">{props.description}</p>}
    </header>
  );
};

Object.assign(window, { MemoryPage, BacklogPage, OnboardingPage });
