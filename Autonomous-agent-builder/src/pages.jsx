/* Pages: Board, Agent detail, Metrics, Knowledge, Tokens inspector */

const {
  cn, StatusDot, StatusPill, Button, Surface, Eyebrow, Kbd, Code, Meter, Stat, Tabs, Input, BrandMark,
  LivePulse, CostMeter, Sparkline, ConfidenceBar, LogBlock, AgentTimeline, TaskCard, PhaseStepper, PHASES,
} = window;

/* =====================================================================
   BOARD PAGE
   ===================================================================== */
function BoardPage({ onSelectTask }) {
  const [density, setDensity] = React.useState("comfortable");
  const board = window.BOARD_DATA;
  const lanes = [
    { key: "active",  title: "In progress", tasks: board.active,  tone: "active"  },
    { key: "review",  title: "Needs review", tasks: board.review,  tone: "review"  },
    { key: "pending", title: "Queued",       tasks: board.pending, tone: "pending" },
    { key: "done",    title: "Shipped",      tasks: board.done,    tone: "done"    },
    { key: "blocked", title: "Blocked",      tasks: board.blocked, tone: "blocked" },
  ];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Pipeline · board"
        kicker="A calm operator view."
        title={<>Every task, every phase — <span className="display-serif italic">one horizon.</span></>}
        description="Five status lanes, one unified visual grammar. Active runs breathe. Blocked work is hatched. Reviewable work glows amber. Nothing is louder than it needs to be."
        meta={
          <div className="flex items-center gap-2">
            <LivePulse running label="Stream · live" />
            <Tabs
              value={density}
              onChange={setDensity}
              items={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact", label: "Compact" },
              ]}
            />
            <Button variant="outline" size="md">
              <span>Dispatch task</span>
              <Kbd>⌘N</Kbd>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-5 gap-4">
        {lanes.map((lane) => (
          <BoardLane
            key={lane.key}
            lane={lane}
            density={density}
            onSelectTask={onSelectTask}
          />
        ))}
      </div>
    </div>
  );
}

function BoardLane({ lane, density, onSelectTask }) {
  const color = `var(--status-${lane.tone})`;
  return (
    <div
      className="flex flex-col rounded-[var(--radius-lg)] relative"
      style={{
        background: `color-mix(in oklab, ${color} 3%, var(--surface))`,
        border: "1px solid var(--line)",
        minHeight: 400,
      }}
    >
      <div
        className="flex items-center justify-between gap-2 px-3 h-10 border-b"
        style={{ borderColor: "var(--line-2)" }}
      >
        <div className="flex items-center gap-2">
          <StatusDot tone={lane.tone} pulse={lane.key === "active"} size={7} />
          <span className="text-[12.5px] font-medium text-[var(--fg)]">{lane.title}</span>
        </div>
        <span
          className="font-mono text-[11px] px-1.5 rounded-[5px] tabular-nums"
          style={{ background: `oklch(from ${color} l c h / 0.12)`, color: `oklch(from ${color} calc(l - 0.1) c h)` }}
        >
          {lane.tasks.length}
        </span>
      </div>
      {lane.key === "active" && (
        <div className="px-3 py-2 border-b" style={{ borderColor: "var(--line-2)" }}>
          <PhaseStepper current={2} />
        </div>
      )}
      <div
        className={cn(
          "flex-1 p-2 space-y-2 overflow-auto",
          density === "compact" && "space-y-1.5"
        )}
      >
        {lane.tasks.length === 0 ? (
          <div
            className="h-full grid place-items-center p-6 rounded-[var(--radius-md)] hatch"
            style={{ color: "var(--fg-muted)", fontSize: 12 }}
          >
            — empty —
          </div>
        ) : (
          lane.tasks.map((t) => (
            <TaskCard key={t.id} task={t} onClick={() => onSelectTask?.(t)} />
          ))
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   PAGE INTRO
   ===================================================================== */
function PageIntro({ eyebrow, kicker, title, description, meta }) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between pb-5 border-b border-[var(--line-2)]">
      <div className="max-w-[720px] space-y-2">
        <Eyebrow>{eyebrow}</Eyebrow>
        {kicker && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent-ink)]">
            {kicker}
          </p>
        )}
        <h1
          className="display-serif text-[var(--fg)]"
          style={{ fontSize: "clamp(28px, 3.4vw, 40px)", lineHeight: 1.08, letterSpacing: "-0.022em" }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-[14px] leading-[1.6] text-[var(--fg-3)] max-w-[620px]">{description}</p>
        )}
      </div>
      {meta && <div className="flex items-center gap-3 flex-wrap">{meta}</div>}
    </header>
  );
}

