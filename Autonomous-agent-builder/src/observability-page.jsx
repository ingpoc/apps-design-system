/* Observability page — traces, spans, system health, run history */

const {
  cn, Eyebrow, StatusDot, StatusPill, Surface,
  Tabs, LogBlock,
} = window;

/* Local helper — small uppercase label used as section header */
function OPSectionLabel({ children, trailing }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg-muted)]">
        {children}
      </span>
      {trailing}
    </div>
  );
}

/* Seed data: realistic SDK telemetry for an active session */
const TRACE_SPANS = [
  { id: "s1", name: "session.bootstrap",    parent: null,  kind: "session", duration: 142,  ts: 0,    status: "ok",    detail: "session_id=8b2c · sdk=claude · model=sonnet-4-5" },
  { id: "s2", name: "plan.draft",           parent: "s1", kind: "phase",   duration: 4820, ts: 142,  status: "ok",    detail: "produced 7 tasks, 2 gates" },
  { id: "s3", name: "knowledge.retrieve",   parent: "s2", kind: "tool",    duration: 312,  ts: 320,  status: "ok",    detail: "k=8, query=auth flow" },
  { id: "s4", name: "memory.read",          parent: "s2", kind: "tool",    duration: 184,  ts: 712,  status: "ok",    detail: "type=decision, n=3" },
  { id: "s5", name: "design.draft",         parent: "s1", kind: "phase",   duration: 6210, ts: 4962, status: "ok",    detail: "diagrams=2, contracts=1" },
  { id: "s6", name: "implement.run",        parent: "s1", kind: "phase",   duration: 11420, ts: 11172, status: "active", detail: "edits=14, files=7" },
  { id: "s7", name: "tool.bash",            parent: "s6", kind: "tool",    duration: 2210, ts: 12300, status: "ok",    detail: "pnpm test --filter auth" },
  { id: "s8", name: "tool.edit",            parent: "s6", kind: "tool",    duration: 86,   ts: 14620, status: "ok",    detail: "src/auth/session.ts" },
  { id: "s9", name: "gate.lint",            parent: "s6", kind: "gate",    duration: 1430, ts: 15100, status: "warn",  detail: "12 warnings, 0 errors" },
  { id: "s10", name: "gate.types",          parent: "s6", kind: "gate",    duration: 2280, ts: 16600, status: "ok",    detail: "0 errors" },
  { id: "s11", name: "approval.requested",  parent: "s6", kind: "gate",    duration: 0,    ts: 18920, status: "pending", detail: "awaiting human review" },
];

const HEALTH_BANDS = [
  { label: "p50",  value: "1.2s",  tone: "done"   },
  { label: "p95",  value: "4.8s",  tone: "review" },
  { label: "p99",  value: "12.4s", tone: "review" },
  { label: "Errs", value: "0.4%",  tone: "done"   },
];

const RUN_HISTORY = [
  { id: "r-9214", task: "Implement OAuth callback retry", status: "done",    cost: 0.84, turns: 18, dur: "4:12" },
  { id: "r-9213", task: "Refactor session store",         status: "review",  cost: 0.41, turns: 9,  dur: "2:38" },
  { id: "r-9212", task: "Backlog grooming · auth slice",  status: "done",    cost: 0.22, turns: 6,  dur: "1:14" },
  { id: "r-9211", task: "Redis client connection retries", status: "blocked", cost: 1.18, turns: 24, dur: "6:42" },
  { id: "r-9210", task: "Knowledge index rebuild",         status: "done",    cost: 0.07, turns: 3,  dur: "0:38" },
];

