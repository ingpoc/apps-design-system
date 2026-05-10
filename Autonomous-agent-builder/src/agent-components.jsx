/* Agent-native components — LogBlock, AgentTimeline, CostMeter, ConfidenceBar, LivePulse, TaskCard */

const {
  cn, StatusDot, StatusPill, Button, Surface, Eyebrow, Code, Meter, Stat,
} = window;

/* --- LivePulse — breathing dot + ring that signals "agent active" --- */
function LivePulse({ running = true, label = "Live" }) {
  const color = running ? "var(--status-active)" : "var(--fg-muted)";
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative inline-flex">
        <span
          className="block w-[8px] h-[8px] rounded-full"
          style={{ background: color }}
        />
        {running && (
          <>
            <span
              className="absolute inset-0 rounded-full pulse-ring"
              style={{ color, background: color }}
            />
            <span
              className="absolute -inset-1 rounded-full breathe"
              style={{ background: `oklch(from ${color} l c h / 0.18)` }}
            />
          </>
        )}
      </span>
      <span
        className="font-mono text-[10.5px] uppercase tracking-[0.18em]"
        style={{ color: running ? "var(--fg-2)" : "var(--fg-muted)" }}
      >
        {label}
      </span>
    </span>
  );
}

/* --- CostMeter — dollar amount + small sparkline ---------------- */
function CostMeter({ value, budget, sparkline = [] }) {
  const pct = budget ? Math.min(value / budget, 1) : 0;
  const over = pct > 0.8;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <Eyebrow>Run cost</Eyebrow>
          <div className="mt-1 font-mono tabular-nums text-[22px] leading-none text-[var(--fg)]">
            ${value.toFixed(4)}
          </div>
        </div>
        {budget && (
          <div className="text-right">
            <Eyebrow>Budget</Eyebrow>
            <div className={cn("mt-1 font-mono text-[12px]", over ? "text-[var(--status-review)]" : "text-[var(--fg-3)]")}>
              of ${budget.toFixed(2)}
            </div>
          </div>
        )}
      </div>
      {budget && (
        <div className="meter-track" style={{ height: 3 }}>
          <div
            className="meter-fill"
            style={{
              width: `${pct * 100}%`,
              background: over ? "var(--status-review)" : "var(--accent)",
            }}
          />
        </div>
      )}
      {sparkline.length > 0 && <Sparkline data={sparkline} />}
    </div>
  );
}

/* --- Sparkline — svg polyline ----------------------------------- */
function Sparkline({ data, height = 32, color = "var(--accent)" }) {
  const max = Math.max(...data, 0.0001);
  const min = Math.min(...data);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((v - min) / (max - min || 1)) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  const area = `0,100 ${pts} 100,100`;
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ width: "100%", height, display: "block" }}
    >
      <polygon points={area} fill={color} opacity="0.1" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* --- ConfidenceBar ---------------------------------------------- */
function ConfidenceBar({ value }) {
  const segments = 10;
  const filled = Math.round(value * segments);
  const tone = value > 0.75 ? "done" : value > 0.5 ? "active" : value > 0.25 ? "review" : "blocked";
  const color = `var(--status-${tone})`;
  return (
    <div className="flex items-center gap-2">
      <Eyebrow className="flex-none">Conf</Eyebrow>
      <div className="flex gap-[2px]">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className="block w-[6px] h-[10px] rounded-[2px]"
            style={{
              background: i < filled ? color : "color-mix(in oklab, var(--fg) 8%, transparent)",
              opacity: i < filled ? 1 - i * 0.02 : 1,
            }}
          />
        ))}
      </div>
      <span className="font-mono text-[11px] text-[var(--fg-2)] tabular-nums">
        {(value * 100).toFixed(0)}
      </span>
    </div>
  );
}