/* =====================================================================
   AGENT DETAIL PAGE
   ===================================================================== */
function AgentPage({ task }) {
  const [tab, setTab] = React.useState("thread");
  const t = task || window.BOARD_DATA.active[0];
  const logLines = [
    'claude-agent <span style="color:var(--accent-ink)">v0.42.1</span> <span style="color:var(--fg-muted)">model=sonnet-4.5</span>',
    'resolved <span style="color:var(--status-active)">tool-registry</span> → 14 tools registered',
    'executing <span style="color:var(--fg-2)">edit_file(runs.py)</span> <span style="color:var(--fg-muted)">+38 / -6</span>',
    'running <span style="color:var(--fg-2)">pytest</span> <span style="color:var(--fg-muted)">tests/test_api_routes.py::test_rate_limit</span>',
    '<span style="color:var(--status-done)">pass</span> test_rate_limit <span style="color:var(--fg-muted)">1.2s</span>',
    'gate <span style="color:var(--fg-2)">type-check</span> → <span style="color:var(--status-done)">pass</span> <span style="color:var(--fg-muted)">0 issues</span>',
    'gate <span style="color:var(--fg-2)">contract-lint</span> → <span style="color:var(--status-review)">warn</span> <span style="color:var(--fg-muted)">1 non-blocking</span>',
  ];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow={`Task · ${t.id}`}
        kicker={t.feature_title}
        title={t.title}
        description="Live trace of the agent's reasoning, tool calls, and gate outcomes. Everything you need to intervene, approve, or follow along."
        meta={
          <div className="flex items-center gap-2 flex-wrap">
            <StatusPill status={t.status} />
            <LivePulse running={t.status !== "done" && t.status !== "blocked"} label="agent · thinking" />
            <Button variant="soft" size="md">Approve</Button>
            <Button variant="outline" size="md">Pause run</Button>
          </div>
        }
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "minmax(0,1fr) 340px" }}>
        {/* Main */}
        <div className="space-y-4">
          <Surface className="p-5 space-y-5 ambient-surface relative overflow-hidden">
            <div className="ambient-scan absolute inset-0 opacity-60" />
            <div className="relative flex items-center justify-between">
              <PhaseStepper current={2} />
              <Tabs
                value={tab}
                onChange={setTab}
                items={[
                  { value: "thread", label: "Thread" },
                  { value: "logs",   label: "Raw log" },
                  { value: "diffs",  label: "Diffs" },
                ]}
              />
            </div>
          </Surface>

          {tab === "thread" && (
            <Surface className="p-5">
              <AgentTimeline items={window.AGENT_THREAD} />
            </Surface>
          )}
          {tab === "logs" && (
            <Surface className="p-5">
              <LogBlock lines={logLines} maxHeight={360} />
            </Surface>
          )}
          {tab === "diffs" && (
            <Surface className="p-5">
              <DiffBlock />
            </Surface>
          )}
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <Surface className="p-4 space-y-3">
            <Eyebrow>Current run</Eyebrow>
            <CostMeter value={t.cost_usd} budget={0.25} sparkline={window.METRICS.sparkline_cost} />
          </Surface>

          <Surface className="p-4 space-y-3">
            <Eyebrow>Signals</Eyebrow>
            <ConfidenceBar value={t.confidence} />
            <div className="space-y-2 pt-1">
              <KV label="Turns"       value={<span className="font-mono">{t.num_turns}</span>} />
              <KV label="Duration"    value={<span className="font-mono">{Math.round(t.duration_ms / 1000)}s</span>} />
              <KV label="Agent"       value={<Code>{t.agent_name}</Code>} />
              <KV label="Model"       value={<Code>sonnet-4.5</Code>} />
            </div>
          </Surface>

          <Surface className="p-4 space-y-3">
            <Eyebrow>Gates</Eyebrow>
            <GateRow name="type-check" status="pass" detail="0 issues · 0.4s" />
            <GateRow name="unit-tests" status="pass" detail="48 passed · 1.2s" />
            <GateRow name="contract-lint" status="warn" detail="1 non-blocking" />
            <GateRow name="runtime-boundary" status="pending" detail="queued" />
          </Surface>

          <Surface className="p-4 space-y-2">
            <Eyebrow>Approvals</Eyebrow>
            <p className="text-[12.5px] text-[var(--fg-3)] leading-[1.5]">
              No gate requires human approval yet. Approval will be requested after the implementation phase completes.
            </p>
          </Surface>
        </aside>
      </div>
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12.5px]">
      <span className="text-[var(--fg-3)]">{label}</span>
      <span className="text-[var(--fg)]">{value}</span>
    </div>
  );
}

