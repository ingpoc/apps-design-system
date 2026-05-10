/* Command Palette (⌘K), Run Compare, Gate Approvals Inbox */

const {
  cn, StatusDot, StatusPill, Button, Surface, Eyebrow, Kbd, Code, Input,
  LivePulse, AgentTimeline, CostMeter, ConfidenceBar,
} = window;

/* ============================================================
   COMMAND PALETTE — ⌘K
   ============================================================ */

function CommandPalette({ open, onClose, onRoute, onSelectTask }) {
  const [query, setQuery] = React.useState("");
  const [cursor, setCursor] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const board = window.BOARD_DATA || { active: [], review: [], pending: [], done: [], blocked: [] };
  const allTasks = [...board.active, ...board.review, ...board.pending, ...board.done, ...board.blocked];

  const actions = [
    { id: "go-agent",     kind: "nav", label: "Go to Agent",     hint: "G A", route: "agent" },
    { id: "go-board",     kind: "nav", label: "Go to Board",     hint: "G B", route: "board" },
    { id: "go-metrics",   kind: "nav", label: "Go to Metrics",   hint: "G M", route: "metrics" },
    { id: "go-knowledge", kind: "nav", label: "Go to Knowledge", hint: "G K", route: "knowledge" },
    { id: "go-memory",    kind: "nav", label: "Go to Memory",    hint: "G Y", route: "memory" },
    { id: "go-backlog",   kind: "nav", label: "Go to Backlog",   hint: "G L", route: "backlog" },
    { id: "go-compare",   kind: "nav", label: "Compare runs",    hint: "G C", route: "compare" },
    { id: "go-inbox",     kind: "nav", label: "Open gate inbox", hint: "G I", route: "inbox" },
    { id: "go-onboarding", kind: "nav", label: "Go to Onboarding", hint: "G O", route: "onboarding" },
    { id: "new-feature",  kind: "action", label: "New feature",      hint: "⌘⇧N" },
    { id: "new-task",     kind: "action", label: "New task",         hint: "⌘N" },
    { id: "dispatch",     kind: "action", label: "Dispatch a run",   hint: "⌘⏎" },
    { id: "theme",        kind: "action", label: "Switch theme…",    hint: "⌥T" },
    { id: "tokens",       kind: "action", label: "Open System tokens", hint: "?" },
  ];

  const q = query.trim().toLowerCase();
  const groups = React.useMemo(() => {
    const filterFn = (text) => !q || text.toLowerCase().includes(q);
    const navs = actions.filter(a => a.kind === "nav" && filterFn(a.label));
    const acts = actions.filter(a => a.kind === "action" && filterFn(a.label));
    const tasks = allTasks.filter(t => filterFn(t.title) || filterFn(t.id)).slice(0, 6).map(t => ({
      id: `task-${t.id}`, kind: "task", label: t.title, hint: t.id, task: t,
    }));
    const gates = (window.APPROVAL_GATES || []).filter(g => filterFn(g.title) || filterFn(g.id)).slice(0, 4).map(g => ({
      id: `gate-${g.id}`, kind: "gate", label: g.title, hint: g.id,
    }));
    const groups = [];
    if (navs.length) groups.push({ title: "Navigate", items: navs });
    if (acts.length) groups.push({ title: "Actions", items: acts });
    if (tasks.length) groups.push({ title: "Tasks", items: tasks });
    if (gates.length) groups.push({ title: "Pending gates", items: gates });
    return groups;
  }, [q, allTasks]);

  const flat = groups.flatMap(g => g.items);

  React.useEffect(() => { setCursor(0); }, [query]);

  const runItem = (item) => {
    if (item.kind === "nav") onRoute(item.route);
    if (item.kind === "task") { onSelectTask(item.task); }
    if (item.kind === "gate") onRoute("inbox");
    if (item.kind === "action" && item.id === "tokens") window.dispatchEvent(new CustomEvent("aab:open-tokens"));
    onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") { e.preventDefault(); onClose(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (flat[cursor]) runItem(flat[cursor]); }
  };

  if (!open) return null;

  let idx = -1;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] px-4"
      style={{ background: "color-mix(in oklab, var(--fg) 32%, transparent)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] rounded-[var(--radius-lg)] overflow-hidden fade-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface-raised)",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="flex items-center gap-3 px-4 h-12 border-b" style={{ borderColor: "var(--line-2)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--fg-muted)]">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a command, search tasks, or jump to a page…"
            className="flex-1 bg-transparent outline-none text-[14px] text-[var(--fg)] placeholder:text-[var(--fg-muted)]"
          />
          <Kbd>Esc</Kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {groups.length === 0 && (
            <div className="py-12 text-center text-[13px] text-[var(--fg-muted)]">
              No matches for <span className="font-mono text-[var(--fg-2)]">"{query}"</span>
            </div>
          )}
          {groups.map((g) => (
            <div key={g.title} className="mb-2 last:mb-0">
              <div className="px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--fg-muted)]">
                {g.title}
              </div>
              {g.items.map((item) => {
                idx++;
                const active = idx === cursor;
                const myIdx = idx;
                return (
                  <button
                    key={item.id}
                    onMouseEnter={() => setCursor(myIdx)}
                    onClick={() => runItem(item)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 h-9 rounded-[var(--radius-sm)] text-left transition-colors"
                    )}
                    style={{
                      background: active ? "color-mix(in oklab, var(--accent) 10%, transparent)" : "transparent",
                    }}
                  >
                    <CmdIcon kind={item.kind} />
                    <span className="text-[13px] text-[var(--fg)] flex-1 truncate">{item.label}</span>
                    {item.hint && <Kbd>{item.hint}</Kbd>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4 h-9 border-t font-mono text-[10.5px] text-[var(--fg-muted)]" style={{ borderColor: "var(--line-2)" }}>
          <span className="inline-flex items-center gap-1.5"><Kbd>↑↓</Kbd> move</span>
          <span className="inline-flex items-center gap-1.5"><Kbd>⏎</Kbd> open</span>
          <span className="inline-flex items-center gap-1.5"><Kbd>Esc</Kbd> close</span>
          <span className="ml-auto">{flat.length} result{flat.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}

function CmdIcon({ kind }) {
  const common = { width: 14, height: 14, viewBox: "0 0 14 14", fill: "none" };
  const color = kind === "task" ? "var(--status-active)" : kind === "gate" ? "var(--status-review)" : kind === "nav" ? "var(--accent)" : "var(--fg-3)";
  return (
    <span className="w-5 h-5 shrink-0 grid place-items-center rounded-[5px]" style={{ background: `color-mix(in oklab, ${color} 12%, transparent)`, color }}>
      {kind === "nav" && <svg {...common}><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      {kind === "action" && <svg {...common}><rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>}
      {kind === "task" && <svg {...common}><circle cx="7" cy="7" r="3" fill="currentColor"/></svg>}
      {kind === "gate" && <svg {...common}><path d="M3 11l4-8 4 8H3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>}
    </span>
  );
}

/* ============================================================
   GATE APPROVALS INBOX
   ============================================================ */

const APPROVAL_GATES = [
  {
    id: "g_7b02",
    title: "Approve async tool-handler migration",
    task_id: "t_4a18", task_title: "Migrate tool registry to async handler model",
    phase: "design_review", urgency: "high",
    agent: "design-agent", age: "14m",
    confidence: 0.78,
    summary: "Design proposes replacing the synchronous tool-call path with an async contract. Breaking change for internal tool authors; public SDK is unaffected.",
    risks: [
      { tone: "review", label: "Breaking change", body: "Internal tool authors must update handlers. 12 call sites identified." },
      { tone: "active", label: "Rollout", body: "Plan includes a 90-day sync-handler shim before removal." },
      { tone: "done",   label: "Test coverage", body: "Contract tests added; mypy strict passes." },
    ],
    checks: [
      { name: "type-check", status: "pass" },
      { name: "contract-lint", status: "warn" },
      { name: "perf-budget", status: "pass" },
    ],
  },
  {
    id: "g_5e44",
    title: "Approve evidence-graph schema v2",
    task_id: "t_5e44", task_title: "Schema v2 — attach evidence graph to knowledge docs",
    phase: "design_review", urgency: "med",
    agent: "design-agent", age: "42m",
    confidence: 0.92,
    summary: "Adds evidence_node and evidence_edge tables, foreign-keyed to knowledge.doc. Backfill for existing docs is deferred.",
    risks: [
      { tone: "done",   label: "Additive only", body: "No existing columns or tables change." },
      { tone: "active", label: "Backfill cost", body: "~12 minutes at current KB size." },
    ],
    checks: [
      { name: "schema-lint", status: "pass" },
      { name: "migration-dry-run", status: "pass" },
    ],
  },
  {
    id: "g_2c77",
    title: "Approve OTEL instrumentation rollout",
    task_id: "t_2c77", task_title: "Emit OTEL spans for every subagent tool call",
    phase: "planning", urgency: "low",
    agent: "plan-agent", age: "3h",
    confidence: 0.81,
    summary: "Instrument every subagent tool call. Spans include tool_name, args_hash, and result_kind. No PII in spans.",
    risks: [
      { tone: "active", label: "Overhead", body: "~1.2ms per tool call on the hot path." },
    ],
    checks: [
      { name: "privacy-scan", status: "pass" },
      { name: "perf-budget", status: "pass" },
    ],
  },
];

const URGENCY_META = {
  high: { label: "High", hue: 28 },
  med:  { label: "Med",  hue: 82 },
  low:  { label: "Low",  hue: 212 },
};

function InboxPage({ onSelectTask }) {
  const [selected, setSelected] = React.useState(APPROVAL_GATES[0]);
  const [filter, setFilter] = React.useState("all");

  const list = filter === "all" ? APPROVAL_GATES : APPROVAL_GATES.filter(g => g.urgency === filter);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Gate approvals · inbox"
        kicker="Your signatures, pending."
        title={<>Decisions that want <span className="display-serif italic">a human.</span></>}
        description="Work is gated before it ships. Each card is a pending approval — the agent has done the work, the quality checks have run, and now it's waiting on you."
        meta={<LivePulse running label={`${APPROVAL_GATES.length} pending`} />}
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "380px minmax(0,1fr)" }}>
        <Surface className="p-3 space-y-2">
          <div className="flex gap-1 pb-1">
            {[
              ["all","All",APPROVAL_GATES.length],
              ["high","High", APPROVAL_GATES.filter(g => g.urgency==="high").length],
              ["med","Med",   APPROVAL_GATES.filter(g => g.urgency==="med").length],
              ["low","Low",   APPROVAL_GATES.filter(g => g.urgency==="low").length],
            ].map(([v,l,c]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={cn(
                  "flex-1 h-7 rounded-[var(--radius-sm)] text-[11px] font-medium inline-flex items-center justify-center gap-1",
                  filter === v ? "text-[var(--fg-on-accent)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"
                )}
                style={{
                  background: filter === v ? "var(--accent)" : "var(--surface-2)",
                  border: "1px solid var(--line)",
                }}
              >
                <span>{l}</span>
                <span className="font-mono text-[9.5px] opacity-70">{c}</span>
              </button>
            ))}
          </div>
          <div className="space-y-1">
            {list.map((g) => (
              <GateListItem
                key={g.id}
                gate={g}
                active={selected.id === g.id}
                onClick={() => setSelected(g)}
              />
            ))}
          </div>
        </Surface>

        <GateDetail key={selected.id} gate={selected} onJumpToTask={() => onSelectTask?.({ id: selected.task_id, title: selected.task_title, agent_name: selected.agent, status: selected.phase })} />
      </div>
    </div>
  );
}

function GateListItem({ gate, active, onClick }) {
  const u = URGENCY_META[gate.urgency];
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-3 rounded-[var(--radius-md)] border transition-colors",
        active ? "bg-[color-mix(in_oklab,var(--accent)_6%,var(--surface))]" : "hover:bg-[var(--surface-2)]"
      )}
      style={{ borderColor: active ? "color-mix(in oklab, var(--accent) 30%, var(--line))" : "transparent" }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="inline-flex items-center px-1.5 h-4.5 rounded-[4px] font-mono text-[9.5px] uppercase tracking-[0.14em]"
          style={{
            background: `oklch(0.96 0.02 ${u.hue})`,
            color: `oklch(0.4 0.12 ${u.hue})`,
            border: `1px solid oklch(0.9 0.04 ${u.hue})`,
            paddingTop: 2, paddingBottom: 2,
          }}
        >{u.label}</span>
        <span className="font-mono text-[10px] text-[var(--fg-muted)]">{gate.id}</span>
        <span className="font-mono text-[10px] text-[var(--fg-muted)] ml-auto">{gate.age} ago</span>
      </div>
      <div className="text-[13px] font-medium text-[var(--fg)] leading-[1.35] mb-1">{gate.title}</div>
      <div className="flex items-center gap-2">
        <StatusDot tone="review" pulse size={5} />
        <span className="font-mono text-[10.5px] text-[var(--fg-3)]">{gate.agent}</span>
        <span className="font-mono text-[10.5px] text-[var(--fg-muted)]">·</span>
        <span className="font-mono text-[10.5px] text-[var(--fg-3)] truncate">{gate.task_id}</span>
      </div>
    </button>
  );
}

function GateDetail({ gate, onJumpToTask }) {
  return (
    <Surface className="p-7 space-y-6 fade-up">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <StatusPill status="review_pending" />
          <span className="font-mono text-[11px] text-[var(--fg-muted)]">{gate.id}</span>
          <span className="font-mono text-[11px] text-[var(--fg-muted)]">· {gate.age} ago</span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onJumpToTask}>Open run →</Button>
          </div>
        </div>
        <h2 className="display-serif text-[var(--fg)]" style={{ fontSize: 30, lineHeight: 1.12, letterSpacing: "-0.02em" }}>
          {gate.title}
        </h2>
        <p className="text-[15px] leading-[1.7] text-[var(--fg-2)] font-serif">{gate.summary}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Confidence" value={`${Math.round(gate.confidence * 100)}%`}>
          <ConfidenceBar value={gate.confidence} />
        </MetricCard>
        <MetricCard label="Agent" value={gate.agent} mono />
        <MetricCard label="Task" value={gate.task_id} mono />
      </div>

      <section className="space-y-2">
        <Eyebrow>Risks & notes</Eyebrow>
        <div className="space-y-1.5">
          {gate.risks.map((r, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-3 py-2.5 rounded-[var(--radius-md)]"
              style={{ background: "var(--surface-2)", border: "1px solid var(--line)" }}
            >
              <StatusDot tone={r.tone} size={6} />
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-[var(--fg)]">{r.label}</div>
                <div className="text-[12.5px] text-[var(--fg-2)] leading-[1.55] mt-0.5">{r.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <Eyebrow>Quality checks</Eyebrow>
        <div className="grid grid-cols-3 gap-2">
          {gate.checks.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-sm)]"
              style={{ background: "var(--surface-2)", border: "1px solid var(--line)" }}
            >
              <StatusDot tone={c.status === "pass" ? "done" : c.status === "warn" ? "review" : "blocked"} size={6} />
              <span className="font-mono text-[11px] text-[var(--fg-2)] flex-1">{c.name}</span>
              <span className="font-mono text-[10px] text-[var(--fg-muted)] uppercase">{c.status}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: "var(--line-2)" }}>
        <div className="flex-1 pt-4 text-[11.5px] text-[var(--fg-muted)] font-mono">
          Signing approves the design and unblocks implementation.
        </div>
        <div className="pt-4 flex gap-2">
          <Button variant="ghost" size="md">Request changes</Button>
          <Button variant="outline" size="md">Defer</Button>
          <Button variant="primary" size="md">Approve & dispatch</Button>
        </div>
      </div>
    </Surface>
  );
}

function MetricCard({ label, value, mono, children }) {
  return (
    <div className="p-3 rounded-[var(--radius-md)]" style={{ background: "var(--surface-2)", border: "1px solid var(--line)" }}>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--fg-muted)] mb-1.5">{label}</div>
      <div className={cn("text-[var(--fg)]", mono ? "font-mono text-[13px]" : "text-[17px] font-medium tabular-nums")}>{value}</div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

/* ============================================================
   RUN COMPARE
   ============================================================ */

const COMPARE_RUNS = [
  {
    id: "r_a1",
    task_id: "t_9f21", task_title: "Add rate-limit retry to /v1/runs",
    agent: "impl-agent", model: "opus-4.1", strategy: "conservative",
    status: "review_pending", cost_usd: 0.1842, turns: 42, confidence: 0.78, duration: "6m 52s",
    verdict: "Shipped cleanly with a follow-up logged for HTTP-date Retry-After.",
    timeline: [
      { kind: "user", ts: "14:21:02", body: "Add resilient retry honoring Retry-After." },
      { kind: "thinking", ts: "14:21:14", body: "Conservative: retry only on 429, exponential with jitter, Retry-After as integer seconds." },
      { kind: "tool", name: "read_file", ts: "14:21:22", args: "src/api/runs.py", result: "312 lines" },
      { kind: "tool", name: "edit_file", ts: "14:22:09", args: "runs.py +38 / -6", result: "ok" },
      { kind: "gate", name: "type-check", ts: "14:22:17", status: "pass", body: "mypy strict — no new errors" },
      { kind: "gate", name: "contract-lint", ts: "14:22:19", status: "warn", body: "HTTP-date Retry-After not handled; non-blocking." },
    ],
  },
  {
    id: "r_b1",
    task_id: "t_9f21", task_title: "Add rate-limit retry to /v1/runs",
    agent: "impl-agent", model: "sonnet-4.5", strategy: "aggressive",
    status: "done", cost_usd: 0.0824, turns: 28, confidence: 0.86, duration: "4m 11s",
    verdict: "Slightly broader scope (handled both 429 and 503), no gate warnings.",
    timeline: [
      { kind: "user", ts: "14:21:02", body: "Add resilient retry honoring Retry-After." },
      { kind: "thinking", ts: "14:21:10", body: "Aggressive: retry on 429 and 503, handle Retry-After as seconds OR HTTP-date." },
      { kind: "tool", name: "read_file", ts: "14:21:15", args: "src/api/runs.py", result: "312 lines" },
      { kind: "tool", name: "edit_file", ts: "14:21:45", args: "runs.py +52 / -6", result: "ok" },
      { kind: "tool", name: "run_tests", ts: "14:21:58", args: "tests/test_api_routes.py", result: "passed in 1.1s" },
      { kind: "gate", name: "type-check", ts: "14:22:02", status: "pass", body: "mypy strict — clean" },
      { kind: "gate", name: "contract-lint", ts: "14:22:05", status: "pass", body: "clean" },
    ],
  },
];

function ComparePage() {
  const [leftId, setLeftId] = React.useState(COMPARE_RUNS[0].id);
  const [rightId, setRightId] = React.useState(COMPARE_RUNS[1].id);
  const left = COMPARE_RUNS.find(r => r.id === leftId);
  const right = COMPARE_RUNS.find(r => r.id === rightId);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Run compare · side-by-side"
        kicker="Two roads, one commit."
        title={<>When strategies <span className="display-serif italic">diverge.</span></>}
        description="The same task dispatched to two agents with different models or strategies. Compare reasoning, tool calls, gate outcomes, and cost — then keep the one you like."
      />

      <div
        className="px-5 py-3 flex items-center gap-4 rounded-[var(--radius-md)]"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        <Eyebrow>Task</Eyebrow>
        <span className="font-mono text-[11px] text-[var(--fg-muted)]">{left.task_id}</span>
        <span className="text-[13px] text-[var(--fg)]">{left.task_title}</span>
        <span className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm">Keep left</Button>
          <Button variant="ghost" size="sm">Keep right</Button>
          <Button variant="outline" size="sm">Discard both</Button>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <RunColumn run={left} side="left" />
        <RunColumn run={right} side="right" />
      </div>

      <Surface className="p-5">
        <Eyebrow className="mb-3">Diff at a glance</Eyebrow>
        <div className="grid grid-cols-4 gap-4">
          <DiffRow label="Model"        left={left.model}           right={right.model}        mono winner={right.cost_usd < left.cost_usd ? "right" : "left"} />
          <DiffRow label="Strategy"     left={left.strategy}        right={right.strategy}     mono />
          <DiffRow label="Cost"         left={`$${left.cost_usd.toFixed(4)}`} right={`$${right.cost_usd.toFixed(4)}`} winner={right.cost_usd < left.cost_usd ? "right" : "left"} />
          <DiffRow label="Duration"     left={left.duration}        right={right.duration}     winner={right.duration.length < left.duration.length ? "right" : "left"} />
          <DiffRow label="Turns"        left={left.turns}           right={right.turns}        winner={right.turns < left.turns ? "right" : "left"} />
          <DiffRow label="Confidence"   left={`${Math.round(left.confidence*100)}%`} right={`${Math.round(right.confidence*100)}%`} winner={right.confidence > left.confidence ? "right" : "left"} />
          <DiffRow label="Final status" left={left.status}          right={right.status}       mono winner={right.status === "done" ? "right" : "left"} />
          <DiffRow label="Tool calls"   left={left.timeline.filter(t=>t.kind==="tool").length} right={right.timeline.filter(t=>t.kind==="tool").length} />
        </div>
      </Surface>
    </div>
  );
}

function RunColumn({ run, side }) {
  return (
    <Surface className="p-0 overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: "var(--line-2)" }}>
        <span
          className="inline-flex items-center px-1.5 h-5 rounded-[5px] font-mono text-[10px] uppercase tracking-[0.14em]"
          style={{
            background: "color-mix(in oklab, var(--accent) 12%, transparent)",
            color: "var(--accent)",
            border: "1px solid color-mix(in oklab, var(--accent) 30%, var(--line))",
          }}
        >{side === "left" ? "A · baseline" : "B · variant"}</span>
        <span className="font-mono text-[11px] text-[var(--fg-muted)]">{run.id}</span>
        <StatusPill status={run.status} />
        <span className="ml-auto font-mono text-[11px] text-[var(--fg-3)]">{run.model}</span>
      </div>

      <div className="px-5 py-4 grid grid-cols-4 gap-2 border-b" style={{ borderColor: "var(--line-2)" }}>
        <MiniStat label="Cost"       value={`$${run.cost_usd.toFixed(4)}`} />
        <MiniStat label="Duration"   value={run.duration} />
        <MiniStat label="Turns"      value={run.turns} />
        <MiniStat label="Confidence" value={`${Math.round(run.confidence*100)}%`} />
      </div>

      <div className="px-5 py-4 border-b space-y-1.5" style={{ borderColor: "var(--line-2)" }}>
        <Eyebrow>Verdict</Eyebrow>
        <p className="text-[13.5px] text-[var(--fg-2)] leading-[1.6] font-serif italic">"{run.verdict}"</p>
      </div>

      <div className="px-5 py-4 flex-1">
        <Eyebrow className="mb-3">Thread</Eyebrow>
        <AgentTimeline items={run.timeline} />
      </div>
    </Surface>
  );
}

function MiniStat({ label, value }) {
  return (
    <div>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--fg-muted)]">{label}</div>
      <div className="text-[14px] font-mono text-[var(--fg)] tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

function DiffRow({ label, left, right, mono, winner }) {
  const leftWin = winner === "left";
  const rightWin = winner === "right";
  const cell = (val, win) => (
    <span
      className={cn("inline-block px-2 py-0.5 rounded-[5px] tabular-nums", mono && "font-mono")}
      style={{
        background: win ? "color-mix(in oklab, var(--status-done) 12%, transparent)" : "transparent",
        color: win ? "var(--status-done-ink)" : "var(--fg)",
        fontSize: mono ? 11.5 : 13,
        fontWeight: win ? 500 : 400,
      }}
    >{val}</span>
  );
  return (
    <div>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--fg-muted)] mb-1.5">{label}</div>
      <div className="flex items-center gap-2">
        {cell(left, leftWin)}
        <span className="text-[var(--fg-muted)] font-mono text-[10px]">vs</span>
        {cell(right, rightWin)}
      </div>
    </div>
  );
}

/* PageIntro re-import */
const PageIntro = (props) => {
  const _PI = window.__PageIntro;
  if (_PI) return <_PI {...props} />;
  return (
    <header className="pb-5 border-b border-[var(--line-2)] space-y-2">
      <Eyebrow>{props.eyebrow}</Eyebrow>
      <h1 className="display-serif" style={{ fontSize: 32, lineHeight: 1.08 }}>{props.title}</h1>
      {props.description && <p className="text-[14px] text-[var(--fg-3)]">{props.description}</p>}
    </header>
  );
};

Object.assign(window, {
  CommandPalette, InboxPage, ComparePage, APPROVAL_GATES,
});
