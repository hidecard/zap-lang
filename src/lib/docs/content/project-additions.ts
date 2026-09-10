import type { DocSection, DocPage } from "../types";

const bootstrapContractPage: DocPage = {
  slug: "bootstrap-contract",
  title: 'Bootstrap & Self-Hosting',
  description: 'The B0–B4 self-hosting stages, the B1 lexer/parser candidates, the B2 type-check conformance foundation, the reference VM, and the inspection commands.',
  source: "docs/BOOTSTRAP_CONTRACT_EN.md",
  markdown: `Zap's self-hosting roadmap is **staged**. The current release remains a **Rust reference/native implementation**; it is not yet a fully Zap-only compiler. The normative stage contract, independent version identities, and machine-readable ownership records are maintained under \`bootstrap/contracts\`.

## Current B0 boundary

The reference pipeline is:

\`\`\`text
Zap source -> Rust lexer -> AST parser -> evaluator/runtime
\`\`\\

Rust/Cargo is therefore still required to build the current compiler. The operating-system loader and explicitly documented platform boundary are accepted as infrastructure boundaries, while other language runtimes and frameworks are not required by the current Zap compiler path.

## Stage policy

| Stage | Meaning | Allowed release claim |
|---|---|---|
| **B0** | Rust owns reference behavior and fixtures | Rust reference/native implementation |
| **B1** | Zap lexer/parser reproduces B0 artifacts | Zap bootstrap compiler foundation |
| **B2** | Zap diagnostics/type checker reproduces B0 acceptance and rejection | Zap bootstrap compiler foundation |
| **B3** | Zap stdlib, typed IR, package resolver, and test runner operate offline and deterministically | Zap-owned compiler pipeline in transition |
| **B4** | Zap compiler rebuilds itself from the documented platform seed | Fully Zap-only self-hosted compiler |

No release may use the B4 wording before the B4 bootstrap checks pass.

## B1 candidate status

A first Zap-owned lexer candidate is checked in at \`bootstrap/b1/lexer.zp\`. It covers the current identifier, number, text, comment, whitespace, operator, delimiter, Unicode, and fail-closed diagnostic paths needed by the initial owned corpus. A first Zap-written parser candidate is at \`bootstrap/b1/parser.zp\`.

These are **corpus-limited B1 foundations**, not completed B1 compilers. The candidates are not yet the reference owner, do not replace the Rust lexer/parser, and must expand through differential fixtures before the repository can advance the bootstrap stage claim.

## B2 conformance foundation

The repository has a reference-only B2 conformance gate at \`scripts/bootstrap/verify_b2_typecheck.sh\`. It compares the annotated typed-IR artifact byte-for-byte across repeated native runs and checks native type-check acceptance for annotated and conditional expressions plus rejection for incompatible annotation, function-call, collection-element, and bounded map-element cases.

A first provisional Zap-owned type-checker candidate is recorded at \`bootstrap/b2/typecheck.zp\`, with a matching candidate-only typed-IR producer at \`bootstrap/b2/typed_ir.zp\`. Both are intentionally **corpus-limited**: they do not implement general expression inference, generic/variant narrowing, complete function checking, or complete diagnostic parity. Native Rust remains the reference owner and the bootstrap stage remains **B0**.

## B3 foundation status

The repository has a reference-only B3 foundation gate at \`scripts/bootstrap/verify_b3_foundations.sh\`. It validates the catalog determinism taxonomy, generates a canonical dependency-free manifest lockfile, checks lockfile reproducibility, runs an offline locked build, and executes a Zap test fixture. These checks demonstrate existing package/build/test-runner behavior; they do **not** claim that the compiler pipeline is already Zap-owned.

## Reference VM

The first isolated bytecode VM foundation is implemented in \`native/src/bytecode.rs\`. \`zap bootstrap vm-demo\` executes a bounded arithmetic program and emits the canonical \`bootstrap/fixtures/bytecode/vm_demo.json\` artifact. The VM rejects unsupported schema versions, malformed stack shapes, missing halts, arithmetic failures, and step-budget exhaustion without panicking.

## Canonical inspection commands

The native CLI exposes read-only B0 inspection commands:

\`\`\`text
zap bootstrap status
zap bootstrap tokens <file.zp>
zap bootstrap ast <file.zp>
zap bootstrap typed-ir <file.zp>
zap bootstrap diagnostics <file.zp>
\`\`\\

Run \`scripts/bootstrap/verify_b0_artifacts.sh\` to rebuild representative token, AST, reference-only typed-IR, diagnostic, metadata, platform-boundary, and standard-library fixtures and compare them byte-for-byte with the committed corpus.

## Working rules

- Every increment needs paired positive and negative fixtures, deterministic replay, and an explicit candidate/reference comparison.
- A green seed-pipeline test **never** transfers ownership from Rust by itself.
- Remove a Rust stage only **after** its replacement has passed its gate; do not silently swap a reference implementation.
- The final bootstrap toolchain must be Zap-owned. Python is allowed only as a temporary seed host and test harness until the corresponding Zap component is executable independently.
`,
};
const rustIndependencePage: DocPage = {
  slug: "rust-independence",
  title: 'Rust Independence Roadmap',
  description: 'The six-phase plan from an independent Rust-free seed to a fully Zap-owned self-rebuilding compiler, with working rules and commands.',
  source: "docs/RUST_INDEPENDENCE_ROADMAP_EN.md",
  markdown: `Zap is currently at bootstrap stage **B0**. The Rust native compiler and runtime remain the authoritative implementation for complete language semantics, diagnostics, package/build behaviour, and supported release artifacts. No release or documentation may describe Zap as fully self-hosted until acceptance gates A1 through A13 in the self-hosting contract pass.

## A separately verified, Rust-free seed path

There is now a separately verified, Rust-free seed path:

\`\`\`text
Zap source (supported seed subset)
  -> host/zap-bootstrap/compile.py
  -> bytecode
  -> host/zap-vm-host/run.py
  -> output
\`\`\\

\`scripts/bootstrap/verify_non_rust_seed_pipeline.sh\` runs this path with the usual Rust toolchain variables removed. It covers arithmetic, branches, loops, calls, recursion, closures, classes/methods, and caught raises in small fixtures. It is evidence for a non-Rust execution path only; the seed hosts are Python implementations and are **not** the final Zap-owned compiler/runtime.

## Ownership plan

| Phase | Deliverable | Acceptance boundary |
|---|---|---|
| 1. Independent seed | Keep the source-to-bytecode-to-VM seed gate green in CI. | No Cargo/rustc/rustup process is needed for supported seed fixtures. |
| 2. Canonical front end | Make the Zap B1 lexer/parser consume arbitrary source rather than fixture shapes; add valid, malformed, Unicode, indentation, span, and diagnostic differential corpora. | A7/A8 candidate/reference parity is measured and deterministic. |
| 3. Type ownership | Complete B2 inference, aliases, generics, flow/mutation invalidation, and diagnostics from parser AST. | A1–A6 acceptance matrices pass, including negative cases. |
| 4. Compiler ownership | Replace source-string routing with a canonical AST to typed-IR producer, then lower every supported AST form. | A9 artifacts are deterministic and semantically match the reference. |
| 5. Runtime ownership | Execute produced bytecode in the Zap-owned VM with calls, closures, classes, collections, errors, limits, and package/build behaviour. | A10/A11 differential, limit, and security gates pass. |
| 6. Self rebuild | Build the documented seed with Zap, rebuild the compiler with that compiler, and prove byte-identical/reproducible artifacts on release targets. | A12/A13 pass on Linux x86_64, macOS ARM64, and Windows x86_64. |

## Working rules

- Every increment needs paired positive and negative fixtures, deterministic replay, and an explicit candidate/reference comparison.
- A green seed-pipeline test **never** transfers ownership from Rust by itself.
- Remove a Rust stage only **after** its replacement has passed its gate; do not silently swap a reference implementation.
- The final bootstrap toolchain must be Zap-owned. Python is allowed only as a temporary seed host and test harness until the corresponding Zap component is executable independently.

## Commands

\`\`\`bash
make bootstrap-non-rust-test
# or
bash scripts/bootstrap/verify_non_rust_seed_pipeline.sh
\`\`\\

## References

- [Bootstrap Contract](#bootstrap-contract) for the B0–B4 stage definitions.
- The self-hosting acceptance contract for A1–A13.
`,
};
const traitsRfcPage: DocPage = {
  slug: "traits-rfc",
  title: 'Traits RFC',
  description: 'The composition-first RFC: trait, interface, with, implements, conflict resolution, and the boundary between composition and single inheritance.',
  source: "docs/TRAITS_RFC_EN.md",
  markdown: `This RFC proposes a **composition-first design** for reusable behavior in Zap. The proposal adds named behavioral contracts and explicit composition **without** replacing the current single-inheritance model. It defines the conceptual model, surface syntax, method lookup, visibility, diagnostics, migration rules, dispatch choices, rejected alternatives, and compatibility boundaries required before implementation begins.

> **T1–T6 decision:** Keep \`extends\` as nominal class inheritance. Freeze the contract for \`trait\`, \`interface\`, \`with\`, \`implements\`, and bounded \`use Trait.method as name\`. The implementation now covers canonical parser/AST, static registry, typed-IR nodes, canonical lowerer/VM dispatch, package metadata, and the LSP catalog. The full production evaluator/runtime contract is **not enabled**.

## Problem statement

Zap currently supports classes, methods, and single inheritance through \`extends\`. That model is useful for substitutable families of objects, but it couples behavior reuse to one nominal parent. A class that needs capabilities from two independent domains must either duplicate methods, create an artificial parent hierarchy, or depend on helper functions that do not participate in method contracts.

The proposal addresses composition as a **separate** design problem. It does **not** claim that the current runtime already supports traits, interfaces, conflict resolution, or multiple inheritance.

## Composition versus single inheritance

| Question | Single inheritance | Proposed composition |
|---|---|---|
| Primary relationship | "Is a specialized form of" | "Has these capabilities" |
| Parent count | At most one nominal parent | Multiple explicit traits/interfaces |
| Reuse unit | Parent class state and methods | Named behavior contract and selected methods |
| State ownership | Parent may contribute instance state | Traits do not implicitly add instance fields in the initial proposal |
| Override rule | Child method overrides inherited method | Class implementation overrides a provided trait method; two unselected providers are a conflict |
| Constructor behavior | Parent constructor rules remain explicit | Traits/interfaces do not run constructors |
| Compatibility | Existing \`extends\` remains supported | New syntax is gated behind a later version |
| Best use | Object taxonomy and stateful specialization | Cross-cutting capabilities such as printable, iterable, comparable, or serializable behavior |

The proposal intentionally avoids multiple inheritance. A class has at most one class parent and may compose multiple stateless behavior units. This keeps object layout, constructor order, and \`super\` behavior distinct from capability reuse.

## Proposed surface syntax

> The following syntax is illustrative and is **not** accepted by the current parser.

### Trait with a provided method

\`\`\`zap
trait Printable:
    fn format(self) -> text:
        return "<value>"

class Report with Printable:
    fn format(self) -> text:
        return self.title
\`\`\\

A class implementation takes precedence over a provided trait method. The class remains responsible for satisfying every required method.

### Interface with a required method

\`\`\`zap
interface Identifiable:
    fn id(self) -> text

class User implements Identifiable:
    fn id(self) -> text:
        return self.name
\`\`\\

An interface declares a contract but does not provide an implementation. A class that omits \`id\` cannot be instantiated or passed where \`Identifiable\` is required.

### Explicit conflict selection

\`\`\`zap
trait A:
    fn label(self) -> text:
        return "A"

trait B:
    fn label(self) -> text:
        return "B"

class C with A, B:
    use A.label as label
\`\`\\

When two composed units provide the same method, the class must select one with \`use Trait.method as name\` or override it; otherwise it is a conflict error.

## Terminology

| Term | Proposed meaning |
|---|---|
| Trait | A named set of behavior declarations that may contain required methods, provided methods, and associated visibility metadata. A trait is not itself an instantiable class. |
| Interface | A contract containing required callable signatures and visibility rules. An interface provides no method body in the initial proposal. |
| Composition | Attaching one or more traits or interfaces to a class through explicit syntax. |
| Required method | A method that the composing class must implement before it is concrete. |
| Provided method | A default method body supplied by a trait and eligible for explicit conflict resolution. |
| Conformance | The checker/runtime-visible fact that a class satisfies an interface or trait requirement. |
| Conflict | Two or more composed units provide the same method name and no explicit selection resolves the ambiguity. |
| Linearization | The deterministic ordering used to search class, composed units, and parent methods. |

## Current status

The T2–T6 milestone extends the canonical parser/AST, checker/typed-IR, bounded canonical lowerer/VM path, package metadata, and LSP catalog, but does **not** change the B4 \`native_independent:false\` boundary or release feature flag. The canonical parser represents \`trait\`, \`interface\`, \`with\`, \`implements\`, and bounded \`use Trait.method as name\`; the canonical VM exercises provided-method dispatch. The B4 line compiler does not yet provide a full independent executable feature.

> This is a **design-only RFC**. The feature is not release-supported until parser, checker, typed-IR, lowerer, runtime, diagnostics, tooling, and compatibility gates pass.
`,
};
const compatibilityMatrixPage: DocPage = {
  slug: "compatibility-matrix",
  title: 'Compatibility Matrix',
  description: 'Version compatibility across components and platforms, the determinism taxonomy, and the breaking-changes and support policies.',
  source: "docs/COMPATIBILITY_MATRIX.md",
  markdown: `This document tracks version compatibility across Zap components and platforms.

## Current release

| Component | Version | Notes |
|---|---|---|
| Compiler | 2.11.18 | Native Rust implementation |
| Language | 2.11.18 | AST schema v1 |
| Standard Library | 2.11.18 | Entries across 9+ domains |
| Package Format | 2.11.18 | \`zap.toml\` manifest |
| LSP | 2.11.18 | \`zap lsp\` |
| Bootstrap Stage | B0 | Rust reference/native implementation |

## Platform support

| Platform | Status | Binary | CI |
|---|---|---|---|
| Linux x86_64 | Supported | \`zap\` | Yes |
| macOS x86_64 | Supported | \`zap\` | Yes |
| macOS ARM64 | Supported | \`zap\` | Yes |
| Windows x86_64 | Supported | \`zap.exe\` | Yes |
| Linux ARM64 | Planned | — | No |
| Windows ARM64 | Planned | — | No |

## Bootstrap contracts

| Contract | Version | Status |
|---|---|---|
| AST Schema | 1 | Stable |
| Token Schema | 1 | Stable |
| Diagnostic Schema | 1 | Stable |
| Typed-IR Schema | 1 | Reference-only |
| Artifact Schema | 1 | Stable |

## Standard Library determinism

| Domain | Determinism | Examples |
|---|---|---|
| async | runtime-dependent | \`task_spawn\`, \`task_join\` |
| collections | pure | \`append\`, \`count\`, \`enumerate\` |
| filesystem | external-io | \`read_text\`, \`write_text\` |
| json | pure | \`from_json\`, \`json\` |
| logging | pure | \`log_json\`, \`log_record\` |
| math | pure | \`abs\`, \`max\`, \`min\`, \`pow\`, \`sqrt\` |
| network | external-io | \`http_get\`, \`url_parse\` |
| system | pure/external-io | \`dirname\`, \`env\`, \`config_dir\` |
| text | pure | \`contains\`, \`join\`, \`len\`, \`split\`, \`trim\` |
| time | input-deterministic/runtime-dependent | \`utc_now\`, \`duration_between\` |

## Breaking changes policy

- Breaking changes require a **major version bump**.
- Deprecated features receive at least **2 minor versions** warning.
- Security fixes may be backported to supported versions.
- AST schema changes require a migration guide.

## Support policy

| Version | Supported | Security Fixes | Bug Fixes |
|---|---|---|---|
| 2.x | Yes | Yes | Yes |
| 1.x | No | No | No |
`,
};
const branchHygienePage: DocPage = {
  slug: "branch-hygiene",
  title: 'Branch Hygiene',
  description: 'The master baseline, the merge policy, the immutability of release tags, and the rules for contributors.',
  source: "docs/BRANCH_HYGIENE_EN.md",
  markdown: `The integrated \`master\` branch is the active release baseline. This record documents the branch hygiene and merge policy.

## Operating policy

| Situation | Required action |
|---|---|
| Open branch with reviewable changes and a passing merge path | Review, validate, then merge through the normal pull-request path. |
| Closed branch whose changes are already superseded | Do **not** blindly merge; retain only when its historical reference is intentional. |
| Branch with unclear provenance or a large divergent delta | Preserve it and document the reason; do not delete or merge by inference. |
| Published release tag | Treat it as **immutable**; use a new tag for every subsequent release. |

This record is maintenance evidence, not a claim that every historical branch has been semantically re-audited. Future branch cleanup requires the same ancestry, patch-equivalence, pull-request, and release-history checks.

## Bootstrap boundary

Branch hygiene does **not** change Zap's maturity claim. Zap remains **B0**. Rust remains the complete/reference compiler and runtime owner, while Zap lexer, parser, type-checker, and typed-IR work under \`bootstrap/\` remains provisional and corpus-limited.

## Rules for contributors

1. Use \`master\` as the integrated baseline.
2. Stale merged branches are pruned only after their changes are present in \`master\`.
3. Active review branches remain subject to their pull requests.
4. Do **not** rewrite or move a published release tag — create a new tag for every release.
5. Do **not** delete a branch without explicit authorization and a separate review proving its historical reference is no longer required.
`,
};
const ecosystemPage: DocPage = {
  slug: "ecosystem",
  title: 'Ecosystem',
  description: 'The layered ecosystem: Zap Core, Standard Library, Package Tooling, Domain Frameworks (Web/Mobile/AI/IoT), and Platform Runtimes.',
  source: "docs/ECOSYSTEM.md",
  markdown: `Zap is an ecosystem that builds **domain-specific packages** and **platform runtimes** on top of a single language core. The current Framework Foundation provides runnable contract starters for Web, App, AI, and IoT, with Zap-native loopback serving and SQLite-first migration.

## Layers

| Layer | Responsibility | Status |
|---|---|---|
| Zap Core | syntax, parser, values, functions, modules, runtime | Currently building |
| Standard Library | collections, JSON, file, time, networking, process, and testing APIs | Partial |
| Package Tooling | \`zap.toml\`, local modules, dependencies, lockfile, registry | Manifest, deterministic lockfile, nested local graph/cycle validation, and registry-ready metadata; remote registry roadmap |
| Domain Frameworks | Web, App/Mobile, AI, and IoT contract starters | Web native runtime/asset/API slice implemented; production adapters deferred |
| Platform Runtimes | native OS, browser/WASM, Android, GPU, and microcontroller | Host adapters and target runtimes are roadmap work |

## Future frameworks

### Zap Web

The Zap Web starter defines a deterministic routing/request/response contract, with a Zap-native loopback development server, confined UTF-8 HTML/CSS/JavaScript asset serving, a browser JSON API boundary, a SQLite-first database adapter, a structured migration workflow, and a provider-neutral parameterized query/DTO contract.

TLS, production concurrency, middleware execution, binary asset streaming, WebSocket, PostgreSQL/MySQL adapters, and production database operations are next-step work. \`zap-host\` remains an **operational** Axum/Tower platform adapter boundary, not an application framework.

### Zap Mobile

The Zap App starter defines a deterministic app-state/navigation contract. Native renderer, lifecycle, permissions, storage, notifications, and bridge APIs must be built as separate adapters on Tauri, Flutter, or React Native/Expo shells.

### Zap AI

The Zap AI starter models only a provider request/response contract. Provider client, structured output, embeddings, vector store, tool calling, streaming, and secret/quota handling must be built as provider adapters. **Never** write an API key into source.

### Zap IoT

The Zap IoT starter simulates a bounded telemetry/device-state contract. The first real target is a Linux/SBC gateway, with MQTT/Paho, device identity, payload limit, reconnect, duplicate handling, and offline replay as adapter contracts. Firmware uses ESP-IDF/Zephyr/Embassy as the host ecosystem. A full Zap interpreter is **not** yet started on low-RAM MCUs.

## Current commands

\`\`\`text
zap main.zp
zap check
zap test
zap init my-app
zap fmt main.zp
zap add package-name 1.0 [project-dir]
zap lock [project-dir]
zap --version
zap --help
zap async-check
zap lsp
zap new shop
zap dev shop
zap db check shop
zap db inspect --json shop
zap db plan shop
zap db migrate --dry-run shop
zap db migrate --check shop
zap db migrate shop
\`\`\\

## Recommended implementation order

1. First stabilize contract starters and smoke validation with current syntax.
2. Freeze the \`zap-host\` capability, DTO, typed errors, limits, cancellation, idempotency, tracing, redaction, and replay boundary.
3. Pilot Web or a Linux/SBC Edge adapter.
4. Extend App native shell and IoT firmware bindings only after the host adapter contract and target-specific tests pass.

Framework packages do **not** change Zap core syntax. Domain APIs are delivered as modules/packages; platform-specific implementations are separated through runtime adapters.
`,
};
export const projectAdditions: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "project-extras",
    title: "Project (Advanced)",
    icon: "Info",
    pages: [
      { slug: "bootstrap-contract", title: "Bootstrap & Self-Hosting" },
      { slug: "rust-independence", title: "Rust Independence Roadmap" },
      { slug: "traits-rfc", title: "Traits RFC" },
      { slug: "compatibility-matrix", title: "Compatibility Matrix" },
      { slug: "branch-hygiene", title: "Branch Hygiene" },
      { slug: "ecosystem", title: "Ecosystem" }
    ],
  },
  pages: [
    bootstrapContractPage,
    rustIndependencePage,
    traitsRfcPage,
    compatibilityMatrixPage,
    branchHygienePage,
    ecosystemPage
  ],
};