/* --- LogBlock — terminal-style block ----------------------------- */
function LogBlock({ lines = [], prompt = "$", maxHeight = 240 }) {
  return (
    <div
      className="rounded-[var(--radius-md)] border overflow-hidden font-mono"
      style={{
        background: "var(--bg-sunk)",
        borderColor: "var(--line)",
        fontSize: "12px",
        lineHeight: 1.6,
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b"
        style={{ borderColor: "var(--line-2)", background: "color-mix(in oklab, var(--fg) 3%, transparent)" }}
      >
        <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--fg-muted)]">log · t_9f21</span>
        <span className="text-[10px] text-[var(--fg-muted)]">{lines.length} lines</span>
      </div>
      <div className="p-3 overflow-auto" style={{ maxHeight }}>
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-[var(--fg-muted)] select-none shrink-0">{String(i + 1).padStart(3, "0")}</span>
            <span className="text-[var(--fg-muted)] shrink-0">{prompt}</span>
            <span
              className="text-[var(--fg-2)] whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: line }}
            />
          </div>
        ))}
        <span className="inline-block w-[7px] h-[13px] bg-[var(--accent)] blink align-middle ml-3" />
      </div>
    </div>
  );
}

/* --- AgentTimeline — thread of thoughts, tool calls, gates ------- */
function AgentTimeline({ items }) {
  return (
    <div className="relative">
      <div
        className="absolute top-0 bottom-0 w-px"
        style={{ left: 15, background: "var(--line)" }}
      />
      <div className="space-y-4">
        {items.map((item, i) => (
          <TimelineItem key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ item }) {
  const icon = TIMELINE_ICON[item.kind] || TIMELINE_ICON.thinking;
  return (
    <div className="relative pl-10 fade-up">
      <div
        className="absolute left-0 top-0.5 grid place-items-center w-[31px] h-[31px] rounded-full"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          color: icon.color,
        }}
      >
        {icon.glyph}
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--fg-2)]">
          {item.kind}{item.name && ` · ${item.name}`}
        </span>
        {item.status && <StatusPill status={item.status} />}
        <span className="font-mono text-[10.5px] text-[var(--fg-muted)] ml-auto">{item.ts}</span>
      </div>
      {item.kind === "tool" ? (
        <div
          className="rounded-[var(--radius-sm)] border p-2 space-y-1 font-mono text-[11.5px]"
          style={{ borderColor: "var(--line)", background: "var(--bg-sunk)" }}
        >
          <div className="flex gap-2"><span className="text-[var(--fg-muted)]">args</span><span className="text-[var(--fg-2)]">{item.args}</span></div>
          <div className="flex gap-2"><span className="text-[var(--fg-muted)]">→</span><span className="text-[var(--status-done)]">{item.result}</span></div>
        </div>
      ) : item.kind === "gate" ? (
        <div
          className="rounded-[var(--radius-sm)] border px-3 py-2 text-[12.5px]"
          style={{
            borderColor: item.status === "pass" ? "color-mix(in oklab, var(--status-done) 30%, var(--line))" : "color-mix(in oklab, var(--status-review) 30%, var(--line))",
            background: item.status === "pass" ? "color-mix(in oklab, var(--status-done) 6%, var(--surface))" : "color-mix(in oklab, var(--status-review) 6%, var(--surface))",
            color: "var(--fg-2)",
          }}
        >
          {item.body}
        </div>
      ) : item.kind === "thinking" ? (
        <p
          className="text-[13.5px] leading-[1.6] font-serif italic"
          style={{ color: "var(--fg-2)" }}
        >
          {item.body}
        </p>
      ) : (
        <p className="text-[13.5px] leading-[1.55] text-[var(--fg)]">{item.body}</p>
      )}
    </div>
  );
}

const TIMELINE_ICON = {
  user:     { glyph: <UserGlyph />,    color: "var(--fg-2)" },
  thinking: { glyph: <ThinkingGlyph />,color: "var(--accent)" },
  tool:     { glyph: <ToolGlyph />,    color: "var(--fg-2)" },
  gate:     { glyph: <GateGlyph />,    color: "var(--status-review)" },
};

function UserGlyph() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.4" stroke="currentColor" strokeWidth="1.2"/><path d="M2 10c.6-1.8 2.2-3 4-3s3.4 1.2 4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function ThinkingGlyph() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.2"/><circle cx="6" cy="6" r="4.8" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/></svg>; }
function ToolGlyph() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3h6v6H3z" stroke="currentColor" strokeWidth="1.2"/><path d="M5 1v2M7 1v2M5 9v2M7 9v2M1 5h2M1 7h2M9 5h2M9 7h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function GateGlyph() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

