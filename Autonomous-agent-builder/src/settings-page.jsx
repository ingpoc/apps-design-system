/* SettingsPage — full page (not a side drawer). Replaces the TweaksPanel
   slide-out for runtime preferences and now hosts voice configuration.

   Sections:
     · Voice & Realtime   — VoiceConfigSection from voice-chat.jsx
     · Board & layout     — boardDensity, transcriptLayout, compareDisplayMode
     · Agent              — agentInspectorDefault, transcriptFilterDefault
     · Appearance         — theme toggle echo (kept simple)
*/

const { useState: _sUseState, useEffect: _sUseEffect } = React;
const { Eyebrow: _sEyebrow, StatusDot: _sStatusDot } = window;

const _SETTINGS_KEY = "aab-runtime-preferences";
const _SETTINGS_DEFAULTS = {
  boardDensity: "comfortable",
  agentInspectorDefault: "evidence",
  transcriptFilterDefault: "thread",
  transcriptLayout: "cards",
  compareDisplayMode: "split",
};

function _readSettings() {
  try { return { ..._SETTINGS_DEFAULTS, ...JSON.parse(localStorage.getItem(_SETTINGS_KEY) || "{}") }; }
  catch { return _SETTINGS_DEFAULTS; }
}

function useRuntimePreferences() {
  const [prefs, setPrefs] = _sUseState(_readSettings);
  _sUseEffect(() => {
    try { localStorage.setItem(_SETTINGS_KEY, JSON.stringify(prefs)); } catch {}
  }, [prefs]);
  return [prefs, (patch) => setPrefs(p => ({ ...p, ...patch }))];
}

/* ------------------------------------------------------------------ */
function SettingsPage() {
  const [prefs, update] = useRuntimePreferences();
  return (
    <div data-screen-label="Settings" style={{ display: "grid", gap: 28 }}>
      <SettingsHeader />

      <SettingsSection
        id="voice"
        eyebrow="01 — Voice & Realtime"
        title="Voice transport"
        description="Voice rides on top of the Agent surface — utterances are merged into the same timeline as text. Configure transport here; toggle it from the Mic button on the Agent composer."
      >
        <window.VoiceConfigSection />
      </SettingsSection>

      <SettingsSection
        id="board"
        eyebrow="02 — Board & layout"
        title="Board density and surface modes"
        description="Default layout decisions persist across sessions and apply per surface."
      >
        <SettingsRadioRow
          label="Board density"
          hint="Card padding and row height on the Board surface."
          value={prefs.boardDensity}
          onChange={(v) => update({ boardDensity: v })}
          options={[
            ["comfortable", "Comfortable"],
            ["compact",     "Compact"],
          ]}
        />
        <SettingsRadioRow
          label="Transcript layout"
          hint="How agent timeline events stack inside the Agent page."
          value={prefs.transcriptLayout}
          onChange={(v) => update({ transcriptLayout: v })}
          options={[["cards","Cards"], ["compact","Compact rows"]]}
        />
        <SettingsRadioRow
          label="Compare display"
          hint="Default comparison layout when two runs are pinned."
          value={prefs.compareDisplayMode}
          onChange={(v) => update({ compareDisplayMode: v })}
          options={[["split","Split"], ["stacked","Stacked"], ["overlay","Overlay"]]}
        />
      </SettingsSection>

      <SettingsSection
        id="agent"
        eyebrow="03 — Agent surface"
        title="Inspector + transcript defaults"
        description="Defaults applied when the Agent page mounts. Per-session overrides still win."
      >
        <SettingsRadioRow
          label="Inspector default tab"
          value={prefs.agentInspectorDefault}
          onChange={(v) => update({ agentInspectorDefault: v })}
          options={[["evidence","Evidence"], ["context","Context"], ["events","Events"]]}
        />
        <SettingsRadioRow
          label="Transcript filter"
          hint="Which timeline view opens first."
          value={prefs.transcriptFilterDefault}
          onChange={(v) => update({ transcriptFilterDefault: v })}
          options={[["thread","Full thread"], ["events","Events only"], ["tools","Tool calls"]]}
        />
      </SettingsSection>

      <SettingsSection
        id="appearance"
        eyebrow="04 — Appearance"
        title="Theme"
        description="The theme toggle in the global header is the primary control. This panel mirrors current state."
      >
        <_ThemeRow />
      </SettingsSection>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function SettingsHeader() {
  return (
    <header
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 24,
        alignItems: "end",
        paddingBottom: 18,
        borderBottom: "1px solid var(--line-2)",
      }}
    >
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em]"
           style={{ color: "var(--fg-muted)", marginBottom: 10 }}>
          Workspace · Settings
        </p>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: 40, lineHeight: 1.05,
          letterSpacing: "-0.02em", color: "var(--fg)", margin: 0,
        }}>
          Settings
        </h1>
        <p style={{
          maxWidth: "60ch", marginTop: 10, fontSize: 14, lineHeight: 1.6,
          color: "var(--fg-2)",
        }}>
          Tune voice transport, board density, and Agent surface defaults. All preferences persist in <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>aab-runtime-preferences</code> and apply across sessions.
        </p>
      </div>
      <a href="#voice"
         className="font-mono text-[10px] uppercase tracking-[0.12em]"
         style={{
           padding: "8px 12px", borderRadius: 999,
           border: "1px solid var(--line)",
           color: "var(--fg-2)", background: "var(--surface)",
           textDecoration: "none", justifySelf: "end",
         }}>
        Jump to voice ↓
      </a>
    </header>
  );
}

