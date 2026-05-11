/* Editorial & knowledge primitives — second-wave components added to mirror
   the live frontend (ingpoc/autonomous-agent-builder@main).

   These all share the editorial-calm vocabulary defined in primitives.jsx:
   surface borders via --line, body text at --fg/0.84, mono eyebrows, status
   tints sourced from oklch(from var(--status-...)).

   Animations use the global `gsap` object (loaded via CDN in the host HTML).
   Every animation respects prefers-reduced-motion.
*/

const { useState: _useState, useEffect: _useEffect, useRef: _useRef } = React;

/* ------------------------------------------------------------------ */
/* Reduced-motion helper                                              */
/* ------------------------------------------------------------------ */
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* EditorialContent — markdown → editorial blocks                     */
/* ------------------------------------------------------------------ */
const _cleanInline = (text) =>
  text
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1");

function _parseInline(text) {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return tokens.map((token, i) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={`c-${i}`}
          className="font-mono text-[0.92em] px-1.5 py-0.5 rounded-[4px]"
          style={{
            background: "color-mix(in oklab, var(--fg) 5%, transparent)",
            color: "var(--fg-2)",
          }}
        >
          {_cleanInline(token.slice(1, -1))}
        </code>
      );
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={`b-${i}`} className="font-semibold" style={{ color: "var(--fg)" }}>
          {_cleanInline(token.slice(2, -2))}
        </strong>
      );
    }
    return <span key={`t-${i}`}>{_cleanInline(token)}</span>;
  });
}

function _parseBlocks(content) {
  const lines = content
    .replace(/^---[\s\S]*?---\s*/, "")
    .replace(/\r\n/g, "\n")
    .split("\n");

  const blocks = [];
  let paragraphLines = [];
  let listItems = [];
  let quoteLines = [];
  let codeLines = [];
  let codeLanguage = "";
  let inCode = false;

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" ").replace(/\s+/g, " ").trim(),
    });
    paragraphLines = [];
  };
  const flushList = () => {
    if (!listItems.length) return;
    blocks.push({ type: "list", items: [...listItems] });
    listItems = [];
  };
  const flushQuote = () => {
    if (!quoteLines.length) return;
    blocks.push({ type: "quote", lines: [...quoteLines] });
    quoteLines = [];
  };
  const flushCode = () => {
    if (!codeLines.length) return;
    blocks.push({
      type: "code",
      language: codeLanguage || undefined,
      code: codeLines.join("\n").trimEnd(),
    });
    codeLines = [];
    codeLanguage = "";
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        flushQuote();
        inCode = true;
        codeLanguage = trimmed.slice(3).trim();
      }
      continue;
    }
    if (inCode) {
      codeLines.push(raw);
      continue;
    }
    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }
    const h = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push({
        type: "heading",
        level: h[1].length,
        text: _cleanInline(h[2].trim()),
      });
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      flushQuote();
      listItems.push(trimmed.replace(/^[-*]\s+/, ""));
      continue;
    }
    if (trimmed.startsWith(">")) {
      flushParagraph();
      flushList();
      quoteLines.push(trimmed.replace(/^>\s?/, ""));
      continue;
    }
    paragraphLines.push(trimmed);
  }
  flushParagraph();
  flushList();
  flushQuote();
  flushCode();
  return blocks;
}

