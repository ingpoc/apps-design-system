/* Primitives — buttons, badges, surfaces, status tokens, layout helpers. */

const { useState, useEffect, useRef, useMemo } = React;

/* --- tiny util ---------------------------------------------------- */
const cn = (...c) => c.filter(Boolean).join(" ");

/* --- StatusDot ---------------------------------------------------- */
function StatusDot({ tone = "active", pulse = false, size = 8 }) {
  const color = `var(--status-${tone})`;
  return (
    <span
      className={cn("inline-block rounded-full", pulse && "pulse-ring")}
      style={{
        width: size,
        height: size,
        background: color,
        color,
        boxShadow: `0 0 0 3px oklch(from ${color} l c h / 0.15)`,
      }}
    />
  );
}

/* --- StatusPill — unified status chip ----------------------------- */
const STATUS_LABEL = {
  active: "Active",
  running: "Running",
  implementation: "Implementing",
  planning: "Planning",
  design: "Designing",
  review: "In review",
  review_pending: "Needs review",
  design_review: "Design review",
  pending: "Queued",
  done: "Shipped",
  success: "Success",
  blocked: "Blocked",
  failed: "Failed",
  warn: "Warn",
  pass: "Pass",
  fail: "Fail",
};

const STATUS_TONE = {
  running: "active", active: "active", implementation: "active", planning: "active", design: "active",
  review: "review", review_pending: "review", design_review: "review", warn: "review",
  pending: "pending",
  done: "done", success: "done", pass: "done",
  blocked: "blocked", failed: "blocked", fail: "blocked",
};

function StatusPill({ status, withDot = true, className = "" }) {
  const tone = STATUS_TONE[status] || "pending";
  const label = STATUS_LABEL[status] || status;
  const color = `var(--status-${tone})`;
  const pulse = ["running", "active", "implementation", "planning", "design"].includes(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-full)] text-[11px] font-medium tracking-[-0.005em]",
        className
      )}
      style={{
        background: `oklch(from ${color} l c h / 0.1)`,
        color: `oklch(from ${color} calc(l - 0.1) c h)`,
        border: `1px solid oklch(from ${color} l c h / 0.22)`,
      }}
    >
      {withDot && <StatusDot tone={tone} pulse={pulse} size={6} />}
      <span>{label}</span>
    </span>
  );
}

