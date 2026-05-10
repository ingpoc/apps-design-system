/* Seed data for the prototype. Realistic for an agent-builder product. */

const BOARD_DATA = {
  active: [
    {
      id: "t_9f21",
      title: "Add rate-limit retry to /v1/runs endpoint",
      feature_title: "Resilient public API surface",
      agent_name: "impl-agent",
      status: "implementation",
      cost_usd: 0.0423,
      num_turns: 14,
      progress: 0.62,
      confidence: 0.84,
      duration_ms: 186000,
    },
    {
      id: "t_4a18",
      title: "Migrate tool registry to async handler model",
      feature_title: "Runtime consolidation",
      agent_name: "design-agent",
      status: "design",
      cost_usd: 0.0118,
      num_turns: 6,
      progress: 0.3,
      confidence: 0.71,
      duration_ms: 72000,
    },
    {
      id: "t_2c77",
      title: "Emit OTEL spans for every subagent tool call",
      feature_title: "Observability mesh",
      agent_name: "plan-agent",
      status: "planning",
      cost_usd: 0.0041,
      num_turns: 3,
      progress: 0.12,
      confidence: 0.66,
      duration_ms: 22000,
    },
  ],
  review: [
    {
      id: "t_7b02",
      title: "Replace hand-rolled JWT with oauth provider abstraction",
      feature_title: "Auth hardening",
      agent_name: "impl-agent",
      status: "review_pending",
      cost_usd: 0.0874,
      num_turns: 22,
      progress: 0.95,
      confidence: 0.78,
      approval_gate_id: "g_7b02",
      duration_ms: 412000,
    },
    {
      id: "t_5e44",
      title: "Schema v2 — attach evidence graph to knowledge docs",
      feature_title: "Knowledge graph",
      agent_name: "design-agent",
      status: "design_review",
      cost_usd: 0.0291,
      num_turns: 11,
      progress: 0.9,
      confidence: 0.92,
      approval_gate_id: "g_5e44",
      duration_ms: 198000,
    },
  ],
  pending: [
    { id: "t_0a91", title: "Add cost budget caps per agent", feature_title: "Runaway-cost protection", agent_name: "unassigned", status: "pending", cost_usd: 0, num_turns: 0, progress: 0, confidence: 0, duration_ms: 0 },
    { id: "t_0a92", title: "Promote /v2 endpoints to default router", feature_title: "Resilient public API surface", agent_name: "unassigned", status: "pending", cost_usd: 0, num_turns: 0, progress: 0, confidence: 0, duration_ms: 0 },
    { id: "t_0a93", title: "Backfill memory index for pre-GA runs", feature_title: "Memory system", agent_name: "unassigned", status: "pending", cost_usd: 0, num_turns: 0, progress: 0, confidence: 0, duration_ms: 0 },
  ],
  done: [
    { id: "t_d100", title: "Wire quality-gate stream to dashboard", feature_title: "Observability mesh", agent_name: "impl-agent", status: "done", cost_usd: 0.0612, num_turns: 18, progress: 1, confidence: 0.95, duration_ms: 268000 },
    { id: "t_d101", title: "Seed demo with 12 canonical tasks", feature_title: "Onboarding polish", agent_name: "impl-agent", status: "done", cost_usd: 0.0104, num_turns: 4, progress: 1, confidence: 1, duration_ms: 38000 },
  ],
  blocked: [
    {
      id: "t_b900",
      title: "Support Anthropic batch API for nightly eval",
      feature_title: "Eval throughput",
      agent_name: "impl-agent",
      status: "blocked",
      blocked_reason: "Upstream SDK v0.42 required — currently pinned to 0.38",
      cost_usd: 0.0052,
      num_turns: 2,
      progress: 0.08,
      confidence: 0.3,
      duration_ms: 14000,
    },
  ],
};