const SDK_EVENTS = [
  { ts: "00:14:21.402", level: "info",  source: "claude_sdk",     msg: "session.start id=8b2c lane=primary" },
  { ts: "00:14:21.586", level: "info",  source: "telemetry",      msg: "lane.active=primary fallback=ready" },
  { ts: "00:14:22.144", level: "info",  source: "mcp",            msg: "server.connect filesystem ok" },
  { ts: "00:14:22.190", level: "info",  source: "mcp",            msg: "server.connect knowledge ok" },
  { ts: "00:14:24.812", level: "warn",  source: "rate_limiter",   msg: "tokens_input near soft cap (84%)" },
  { ts: "00:14:31.006", level: "info",  source: "tool.bash",      msg: "exec pnpm test --filter auth" },
  { ts: "00:14:33.218", level: "info",  source: "tool.bash",      msg: "exit code=0 elapsed=2.21s" },
  { ts: "00:14:33.404", level: "info",  source: "claude_sdk",     msg: "todo.update completed=3 in_progress=1" },
  { ts: "00:14:34.118", level: "warn",  source: "gate.lint",      msg: "12 warnings, 0 errors — eligible to proceed" },
  { ts: "00:14:36.502", level: "info",  source: "gate.types",     msg: "tsc --noEmit ok" },
  { ts: "00:14:38.918", level: "info",  source: "approval",       msg: "request_changes_or_approve gate=lint" },
];

function spanColor(kind) {
  return {
    session: "var(--accent)",
    phase:   "var(--status-active)",
    tool:    "color-mix(in oklab, var(--accent) 70%, var(--fg))",
    gate:    "var(--status-review)",
  }[kind] || "var(--fg-3)";
}

function SpanRow({ span, totalDur }) {
  const left = (span.ts / totalDur) * 100;
  const width = Math.max((span.duration / totalDur) * 100, 0.4);
  const indent = span.parent ? (span.parent === "s1" ? 14 : 28) : 0;
  return (
    <div className="grid items-center gap-4 py-1.5" style={{ gridTemplateColumns: "260px 1fr 90px" }}>
      <div className="flex items-center gap-2 min-w-0" style={{ paddingLeft: indent }}>
        <StatusDot
          tone={span.status === "ok" ? "done" : span.status === "warn" ? "review" : span.status === "active" ? "active" : span.status === "pending" ? "pending" : "muted"}
          pulse={span.status === "active"}
          size={6}
        />
        <span className="font-mono text-[11px] text-[var(--fg)] truncate">{span.name}</span>
      </div>
      <div className="relative h-5 rounded-[3px]" style={{ background: "var(--bg-sunk)" }}>
        <div
          className="absolute top-0 h-full rounded-[3px]"
          style={{
            left: `${left}%`,
            width: `${width}%`,
            background: spanColor(span.kind),
            opacity: span.status === "pending" ? 0.4 : 0.85,
          }}
        />
        <div
          className="absolute top-0 h-full font-mono text-[9.5px] flex items-center px-1.5 whitespace-nowrap text-[var(--fg-muted)]"
          style={{ left: `calc(${left + width}% + 6px)` }}
        >
          {span.detail}
        </div>
      </div>
      <div className="font-mono text-[10.5px] tabular-nums text-right text-[var(--fg-muted)]">
        {span.duration ? `${span.duration}ms` : "—"}
      </div>
    </div>
  );
}

function TraceWaterfall() {
  const totalDur = TRACE_SPANS.reduce((m, s) => Math.max(m, s.ts + s.duration), 0);
  return (
    <Surface className="p-5 space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <OPSectionLabel>Trace · session 8b2c · plan → design → implement</OPSectionLabel>
          <p className="text-[12px] text-[var(--fg-3)] mt-1.5" style={{ fontFamily: "var(--font-text)" }}>
            One span per phase, tool call, and gate. Hover ranges reveal payload metadata.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { k: "session", l: "Session" },
            { k: "phase",   l: "Phase"   },
            { k: "tool",    l: "Tool"    },
            { k: "gate",    l: "Gate"    },
          ].map(({ k, l }) => (
            <span key={k} className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg-muted)]">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: spanColor(k) }} />
              {l}
            </span>
          ))}
        </div>
      </div>
      <div
        className="grid items-center gap-4 pb-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--fg-muted)] border-b"
        style={{ gridTemplateColumns: "260px 1fr 90px", borderColor: "var(--line-2)" }}
      >
        <span>Span</span>
        <span>Timeline · {Math.round(totalDur / 1000)}s window</span>
        <span className="text-right">Duration</span>
      </div>
      <div className="space-y-0.5">
        {TRACE_SPANS.map((s) => <SpanRow key={s.id} span={s} totalDur={totalDur} />)}
      </div>
    </Surface>
  );
}