function GateRow({ name, status, detail }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <StatusDot tone={window.STATUS_TONE[status] || "pending"} size={7} />
        <span className="text-[12.5px] text-[var(--fg)] truncate">{name}</span>
      </div>
      <span className="font-mono text-[10.5px] text-[var(--fg-3)] shrink-0">{detail}</span>
    </div>
  );
}

function DiffBlock() {
  const lines = [
    { t: "file", v: "src/autonomous_agent_builder/api/runs.py" },
    { t: "hunk", v: "@@ -142,6 +142,38 @@ async def post_run(req: RunRequest):" },
    { t: "ctx",  v: "    payload = req.model_dump()" },
    { t: "rm",   v: "    response = await client.post(url, json=payload)" },
    { t: "rm",   v: "    response.raise_for_status()" },
    { t: "add",  v: "    # Retry with exp. backoff; respect Retry-After integers." },
    { t: "add",  v: "    for attempt in range(1, MAX_RETRIES + 1):" },
    { t: "add",  v: "        response = await client.post(url, json=payload)" },
    { t: "add",  v: "        if response.status_code != 429:" },
    { t: "add",  v: "            break" },
    { t: "add",  v: "        wait = parse_retry_after(response) or (2 ** attempt) * 0.25" },
    { t: "add",  v: "        await asyncio.sleep(min(wait, MAX_BACKOFF))" },
    { t: "add",  v: "    response.raise_for_status()" },
  ];
  return (
    <div
      className="rounded-[var(--radius-md)] border overflow-hidden font-mono text-[12px]"
      style={{ borderColor: "var(--line)", background: "var(--bg-sunk)" }}
    >
      {lines.map((l, i) => {
        const map = {
          file: { bg: "color-mix(in oklab, var(--fg) 6%, transparent)", c: "var(--fg-2)" },
          hunk: { bg: "color-mix(in oklab, var(--accent) 8%, transparent)", c: "var(--accent-ink)" },
          ctx:  { bg: "transparent", c: "var(--fg-3)" },
          add:  { bg: "color-mix(in oklab, var(--status-done) 8%, transparent)", c: "var(--status-done)" },
          rm:   { bg: "color-mix(in oklab, var(--status-blocked) 8%, transparent)", c: "var(--status-blocked)" },
        };
        const s = map[l.t];
        const prefix = l.t === "add" ? "+" : l.t === "rm" ? "−" : l.t === "hunk" ? "@" : l.t === "file" ? "›" : " ";
        return (
          <div key={i} className="flex gap-3 px-3 py-0.5" style={{ background: s.bg, color: s.c }}>
            <span className="text-[var(--fg-muted)] w-6 text-right select-none tabular-nums">{i + 1}</span>
            <span className="w-3 select-none">{prefix}</span>
            <span className="whitespace-pre">{l.v}</span>
          </div>
        );
      })}
    </div>
  );
}

/* =====================================================================
   METRICS PAGE
   ===================================================================== */