const AGENT_THREAD = [
  { kind: "user", ts: "14:22:01", body: "Work on t_9f21 — add rate-limit retry to /v1/runs." },
  { kind: "thinking", ts: "14:22:03", body: "Locating the current handler. Repository layout suggests src/autonomous_agent_builder/api/runs.py — let me confirm before editing." },
  { kind: "tool", name: "grep", ts: "14:22:04", args: "pattern=\"def.*runs\", path=\"src/\"", result: "7 matches across 3 files" },
  { kind: "tool", name: "read_file", ts: "14:22:05", args: "src/autonomous_agent_builder/api/runs.py", result: "312 lines" },
  { kind: "thinking", ts: "14:22:07", body: "Handler uses a plain httpx.post with no retry. I'll introduce a tenacity-style retry wrapper with exponential backoff, capped at 3 attempts, and respect Retry-After when provided." },
  { kind: "tool", name: "edit_file", ts: "14:22:09", args: "runs.py +38 / -6", result: "ok" },
  { kind: "tool", name: "run_tests", ts: "14:22:14", args: "tests/test_api_routes.py::test_rate_limit", result: "passed in 1.2s" },
  { kind: "gate", name: "type-check", ts: "14:22:17", status: "pass", body: "mypy strict — no new errors" },
  { kind: "gate", name: "contract-lint", ts: "14:22:19", status: "warn", body: "Retry-After parsing ignores non-integer values; spec allows HTTP-date. Non-blocking." },
  { kind: "thinking", ts: "14:22:22", body: "The warn is fair; HTTP-date is a real case. Not in scope for this task, but I'll open a follow-up." },
];

const METRICS = {
  total_cost: 4.82,
  total_tokens: 2_184_992,
  total_runs: 43,
  gate_pass_rate: 0.88,
  sparkline_cost: [0.12, 0.18, 0.09, 0.22, 0.3, 0.18, 0.26, 0.41, 0.24, 0.32, 0.28, 0.5, 0.38, 0.44],
  runs: [
    { id: "r_001", task: "t_9f21", agent: "impl-agent", cost: 0.0423, tokens: 48210, turns: 14, duration_ms: 186000, status: "running", started_at: "14:22:01" },
    { id: "r_002", task: "t_7b02", agent: "impl-agent", cost: 0.0874, tokens: 96112, turns: 22, duration_ms: 412000, status: "review_pending", started_at: "13:58:12" },
    { id: "r_003", task: "t_d100", agent: "impl-agent", cost: 0.0612, tokens: 72488, turns: 18, duration_ms: 268000, status: "success", started_at: "13:11:44" },
    { id: "r_004", task: "t_d101", agent: "impl-agent", cost: 0.0104, tokens: 11808, turns: 4, duration_ms: 38000, status: "success", started_at: "12:48:02" },
    { id: "r_005", task: "t_b900", agent: "impl-agent", cost: 0.0052, tokens: 4214, turns: 2, duration_ms: 14000, status: "blocked", started_at: "12:22:19" },
    { id: "r_006", task: "t_5e44", agent: "design-agent", cost: 0.0291, tokens: 31880, turns: 11, duration_ms: 198000, status: "review_pending", started_at: "11:55:44" },
  ],
};

const KNOWLEDGE_DOCS = [
  { id: "k_101", type: "adr", title: "ADR-014 · Adopt async tool-handler protocol", updated: "2d ago", tags: ["runtime", "tools"], excerpt: "We replace the synchronous tool interface with an async protocol to support streaming and long-running tools without blocking the event loop." },
  { id: "k_102", type: "runbook", title: "Recovering a stuck quality-gate run", updated: "4d ago", tags: ["ops", "quality-gate"], excerpt: "Step-by-step recovery when a gate times out and the task is stranded in the implementation phase." },
  { id: "k_103", type: "api_contract", title: "/v1/runs — POST contract", updated: "6h ago", tags: ["api", "v1"], excerpt: "Creates an agent run from a task. Validates approval gate status. Idempotency keyed on (task_id, agent, content_hash)." },
  { id: "k_104", type: "schema", title: "evidence_graph — node/edge tables", updated: "1d ago", tags: ["db", "kb"], excerpt: "Schema for the evidence graph attaching supporting sources to knowledge-base documents." },
  { id: "k_105", type: "context", title: "Why we keep local memory separate from KB", updated: "3w ago", tags: ["memory", "kb"], excerpt: "Local memory is ephemeral and scoped to an agent; KB is versioned, shared, and curated." },
];

Object.assign(window, {
  BOARD_DATA, AGENT_THREAD, METRICS, KNOWLEDGE_DOCS,
});
