import type { DocSection, DocPage } from "../types";

const benchmarkHarnessPage: DocPage = {
  slug: "benchmark-harness",
  title: 'Benchmark Harness',
  description: 'Dependency-free native benchmark runner with provenance sidecar, seven suites, CI regression gate, and the B2 typed-IR cross-platform baseline.',
  source: "docs/BENCHMARK_HARNESS_EN.md",
  markdown: `The repository includes \`scripts/benchmark_native.sh\`, a **dependency-free** benchmark runner for the native interpreter. It builds \`native/target/release/zap\` with the locked dependency graph when necessary, creates temporary source fixtures, runs each fixture a configurable number of times, and writes stable raw CSV columns: \`suite\`, \`iteration\`, and \`elapsed_seconds\`.

## Current benchmark suites

| Suite | Workload | Purpose |
|---|---|---|
| \`loops\` | A bounded \`while\` loop with integer accumulation. | Establish loop and arithmetic dispatch baseline. |
| \`calls\` | Repeated user-defined function calls inside a bounded loop. | Establish call-frame and return-value baseline. |
| \`closures\` | A nested function mutating captured state across repeated calls. | Establish closure environment and captured-state dispatch baseline. |
| \`allocations\` | \`range(10000)\` followed by \`enumerate\`. | Establish list allocation and collection transformation baseline. |
| \`json\` | JSON encoding and decoding of a deterministic numeric list. | Establish conversion and nested-value traversal baseline. |
| \`async\` | Spawn, readiness check, and join of a deterministic async task. | Establish task scheduling and completion baseline. |
| \`imports\` | Explicit module/import dispatch fixture with a deterministic helper call. | Establish module loading and dispatch coverage without external dependencies. |

The fixtures are generated in a temporary directory and do not modify the repository. The output is written to \`benchmark-results/native.csv\` by default.

\`\`\`bash
ZAP_BENCH_REPEATS=10 scripts/benchmark_native.sh
\`\`\\

The harness uses Bash's built-in \`time\` facility rather than an optional external timing package, so it remains usable in the minimal CI environment. \`ZAP_BENCH_REPEATS\` must be between 1 and 64, and \`ZAP_BENCH_WARMUPS\` must be between 0 and 16; these caps keep CI and release-preflight work bounded.

## Interpretation and limits

A baseline run is useful only when the binary, compiler profile, operating system, CPU conditions, repetition count, and fixture source are recorded together. The harness records those run conditions in a **provenance sidecar** and keeps the raw observation CSV separate so the original measurements remain auditable.

\`scripts/aggregate_benchmark.sh\` consumes the CSV and emits deterministic per-suite min/mean/p95/max summaries plus population standard deviation, population variance, and coefficient of variation (\`cv_percent\`) while preserving the raw observations.

> This harness does **not** claim to be a statistically rigorous microbenchmark framework. It does not isolate CPU frequency, pin a process to a core, or measure allocations at the allocator level. Performance claims must therefore report the environment and should compare repeated runs of the same commit.

## CI regression gate

CI runs a seven-suite smoke, aggregates the CSV, compares mean and p95 values with \`benchmark-results/native-summary.csv\`, and uploads the raw CSV, provenance TSV, summary, and comparison artifacts. The default threshold is a **200% increase** over the checked-in baseline; a run that exceeds the threshold fails the quality job. Because measurements are machine-dependent, baseline updates require an **explicit reviewed change** rather than an automatic rewrite.

## B2 typed-IR cross-platform baseline

\`scripts/benchmark_b2_typed_ir.sh\` extends the harness to the B2 typed-IR candidate, capturing per-run wall-clock elapsed seconds and peak resident-set-size in kilobytes, and writing a \`suite,iteration,elapsed_seconds,peak_rss_kb\` raw CSV. It adds:

- **Portable timing backend.** GNU \`/usr/bin/time\` is used when present (Linux); \`gtime\` is used on macOS when available; a bash \`SECONDS\` plus \`/proc/$$/status\` VmHWM sampler is the documented fallback.
- **Provenance sidecar.** Default \`<output>.provenance.tsv\` with schema version, run status, UTC timestamp, commit, target triple, OS/kernel/arch, Rust/Cargo versions, binary and script SHA-256, repeats, warmups, suites, time backend, and raw CSV path.
- **Cross-platform baseline table.** Default \`benchmark-results/b2-typed-ir.baseline.tsv\` accumulates one row per \`(target_triple, suite)\` pair with min/mean/max elapsed seconds and peak RSS min/max.

The baseline is intentionally machine-dependent. It is intended for repeated measurement on the same runner with the same toolchain. Cross-target comparison is recorded as **evidence the runner executed on each platform**; performance portability is not claimed.

## P1-05 deterministic test-layer runner

\`scripts/test_p105_layers.sh\` is the dependency-free CI-visible runner for the broader conformance and property layer. It executes deterministic parser and lexer corpora, malformed-program and JSON security corpora, malformed-lockfile cases, standard-library security inputs, registry provenance/property mutations, collection/filesystem regressions, and async cancellation/scheduler determinism cases.

The runner is a **deterministic regression gate**, not a timing benchmark and not a substitute for long-running fuzz campaigns.
`,
};
export const runtimeAdditions: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "runtime-extras",
    title: "Runtime (Advanced)",
    icon: "Cpu",
    pages: [
      { slug: "benchmark-harness", title: "Benchmark Harness" }
    ],
  },
  pages: [
    benchmarkHarnessPage
  ],
};