function MetricsPage() {
  const m = window.METRICS;
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Metrics · runs"
        kicker="The cost of autonomy, plotted."
        title={<>What the agents <span className="display-serif italic">spent today.</span></>}
        description="Roll-ups over the last 24h: total cost, tokens, pass rate, and per-run breakdown. Numerics use tabular-lining figures for clean vertical alignment."
      />

      <div className="grid grid-cols-4 gap-4">
        <Surface className="p-5"><Stat label="Total cost · 24h" value={`$${m.total_cost.toFixed(2)}`} detail="+$0.82 vs 24h ago" accent /></Surface>
        <Surface className="p-5"><Stat label="Tokens" value={`${(m.total_tokens / 1_000_000).toFixed(2)}M`} detail="~42% cached" /></Surface>
        <Surface className="p-5"><Stat label="Runs" value={m.total_runs.toString()} detail="6 active · 2 review" /></Surface>
        <Surface className="p-5">
          <Stat label="Gate pass rate" value={`${(m.gate_pass_rate * 100).toFixed(0)}%`} detail="last 100 runs" />
        </Surface>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "minmax(0,1fr) 360px" }}>
        <Surface className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Eyebrow>Cost per hour</Eyebrow>
              <p className="mt-1 text-[13px] text-[var(--fg-3)]">Rolling window · last 14h</p>
            </div>
            <Tabs
              value="cost"
              onChange={() => {}}
              items={[{ value: "cost", label: "Cost" }, { value: "latency", label: "Latency" }, { value: "tokens", label: "Tokens" }]}
            />
          </div>
          <BarChart data={m.sparkline_cost} />
        </Surface>
        <Surface className="p-5 space-y-3">
          <Eyebrow>By agent</Eyebrow>
          <AgentBreakdown />
        </Surface>
      </div>

      <Surface className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 h-12 border-b" style={{ borderColor: "var(--line-2)" }}>
          <Eyebrow>Recent runs</Eyebrow>
          <div className="flex items-center gap-2">
            <Input placeholder="Filter by task, agent, status…" className="w-72" />
            <Button variant="outline" size="md">Export CSV</Button>
          </div>
        </div>
        <RunTable runs={m.runs} />
      </Surface>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-40">
      {data.map((v, i) => {
        const h = (v / max) * 100;
        const isLast = i === data.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="relative w-full flex-1 flex items-end">
              <div
                className={cn("w-full rounded-[3px] transition-all", isLast && "breathe")}
                style={{
                  height: `${h}%`,
                  background: isLast
                    ? "var(--accent)"
                    : "color-mix(in oklab, var(--accent) 28%, transparent)",
                  border: `1px solid color-mix(in oklab, var(--accent) ${isLast ? 60 : 20}%, transparent)`,
                }}
              />
            </div>
            <span className="font-mono text-[9px] text-[var(--fg-muted)]">{i + 1}</span>
          </div>
        );
      })}
    </div>
  );
}

