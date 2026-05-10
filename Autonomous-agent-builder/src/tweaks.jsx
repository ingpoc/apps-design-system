/* Settings drawer — right-side panel covering Design system, Preferences, and Runtime
   Live theme changes are visible while picking presets/advanced. */

const { cn, Eyebrow, Kbd, StatusDot } = window;

/* =========================================================================
   Theme presets — each bundles hue, density, radius, mode, and optional
   font-family switch. Picking one updates all knobs at once.
   ========================================================================= */
const THEMES = [
  { id: "calm",     name: "Calm Paper",   tagline: "Editorial · warm · cobalt",   hue: 252, density: 1,    radius: 10, mode: "light", fontDisplay: "Newsreader", fontUi: "Geist" },
  { id: "operator", name: "Operator",     tagline: "Terminal · graphite · azure", hue: 212, density: 0.82, radius: 4,  mode: "dark",  fontDisplay: "Geist",      fontUi: "Geist" },
  { id: "sage",     name: "Sage Studio",  tagline: "Original · teal · soft",      hue: 180, density: 1,    radius: 16, mode: "light", fontDisplay: "Newsreader", fontUi: "Geist" },
  { id: "ember",    name: "Ember",        tagline: "Warm · amber · cozy",         hue: 28,  density: 1.15, radius: 14, mode: "light", fontDisplay: "Newsreader", fontUi: "Geist" },
  { id: "midnight", name: "Midnight",     tagline: "Cinematic · iris · dense",    hue: 264, density: 0.82, radius: 8,  mode: "dark",  fontDisplay: "Newsreader", fontUi: "Geist" },
  { id: "paper",    name: "Paper Mono",   tagline: "Stripped · neutral · 0 chroma", hue: 0, density: 1,    radius: 6,  mode: "light", fontDisplay: "Geist",      fontUi: "Geist" },
];

const DEFAULT_THEME = { themeId: "calm", hue: 252, density: 1, radius: 10, mode: "light" };

const DEFAULT_PREFS = {
  runtimeSdk: "claude",
  boardDensity: "comfortable",
  agentInspector: "evidence",
  transcriptFilter: "thread",
  compareDisplay: "split",
  transcriptLayout: "cards",
  notifications: "approvals",
};

/* Read-only runtime mock — would be live SDK state in the real app */
const RUNTIME = {
  sdk: "Claude Agent SDK",
  model: "claude-sonnet-4-5",
  lane: "primary",
  running: "2 runs active",
  approvals: 3,
  questions: 1,
  permission: "embedded",
  cost: "$0.84",
  tokens: "184,212",
  session: "8b2c-21f3-4a90",
  mcpServers: ["filesystem", "knowledge", "memory"],
  mcpTools: ["bash", "edit", "search", "fetch"],
};

function loadTheme()  { try { return { ...DEFAULT_THEME, ...JSON.parse(localStorage.getItem("aab.theme")  || "null") }; } catch { return DEFAULT_THEME; } }
function loadPrefs()  { try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem("aab.prefs")  || "null") }; } catch { return DEFAULT_PREFS; } }

function applyTheme(s) {
  const root = document.documentElement;
  root.style.setProperty("--accent-hue", s.hue);
  root.style.setProperty("--density", s.density);
  root.style.setProperty("--radius-base", s.radius + "px");
  root.setAttribute("data-theme", s.mode);
}

