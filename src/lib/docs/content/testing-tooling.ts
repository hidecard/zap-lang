import type { DocSection, DocPage } from "../types";

const testingTooling: DocPage = {
  slug: "testing-tooling",
  title: 'Testing & Tooling',
  description: 'assert, _test.zp files, zap test flags, zap fmt, zap lint, the LSP, and the canonical VS Code extension.',
  source: "docs/LEARN_ZAP_EN.md",
  markdown: `Zap ships a complete testing and tooling story in the single native executable: \`assert\`, \`*_test.zp\` files, structured diagnostics, a formatter, a linter, a stdio LSP, and a maintained VS Code extension.

## \`assert\`

\`assert(condition, message)\` is the fail-fast primitive for tests and invariants. It checks the condition at runtime and reports a stable \`ZAP-...\` diagnostic when it is false:

\`\`\`zap
fn add(a: number, b: number) -> number:
    return a + b

assert(add(2, 3) == 5, "addition failed")
assert(type(add(2, 3)) == "number", "wrong result type")
say "test passed"
\`\`\`

## Test files

Test files conventionally end in \`_test.zp\`:

\`\`\`text
my_app/
├── main.zp
└── tests/
    └── arithmetic_test.zp
\`\`\`

\`zap test tests\` discovers nested \`*_test.zp\` files and resolves imports from the nearest project root containing \`zap.toml\`. This makes the generated project layout usable without copying shared modules into the test directory.

## \`zap test\` flags

\`\`\`bash
zap test                       # run all tests in the project
zap test tests                 # run tests in tests/
zap test tests --filter arithmetic   # run matching tests
zap test tests --fail-fast     # stop after the first failure
zap test tests --json          # machine-readable test results
\`\`\`

A failing test returns exit code \`1\`. A command-usage error returns exit code \`2\`. Use \`--json\` when a CI system needs machine-readable test results.

## Structured diagnostics

\`zap check --json\` emits structured diagnostics with fields such as \`ok\`, \`kind\`, \`file\`, \`line\`, \`column\`, \`message\`, and the formatted \`error\` string when source information is available:

\`\`\`json
{"ok":false,"kind":"TypeError","file":"main.zp","line":4,"column":12,"message":"expected number, got text"}
\`\`\`

The command-line checker and the LSP share the **same** semantic diagnostic categories: \`SyntaxError\`, \`NameError\`, \`TypeError\`, \`ValueError\`, \`IOError\`, \`FileNotFound\`, \`PermissionError\`, \`OverflowError\`, \`Error\`, or \`ProjectError\`.

## \`zap fmt\` and \`zap lint\`

\`\`\`bash
zap fmt main.zp
zap lint main.zp
\`\`\`

- \`zap fmt\` formats Zap source to the canonical style.
- \`zap lint\` reports formatting and style issues without changing the file.

A normal development loop:

\`\`\`bash
zap fmt main.zp
zap lint main.zp
zap check .
zap test tests
zap build --locked .
\`\`\`

## Language Server Protocol

Zap includes a stdio Language Server Protocol implementation and a maintained VS Code asset set. The server supports:

- Diagnostics
- Hover
- Completion
- Signature help
- Definitions
- Document symbols
- Workspace symbols
- Formatting
- Scope-aware rename within its documented boundaries

### Incremental synchronization

The LSP advertises bounded incremental synchronization (\`textDocumentSync.change = 2\`):

- Each \`didChange\` notification may contain up to **128** sequential full-document or range edits.
- Range positions are validated against the negotiated UTF-8, UTF-16, or UTF-32 encoding.
- Edits must land on character boundaries.
- Document versions must increase monotonically.
- The **32 MiB** workspace byte cap is enforced after every edit.

Malformed, out-of-range, oversized, unknown-document range edits, and stale updates are rejected **without** replacing the stored document.

### Run the LSP

\`\`\`bash
zap lsp
\`\`\`

## VS Code extension

Use the canonical extension assets from \`vscode-extension/\` or the editor tree under \`editors/vscode/\`.

For repository development, validate editor parity with:

\`\`\`bash
python3 scripts/validate_vscode_assets.py
scripts/test_lsp_semantic_parity.sh
scripts/test_lsp_protocol_sync.sh
\`\`\`

## Reproducing an editor diagnostic

When an editor reports an error, reproduce it with \`zap check --json\` first. This separates a language diagnostic from an editor transport or presentation problem:

\`\`\`bash
zap check --json .
\`\`\`

## Test layers

The test layers should grow in this order:

| Layer | Evidence |
|---|---|
| Language | Parser, type, memory, and deterministic runtime tests |
| Contract | Route catalog, DTO, auth, rate-limit, and migration metadata tests |
| Handler | Request/response tests with injected fake repositories and identities |
| Database | Adapter tests against an isolated test database and rollback fixtures |
| HTTP | Loopback end-to-end tests for headers, status, limits, and graceful shutdown |
| Security | Invalid input, credential leakage, CSRF, SSRF, traversal, timing, and permission corpus |
| Operations | Readiness, drain, restart, migration lock, log redaction, and resource-boundary tests |

Tests that use a database must use a disposable isolated database. Production credentials and production data must **never** be used by the test runner.

## Troubleshooting

| Symptom | Likely cause | Action |
|---|---|---|
| \`zap: command not found\` | Executable is not on \`PATH\` | Add the Zap \`bin\` directory to \`PATH\` and reopen the shell |
| \`unknown command\` | Installed binary is older than this guide | Run \`zap --version\` and install the matching release |
| \`zap check\` rejects a type | Annotation and value disagree | Correct the value or annotation; do not rely on coercion |
| \`module not found\` | Import path or module root is wrong | Check relative paths, entries, and \`.zp\` file names |
| \`circular module dependency\` | Import graph contains a cycle | Split shared declarations into a lower-level module |
| \`zap build --locked\` rejects the project | Lockfile is missing or stale | Run \`zap lock\` after reviewing manifest changes |
| \`zap dev\` rejects the project | Web manifest path is unsafe or missing | Run \`zap web check\` and inspect \`[web]\` fields |
| \`db migrate --check\` reports pending work | Migrations have not been applied | Review \`zap db plan\`, back up data, then migrate intentionally |
| LSP shows stale diagnostics | Editor sent an unsupported/stale update | Reopen the document and reproduce with \`zap check --json\` |
| frontend works in dev but not deployment | Build output was not copied to \`public/\` | Copy the final HTML/CSS/JS assets and serve them through Zap |
`,
};

export const testingToolingSection: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "testing-tooling",
    title: "Testing & Tooling",
    icon: "Wrench",
    pages: [{ slug: "testing-tooling", title: "Testing & Tooling" }],
  },
  pages: [testingTooling],
};