/* ------------------------------------------------------------------ */
function SettingsSection({ id, eyebrow, title, description, children }) {
  return (
    <section
      id={id}
      data-board-section
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(220px, 280px) 1fr",
        gap: 40,
        paddingBottom: 28,
        borderBottom: "1px solid var(--line-2)",
      }}
    >
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em]"
           style={{ color: "var(--fg-muted)", marginBottom: 8 }}>
          {eyebrow}
        </p>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.2,
          letterSpacing: "-0.01em", color: "var(--fg)", margin: 0,
        }}>
          {title}
        </h2>
        {description && (
          <p style={{
            marginTop: 8, fontSize: 13, lineHeight: 1.6, color: "var(--fg-2)", maxWidth: "30ch",
          }}>
            {description}
          </p>
        )}
      </div>
      <div
        style={{
          display: "grid", gap: 16,
          padding: 20,
          borderRadius: 14,
          background: "var(--surface)",
          border: "1px solid var(--line)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
function SettingsRadioRow({ label, hint, value, onChange, options }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
      <div>
        <p style={{ fontSize: 13, color: "var(--fg)", margin: 0 }}>{label}</p>
        {hint && (
          <p style={{ fontSize: 12, color: "var(--fg-muted)", margin: "2px 0 0" }}>{hint}</p>
        )}
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        style={{
          display: "inline-flex", padding: 2, borderRadius: 999,
          background: "var(--bg-sunk)", border: "1px solid var(--line)",
        }}
      >
        {options.map(([v, l]) => {
          const active = v === value;
          return (
            <button
              key={v}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(v)}
              className="text-[12px] font-medium"
              style={{
                padding: "5px 12px", borderRadius: 999,
                background: active ? "var(--fg)" : "transparent",
                color: active ? "var(--bg)" : "var(--fg-2)",
                transition: "background 140ms var(--ease-out)",
              }}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function _ThemeRow() {
  const [dark, setDark] = _sUseState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  _sUseEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("aab-theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 16 }}>
      <div>
        <p style={{ fontSize: 13, color: "var(--fg)", margin: 0 }}>Dark mode</p>
        <p style={{ fontSize: 12, color: "var(--fg-muted)", margin: "2px 0 0" }}>
          Applies <code style={{ fontFamily: "var(--font-mono)" }}>.dark</code> to the document root and overrides token defaults.
        </p>
      </div>
      <div
        role="radiogroup"
        style={{ display: "inline-flex", padding: 2, borderRadius: 999, background: "var(--bg-sunk)", border: "1px solid var(--line)" }}
      >
        {[["light","Light"], ["dark","Dark"]].map(([v, l]) => {
          const active = (v === "dark") === dark;
          return (
            <button
              key={v}
              onClick={() => setDark(v === "dark")}
              className="text-[12px] font-medium"
              style={{
                padding: "5px 12px", borderRadius: 999,
                background: active ? "var(--fg)" : "transparent",
                color: active ? "var(--bg)" : "var(--fg-2)",
              }}
            >{l}</button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { SettingsPage, useRuntimePreferences });
