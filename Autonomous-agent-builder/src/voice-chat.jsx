/* Voice transport primitives — corrected to mirror the live repo.

   Voice is NOT a separate page. It's a transport mode embedded in the
   Agent page. The actual hook (use-realtime-voice.tsx) exposes a
   four-state machine:

     idle → connecting → connected → (idle | error)

   …and a context with: voiceStatus, voiceError, voiceCallId, voiceEvents
   (last 6 strings), startVoiceSession({sessionId?}), stopVoiceSession().

   This module exports:
     - VOICE_STATUS / VOICE_STATUS_TONE / VOICE_STATUS_LABEL
     - useVoiceSession()              — mock provider mirroring real API
     - <VoiceProvider>                — wraps app, provides mock state
     - <VoiceComposerToggle/>         — the Mic/MicOff button on composer
     - <FloatingVoiceDock/>           — appears when status ≠ idle
     - <VoiceOrb/> <VoiceWaveform/>   — active-session affordances
     - Timeline row variants emitted by voice:
         <OperatorVoiceMessage/>        operator dictation
         <VoiceDelegationRow/>          realtime voice AI → SDK-backed Agent
         <AgentVoiceSummary/>           SDK-backed Agent → realtime voice AI
         <VoiceApprovalCard/>           voice action approval w/ phrase
     - <VoiceConfigSection/>          — config form (rendered in Settings)

   Actor vocabulary (locked):
     "Realtime voice AI"   — the voice frontend
     "SDK-backed Agent"    — the Claude Agent SDK running tools
*/

const { useState: _vUseState, useEffect: _vUseEffect, useRef: _vUseRef,
        useContext: _vUseContext, createContext: _vCreateContext,
        useCallback: _vUseCallback } = React;

const _vReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Status vocabulary (matches real VoiceStatus type)                  */
/* ------------------------------------------------------------------ */
const VOICE_STATUS = ["idle", "connecting", "connected", "error"];

const VOICE_STATUS_LABEL = {
  idle:       "Idle",
  connecting: "Connecting",
  connected:  "Voice live",
  error:      "Voice issue",
};

/* Maps onto status-language tones used elsewhere */
const VOICE_STATUS_TONE = {
  idle:       "done",
  connecting: "pending",
  connected:  "active",
  error:      "blocked",
};

/* Actor names — locked. Use these strings everywhere voice is described. */
const VOICE_ACTORS = {
  realtime: "Realtime voice AI",
  sdk:      "SDK-backed Agent",
};

/* ------------------------------------------------------------------ */
/* Mock context — same shape as RealtimeVoiceContextValue             */
/* ------------------------------------------------------------------ */
const VoiceContext = _vCreateContext(null);