function TweaksPanel({ open = false, onClose = () => {} }) {
  const [section, setSection] = React.useState("design");
  const [theme, setTheme] = React.useState(loadTheme);
  const [prefs, setPrefs] = React.useState(loadPrefs);
  const [tweakTab, setTweakTab] = React.useState("themes");

  React.useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("aab.theme", JSON.stringify(theme));
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem("aab.prefs", JSON.stringify(prefs));
  }, [prefs]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const pickTheme = (t) => {
    setTheme({ themeId: t.id, hue: t.hue, density: t.density, radius: t.radius, mode: t.mode });
  };

  const updatePref = (key, value) => setPrefs((p) => ({ ...p, [key]: value }));

  const activeTheme = THEMES.find(t => t.id === theme.themeId);

  return (
    <>
      {/* Soft overlay — click outside to close, but app stays visible */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{
          background: "color-mix(in oklab, var(--bg-sunk) 22%, transparent)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />
      {/* Right-anchored drawer */}
      <aside
        role="dialog"
        aria-modal="false"
        aria-labelledby="settings-title"
        className="fixed top-0 right-0 h-screen w-[420px] z-50 flex flex-col transition-transform duration-200"
        style={{
          background: "var(--surface-raised)",
          borderLeft: "1px solid var(--line-strong)",
          boxShadow: "-24px 0 60px -28px rgba(20,18,14,0.28)",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0" style={{ borderColor: "var(--line-2)" }}>
          <div className="min-w-0">
            <div id="settings-title" className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg-muted)]">Settings</div>
            <div className="text-[15px] text-[var(--fg)] mt-0.5 truncate" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.01em" }}>
              {section === "design" && `Design system · ${activeTheme?.name || "Custom"}`}
              {section === "prefs"  && "Workspace preferences"}
              {section === "runtime" && "Runtime · live SDK state"}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close settings" className="h-7 w-7 rounded-full grid place-items-center text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)]">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Section tabs */}
        <div className="px-5 pt-3 pb-1 shrink-0">
          <div className="inline-flex p-0.5 rounded-[var(--radius-full)] gap-0.5 w-full"
            style={{ background: "var(--bg-sunk)", border: "1px solid var(--line)" }}>
            {[
              { v: "design",  label: "Design" },
              { v: "prefs",   label: "Preferences" },
              { v: "runtime", label: "Runtime" },
            ].map((t) => {
              const active = section === t.v;
              return (
                <button key={t.v} onClick={() => setSection(t.v)}
                  className={cn(
                    "flex-1 h-7 rounded-[var(--radius-full)] text-[12px] font-medium transition-colors",
                    active ? "text-[var(--fg)]" : "text-[var(--fg-3)] hover:text-[var(--fg-2)]"
                  )}
                  style={{
                    background: active ? "var(--surface-raised)" : "transparent",
                    boxShadow: active ? "var(--shadow-sm)" : "none",
                  }}
                >{t.label}</button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {section === "design" && (
            <DesignSection
              tab={tweakTab} setTab={setTweakTab}
              theme={theme} setTheme={setTheme}
              pickTheme={pickTheme}
            />
          )}
          {section === "prefs"   && <PrefsSection prefs={prefs} update={updatePref} />}
          {section === "runtime" && <RuntimeSection />}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t shrink-0 flex items-center justify-between gap-3" style={{ borderColor: "var(--line-2)", background: "var(--bg-sunk)" }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg-muted)]">
            Once locked → exportable as agent skill
          </span>
          <span className="font-mono text-[10px] text-[var(--fg-3)]">v0.4</span>
        </div>
      </aside>
    </>
  );
}

/* ---- Design system section ---- */

function DesignSection({ tab, setTab, theme, setTheme, pickTheme }) {
  const hues = [
    { v: 252, name: "Cobalt"  }, { v: 212, name: "Azure" }, { v: 180, name: "Teal" },
    { v: 155, name: "Sage"    }, { v: 82,  name: "Amber" }, { v: 28,  name: "Ember" },
    { v: 264, name: "Iris"    }, { v: 310, name: "Magenta" }, { v: 0, name: "Neutral" },
  ];

  return (
    <div>
      <div className="px-5 pt-3">
        <div className="inline-flex p-0.5 rounded-[var(--radius-full)] gap-0.5 w-full"
          style={{ background: "var(--bg-sunk)", border: "1px solid var(--line)" }}>
          {[
            { v: "themes", label: "Presets"  },
            { v: "tweak",  label: "Advanced" },
          ].map((t) => {
            const active = tab === t.v;
            return (
              <button key={t.v} onClick={() => setTab(t.v)}
                className={cn(
                  "flex-1 h-7 rounded-[var(--radius-full)] text-[12px] font-medium transition-colors",
                  active ? "text-[var(--fg)]" : "text-[var(--fg-3)] hover:text-[var(--fg-2)]"
                )}
                style={{
                  background: active ? "var(--surface-raised)" : "transparent",
                  boxShadow: active ? "var(--shadow-sm)" : "none",
                }}
              >{t.label}</button>
            );
          })}
        </div>
      </div>

      {tab === "themes" && (
        <div className="p-4 space-y-2">
          {THEMES.map((t) => (
            <ThemeCard key={t.id} theme={t} selected={theme.themeId === t.id} onPick={() => pickTheme(t)} />
          ))}
          <button
            onClick={() => setTheme(DEFAULT_THEME)}
            className="w-full h-8 rounded-[var(--radius-sm)] text-[11.5px] text-[var(--fg-3)] hover:text-[var(--fg)] transition-colors mt-1"
            style={{ border: "1px dashed var(--line-strong)" }}
          >Reset to default</button>
        </div>
      )}

      {tab === "tweak" && (
        <div className="p-5 space-y-5">
          <Field label="Mode">
            <div className="flex gap-1">
              {["light", "dark"].map((m) => (
                <button key={m}
                  onClick={() => setTheme((s) => ({ ...s, mode: m, themeId: "custom" }))}
                  className={cn(
                    "flex-1 h-8 rounded-[var(--radius-sm)] text-[12px] capitalize transition-colors",
                    theme.mode === m ? "text-[var(--fg-on-accent)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"
                  )}
                  style={{ background: theme.mode === m ? "var(--accent)" : "var(--surface-2)", border: "1px solid var(--line)" }}
                >{m}</button>
              ))}
            </div>
          </Field>

          <Field label={`Accent hue · ${hues.find(h => h.v === theme.hue)?.name || theme.hue}`}>
            <div className="flex gap-1.5 flex-wrap">
              {hues.map((h) => (
                <button key={h.v}
                  onClick={() => setTheme((s) => ({ ...s, hue: h.v, themeId: "custom" }))}
                  title={h.name}
                  className={cn("w-7 h-7 rounded-full transition-transform", theme.hue === h.v && "scale-110")}
                  style={{
                    background: h.v === 0 ? "oklch(0.55 0 0)" : `oklch(0.58 0.14 ${h.v})`,
                    border: theme.hue === h.v ? "2px solid var(--fg)" : "2px solid var(--surface-raised)",
                    boxShadow: theme.hue === h.v ? "0 0 0 2px var(--accent)" : "var(--shadow-xs)",
                  }}
                />
              ))}
            </div>
          </Field>

          <Field label={`Density · ${theme.density === 0.82 ? "Compact" : theme.density === 1.15 ? "Cozy" : "Comfortable"}`}>
            <div className="flex gap-1">
              {[["Compact", 0.82], ["Comfortable", 1], ["Cozy", 1.15]].map(([name, val]) => (
                <button key={name}
                  onClick={() => setTheme((s) => ({ ...s, density: val, themeId: "custom" }))}
                  className={cn(
                    "flex-1 h-8 rounded-[var(--radius-sm)] text-[11px] transition-colors",
                    theme.density === val ? "text-[var(--fg-on-accent)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"
                  )}
                  style={{ background: theme.density === val ? "var(--accent)" : "var(--surface-2)", border: "1px solid var(--line)" }}
                >{name}</button>
              ))}
            </div>
          </Field>

          <Field label={`Radius · ${theme.radius}px`}>
            <input type="range" min="2" max="20" step="1" value={theme.radius}
              onChange={(e) => setTheme((s) => ({ ...s, radius: Number(e.target.value), themeId: "custom" }))}
              className="w-full accent-[var(--accent)]"
            />
          </Field>
        </div>
      )}
    </div>
  );
}

/* ---- Preferences section ---- */

function PrefsSection({ prefs, update }) {
  return (
    <div className="p-5 space-y-5">
      <PrefRow
        label="Runtime SDK"
        description="Selects the agent execution harness for future chats and task runs."
        value={prefs.runtimeSdk}
        onChange={(v) => update("runtimeSdk", v)}
        options={[
          { value: "claude",     label: "Claude SDK" },
          { value: "codex_sdk",  label: "Codex SDK"  },
        ]}
      />
      <PrefRow
        label="Board density"
        description="Lane and card spacing on the board page."
        value={prefs.boardDensity}
        onChange={(v) => update("boardDensity", v)}
        options={[
          { value: "comfortable", label: "Comfortable" },
          { value: "compact",     label: "Compact"     },
        ]}
      />
      <PrefRow
        label="Agent inspector default"
        description="Right-rail inspector tab when opening an agent session."
        value={prefs.agentInspector}
        onChange={(v) => update("agentInspector", v)}
        options={[
          { value: "evidence", label: "Evidence" },
          { value: "sessions", label: "Sessions" },
        ]}
      />
      <PrefRow
        label="Transcript default"
        description="Default filter on the agent transcript stream."
        value={prefs.transcriptFilter}
        onChange={(v) => update("transcriptFilter", v)}
        options={[
          { value: "thread", label: "Thread" },
          { value: "full",   label: "Full"   },
          { value: "logs",   label: "Logs"   },
        ]}
      />
      <PrefRow
        label="Transcript layout"
        description="Cards is conversational; timeline is one vertical thread."
        value={prefs.transcriptLayout}
        onChange={(v) => update("transcriptLayout", v)}
        options={[
          { value: "cards",    label: "Cards"    },
          { value: "timeline", label: "Timeline" },
        ]}
      />
      <PrefRow
        label="Compare display"
        description="How two runs lay out on the compare page."
        value={prefs.compareDisplay}
        onChange={(v) => update("compareDisplay", v)}
        options={[
          { value: "split",   label: "Split"   },
          { value: "stacked", label: "Stacked" },
        ]}
      />
      <PrefRow
        label="Notifications"
        description="What to surface in the inbox badge."
        value={prefs.notifications}
        onChange={(v) => update("notifications", v)}
        options={[
          { value: "approvals", label: "Approvals" },
          { value: "all",       label: "All"       },
          { value: "off",       label: "Off"       },
        ]}
      />
    </div>
  );
}

function PrefRow({ label, description, value, onChange, options }) {
  return (
    <div className="rounded-[var(--radius-md)] p-3.5" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
      <p className="text-[13px] font-medium text-[var(--fg)]">{label}</p>
      <p className="mt-0.5 text-[11.5px] text-[var(--fg-muted)] leading-[1.5]" style={{ fontFamily: "var(--font-text)" }}>{description}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button key={o.value} onClick={() => onChange(o.value)}
              className={cn(
                "h-7 px-3 rounded-[var(--radius-full)] text-[11.5px] font-medium transition-colors",
                active ? "text-[var(--fg-on-accent)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"
              )}
              style={{
                background: active ? "var(--accent)" : "var(--surface-2)",
                border: active ? "1px solid var(--accent)" : "1px solid var(--line)",
              }}
            >{o.label}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Runtime section (read-only live state) ---- */

function RuntimeSection() {
  return (
    <div className="p-5 space-y-5">
      <div>
        <Eyebrow>Live SDK state</Eyebrow>
        <div className="mt-2.5 grid gap-1.5">
          <RuntimeRow label="SDK"        value={RUNTIME.sdk} tone="active" />
          <RuntimeRow label="Model"      value={RUNTIME.model} />
          <RuntimeRow label="Lane"       value={RUNTIME.lane} tone="active" pulse />
          <RuntimeRow label="Running"    value={RUNTIME.running} tone="active" pulse />
          <RuntimeRow label="Approvals"  value={String(RUNTIME.approvals)} tone="review" />
          <RuntimeRow label="Questions"  value={String(RUNTIME.questions)} tone="review" />
          <RuntimeRow label="Permission" value={RUNTIME.permission} />
          <RuntimeRow label="Cost"       value={RUNTIME.cost} />
          <RuntimeRow label="Tokens"     value={RUNTIME.tokens} />
        </div>
      </div>

      <div className="rounded-[var(--radius-md)] p-3.5 space-y-2.5" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        <Eyebrow>Session</Eyebrow>
        <p className="text-[12.5px] text-[var(--fg-2)]" style={{ fontFamily: "var(--font-text)" }}>
          Active session: <span className="font-mono text-[var(--fg)]">{RUNTIME.session}</span>
        </p>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--fg-muted)]">MCP servers</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {RUNTIME.mcpServers.map((s) => (
              <span key={s} className="font-mono text-[10.5px] px-2 py-0.5 rounded-[var(--radius-sm)]"
                style={{ background: "var(--bg-sunk)", border: "1px solid var(--line)", color: "var(--fg-2)" }}>{s}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--fg-muted)]">MCP tools</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {RUNTIME.mcpTools.map((s) => (
              <span key={s} className="font-mono text-[10.5px] px-2 py-0.5 rounded-[var(--radius-sm)]"
                style={{ background: "var(--bg-sunk)", border: "1px solid var(--line)", color: "var(--fg-2)" }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => window.dispatchEvent(new CustomEvent("aab:open-tokens"))}
        className="w-full h-9 rounded-[var(--radius-sm)] text-[12px] font-medium text-[var(--fg-2)] hover:text-[var(--fg)] transition-colors"
        style={{ border: "1px solid var(--line-strong)", background: "var(--surface)" }}
      >Open token + component reference →</button>
    </div>
  );
}

function RuntimeRow({ label, value, tone = "muted", pulse = false }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] px-3 py-2"
      style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
      <span className="inline-flex items-center gap-2 min-w-0">
        <StatusDot tone={tone} pulse={pulse} size={6} />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--fg-muted)]">{label}</span>
      </span>
      <span className="font-mono text-[11.5px] text-[var(--fg)] truncate text-right">{value}</span>
    </div>
  );
}