/* --- Button ------------------------------------------------------- */
function Button({ variant = "default", size = "md", children, className = "", ...rest }) {
  const sizes = {
    sm: "h-7 px-2.5 text-[12px]",
    md: "h-8 px-3 text-[13px]",
    lg: "h-10 px-4 text-[14px]",
    icon: "h-8 w-8 p-0 text-[13px]",
  };
  const variants = {
    default: "bg-[var(--accent)] text-[var(--fg-on-accent)] hover:brightness-110 shadow-[var(--shadow-sm)]",
    outline: "bg-[var(--surface)] text-[var(--fg)] border border-[var(--line-strong)] hover:bg-[var(--surface-2)]",
    ghost: "text-[var(--fg-2)] hover:bg-[color-mix(in_oklab,var(--fg)_8%,transparent)] hover:text-[var(--fg)]",
    soft: "bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-[var(--accent-ink)] hover:bg-[color-mix(in_oklab,var(--accent)_22%,transparent)]",
    destructive: "bg-[var(--status-blocked)] text-white hover:brightness-105",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 ease-out disabled:opacity-40 disabled:pointer-events-none",
        sizes[size], variants[variant], className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* --- Surface ------------------------------------------------------ */
function Surface({ raised = false, className = "", children, ...rest }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border relative",
        className
      )}
      style={{
        background: raised ? "var(--surface-raised)" : "var(--surface)",
        borderColor: "var(--line)",
        boxShadow: raised ? "var(--shadow-md)" : "var(--shadow-sm)",
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* --- Eyebrow ------------------------------------------------------ */
function Eyebrow({ children, className = "" }) {
  return (
    <span
      className={cn(
        "inline-block font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--fg-3)]",
        className
      )}
    >
      {children}
    </span>
  );
}

/* --- KBD (keyboard key) ------------------------------------------ */
function Kbd({ children }) {
  return (
    <kbd
      className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-[5px] font-mono text-[10px] text-[var(--fg-2)]"
      style={{
        background: "color-mix(in oklab, var(--fg) 6%, transparent)",
        border: "1px solid var(--line)",
        boxShadow: "inset 0 -1px 0 var(--line)",
      }}
    >
      {children}
    </kbd>
  );
}

/* --- Code / mono inline ------------------------------------------ */
function Code({ children, className = "" }) {
  return (
    <code
      className={cn("font-mono text-[12px] px-1 py-0.5 rounded-[4px]", className)}
      style={{
        background: "color-mix(in oklab, var(--fg) 5%, transparent)",
        color: "var(--fg-2)",
      }}
    >
      {children}
    </code>
  );
}

/* --- Meter -------------------------------------------------------- */
function Meter({ value = 0, tone = "active", label, showValue = true, className = "" }) {
  const color = `var(--status-${tone})`;
  return (
    <div className={cn("space-y-1", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-2 text-[11px]">
          {label && <span className="text-[var(--fg-3)]">{label}</span>}
          {showValue && <span className="font-mono text-[var(--fg-2)]">{Math.round(value * 100)}%</span>}
        </div>
      )}
      <div className="meter-track">
        <div
          className="meter-fill"
          style={{ width: `${value * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}

/* --- Stat ----------------------------------------------------- */
function Stat({ label, value, detail, accent = false, className = "" }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Eyebrow>{label}</Eyebrow>
      <div
        className="font-mono tracking-[-0.02em]"
        style={{
          fontSize: "var(--text-3xl)",
          lineHeight: 1,
          color: accent ? "var(--accent-ink)" : "var(--fg)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {detail && (
        <div className="text-[11px] text-[var(--fg-3)] font-mono">{detail}</div>
      )}
    </div>
  );
}

/* --- Tabs --------------------------------------------------------- */
function Tabs({ value, onChange, items }) {
  return (
    <div
      className="inline-flex items-center p-1 rounded-[var(--radius-full)] gap-0.5"
      style={{ background: "var(--bg-sunk)", border: "1px solid var(--line)" }}
    >
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange?.(it.value)}
            className={cn(
              "px-3 h-7 rounded-[var(--radius-full)] text-[12px] font-medium transition-colors",
              active ? "text-[var(--fg)]" : "text-[var(--fg-3)] hover:text-[var(--fg-2)]"
            )}
            style={{
              background: active ? "var(--surface-raised)" : "transparent",
              boxShadow: active ? "var(--shadow-sm)" : "none",
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* --- Input -------------------------------------------------------- */
function Input(props) {
  return (
    <input
      {...props}
      className={cn(
        "h-8 px-3 rounded-[var(--radius-sm)] text-[13px] w-full",
        "placeholder:text-[var(--fg-muted)] text-[var(--fg)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-0",
        props.className
      )}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line-strong)",
        ...(props.style || {}),
      }}
    />
  );
}

/* --- Brand mark --------------------------------------------------- */
function BrandMark({ size = 28 }) {
  return (
    <div
      className="relative rounded-[6px] overflow-hidden grid place-items-center font-mono font-semibold"
      style={{
        width: size, height: size,
        background: "linear-gradient(140deg, var(--accent) 0%, color-mix(in oklab, var(--accent) 70%, black) 100%)",
        color: "var(--fg-on-accent)",
        fontSize: size * 0.4,
        boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.25), var(--shadow-sm)",
      }}
    >
      <span style={{ letterSpacing: "-0.04em" }}>ab</span>
      <span
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 30% 20%, oklch(1 0 0 / 0.2), transparent 60%)",
        }}
      />
    </div>
  );
}

Object.assign(window, {
  cn, StatusDot, StatusPill, Button, Surface, Eyebrow, Kbd, Code, Meter, Stat, Tabs, Input, BrandMark,
  STATUS_LABEL, STATUS_TONE,
});