function EditorialContent({ content, externalTitle, className = "" }) {
  const blocks = _parseBlocks(content || "");
  const ext = externalTitle?.trim().toLowerCase();
  const visible =
    ext &&
    blocks[0]?.type === "heading" &&
    blocks[0].level === 1 &&
    blocks[0].text.trim().toLowerCase() === ext
      ? blocks.slice(1)
      : blocks;

  if (!visible.length) {
    return (
      <div
        className="px-5 py-4 text-[13px]"
        style={{
          borderRadius: "var(--radius-lg)",
          border: "1px dashed var(--line-strong)",
          background: "color-mix(in oklab, var(--fg) 4%, transparent)",
          color: "var(--fg-3)",
        }}
      >
        No readable content available.
      </div>
    );
  }

  return (
    <div className={cn("space-y-5 text-[14px] leading-[1.6]", className)} style={{ color: "var(--fg)" }}>
      {visible.map((b, i) => {
        if (b.type === "heading") {
          if (b.level === 1) {
            return (
              <h1
                key={`h1-${i}`}
                className="display-serif"
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.6rem)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.035em",
                  maxWidth: "16ch",
                  color: "var(--fg)",
                  fontWeight: 500,
                }}
              >
                {b.text}
              </h1>
            );
          }
          if (b.level === 2) {
            return (
              <section key={`h2-${i}`} className="space-y-3 pt-2">
                <div className="h-px" style={{ background: "var(--line)" }} />
                <h2
                  className="font-mono uppercase"
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.2em",
                    color: "var(--fg-3)",
                    fontWeight: 600,
                  }}
                >
                  {b.text}
                </h2>
              </section>
            );
          }
          return (
            <h3
              key={`h3-${i}`}
              className="font-semibold tracking-tight"
              style={{ fontSize: "1rem", color: "var(--fg)" }}
            >
              {b.text}
            </h3>
          );
        }
        if (b.type === "paragraph") {
          return (
            <p
              key={`p-${i}`}
              style={{
                maxWidth: "69ch",
                color: "color-mix(in oklab, var(--fg) 84%, transparent)",
              }}
            >
              {_parseInline(b.text)}
            </p>
          );
        }
        if (b.type === "list") {
          return (
            <ul
              key={`ul-${i}`}
              className="pl-5 space-y-2.5"
              style={{
                maxWidth: "70ch",
                color: "color-mix(in oklab, var(--fg) 84%, transparent)",
              }}
            >
              {b.items.map((item, j) => (
                <li key={`li-${i}-${j}`} style={{ listStyle: "disc" }}>
                  {_parseInline(item)}
                </li>
              ))}
            </ul>
          );
        }
        if (b.type === "quote") {
          return (
            <blockquote
              key={`q-${i}`}
              className="px-5 py-4 text-[14px] leading-[1.6]"
              style={{
                maxWidth: "69ch",
                borderRadius: "0.3rem 1rem 1rem 0.3rem",
                borderLeft: "3px solid oklch(from var(--status-active) l c h / 0.35)",
                background: "oklch(from var(--status-active) l c h / 0.045)",
                color: "color-mix(in oklab, var(--fg) 78%, transparent)",
              }}
            >
              {b.lines.map((l, j) => (
                <p key={`ql-${i}-${j}`}>{_parseInline(l)}</p>
              ))}
            </blockquote>
          );
        }
        return (
          <div
            key={`code-${i}`}
            className="overflow-x-auto"
            style={{
              maxWidth: "72ch",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--line)",
              background: "color-mix(in oklab, var(--fg) 4%, var(--surface))",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ borderBottom: "1px solid var(--line)" }}
            >
              <span
                className="font-mono uppercase"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  color: "var(--fg-3)",
                  fontWeight: 600,
                }}
              >
                {b.language || "code"}
              </span>
            </div>
            <pre className="overflow-x-auto px-4 py-4 font-mono" style={{ fontSize: "12px", lineHeight: 1.55, color: "var(--fg-2)" }}>
              <code>{b.code}</code>
            </pre>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SectionLabel & EmptyState                                          */
/* ------------------------------------------------------------------ */
function SectionLabel({ children, className = "" }) {
  return (
    <p
      className={cn("font-mono uppercase", className)}
      style={{
        fontSize: "11px",
        letterSpacing: "0.18em",
        color: "var(--fg-3)",
        fontWeight: 600,
      }}
    >
      {children}
    </p>
  );
}