/* ---- Theme card ---- */

function ThemeCard({ theme, selected, onPick }) {
  const bg      = theme.mode === "dark" ? "oklch(0.17 0.008 250)" : "oklch(0.985 0.006 88)";
  const surface = theme.mode === "dark" ? "oklch(0.23 0.01 250)"  : "oklch(0.998 0.004 88)";
  const fg      = theme.mode === "dark" ? "oklch(0.96 0.006 90)"  : "oklch(0.22 0.012 72)";
  const accent  = theme.hue === 0
    ? "oklch(0.55 0 0)"
    : `oklch(${theme.mode === "dark" ? 0.72 : 0.48} 0.14 ${theme.hue})`;
  const statusDone   = `oklch(${theme.mode === "dark" ? 0.76 : 0.56} 0.12 155)`;
  const statusReview = `oklch(${theme.mode === "dark" ? 0.8  : 0.62} 0.13 82)`;

  return (
    <button
      onClick={onPick}
      className={cn(
        "w-full text-left rounded-[var(--radius-md)] border p-2.5 flex items-center gap-3 transition-all duration-150",
        "hover:-translate-y-[1px] hover:shadow-[var(--shadow-md)]"
      )}
      style={{
        background: selected ? "color-mix(in oklab, var(--accent) 7%, var(--surface))" : "var(--surface)",
        borderColor: selected ? "color-mix(in oklab, var(--accent) 40%, var(--line))" : "var(--line)",
      }}
    >
      <div
        className="relative rounded-[6px] overflow-hidden shrink-0"
        style={{ width: 64, height: 44, background: bg, border: `1px solid ${theme.mode === "dark" ? "oklch(1 0 0 / 0.12)" : "oklch(0.9 0.008 80)"}` }}
      >
        <div className="absolute top-1 left-1 right-1 h-[6px] rounded-[2px]" style={{ background: surface }} />
        <div className="absolute top-[11px] left-1 w-4 h-4 rounded-[3px]" style={{ background: surface, border: `0.5px solid ${accent}` }} />
        <div className="absolute top-[11px] left-[22px] w-3 h-1 rounded-[1px]" style={{ background: fg, opacity: 0.7 }} />
        <div className="absolute top-[15px] left-[22px] w-4 h-0.5 rounded-[1px]" style={{ background: fg, opacity: 0.3 }} />
        <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full" style={{ background: accent }} />
        <div className="absolute bottom-1 left-[14px] w-2 h-2 rounded-full" style={{ background: statusDone }} />
        <div className="absolute bottom-1 left-[26px] w-2 h-2 rounded-full" style={{ background: statusReview }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[var(--fg)] tracking-[-0.005em]">{theme.name}</span>
          {selected && (
            <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--accent-ink)]">· active</span>
          )}
        </div>
        <div className="font-mono text-[10.5px] text-[var(--fg-muted)] mt-0.5 truncate">{theme.tagline}</div>
      </div>
      <div
        className="shrink-0 w-4 h-4 rounded-full grid place-items-center"
        style={{ background: selected ? "var(--accent)" : "transparent", border: selected ? "none" : "1.5px solid var(--line-strong)" }}
      >
        {selected && (
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.2l2.3 2.3L9.5 3.8" stroke="var(--fg-on-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-medium text-[var(--fg-3)]">{label}</div>
      {children}
    </div>
  );
}

Object.assign(window, { TweaksPanel, THEMES });