function HealthRow() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {HEALTH_BANDS.map((b) => (
        <div
          key={b.label}
          className="rounded-[var(--radius-md)] p-4"
          style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
        >
          <div className="flex items-center gap-2">
            <StatusDot tone={b.tone} size={6} />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg-muted)]">{b.label}</span>
          </div>
          <div className="mt-2 font-mono tabular-nums text-[var(--fg)]" style={{ fontSize: 24, letterSpacing: "-0.02em" }}>
            {b.value}
          </div>
          <div className="text-[11px] text-[var(--fg-muted)] mt-1">last 1h · 312 runs</div>
        </div>
      ))}
    </div>
  );
}

function RunHistoryTable() {
  return (
    <Surface className="p-5 space-y-4">
      <OPSectionLabel>Recent runs</OPSectionLabel>
      <div className="space-y-1">
        <div
          className="grid items-center gap-3 pb-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--fg-muted)] border-b"
          style={{ gridTemplateColumns: "100px 1fr 90px 70px 70px 70px", borderColor: "var(--line-2)" }}
        >
          <span>Run</span>
          <span>Task</span>
          <span>Status</span>
          <span className="text-right">Cost</span>
          <span className="text-right">Turns</span>
          <span className="text-right">Time</span>
        </div>
        {RUN_HISTORY.map((r) => (
          <div
            key={r.id}
            className="grid items-center gap-3 py-2.5 border-b"
            style={{ gridTemplateColumns: "100px 1fr 90px 70px 70px 70px", borderColor: "color-mix(in oklab, var(--line-2) 70%, transparent)" }}
          >
            <span className="font-mono text-[11px] text-[var(--fg-3)]">{r.id}</span>
            <span className="text-[12.5px] text-[var(--fg)] truncate" style={{ fontFamily: "var(--font-text)" }}>{r.task}</span>
            <StatusPill status={r.status} />
            <span className="font-mono tabular-nums text-[11px] text-right text-[var(--fg-2)]">${r.cost.toFixed(2)}</span>
            <span className="font-mono tabular-nums text-[11px] text-right text-[var(--fg-2)]">{r.turns}</span>
            <span className="font-mono tabular-nums text-[11px] text-right text-[var(--fg-2)]">{r.dur}</span>
          </div>
        ))}
      </div>
    </Surface>
  );
}

function ObservabilityPage() {
  const [tab, setTab] = React.useState("trace");
  return (
    <div className="space-y-6" data-screen-label="Observability">
      <div data-stagger>
        <Eyebrow>Observability · traces · spans · evidence</Eyebrow>
        <h1
          className="mt-2 text-[var(--fg)]"
          style={{ fontFamily: "var(--font-heading)", fontSize: 36, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.08 }}
        >
          Every run, every span, every gate.
        </h1>
        <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.7] text-[var(--fg-3)]" style={{ fontFamily: "var(--font-text)" }}>
          Operator surface for debugging the agent itself: the lifecycle of a session as a waterfall of phases, tools, and gates,
          system health bands across the fleet, and the raw SDK event stream with grep-able lanes.
        </p>
      </div>

      <div data-stagger>
        <HealthRow />
      </div>

      <div data-stagger>
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "trace",   label: "Trace" },
            { value: "events",  label: "SDK events" },
            { value: "history", label: "Run history" },
          ]}
        />
      </div>

      <div data-stagger>
        {tab === "trace" && <TraceWaterfall />}
        {tab === "events" && (
          <Surface className="p-5 space-y-4">
            <OPSectionLabel>SDK event stream · session 8b2c</OPSectionLabel>
            <LogBlock
              lines={SDK_EVENTS.map((e) => `${e.ts}  ${e.level.padEnd(4)}  ${e.source.padEnd(14)}  ${e.msg}`)}
            />
          </Surface>
        )}
        {tab === "history" && <RunHistoryTable />}
      </div>
    </div>
  );
}

window.ObservabilityPage = ObservabilityPage;
