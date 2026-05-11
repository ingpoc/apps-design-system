/* App shell — realigned to the live App.tsx (Inbox/Compare are utility buttons, Observability in main nav) */

const {
  cn, Button, Eyebrow, Kbd, BrandMark, LivePulse, Tabs, StatusDot, StatusPill,
  BoardPage, AgentPage, MetricsPage, ObservabilityPage, KnowledgePage, MemoryPage, BacklogPage, OnboardingPage,
  InboxPage, ComparePage, CommandPalette, APPROVAL_GATES,
  TokensPanel, SettingsPage, VoiceProvider, FloatingVoiceDock,
} = window;

/* Real nav order from App.tsx — Observability sits between Metrics and Knowledge */
const ROUTES = [
  { key: "agent",         label: "Agent" },
  { key: "board",         label: "Board" },
  { key: "metrics",       label: "Metrics" },
  { key: "observability", label: "Observability" },
  { key: "knowledge",     label: "Knowledge" },
  { key: "memory",        label: "Memory" },
  { key: "backlog",       label: "Backlog" },
  { key: "settings",      label: "Settings" },
];

/* Routes reachable via utility buttons / palette / hotkeys but not in main nav */
const ROUTE_JUMPS = {
  a: "agent", b: "board", m: "metrics", o: "observability",
  k: "knowledge", y: "memory", l: "backlog",
  s: "settings",
  i: "inbox", c: "compare",
};

function App() {
  const [route, setRoute] = React.useState(() => localStorage.getItem("aab.route") || "agent");
  const [task, setTask] = React.useState(null);
  const [inspectorOpen, setInspectorOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  React.useEffect(() => { localStorage.setItem("aab.route", route); }, [route]);

  React.useEffect(() => {
    let jumpAwaiting = false;
    let jumpTimer = null;
    const onKey = (e) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName) || e.target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); setPaletteOpen((v) => !v); return;
      }
      if (typing) return;
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setInspectorOpen(true); return; }
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey) {
        jumpAwaiting = true;
        if (jumpTimer) clearTimeout(jumpTimer);
        jumpTimer = setTimeout(() => { jumpAwaiting = false; }, 1200);
        return;
      }
      if (jumpAwaiting) {
        const next = ROUTE_JUMPS[e.key.toLowerCase()];
        if (next) { e.preventDefault(); setRoute(next); }
        jumpAwaiting = false;
        if (jumpTimer) clearTimeout(jumpTimer);
      }
    };
    window.addEventListener("keydown", onKey);
    const onOpenTokens = () => setInspectorOpen(true);
    window.addEventListener("aab:open-tokens", onOpenTokens);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("aab:open-tokens", onOpenTokens);
      if (jumpTimer) clearTimeout(jumpTimer);
    };
  }, []);

  const contentRef = React.useRef(null);
  React.useEffect(() => {
    if (!contentRef.current || !window.gsap) return;
    const gsap = window.gsap;
    const els = contentRef.current.querySelectorAll("[data-stagger]");
    if (els.length) {
      gsap.from(els, { opacity: 0, y: 10, duration: 0.4, stagger: 0.05, ease: "power3.out", clearProps: "all" });
    } else {
      gsap.from(contentRef.current, { opacity: 0, y: 8, duration: 0.32, ease: "power2.out", clearProps: "all" });
    }
  }, [route]);

  const handleSelectTask = (t) => { setTask(t); setRoute("agent"); };
  const pendingGateCount = (APPROVAL_GATES || []).length;

  return (
    <div className="min-h-screen">
      <AppChrome
        route={route}
        onRoute={setRoute}
        onOpenInspector={() => setInspectorOpen(true)}
        onOpenSettings={() => setRoute("settings")}
        onOpenPalette={() => setPaletteOpen(true)}
        pendingGateCount={pendingGateCount}
      />
      <main className="max-w-[1440px] mx-auto px-6 pb-16 pt-5" ref={contentRef}>
        {route === "board" && <BoardPage onSelectTask={handleSelectTask} />}
        {route === "agent" && <AgentPage task={task} />}
        {route === "metrics" && <MetricsPage />}
        {route === "observability" && <ObservabilityPage />}
        {route === "knowledge" && <KnowledgePage />}
        {route === "memory" && <MemoryPage />}
        {route === "backlog" && <BacklogPage onSelectTask={handleSelectTask} />}
        {route === "onboarding" && <OnboardingPage />}
        {route === "inbox" && <InboxPage onSelectTask={handleSelectTask} />}
        {route === "compare" && <ComparePage />}
        {route === "settings" && <SettingsPage />}
      </main>
      <TokensPanel open={inspectorOpen} onClose={() => setInspectorOpen(false)} />
      <FloatingVoiceDock />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onRoute={setRoute}
        onSelectTask={handleSelectTask}
      />
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark") ||
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  });
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("aab-theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);
  return (
    <UtilityIconButton
      label="Toggle theme"
      onClick={() => setDark(v => !v)}
      icon={dark ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M13 3l-1.4 1.4M4.4 11.6L3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M13 10.5A5.5 5.5 0 017.2 3c0-.3 0-.6.1-.9A6 6 0 1013.9 11c-.3.1-.6.1-.9.1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      )}
    />
  );
}