function VoiceProvider({ children, initial = "idle" }) {
  const [voiceStatus, setVoiceStatus]   = _vUseState(initial);
  const [voiceError,  setVoiceError]    = _vUseState(null);
  const [voiceCallId, setVoiceCallId]   = _vUseState(null);
  const [voiceEvents, setVoiceEvents]   = _vUseState([]);

  const startVoiceSession = _vUseCallback(async (opts) => {
    if (voiceStatus === "connecting" || voiceStatus === "connected") return;
    setVoiceStatus("connecting");
    setVoiceError(null);
    setVoiceEvents([]);
    setTimeout(() => {
      setVoiceStatus("connected");
      setVoiceCallId("rt_" + Math.random().toString(36).slice(2, 10));
      setVoiceEvents(["oai-events connected"]);
      const sid = opts?.sessionId ?? null;
      if (sid) {
        window.dispatchEvent(new CustomEvent("aab:voice-session-bound", { detail: { sessionId: sid } }));
      }
    }, 800);
  }, [voiceStatus]);

  const stopVoiceSession = _vUseCallback(() => {
    setVoiceStatus("idle");
    setVoiceCallId(null);
  }, []);

  const value = { voiceStatus, voiceError, voiceCallId, voiceEvents,
                  startVoiceSession, stopVoiceSession };
  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

function useVoiceSession() {
  const ctx = _vUseContext(VoiceContext);
  if (!ctx) {
    /* Permissive fallback for previews that don't wrap in VoiceProvider */
    return {
      voiceStatus: "idle", voiceError: null, voiceCallId: null, voiceEvents: [],
      startVoiceSession: () => {}, stopVoiceSession: () => {},
    };
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Icons                                                              */
/* ------------------------------------------------------------------ */
function MicIcon({ size = 14, off = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3"/>
      <path d="M5 11a7 7 0 0014 0"/>
      <path d="M12 18v3"/>
      {off && <line x1="3" y1="3" x2="21" y2="21" strokeWidth="2"/>}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* VoiceComposerToggle — the Mic/MicOff button on the Agent composer  */
/* This is the ACTUAL "Start voice chat" affordance in the live repo. */
/* ------------------------------------------------------------------ */
function VoiceComposerToggle({ size = 36, sessionId = null, className = "" }) {
  const { voiceStatus, startVoiceSession, stopVoiceSession } = useVoiceSession();
  const active = voiceStatus === "connected" || voiceStatus === "connecting";
  const onClick = () => {
    if (active) stopVoiceSession();
    else startVoiceSession({ sessionId });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? "Stop voice chat" : "Start voice chat"}
      title={active ? "Stop voice chat" : "Start voice chat"}
      className={"rounded-full grid place-items-center transition-colors shrink-0 " + className}
      style={{
        width: size, height: size,
        border: "1px solid var(--line)",
        background: active
          ? "color-mix(in oklab, var(--status-active) 18%, var(--surface))"
          : "var(--surface)",
        color: active ? "var(--status-active)" : "var(--fg-2)",
      }}
    >
      <MicIcon size={Math.round(size * 0.42)} off={active} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* VoiceOrb — minimal active-session affordance                       */
/* ------------------------------------------------------------------ */
function VoiceOrb({ size = 56, amplitude }) {
  const { voiceStatus } = useVoiceSession();
  const live = voiceStatus === "connected";
  const tone = VOICE_STATUS_TONE[voiceStatus] || "done";
  const amp = typeof amplitude === "number" ? Math.max(0, Math.min(1, amplitude)) : 0.4;
  const ring = live ? `0 0 0 ${4 + amp * 10}px color-mix(in oklab, var(--status-${tone}) 18%, transparent)` : "none";
  return (
    <div
      role="img"
      aria-label={VOICE_STATUS_LABEL[voiceStatus]}
      className="rounded-full grid place-items-center text-white"
      style={{
        width: size, height: size,
        background: `radial-gradient(120% 120% at 30% 30%, var(--status-${tone}), color-mix(in oklab, var(--status-${tone}) 60%, var(--fg)))`,
        boxShadow: ring,
        transition: "box-shadow 180ms var(--ease-out)",
      }}
    >
      <MicIcon size={Math.round(size * 0.36)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* VoiceWaveform — bar viz; gentle breathing if reduced-motion        */
/* ------------------------------------------------------------------ */
function VoiceWaveform({ bars = 14, amplitude, height = 28 }) {
  const reduced = _vReduced();
  const seed = _vUseRef(Array.from({ length: bars }, () => 0.3 + Math.random() * 0.7));
  const [t, setT] = _vUseState(0);
  _vUseEffect(() => {
    if (reduced) return;
    let raf, start;
    const tick = (now) => {
      if (!start) start = now;
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);
  const amp = typeof amplitude === "number" ? amplitude : 0.5;
  return (
    <div className="flex items-center gap-[3px]" style={{ height }} aria-hidden="true">
      {seed.current.map((s, i) => {
        const wave = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(t * 4 + i * 0.6);
        const h = Math.max(3, Math.round(height * (0.18 + amp * wave * s)));
        return (
          <div key={i} style={{
            width: 3, height: h, borderRadius: 2,
            background: "color-mix(in oklab, var(--status-active) 80%, var(--fg))",
            transition: "height 80ms linear",
          }}/>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FloatingVoiceDock — matches FloatingRealtimeVoiceWidget            */
/* Appears when status !== "idle"; bottom-right; pulses when live.    */
/* ------------------------------------------------------------------ */
function FloatingVoiceDock() {
  const { voiceStatus, voiceCallId, voiceError, startVoiceSession, stopVoiceSession } = useVoiceSession();
  if (voiceStatus === "idle" && !voiceError) return null;
  const active = voiceStatus === "connected";
  const connecting = voiceStatus === "connecting";
  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full px-3 py-2"
      style={{
        border: "1px solid color-mix(in oklab, var(--line) 90%, transparent)",
        background: "color-mix(in oklab, var(--surface) 92%, transparent)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 24px 60px -28px rgba(7,12,24,0.55)",
      }}
    >
      <VoiceOrb size={44} />
      <div className="hidden sm:block min-w-0">
        <p className="text-[12px] font-semibold" style={{ color: "var(--fg)" }}>
          {VOICE_STATUS_LABEL[voiceStatus]}
        </p>
        <p className="font-mono text-[10px] truncate" style={{ color: "var(--fg-muted)", maxWidth: 220 }}>
          {voiceError ?? voiceCallId ?? "Realtime"}
        </p>
      </div>
      <button
        type="button"
        onClick={active || connecting ? stopVoiceSession : () => startVoiceSession()}
        aria-label={active || connecting ? "Stop voice" : "Start voice"}
        className="rounded-full h-9 w-9 grid place-items-center"
        style={{
          background: active || connecting ? "var(--status-blocked)" : "transparent",
          color: active || connecting ? "white" : "var(--fg-2)",
          border: active || connecting ? "none" : "1px solid var(--line)",
        }}
      >
        <MicIcon off={active || connecting} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline rows — voice event types merged into the agent timeline   */
/* ------------------------------------------------------------------ */

/* Shared row chrome — matches the live timeline visual vocabulary */
function _VoiceTimelineRow({ kind = "user", label, actor, time, children, tone = "active", phrase }) {
  const isUser = kind === "user";
  return (
    <article
      className="surface-list-item"
      data-slot="card"
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "12px 14px",
        padding: "12px 14px",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-md, 12px)",
        background: isUser ? "var(--surface)" : "color-mix(in oklab, var(--bg-sunk) 60%, var(--surface))",
      }}
    >
      <div
        className="rounded-full"
        style={{
          width: 8, height: 8, marginTop: 8,
          background: `var(--status-${tone})`,
          boxShadow: `0 0 0 3px color-mix(in oklab, var(--status-${tone}) 18%, transparent)`,
        }}
      />
      <div className="min-w-0">
        <header className="flex items-center gap-2 mb-1.5">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.12em]"
            style={{ color: "var(--fg-muted)" }}
          >
            {label}
          </span>
          {actor && (
            <span className="font-mono text-[10px]" style={{ color: "var(--fg-3)" }}>
              · {actor}
            </span>
          )}
          {time && (
            <span className="font-mono text-[10px] ml-auto" style={{ color: "var(--fg-3)" }}>
              {time}
            </span>
          )}
        </header>
        <div style={{ fontSize: 14, lineHeight: 1.55, color: "var(--fg)" }}>{children}</div>
        {phrase && (
          <p className="font-mono text-[11px] mt-2" style={{ color: "var(--fg-muted)" }}>
            Confirm by saying: <span style={{ color: "var(--fg)" }}>“{phrase}”</span>
          </p>
        )}
      </div>
    </article>
  );
}

/* voice_operator_message — operator dictation */
function OperatorVoiceMessage({ text, time }) {
  return (
    <_VoiceTimelineRow kind="user" label="operator by voice" tone="active" time={time}>
      {text}
    </_VoiceTimelineRow>
  );
}

/* user_message w/ payload.source === "realtime_voice"
   Realtime voice AI delegates to SDK-backed Agent. */
function VoiceDelegationRow({ instruction, routingReason, time }) {
  return (
    <_VoiceTimelineRow
      kind="tool"
      label={`${VOICE_ACTORS.realtime} → ${VOICE_ACTORS.sdk}`}
      tone="pending"
      time={time}
    >
      <p style={{ marginBottom: routingReason ? 6 : 0 }}>{instruction}</p>
      {routingReason && (
        <p className="font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
          routing reason — {routingReason}
        </p>
      )}
    </_VoiceTimelineRow>
  );
}

/* voice_final_summary — SDK-backed Agent → Realtime voice AI summary */
function AgentVoiceSummary({ text, time }) {
  return (
    <_VoiceTimelineRow
      kind="tool"
      label={`${VOICE_ACTORS.sdk} → ${VOICE_ACTORS.realtime}`}
      tone="active"
      time={time}
    >
      {text}
    </_VoiceTimelineRow>
  );
}

/* voice_action_prepared — voice approval card with confirmation phrase */
function VoiceApprovalCard({ action, summary, confirmationPhrase, time, onApprove, onDeny }) {
  return (
    <article
      data-slot="card"
      style={{
        border: "1px solid color-mix(in oklab, var(--status-review) 35%, var(--line))",
        borderRadius: "var(--r-md, 12px)",
        background: "color-mix(in oklab, var(--status-review) 6%, var(--surface))",
        padding: "14px",
      }}
    >
      <header className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em]"
              style={{ color: "var(--status-review)" }}>
          voice action prepared
        </span>
        {time && (
          <span className="font-mono text-[10px] ml-auto" style={{ color: "var(--fg-3)" }}>
            {time}
          </span>
        )}
      </header>
      <p style={{ fontSize: 15, fontWeight: 500, color: "var(--fg)" }}>{action}</p>
      {summary && (
        <p style={{ fontSize: 13, lineHeight: 1.55, marginTop: 6, color: "var(--fg-2)" }}>
          {summary}
        </p>
      )}
      <div
        className="mt-3 p-2.5 rounded-md"
        style={{
          border: "1px dashed color-mix(in oklab, var(--status-review) 40%, var(--line))",
          background: "var(--surface)",
        }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.12em]"
           style={{ color: "var(--fg-muted)", marginBottom: 4 }}>
          Confirmation phrase
        </p>
        <p className="font-mono text-[13px]" style={{ color: "var(--fg)" }}>
          “{confirmationPhrase}”
        </p>
      </div>
      <footer className="flex gap-2 mt-3">
        <button
          onClick={onApprove}
          className="text-[12px] font-medium px-3 py-1.5 rounded-full"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >
          Approve
        </button>
        <button
          onClick={onDeny}
          className="text-[12px] font-medium px-3 py-1.5 rounded-full"
          style={{ border: "1px solid var(--line)", color: "var(--fg-2)", background: "var(--surface)" }}
        >
          Deny
        </button>
      </footer>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* VoiceConfigSection — config form rendered inside Settings page     */
/* ------------------------------------------------------------------ */
const VOICE_PREF_KEY = "aab.voice-preferences";
const VOICE_PREF_DEFAULTS = {
  model: "gpt-4o-realtime",
  voice: "alloy",
  pushToTalk: false,
  showTranscript: true,
  bindToCurrentSession: true,
  confirmDestructive: true,
};

function _readVoicePrefs() {
  try { return { ...VOICE_PREF_DEFAULTS, ...JSON.parse(localStorage.getItem(VOICE_PREF_KEY) || "{}") }; }
  catch { return VOICE_PREF_DEFAULTS; }
}

function useVoicePreferences() {
  const [prefs, setPrefs] = _vUseState(_readVoicePrefs);
  _vUseEffect(() => {
    try { localStorage.setItem(VOICE_PREF_KEY, JSON.stringify(prefs)); } catch {}
  }, [prefs]);
  return [prefs, (patch) => setPrefs(p => ({ ...p, ...patch }))];
}

function VoiceConfigSection() {
  const [prefs, update] = useVoicePreferences();
  const { voiceStatus, voiceCallId } = useVoiceSession();
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="flex items-center gap-3">
        <VoiceOrb size={36} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>
            {VOICE_STATUS_LABEL[voiceStatus]}
          </p>
          <p className="font-mono text-[10px]" style={{ color: "var(--fg-muted)" }}>
            {voiceCallId || "no active call"}
          </p>
        </div>
      </div>

      <_VoiceSelectRow label="Realtime model" value={prefs.model}
        onChange={v => update({ model: v })}
        options={[
          ["gpt-4o-realtime",         "OpenAI · gpt-4o-realtime"],
          ["gpt-4o-mini-realtime",    "OpenAI · gpt-4o-mini-realtime"],
        ]} />
      <_VoiceSelectRow label="Voice timbre" value={prefs.voice}
        onChange={v => update({ voice: v })}
        options={[["alloy","Alloy"], ["echo","Echo"], ["shimmer","Shimmer"], ["coral","Coral"]]} />
      <_VoiceToggleRow label="Push-to-talk"
        hint="Hold space to talk. Off = continuous open mic."
        value={prefs.pushToTalk}
        onChange={v => update({ pushToTalk: v })} />
      <_VoiceToggleRow label="Show inline transcript"
        hint="Render voice utterances in the Agent timeline."
        value={prefs.showTranscript}
        onChange={v => update({ showTranscript: v })} />
      <_VoiceToggleRow label="Bind to current session"
        hint="Continue the open Agent session over voice instead of starting fresh."
        value={prefs.bindToCurrentSession}
        onChange={v => update({ bindToCurrentSession: v })} />
      <_VoiceToggleRow label="Require confirmation phrase for destructive actions"
        hint="Voice AI must hear an exact phrase before running destructive tools."
        value={prefs.confirmDestructive}
        onChange={v => update({ confirmDestructive: v })} />
    </div>
  );
}

function _VoiceSelectRow({ label, value, onChange, options }) {
  return (
    <label style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 12, alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "var(--fg)" }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-[12px]"
        style={{
          height: 32, padding: "0 10px", borderRadius: 8,
          background: "var(--surface)", color: "var(--fg)",
          border: "1px solid var(--line)",
        }}
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function _VoiceToggleRow({ label, hint, value, onChange }) {
  return (
    <label style={{ display: "grid", gridTemplateColumns: "1fr 44px", gap: 12, alignItems: "center", cursor: "pointer" }}>
      <span>
        <span style={{ fontSize: 13, color: "var(--fg)", display: "block" }}>{label}</span>
        {hint && (
          <span style={{ fontSize: 12, color: "var(--fg-muted)", display: "block", marginTop: 2 }}>
            {hint}
          </span>
        )}
      </span>
      <span
        onClick={() => onChange(!value)}
        style={{
          width: 36, height: 20, borderRadius: 999, padding: 2,
          background: value ? "var(--status-active)" : "color-mix(in oklab, var(--fg) 18%, var(--bg))",
          transition: "background 160ms var(--ease-out)",
          justifySelf: "end",
        }}
      >
        <span style={{
          display: "block", width: 16, height: 16, borderRadius: "50%",
          background: "white",
          transform: value ? "translateX(16px)" : "translateX(0)",
          transition: "transform 160ms var(--ease-out)",
        }}/>
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Export to window                                                   */
/* ------------------------------------------------------------------ */
Object.assign(window, {
  VOICE_STATUS, VOICE_STATUS_LABEL, VOICE_STATUS_TONE, VOICE_ACTORS,
  VoiceProvider, useVoiceSession,
  VoiceComposerToggle, FloatingVoiceDock,
  VoiceOrb, VoiceWaveform,
  OperatorVoiceMessage, VoiceDelegationRow, AgentVoiceSummary, VoiceApprovalCard,
  VoiceConfigSection, useVoicePreferences,
});
