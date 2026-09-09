import type { DocSection, DocPage } from "../types";

const runtime: DocPage = {
  slug: "runtime",
  title: "Runtime State",
  description:
    "The single-threaded execution context that owns tasks, the async scheduler, and lifecycle counters.",
  source: "docs/RUNTIME_STATE_EN.md",
  markdown: `## Execution context

The Zap runtime is a single-threaded execution context. Each run owns its own \`RuntimeState\`, which holds the evaluator stack, the async scheduler, lifecycle counters, and bounded memory diagnostics.

The normal execution pipeline is **source &rarr; lexer &rarr; AST parser &rarr; evaluator**. The evaluator executes the parsed AST directly; function and method bodies are not reconstructed from source lines.

## Async scheduling

Language \`async fn\` calls schedule their completed values through the caller's \`RuntimeState\` and return a context-owned \`ScheduledFuture\`:

- \`await\` and \`task_join\` drive the executor before consuming the result.
- \`task_is_ready\` observes readiness **without** polling.
- \`task_cancel\` requests cooperative cancellation.
- \`task_join_timeout\` enforces a deterministic poll budget.

The executor is deterministic and poll-budgeted. It is **not** a production I/O reactor. Blocking calls, socket readiness, worker scheduling, shutdown, and forced cancellation of foreign blocking work require the separate production boundary contract.

## Memory diagnostics

\`memory_stats()\` returns a map with live-object, object allocation/deallocation, validation/cleanup lifecycle, logical budget, value-size-limit, and deferred-capability fields, including \`cycle_policy=explicit_clear_object_fields\`. Logical budget failures use stable \`ZAP-MEMORY-001\` diagnostics.

\`\`\`zap
say memory_stats()
\`\`\`

## Determinism

The runtime is **deterministic by construction**:

- Statement order is source order.
- Loops evaluate their condition before every iteration.
- \`return\` exits the current function only.
- Module resolution visits imports in deterministic source order and rejects cycles with a complete-cycle diagnostic.
- Async scheduling is poll-budgeted and single-threaded.

This determinism is what makes Zap reproducible in CI: the same source and the same registry index produce byte-for-byte identical lockfile content, identical diagnostics, and identical task scheduling.

## Boundaries

| Boundary | Owner |
|---|---|
| Syntax and AST construction | Parser |
| Runtime expression and statement behavior | Evaluator |
| Stable error contract | Diagnostics module |
| Package transport, authentication, checksums, signatures, cache policy | Registry module |
| Enforcement of declared gates | CI |

No subsystem may silently redefine another subsystem's contract.
`,
};

const memory: DocPage = {
  slug: "memory",
  title: "Memory Model",
  description:
    "Single-threaded Rc<RefCell> ownership, explicit cycle breaking, bounded budgets, and 8 MiB safety limits.",
  source: "docs/MEMORY_BUDGET_OBJECT_STORE_EN.md",
  markdown: `## Single-threaded ownership

Object fields use a documented single-threaded \`Rc<RefCell>\` ownership model. Cyclic object graphs require an **explicit** cycle-breaking operation before the owning graph is discarded. The runtime is not thread-safe by default; this boundary is intentional.

## Memory budget

The runtime exposes bounded memory diagnostics through \`memory_stats()\`:

\`\`\`zap
say memory_stats()
\`\`\`

The returned map includes:

- Live-object count
- Object allocation/deallocation lifecycle
- Validation/cleanup lifecycle
- Logical budget
- Value-size-limit
- Deferred-capability fields
- \`cycle_policy=explicit_clear_object_fields\`

Logical budget failures use the stable \`ZAP-MEMORY-001\` diagnostic. Public weak references are reported as unsupported and tracing collection as not implemented.

## Bounded value graphs

Public builtin boundaries reject oversized or excessively deep/cyclic value graphs deterministically. Documented safety limits:

| Surface | Limit |
|---|---|
| Filesystem, JSON, HTTP response operations | 8 MiB |
| URL inputs | 8 KiB |
| \`process_run\` output | 1 MiB |
| \`http_serve_once\` request | 64 KiB |
| \`http_serve_once\` response | 8 MiB |
| \`http_serve_once\` wait | 10 seconds |
| HTTP connect/read/write timeouts | bounded |

## Object store isolation

The object store is owned by the current \`RuntimeState\`. Workspace reset returns the runtime to a clean state for the next run without leaking objects across runs. This keeps tests deterministic and prevents cross-test contamination.

## What this means

- Design your data so cycles are explicit and bounded.
- Do not build unbounded recursive value graphs and expect the runtime to absorb them.
- Prefer \`Result\`/\`Option\` and explicit \`raise\` over relying on undefined cleanup order.
- Treat memory diagnostics as **diagnostics**, not as a garbage collector.
`,
};

const asyncBoundaries: DocPage = {
  slug: "async-boundaries",
  title: "Async Boundaries",
  description:
    "What the deterministic language scheduler is — and is not. The production I/O reactor remains a separate boundary.",
  source: "docs/ASYNC_BOUNDARIES_EN.md",
  markdown: `## What the language scheduler is

The current async executor is **deterministic and poll-budgeted**. Language \`async fn\` calls schedule their completed values through the caller's \`RuntimeState\` and return a context-owned \`ScheduledFuture\`:

- \`await\` and \`task_join\` drive the executor before consuming the result.
- \`task_is_ready\` observes readiness without polling.
- \`task_cancel\` requests cooperative cancellation.
- \`task_join_timeout\` enforces a deterministic poll budget.

A cancelled join reports a deterministic \`Cancelled\` failure. An exhausted poll budget reports \`TimedOut\`. Deterministic timers, task budgets, and suspension controls remain supported.

\`\`\`zap
async fn load() -> number:
    return 7

let handle = load()
say task_is_ready(handle)        # false before executor polling
say task_join_timeout(handle, 1)  # 7
\`\`\`

## What the language scheduler is **not**

This language scheduler is **not** a production I/O reactor. Specifically, it does **not** provide:

- Background worker scheduling for arbitrary blocking work
- Socket readiness and I/O multiplexing
- Production cancellation of foreign blocking calls
- Graceful shutdown orchestration
- Thread-safe sharing across runtimes

## Capability reporting

\`async_capabilities()\` reports which work is deterministic, worker-backed, bounded, cancellable, deferred, or unsupported. It reports runtime-state scheduling, cooperative language cancellation, and poll-budget timeouts, while typed resource-limit preflight remains enforced and does **not** start any worker, network, or process operation.

\`\`\`zap
say async_capabilities()
\`\`\`

## The production boundary

Blocking calls, socket readiness, worker scheduling, shutdown, and forced cancellation of foreign blocking work require the **separate production boundary contract**. The host or a standard identity adapter provides these; the language itself does not hide blocking behavior behind an async-looking call.

> Zap must expose I/O boundaries and avoid hiding blocking behavior. This is a deliberate design choice, not a limitation to be removed.
`,
};

export const runtimeSection: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "runtime",
    title: "Runtime",
    icon: "Cpu",
    pages: [
      { slug: "runtime", title: "Runtime State" },
      { slug: "memory", title: "Memory Model" },
      { slug: "async-boundaries", title: "Async Boundaries" },
    ],
  },
  pages: [runtime, memory, asyncBoundaries],
};