function AgentBreakdown() {
  const rows = [
    { name: "impl-agent",   cost: 3.12, share: 0.65, runs: 31 },
    { name: "design-agent", cost: 1.04, share: 0.22, runs: 8 },
    { name: "plan-agent",   cost: 0.66, share: 0.13, runs: 4 },
  ];
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.name} className="space-y-1.5">
          <div className="flex items-center justify-between text-[12.5px]">
            <span className="font-mono text-[var(--fg)]">{r.name}</span>
            <span className="font-mono text-[var(--fg-2)] tabular-nums">${r.cost.toFixed(2)}</span>
          </div>
          <div className="meter-track" style={{ height: 4 }}>
            <div className="meter-fill" style={{ width: `${r.share * 100}%`, background: "var(--accent)" }} />
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] text-[var(--fg-muted)]">
            <span>{(r.share * 100).toFixed(0)}% share</span>
            <span>{r.runs} runs</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RunTable({ runs }) {
  return (
    <table className="w-full text-[12.5px]" style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr className="text-left" style={{ background: "color-mix(in oklab, var(--fg) 3%, transparent)" }}>
          {["Run", "Task", "Agent", "Status", "Turns", "Tokens", "Cost", "Duration"].map((h, i) => (
            <th
              key={h}
              className={cn(
                "px-5 h-9 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--fg-3)] font-medium",
                i >= 4 && "text-right"
              )}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {runs.map((r) => (
          <tr
            key={r.id}
            className="border-t hover:bg-[color-mix(in_oklab,var(--fg)_3%,transparent)] transition-colors"
            style={{ borderColor: "var(--line-2)" }}
          >
            <td className="px-5 h-11 font-mono text-[var(--fg-2)]">{r.id}</td>
            <td className="px-5 h-11 font-mono text-[var(--fg-2)]">{r.task}</td>
            <td className="px-5 h-11 font-mono text-[var(--fg-3)]">{r.agent}</td>
            <td className="px-5 h-11"><StatusPill status={r.status} /></td>
            <td className="px-5 h-11 font-mono text-right tabular-nums text-[var(--fg)]">{r.turns}</td>
            <td className="px-5 h-11 font-mono text-right tabular-nums text-[var(--fg)]">{r.tokens.toLocaleString()}</td>
            <td className="px-5 h-11 font-mono text-right tabular-nums text-[var(--fg)]">${r.cost.toFixed(4)}</td>
            <td className="px-5 h-11 font-mono text-right tabular-nums text-[var(--fg-2)]">{Math.round(r.duration_ms / 1000)}s</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* =====================================================================
   KNOWLEDGE PAGE
   ===================================================================== */
function KnowledgePage() {
  const docs = window.KNOWLEDGE_DOCS;
  const [selected, setSelected] = React.useState(docs[0]);
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Knowledge · graph"
        kicker="The agent's durable memory."
        title={<>ADRs, runbooks, contracts — <span className="display-serif italic">linked.</span></>}
        description="Every decision and contract the agents produced is versioned, tagged, and cross-linked. Browse by type, search full-text, or follow wikilinks."
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "320px minmax(0,1fr)" }}>
        <Surface className="p-3 space-y-2">
          <Input placeholder="Search docs, tags, #wikilinks…" />
          <div className="flex flex-wrap gap-1 pt-1 pb-2">
            {["all", "adr", "runbook", "api_contract", "schema", "context"].map((t, i) => (
              <button
                key={t}
                className={cn(
                  "px-2 h-6 rounded-[var(--radius-full)] text-[11px] font-mono transition-colors",
                  i === 0 ? "bg-[var(--accent)] text-[var(--fg-on-accent)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"
                )}
                style={i !== 0 ? { border: "1px solid var(--line)" } : {}}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            {docs.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelected(d)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] border transition-colors",
                  selected.id === d.id ? "bg-[color-mix(in_oklab,var(--accent)_6%,var(--surface))]" : "hover:bg-[var(--surface-2)]"
                )}
                style={{ borderColor: selected.id === d.id ? "color-mix(in oklab, var(--accent) 30%, var(--line))" : "transparent" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <DocTypeBadge type={d.type} />
                  <span className="font-mono text-[10px] text-[var(--fg-muted)] ml-auto">{d.updated}</span>
                </div>
                <h4 className="text-[13px] font-medium text-[var(--fg)] leading-[1.35]">{d.title}</h4>
              </button>
            ))}
          </div>
        </Surface>

        <Surface className="p-7 space-y-5">
          <div className="flex items-center gap-2">
            <DocTypeBadge type={selected.type} />
            <span className="font-mono text-[11px] text-[var(--fg-muted)]">{selected.id} · v3</span>
            <span className="font-mono text-[11px] text-[var(--fg-muted)] ml-auto">Updated {selected.updated}</span>
          </div>
          <h2
            className="display-serif text-[var(--fg)]"
            style={{ fontSize: 30, lineHeight: 1.12, letterSpacing: "-0.02em" }}
          >
            {selected.title}
          </h2>
          <p className="text-[15px] leading-[1.7] text-[var(--fg-2)] font-serif">{selected.excerpt}</p>
          <div className="pt-3 space-y-3">
            <h3 className="text-[13px] font-medium text-[var(--fg)]">Context</h3>
            <p className="text-[13.5px] leading-[1.7] text-[var(--fg-2)]">
              The existing synchronous interface forced us to run tools on the main agent thread. As tool counts grew (past 14), any slow
              tool — in particular network-bound ones like <Code>fetch_url</Code> and <Code>run_tests</Code> — would stall other concurrent
              tool calls and starve the agent's reasoning step.
            </p>
            <h3 className="text-[13px] font-medium text-[var(--fg)]">Decision</h3>
            <p className="text-[13.5px] leading-[1.7] text-[var(--fg-2)]">
              Adopt an <Code>async def handle(req)</Code> protocol. Tools return either a value, a stream, or a deferred handle. The
              registry dispatches through <Code>asyncio.gather</Code> and enforces per-tool timeouts.
            </p>
          </div>
          <div className="pt-3 flex flex-wrap gap-1.5">
            {selected.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-2 h-6 rounded-[var(--radius-full)] font-mono text-[10.5px] text-[var(--fg-3)]"
                style={{ border: "1px solid var(--line)" }}
              >
                #{t}
              </span>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}

function DocTypeBadge({ type }) {
  const map = {
    adr:          { label: "ADR",      hue: 212 },
    runbook:      { label: "Runbook",  hue: 82 },
    api_contract: { label: "Contract", hue: 264 },
    schema:       { label: "Schema",   hue: 155 },
    context:      { label: "Context",  hue: 28 },
  };
  const m = map[type] || { label: type, hue: 200 };
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

/* =====================================================================
   TOKENS / COMPONENTS inspector overlay (right-side drawer)
   ===================================================================== */
function TokensPanel({ open, onClose }) {
  const [section, setSection] = React.useState("color");
  return (
    <div
      className={cn("fixed inset-0 z-40 pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn("absolute inset-0 transition-opacity", open ? "opacity-100 pointer-events-auto" : "opacity-0")}
        style={{ background: "color-mix(in oklab, var(--bg-sunk) 60%, transparent)" }}
      />
      <aside
        className={cn(
          "absolute top-0 right-0 h-full w-[540px] transition-transform duration-300 ease-out",
          open ? "translate-x-0 pointer-events-auto" : "translate-x-full"
        )}
        style={{
          background: "var(--surface)",
          borderLeft: "1px solid var(--line)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="flex items-center justify-between h-12 px-5 border-b" style={{ borderColor: "var(--line-2)" }}>
          <Eyebrow>System inspector</Eyebrow>
          <button onClick={onClose} className="text-[var(--fg-3)] hover:text-[var(--fg)] text-[14px]">×</button>
        </div>
        <div className="px-5 pt-4">
          <Tabs
            value={section}
            onChange={setSection}
            items={[
              { value: "color",     label: "Color" },
              { value: "type",      label: "Type" },
              { value: "components", label: "Components" },
              { value: "status",    label: "Status" },
            ]}
          />
        </div>
        <div className="p-5 overflow-auto" style={{ height: "calc(100% - 110px)" }}>
          {section === "color" && <ColorInspector />}
          {section === "type" && <TypeInspector />}
          {section === "components" && <ComponentsInspector />}
          {section === "status" && <StatusInspector />}
        </div>
      </aside>
    </div>
  );
}

function Swatch({ name, token, value, fg }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-[var(--radius-sm)] border"
        style={{ background: `var(${token})`, borderColor: "var(--line)" }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] text-[var(--fg)]">{name}</div>
        <div className="font-mono text-[10.5px] text-[var(--fg-3)] truncate">{token}</div>
      </div>
    </div>
  );
}

function ColorInspector() {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Surface</Eyebrow>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Swatch name="Background" token="--bg" />
          <Swatch name="Sunk" token="--bg-sunk" />
          <Swatch name="Surface" token="--surface" />
          <Swatch name="Surface 2" token="--surface-2" />
          <Swatch name="Surface raised" token="--surface-raised" />
          <Swatch name="Line" token="--line-strong" />
        </div>
      </div>
      <div>
        <Eyebrow>Foreground</Eyebrow>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Swatch name="Foreground" token="--fg" />
          <Swatch name="Secondary" token="--fg-2" />
          <Swatch name="Tertiary" token="--fg-3" />
          <Swatch name="Muted" token="--fg-muted" />
        </div>
      </div>
      <div>
        <Eyebrow>Accent</Eyebrow>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Swatch name="Accent" token="--accent" />
          <Swatch name="Accent soft" token="--accent-soft" />
          <Swatch name="Accent ink" token="--accent-ink" />
        </div>
        <p className="mt-3 text-[12px] text-[var(--fg-3)] leading-[1.55]">
          Accent is driven by a single hue variable (<Code>--accent-hue</Code>). Change it once, and the whole system shifts — chroma and lightness stay fixed across light and dark.
        </p>
      </div>
    </div>
  );
}

function TypeInspector() {
  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div>
          <Eyebrow>Display · Newsreader</Eyebrow>
          <p className="display-serif text-[34px] leading-[1.05] mt-2">Every task, one horizon.</p>
          <p className="font-mono text-[10.5px] text-[var(--fg-muted)] mt-1">Used for page titles and editorial moments. Italic by default.</p>
        </div>
        <div>
          <Eyebrow>UI · Geist</Eyebrow>
          <p className="text-[15px] leading-[1.5] mt-2">Quiet, modern grotesk. The workhorse for every button, label, and paragraph.</p>
          <p className="font-mono text-[10.5px] text-[var(--fg-muted)] mt-1">400 / 500 / 600. Feature flags: <Code>ss01</Code>, <Code>cv11</Code>, <Code>tnum</Code>.</p>
        </div>
        <div>
          <Eyebrow>Mono · Geist Mono</Eyebrow>
          <p className="font-mono text-[13.5px] leading-[1.6] mt-2">0123456789 · agent-runtime-v0.42.1</p>
          <p className="font-mono text-[10.5px] text-[var(--fg-muted)] mt-1">Numerics, IDs, code, eyebrows. Tabular figures on by default.</p>
        </div>
      </div>
      <div>
        <Eyebrow>Scale</Eyebrow>
        <div className="mt-2 space-y-1">
          {[
            ["display", 48], ["3xl", 34], ["2xl", 26], ["xl", 20], ["lg", 17], ["md", 15], ["base", 14], ["sm", 12.5], ["xs", 11], ["micro", 10],
          ].map(([n, s]) => (
            <div key={n} className="flex items-center justify-between gap-3 py-1 border-b" style={{ borderColor: "var(--line-2)" }}>
              <span className="font-mono text-[11px] text-[var(--fg-3)] w-16">{n}</span>
              <span className="flex-1" style={{ fontSize: s, lineHeight: 1 }}>The quick brown fox</span>
              <span className="font-mono text-[10px] text-[var(--fg-muted)]">{s}px</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComponentsInspector() {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Buttons</Eyebrow>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>
      <div>
        <Eyebrow>Inputs</Eyebrow>
        <div className="mt-3 space-y-2">
          <Input placeholder="Search…" />
          <Input placeholder="Disabled" disabled />
        </div>
      </div>
      <div>
        <Eyebrow>Meters</Eyebrow>
        <div className="mt-3 space-y-3">
          <Meter value={0.32} tone="active" label="Progress" />
          <Meter value={0.78} tone="done" label="Coverage" />
          <Meter value={0.12} tone="blocked" label="Error rate" />
        </div>
      </div>
      <div>
        <Eyebrow>Confidence</Eyebrow>
        <div className="mt-3 space-y-2">
          <ConfidenceBar value={0.84} />
          <ConfidenceBar value={0.42} />
          <ConfidenceBar value={0.18} />
        </div>
      </div>
    </div>
  );
}

function StatusInspector() {
  const statuses = ["running", "implementation", "design", "review_pending", "pending", "done", "blocked"];
  return (
    <div className="space-y-5">
      <p className="text-[12.5px] text-[var(--fg-3)] leading-[1.55]">
        One grammar: dot + label + optional pulse + optional bar. Every status uses unified chroma/lightness so they sit together without clashing.
      </p>
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => <StatusPill key={s} status={s} />)}
      </div>
      <div className="space-y-2">
        {statuses.map((s) => (
          <div key={s} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: "var(--line-2)" }}>
            <StatusDot tone={window.STATUS_TONE[s]} pulse={["running", "implementation", "design"].includes(s)} />
            <span className="font-mono text-[11px] text-[var(--fg-3)] uppercase tracking-[0.16em] w-32">{s}</span>
            <StatusPill status={s} />
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  BoardPage, AgentPage, MetricsPage, KnowledgePage, TokensPanel,
  __PageIntro: PageIntro,
});