/* --- TaskCard ---------------------------------------------------- */
function TaskCard({ task, selected, onClick }) {
  const isActive = ["implementation", "planning", "design"].includes(task.status);
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-[var(--radius-md)] border p-3.5 relative transition-all duration-150",
        "hover:-translate-y-[1px] hover:shadow-[var(--shadow-md)]",
        selected && "ring-2"
      )}
      style={{
        background: selected ? "color-mix(in oklab, var(--accent) 6%, var(--surface))" : "var(--surface)",
        borderColor: selected ? "color-mix(in oklab, var(--accent) 35%, var(--line))" : "var(--line)",
        "--tw-ring-color": "color-mix(in oklab, var(--accent) 40%, transparent)",
      }}
    >
      {isActive && (
        <span
          className="absolute top-3 right-3"
          aria-hidden
        >
          <StatusDot tone="active" pulse size={8} />
        </span>
      )}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg-muted)]">
          {task.id}
        </span>
        <StatusPill status={task.status} />
      </div>
      <h3 className="text-[14px] font-medium leading-[1.35] text-[var(--fg)] pr-6">
        {task.title}
      </h3>
      <p className="mt-1 text-[12px] text-[var(--fg-3)] leading-[1.5]">
        {task.feature_title} · <span className="font-mono">{task.agent_name}</span>
      </p>

      {task.progress > 0 && (
        <div className="mt-3 meter-track" style={{ height: 2 }}>
          <div
            className="meter-fill"
            style={{
              width: `${task.progress * 100}%`,
              background: task.status === "blocked" ? "var(--status-blocked)" :
                          task.status === "done" ? "var(--status-done)" :
                          task.status === "review_pending" || task.status === "design_review" ? "var(--status-review)" :
                          "var(--status-active)",
            }}
          />
        </div>
      )}

      {task.blocked_reason && (
        <div
          className="mt-3 text-[11.5px] rounded-[var(--radius-sm)] px-2 py-1.5 hatch"
          style={{
            color: "var(--status-blocked)",
            border: "1px dashed color-mix(in oklab, var(--status-blocked) 35%, var(--line))",
          }}
        >
          {task.blocked_reason}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 text-[10.5px] font-mono text-[var(--fg-3)]">
        <span>${task.cost_usd.toFixed(4)}</span>
        <span>{task.num_turns} turns</span>
        {task.duration_ms > 0 && <span>{Math.round(task.duration_ms / 1000)}s</span>}
      </div>
    </button>
  );
}

/* --- PhaseStepper — horizontal pipeline ---------------------------- */
const PHASES = ["Plan", "Design", "Implement", "Gates", "PR", "Build", "Done"];
function PhaseStepper({ current = 0 }) {
  return (
    <div className="flex items-center gap-0">
      {PHASES.map((p, i) => {
        const state = i < current ? "done" : i === current ? "active" : "muted";
        return (
          <React.Fragment key={p}>
            <div className="flex items-center gap-1.5">
              <span
                className="block w-[7px] h-[7px] rounded-full"
                style={{
                  background: state === "muted" ? "color-mix(in oklab, var(--fg) 15%, transparent)" : `var(--status-${state === "active" ? "active" : "done"})`,
                  boxShadow: state === "active" ? `0 0 0 3px oklch(from var(--status-active) l c h / 0.15)` : "none",
                }}
              />
              <span
                className="font-mono text-[10px] uppercase tracking-[0.16em]"
                style={{ color: state === "muted" ? "var(--fg-muted)" : "var(--fg-2)" }}
              >
                {p}
              </span>
            </div>
            {i < PHASES.length - 1 && (
              <span
                className="mx-2 h-px w-4"
                style={{ background: i < current ? "var(--status-done)" : "var(--line)" }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  LivePulse, CostMeter, Sparkline, ConfidenceBar, LogBlock, AgentTimeline, TaskCard, PhaseStepper, PHASES,
});
