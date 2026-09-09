import type { DocSection, DocPage } from "../types";

const status: DocPage = {
  slug: "status",
  title: "Status & Roadmap",
  description:
    "What is implemented today, the B0 bootstrap boundary, what is deferred, and how the project is versioned.",
  source: "docs/CURRENT_STATUS_EN.md",
  markdown: `## Current release

| Item | Status |
|---|---|
| Current release line | \`v2.11.18\` |
| Source files | \`.zp\`, commonly \`main.zp\` |
| Project manifest | \`zap.toml\` |
| Lockfile | \`zap.lock\` |
| Runtime | Standalone native executable |
| Platforms | Linux x86_64, Windows x86_64, macOS ARM64 |
| Bootstrap stage | **B0** — provisional corpus-limited Zap candidates |
| Reference implementation | Rust native CLI/runtime remains the owner of complete semantics |
| License | MIT |

## What is implemented

The current stable direction covers:

- The \`.zp\` language core (indentation-based blocks, \`#\` comments, \`say\`).
- Numeric, text, boolean, list, map, none, object, and function values.
- \`list<T>\`, \`map<K,V>\`, \`option<T>\`, \`result<T>\` bounded generic annotations.
- Functions, named/positional arguments, default values, and first-class callables.
- Lexical closures with captured environment (bounded canonical AST closure slice shipped in v2.11.18).
- \`if\`/\`else\`, \`while\`, \`for ... in <list>\`, \`break\`, \`continue\`.
- \`module\`/\`import\` declarations and the deterministic resolver.
- \`raise\`/\`try\`/\`catch\` structured control flow.
- Single-threaded \`Rc<RefCell>\` ownership with explicit cycle breaking.
- Async functions, \`await\`, \`task_cancel\`, \`task_join\`, \`task_join_timeout\`.
- \`ok(...)\`/\`err(...)\` construction, \`?\` propagation, \`is_ok\`/\`is_err\`/\`unwrap_or\`.
- \`some(...)\`/\`option_none()\`, \`is_some\`.
- Generic identity/same declarations and multiple-parameter substitution (bounded A3 slice).
- Native CLI, project manifests and lockfiles, typed checks, modules, classes.
- Result/Option, JSON, tests, formatter/linter, structured diagnostics.
- LSP foundations, a user-managed Web scaffold, bounded native Web serving.
- SQLite-first migration contracts.

## Bootstrap and self-hosting

Zap remains at **B0**. The Zap lexer/parser/type-checker/typed-IR work currently documented under \`bootstrap/\` is **provisional and corpus-limited**: it provides differential evidence for selected fixtures, while the Rust native implementation remains the reference owner.

The B2 function fixtures cover:

- One annotated function
- Return propagation
- A compatible numeric call
- A stable incompatible-call diagnostic

They do **not** establish a general self-hosted compiler. Complete type inference, arbitrary-program parser and diagnostic parity, general typed-IR production, package/build ownership, VM execution ownership, and platform-seed acceptance remain future roadmap work. **Do not** interpret the current candidates as fully Zap-only or B4/self-hosted.

The detailed boundary is maintained in the [Bootstrap Contract](https://github.com/hidecard/zap/blob/master/docs/BOOTSTRAP_CONTRACT_EN.md).

## What is deferred

The following are **not** claimed as complete:

- A complete ORM
- Provider-neutral production migration platform
- User-defined trait syntax
- Production asynchronous I/O reactor
- Cross-file semantic rename
- Template compiler
- Hidden app registry (intentionally absent)

Their status is tracked in the [language specification](https://github.com/hidecard/zap/blob/master/docs/LANGUAGE_SPEC_EN.md), contracts, tests, and release notes.

## Release provenance

The current source baseline is v2.11.18. The [canonical current-status page](https://github.com/hidecard/zap/blob/master/docs/CURRENT_STATUS_EN.md) records the active B0 boundary and the signed provenance fields for the latest published release. The preceding v2.3.0, v2.2.7, and earlier release records remain available in [GitHub Releases](https://github.com/hidecard/zap/releases) and the bilingual \`CHANGELOG\` files.

Release artifacts are published only after version consistency, native tests, cross-platform builds, security checks, documentation checks, and installer verification pass.

## How semantics change

A semantics change requires:

1. A specification update
2. Bilingual (English / Burmese) documentation parity
3. Conformance tests
4. A changelog entry
5. An explicit version decision

Release artifacts must continue to pass the pinned Rust toolchain, formatting, strict Clippy, native tests, provenance, and signature gates. Future changes must use the bilingual compatibility templates.
`,
};

const contributing: DocPage = {
  slug: "contributing",
  title: "Contributing",
  description:
    "How to build Zap from source, run the validators, and the branch hygiene and merge record.",
  source: "CONTRIBUTING.md",
  markdown: `## Build from source

Zap itself is implemented in Rust. To build the runtime from source, install the pinned toolchain described by \`rust-toolchain.toml\`, then run:

\`\`\`bash
cargo test --manifest-path native/Cargo.toml --all-targets
cargo build --release --manifest-path native/Cargo.toml
\`\`\`

Before contributing, run \`make doctor\` to distinguish missing environment prerequisites from test failures, then run the documentation, Web scaffold, release-version, VS Code asset, and LSP parity validators described in the [documentation hub](https://github.com/hidecard/zap/blob/master/docs/DOCUMENTATION_NAVIGATION_EN.md).

## Branch hygiene

The repository uses \`master\` as the integrated baseline. Stale merged branches are pruned only after their changes are present in \`master\`, while active review branches remain subject to their pull requests. See the [branch hygiene and merge record](https://github.com/hidecard/zap/blob/master/docs/BRANCH_HYGIENE_EN.md) before merging or deleting a branch.

## Documentation changes

Documentation changes must:

- Preserve the English/Burmese pair.
- Use repository-relative links.
- Identify deferred behavior explicitly.
- Avoid claiming production scheduling, cancellation, sandboxing, or performance guarantees that are not covered by executable gates.

Framework changes must update the Framework guide pair, starter manifests/lockfiles, and the host-adapter boundary without adding unsupported core syntax.

## Compatibility records

When a normative rule changes:

1. Update the English and Burmese contract together.
2. Add or update its fixture owner in \`SPEC_OWNERSHIP_INDEX.tsv\`.
3. Record compatibility impact using the bilingual compatibility template.
4. Include regression evidence before merging.

Public standard-library changes must also update the catalog and its stability policy pair.

## Code of conduct

Participation in the Zap project is governed by the [Code of Conduct](https://github.com/hidecard/zap/blob/master/CODE_OF_CONDUCT.md). Be excellent to each other.
`,
};

const license: DocPage = {
  slug: "license",
  title: "License",
  description: "Zap is released under the MIT License.",
  source: "LICENSE",
  markdown: `## MIT License

Zap is released under the [MIT License](https://github.com/hidecard/zap/blob/master/LICENSE).

Copyright © 2026 hidecard.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Repository

- Source: [github.com/hidecard/zap](https://github.com/hidecard/zap)
- Releases: [GitHub Releases](https://github.com/hidecard/zap/releases)
- Issues: [github.com/hidecard/zap/issues](https://github.com/hidecard/zap/issues)
`,
};

export const projectSection: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "project",
    title: "Project",
    icon: "Info",
    pages: [
      { slug: "status", title: "Status & Roadmap" },
      { slug: "contributing", title: "Contributing" },
      { slug: "license", title: "License" },
    ],
  },
  pages: [status, contributing, license],
};