function BotTile() {
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-[1rem] text-white shrink-0"
      style={{
        background: "linear-gradient(180deg, oklch(0.48 0.14 252), oklch(0.34 0.08 244))",
        boxShadow: "0 14px 34px -22px rgba(7,94,169,0.82)",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="12" rx="3" />
        <circle cx="8.5" cy="14" r="1" fill="currentColor" />
        <circle cx="15.5" cy="14" r="1" fill="currentColor" />
        <path d="M12 8V4M9 4h6" />
      </svg>
    </div>
  );
}

/* Compact icon-only utility button — same shape as the real shell */
function UtilityIconButton({ icon, label, onClick, badge, pulse, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="relative h-8 w-8 rounded-full grid place-items-center transition-colors shrink-0"
      style={{
        border: "1px solid var(--line)",
        background: active
          ? "color-mix(in oklab, var(--accent) 12%, var(--surface))"
          : "color-mix(in oklab, var(--bg) 72%, transparent)",
        color: active ? "var(--fg)" : "var(--fg-2)",
      }}
    >
      <span style={{ display: "grid", placeItems: "center" }}>{icon}</span>
      {pulse && <StatusDot tone="active" pulse size={6} className="absolute -right-0.5 -top-0.5" />}
      {badge > 0 && (
        <span
          className="absolute -right-1 -top-1 min-w-[1rem] h-4 px-1 rounded-full grid place-items-center font-mono text-[9px]"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >{badge}</span>
      )}
    </button>
  );
}

function CommandSearchButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open command palette"
      title="Command palette ⌘K"
      className="hidden md:inline-flex h-8 w-8 items-center justify-center rounded-full shrink-0"
      style={{
        border: "1px solid var(--line)",
        background: "var(--bg-sunk)",
        color: "var(--fg-muted)",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <circle cx="6" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    </button>
  );
}

function NavPills({ route, onRoute, mobile = false }) {
  return (
    <nav
      className={cn(
        "items-center gap-1 p-1.5 rounded-full",
        mobile ? "flex overflow-x-auto" : "hidden lg:flex"
      )}
      style={{
        border: "1px solid color-mix(in oklab, var(--line) 75%, transparent)",
        background: "color-mix(in oklab, var(--bg) 70%, transparent)",
      }}
    >
      {ROUTES.map((r) => {
        const active = route === r.key;
        return (
          <button
            key={r.key}
            onClick={() => onRoute(r.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors shrink-0",
              active ? "text-[var(--bg)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"
            )}
            style={{
              background: active ? "var(--fg)" : "transparent",
              boxShadow: active ? "0 14px 32px -24px rgba(30,26,21,0.8)" : "none",
            }}
          >
            {r.label}
          </button>
        );
      })}
    </nav>
  );
}

function AppChrome({ route, onRoute, onOpenInspector, onOpenSettings, onOpenPalette, pendingGateCount }) {
  const [condensed, setCondensed] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 transition-all duration-200"
      style={{
        background: condensed ? "transparent" : "color-mix(in oklab, var(--bg) 78%, transparent)",
        borderBottom: condensed ? "1px solid transparent" : "1px solid var(--line-2)",
        backdropFilter: condensed ? "none" : "blur(20px)",
        WebkitBackdropFilter: condensed ? "none" : "blur(20px)",
      }}
    >
      <div
        className="max-w-[1440px] mx-auto grid items-center gap-4 px-6 transition-all duration-200"
        style={{
          gridTemplateColumns: "1fr auto 1fr",
          paddingTop: condensed ? 8 : 12,
          paddingBottom: condensed ? 8 : 12,
        }}
      >
        {/* Left: brand (fades on scroll) */}
        <div
          className="min-w-0 justify-self-start flex items-center gap-3 transition-all duration-200"
          style={{
            opacity: condensed ? 0 : 1,
            transform: condensed ? "translateY(-4px)" : "translateY(0)",
            pointerEvents: condensed ? "none" : "auto",
          }}
        >
          <BotTile />
          <div className="leading-none min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--fg-muted)]">
              Autonomous Agent Builder
            </p>
          </div>
        </div>

        {/* Center: nav pills (always visible) */}
        <div className="justify-self-center">
          <NavPills route={route} onRoute={onRoute} />
        </div>

        {/* Right: utility cluster (fades on scroll) */}
        <div
          className="justify-self-end flex items-center gap-2 transition-all duration-200"
          style={{
            opacity: condensed ? 0 : 1,
            transform: condensed ? "translateY(-4px)" : "translateY(0)",
            pointerEvents: condensed ? "none" : "auto",
          }}
        >
          <UtilityIconButton
            label="2 runs active"
            pulse
            onClick={() => onRoute("agent")}
            icon={
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 1.5l1.4 3.7 3.7.4-2.8 2.4.9 3.6L7 9.6 3.8 11.6l.9-3.6L1.9 5.6l3.7-.4z"/>
              </svg>
            }
          />
          <CommandSearchButton onClick={onOpenPalette} />
          <UtilityIconButton
            label="Inbox"
            badge={pendingGateCount}
            active={route === "inbox"}
            onClick={() => onRoute("inbox")}
            icon={
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 3h10v7H2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M2 7h3l1 1.5h2L9 7h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
              </svg>
            }
          />
          <UtilityIconButton
            label="Compare"
            active={route === "compare"}
            onClick={() => onRoute("compare")}
            icon={
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="2.5" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="8" y="2.5" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            }
          />
          <UtilityIconButton
            label="System inspector"
            onClick={onOpenInspector}
            icon={
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M3 3h2v2H3zM6 3h5M3 6.5h5M9 6.5h2M3 10h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            }
          />
          <UtilityIconButton
            label="Settings"
            active={route === "settings"}
            onClick={onOpenSettings}
            icon={
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M7 1.5v2M7 10.5v2M1.5 7h2M10.5 7h2M3 3l1.4 1.4M9.6 9.6L11 11M11 3L9.6 4.4M4.4 9.6L3 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            }
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile / tablet nav row */}
      <div className="lg:hidden max-w-[1440px] mx-auto px-6 pb-3">
        <NavPills route={route} onRoute={onRoute} mobile />
      </div>
    </header>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<VoiceProvider><App /></VoiceProvider>);