function EmptyState({ label, detail, action, className = "" }) {
  return (
    <div
      className={cn("flex flex-col items-start gap-2 px-5 py-6", className)}
      style={{
        borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--line-strong)",
        background: "color-mix(in oklab, var(--fg) 3%, transparent)",
      }}
    >
      <Eyebrow>{label}</Eyebrow>
      {detail && (
        <p
          className="text-[13px] leading-[1.55]"
          style={{ maxWidth: "60ch", color: "var(--fg-3)" }}
        >
          {detail}
        </p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Memory-type tones                                                  */
/* ------------------------------------------------------------------ */
const MEMORY_TYPE_TONE = {
  decision: { label: "Decision", variant: "default" },
  pattern: { label: "Pattern", variant: "soft" },
  correction: { label: "Correction", variant: "destructive" },
};

/* Tiny badge used by KnowledgeCard/TagCloud — distinct from StatusPill */
function Badge({ variant = "outline", className = "", children, ...rest }) {
  const variants = {
    default: {
      background: "var(--accent)",
      color: "var(--fg-on-accent)",
      border: "1px solid transparent",
    },
    soft: {
      background: "color-mix(in oklab, var(--accent) 14%, transparent)",
      color: "var(--accent-ink)",
      border: "1px solid color-mix(in oklab, var(--accent) 22%, transparent)",
    },
    secondary: {
      background: "color-mix(in oklab, var(--fg) 6%, var(--surface))",
      color: "var(--fg-2)",
      border: "1px solid var(--line)",
    },
    outline: {
      background: "color-mix(in oklab, var(--bg) 65%, transparent)",
      color: "var(--fg-3)",
      border: "1px solid var(--line)",
    },
    destructive: {
      background: "oklch(from var(--status-blocked) l c h / 0.12)",
      color: "oklch(from var(--status-blocked) calc(l - 0.1) c h)",
      border: "1px solid oklch(from var(--status-blocked) l c h / 0.28)",
    },
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-full)] font-mono",
        className
      )}
      style={{
        fontSize: "10px",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        fontWeight: 600,
        ...variants[variant],
      }}
      {...rest}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* KnowledgeCard — list-item with hover micro-shift                   */
/* ------------------------------------------------------------------ */
const _TYPE_LABELS = {
  adr: "ADR",
  api_contract: "API Contract",
  schema: "Schema",
  runbook: "Runbook",
  context: "Context",
  raw: "Article",
};

function KnowledgeCard({ doc, isSelected = false, onSelect = () => {} }) {
  const rowRef = _useRef(null);

  _useEffect(() => {
    const el = rowRef.current;
    if (!el || prefersReducedMotion() || !window.gsap) return;
    const onEnter = () =>
      window.gsap.to(el, { x: 4, duration: 0.18, ease: "power2.out" });
    const onLeave = () =>
      window.gsap.to(el, { x: 0, duration: 0.18, ease: "power2.out" });
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [isSelected]);

  const excerpt = (doc.content || "")
    .replace(/^---[\s\S]*?---/, "")
    .replace(/^#+\s+.*$/gm, "")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .trim()
    .slice(0, 170);

  return (
    <button
      ref={rowRef}
      type="button"
      data-selected={isSelected}
      onClick={() => onSelect(doc.id)}
      className="w-full text-left transition-colors block"
      style={{
        background: isSelected
          ? "color-mix(in oklab, var(--accent) 8%, var(--surface))"
          : "var(--surface)",
        border: `1px solid ${
          isSelected ? "color-mix(in oklab, var(--accent) 35%, var(--line))" : "var(--line)"
        }`,
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4) var(--space-5)",
        boxShadow: isSelected ? "var(--shadow-sm)" : "var(--shadow-xs)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {_TYPE_LABELS[doc.doc_type] || doc.doc_type}
            </Badge>
            <span
              className="font-mono uppercase"
              style={{ fontSize: "10px", letterSpacing: "0.18em", color: "var(--fg-3)" }}
            >
              {doc.source_author || "local doc"}
            </span>
          </div>
          <div>
            <h3
              className="font-semibold tracking-tight"
              style={{
                fontSize: "16px",
                lineHeight: 1.3,
                color: "var(--fg)",
              }}
            >
              {doc.title}
            </h3>
            <p
              className="mt-2 leading-6"
              style={{
                fontSize: "13px",
                color: "var(--fg-3)",
                maxWidth: "60ch",
              }}
            >
              {excerpt || "No preview available."}
            </p>
          </div>
        </div>
        <div
          className="text-right font-mono uppercase shrink-0"
          style={{ fontSize: "10px", letterSpacing: "0.18em", color: "var(--fg-3)" }}
        >
          <div>{doc.wikilinks?.length ?? 0} links</div>
          <div className="mt-1">{doc.version ? `v${doc.version}` : "latest"}</div>
        </div>
      </div>
      {doc.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {doc.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
          {doc.tags.length > 4 ? (
            <Badge variant="outline">+{doc.tags.length - 4}</Badge>
          ) : null}
        </div>
      ) : null}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* TagCloud                                                           */
/* ------------------------------------------------------------------ */
function TagCloud({ tags = [], selectedTags = [], onTagToggle = () => {} }) {
  const containerRef = _useRef(null);

  _useEffect(() => {
    const root = containerRef.current;
    if (!root || !window.gsap) return;
    const reduced = prefersReducedMotion();
    root.querySelectorAll("[data-tag]").forEach((el) => {
      const name = el.getAttribute("data-tag");
      const tag = tags.find((t) => t.name === name);
      const isSel = selectedTags.includes(name);
      const isAvail = tag?.available ?? true;
      const payload = {
        opacity: isAvail || isSel ? 1 : 0.3,
        scale: isSel ? 1.05 : 1,
      };
      if (reduced) {
        window.gsap.set(el, payload);
      } else {
        window.gsap.to(el, { ...payload, duration: 0.4, ease: "power2.out" });
      }
    });
  }, [tags, selectedTags]);

  const sorted = [...tags].sort((a, b) => {
    const aSel = selectedTags.includes(a.name);
    const bSel = selectedTags.includes(b.name);
    if (aSel && !bSel) return -1;
    if (!aSel && bSel) return 1;
    return b.count - a.count;
  });

  if (!tags.length) {
    return (
      <div className="text-[13px]" style={{ color: "var(--fg-3)" }}>
        No tags found in documents
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2">
      {sorted.map((t) => {
        const isSel = selectedTags.includes(t.name);
        const isAvail = t.available ?? true;
        const clickable = isAvail || isSel;
        return (
          <span
            key={t.name}
            data-tag={t.name}
            onClick={() => clickable && onTagToggle(t.name)}
            className="inline-flex items-center gap-1.5"
            style={{
              cursor: clickable ? "pointer" : "not-allowed",
              pointerEvents: clickable ? "auto" : "none",
              transformOrigin: "center",
              willChange: "transform",
            }}
          >
            <Badge variant={isSel ? "default" : "outline"}>
              <span>{t.name}</span>
              <span style={{ opacity: 0.7 }}>({t.count})</span>
              {isSel ? <span style={{ marginLeft: 4 }}>×</span> : null}
            </Badge>
          </span>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MemorySidebar                                                      */
/* ------------------------------------------------------------------ */
function MemorySidebar({ entry, content, isOpen, onClose }) {
  const sidebarRef = _useRef(null);
  const backdropRef = _useRef(null);

  _useEffect(() => {
    if (!sidebarRef.current || !backdropRef.current || !window.gsap) return;
    const reduced = prefersReducedMotion();
    if (reduced) {
      sidebarRef.current.style.transform = isOpen ? "translateX(0)" : "translateX(100%)";
      backdropRef.current.style.opacity = isOpen ? "1" : "0";
      backdropRef.current.style.pointerEvents = isOpen ? "auto" : "none";
      return;
    }
    window.gsap.to(sidebarRef.current, {
      x: isOpen ? 0 : "100%",
      duration: 0.4,
      ease: "power3.out",
    });
    window.gsap.to(backdropRef.current, {
      opacity: isOpen ? 1 : 0,
      duration: 0.3,
      onComplete: () => {
        if (backdropRef.current) {
          backdropRef.current.style.pointerEvents = isOpen ? "auto" : "none";
        }
      },
    });
  }, [isOpen]);

  if (!entry) return null;
  const tone = MEMORY_TYPE_TONE[entry.type] || MEMORY_TYPE_TONE.decision;

  return (
    <>
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 z-40 opacity-0 pointer-events-none lg:hidden"
        style={{
          background: "oklch(0 0 0 / 0.2)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        ref={sidebarRef}
        className="fixed right-0 top-0 z-50 h-full w-full sm:w-[36rem] overflow-y-auto p-4"
        style={{ transform: "translateX(100%)" }}
      >
        <div
          className="space-y-6 p-6"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-lg)",
            minHeight: "calc(100% - 1rem)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={tone.variant}>{tone.label}</Badge>
                {entry.status ? <Badge variant="outline">{entry.status}</Badge> : null}
              </div>
              <div>
                <h2 className="font-semibold tracking-tight" style={{ fontSize: "24px", color: "var(--fg)" }}>
                  {entry.title}
                </h2>
                <div
                  className="mt-2 flex flex-wrap items-center gap-2 text-[13px]"
                  style={{ color: "var(--fg-3)" }}
                >
                  {entry.phase && <span>{entry.phase}</span>}
                  {entry.phase && entry.entity && <span>•</span>}
                  {entry.entity && <span>{entry.entity}</span>}
                  {entry.date && <span>•</span>}
                  {entry.date && <span>{entry.date}</span>}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>×</Button>
          </div>

          {entry.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((t) => (
                <Badge key={t} variant="outline">{t}</Badge>
              ))}
            </div>
          ) : null}

          <div className="h-px" style={{ background: "var(--line)" }} />

          <div className="space-y-3">
            <SectionLabel>Memory content</SectionLabel>
            <EditorialContent content={content || "No content available for this memory."} />
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, {
  prefersReducedMotion,
  EditorialContent,
  SectionLabel,
  EmptyState,
  Badge,
  KnowledgeCard,
  TagCloud,
  MemorySidebar,
  MEMORY_TYPE_TONE,
});
