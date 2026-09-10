import type { DocSection, DocPage } from "../types";

const registryAuthPage: DocPage = {
  slug: "registry-auth",
  title: 'Registry Authentication',
  description: 'Trusted-registry policy, credential configuration, stable auth diagnostics, operation order, signed provenance, and the yanked-release policy.',
  source: "docs/REGISTRY_AUTH_EN.md",
  markdown: `Zap separates **transport security**, **registry trust**, **authentication**, and **artifact integrity**. HTTPS protects the request transport, the trusted-registry policy decides which remote origins may be used, credentials identify the caller, and lockfile checksums verify downloaded artifacts. **None of these controls replaces another.**

## Trusted registry policy

Remote registry origins must be **canonicalized** before comparison. Zap lowercases host names, removes default ports, normalizes path prefixes, rejects userinfo, queries, fragments, backslashes, whitespace, and traversal segments, and stores entries in deterministic order. Local paths and \`file://\` sources retain their explicit local-source behavior.

\`\`\`bash
zap registry trust list
zap registry trust add https://registry.example/team
zap registry trust remove https://registry.example/team
\`\`\\

An untrusted remote is rejected **before** a network request is made. \`http://\` remains disabled by default and is intended only for controlled fixtures when \`ZAP_ALLOW_INSECURE_HTTP=1\` is explicitly set.

## Credential configuration

Credentials are scoped to canonical registry origins and path prefixes. A more-specific path credential takes precedence over a broader origin credential. Tokens are accepted only for HTTPS or local file origins, are bounded to 4096 bytes, and must not contain whitespace or control characters.

To avoid exposing secrets in shell history, configure a token through an environment-variable reference:

\`\`\`bash
export ZAP_REGISTRY_TOKEN_CI='replace-with-a-secret'
zap registry credential set https://registry.example/team --token-env ZAP_REGISTRY_TOKEN_CI
zap registry credential list
zap registry credential remove https://registry.example/team
\`\`\\

The list command prints origins only; it **never** prints token values. The persistent configuration path is selected by \`ZAP_REGISTRY_CONFIG\`, then \`$HOME/.config/zap/registry.json\`, and finally \`.zap/registry.json\`. The file is bounded to 64 KiB and updates use a temporary file followed by an atomic replacement.

### Credential resolution order

1. An explicit API token.
2. An origin-scoped configured credential.
3. Finally \`ZAP_REGISTRY_TOKEN\`.

Credentials are **never** written to manifests, lockfiles, logs, diagnostics, or changelogs.

## Stable authentication diagnostics

HTTP authentication responses use stable codes while preserving the existing string-based API:

| Code | Meaning |
|---|---|
| \`ZAP-REG-AUTH-001\` | Credentials are missing for a \`401\` response. |
| \`ZAP-REG-AUTH-002\` | Supplied credentials were rejected for a \`401\` response. |
| \`ZAP-REG-AUTH-003\` | The credential lacks permission for a \`403\` response. |

Diagnostics contain the canonical origin but **never** contain the bearer token.

## Operation order

Install, update, cache, and publish operations must follow this order:

1. Normalize the source.
2. Enforce trusted-origin policy.
3. Resolve an origin-scoped credential.
4. Enforce secure transport.
5. Perform the request.
6. Validate the response.
7. Verify checksum or signature.

When \`ZAP_REGISTRY_INDEX\` names a remote index URL, dependency resolution loads the same persisted and environment-backed credential store for the index request before resolving packages. Offline operations do **not** perform authentication or network access.

## Provenance policy

A protected release must use **signed provenance** and must fail closed when provenance identity is incomplete. Signed mode requires:

- A semantic-version tag ref (\`refs/tags/vX.Y.Z\`)
- A full 40-hex commit SHA
- A numeric CI workflow run ID
- An HTTPS source URI

The signing key must resolve to a full 40-hex OpenPGP fingerprint; that fingerprint, rather than an ambiguous short key ID, is recorded in \`signing.key_id\`. Signed mode also requires the \`TRUSTED_SIGNING_FINGERPRINTS\` allowlist. The active fingerprint must match one of its full 40-hex entries; an empty, malformed, or non-matching allowlist fails closed.

## Yanked-release policy

A registry package record may set \`yanked: true\` for a version that must not be selected for a new dependency resolution. The field defaults to \`false\` for legacy index records, but an explicitly malformed yanked value is rejected rather than silently treated as safe.

- **Exact-version** and **range** resolution both skip yanked candidates.
- An exact yanked request returns \`registry package is yanked: <name> <version>\`.
- A range whose matching candidates are all yanked returns \`all matching registry packages are yanked: <name> <requirement>\`.

An existing lockfile may continue to use a yanked version only for an explicitly locked, checksum-verified offline or update operation. The resolver must **not** introduce a yanked version into a new lockfile, and an update operation must **not** silently replace a healthy locked version with a yanked one. Cache presence does **not** override the yanked flag.
`,
};
const stdlibPolicyPage: DocPage = {
  slug: "stdlib-policy",
  title: 'Standard Library Policy',
  description: 'The compatibility contract: stability labels, the determinism taxonomy, the public domain summary, semver rules, and deprecation/removal.',
  source: "docs/STDLIB_POLICY_EN.md",
  markdown: `This policy defines the **compatibility contract** for every public standard-library domain and its directly exposed builtins. The machine-readable source is the native \`stdlib_catalog.rs\` catalog; this document explains how users and maintainers interpret the metadata. Runtime dispatch remains centralized in the evaluator; the catalog does **not** create a second implementation path.

## Stability model

Every public domain and builtin has one stability label, one introduction release, one deprecation-window value, one semantic-versioning rule, one platform-support declaration, explicit input/output limits, a timeout policy, an error contract, and a \`determinism_class\`.

| Label | Meaning | Compatibility consequence |
|---|---|---|
| \`stable\` | Supported public behavior for the release line | Bug fixes and compatible additions may ship in a minor release; breaking semantic changes require a major release or an approved migration plan |
| \`experimental\` | Opt-in behavior still subject to design change | The documentation must identify the opt-in boundary and migration risk; promotion to \`stable\` requires a catalog and regression review |
| \`platform-specific\` | Supported only on named target families | The platform matrix is normative; unsupported targets must fail with a stable diagnostic rather than silently emulating behavior |
| \`deprecated\` | Existing behavior retained during migration | The catalog must name a deprecation window and replacement; removal is prohibited before that window closes |

The current public catalog marks all released domains and builtins as \`stable\`, with no active deprecation window.

## Determinism taxonomy

\`determinism_class\` is more precise than the legacy boolean:

| Class | Meaning |
|---|---|
| \`pure\` | The result is a function of explicit inputs and has no runtime or external-state dependency. |
| \`input-deterministic\` | Validated inputs determine a repeatable transformation, including parsing, encoding, or duration decomposition. |
| \`runtime-dependent\` | The result may depend on process state, scheduling, platform configuration, or the current clock. |
| \`external-io\` | The operation reads, writes, or coordinates with the filesystem, environment, network, process table, or another external system. |

The retained \`deterministic\` field is \`true\` only for \`pure\` and \`input-deterministic\` entries, and \`false\` for \`runtime-dependent\` and \`external-io\` entries. New tooling should consume \`determinism_class\`; the boolean remains available for consumers that still read schema-version-1 metadata.

## Public domain summary

| Public domain | Stability | Determinism class | Input limit | Output limit |
|---|---|---|---|---|
| \`text\` | stable | pure | 8 KiB text argument | 8 KiB text result |
| \`math\` | stable | pure | bounded integer arguments | bounded integer result |
| \`collections\` | stable | pure | 8 MiB logical collection graph | 8 MiB logical collection graph |
| \`filesystem\` | stable | external-io | 8 MiB path/content input | 8 MiB text/line output |
| \`web\` | stable | pure | 64 KiB JSON/map body and 64 schema fields | typed Result value with bounded error map |
| \`json\` | stable | pure | 8 MiB JSON input | 8 MiB JSON output |
| \`system\` | stable | runtime-dependent | 8 KiB environment/path input | 8 KiB text or structured result |
| \`time\` | stable | runtime-dependent | checked integer milliseconds | checked duration map |
| \`logging\` | stable | external-io | 8 KiB message and 64 fields | 64 KiB encoded record |
| \`runtime\` | stable | runtime-dependent | bounded diagnostic request | bounded statistics map |
| \`async\` | stable | runtime-dependent | run-owned task and poll budgets | bounded task result |
| \`network\` | stable | external-io | 8 KiB URL and 8 MiB request body | 8 MiB response body |
| \`process\` | stable | external-io | text command, text arguments, 1 MiB output | 1 MiB captured stdout/stderr |

All public domains use the stable runtime diagnostic contract. Invalid types, malformed values, path escapes, oversized values, unavailable platform operations, and exceeded logical budgets **fail closed**.

## API evolution and semver rules

A **minor-compatible** change may:

- Add a new builtin.
- Add a new optional field to a returned record.
- Clarify a diagnostic without changing its stable code.
- Fix a bug while preserving accepted valid programs.

Such changes require catalog metadata, English/Burmese documentation, a regression test, and an updated compatibility record.

A **major-breaking** change is required when:

- An existing valid program changes meaning.
- An accepted input becomes invalid.
- A stable result field is removed or changes type.
- A documented diagnostic contract is removed.
- A platform guarantee is narrowed.

The change must first be described in the bilingual compatibility template and approved before implementation.

## Deprecation and removal

Deprecation is a **documentation and tooling event**, not a silent runtime change. A deprecated entry must:

- Retain its old dispatch behavior.
- Name its replacement.
- Specify the first release of deprecation.
- State the minimum release in which removal may occur.

Removal requires a major-version decision or an explicitly approved compatibility exception, plus a migration example in both language trees.

> No current public standard-library domain or builtin is deprecated.

## Verification and change checklist

The acceptance gate requires the catalog metadata tests, the standard-library security corpus, the full native test suite, strict Clippy, documentation consistency, specification ownership, and \`git diff --check\`. A public API change must also update the relevant English and Burmese index entries, this policy pair, the compatibility record, and the release roadmap.
`,
};
export const packagesAdditions: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "packages-extras",
    title: "Packages (Advanced)",
    icon: "Package",
    pages: [
      { slug: "registry-auth", title: "Registry Authentication" },
      { slug: "stdlib-policy", title: "Standard Library Policy" }
    ],
  },
  pages: [
    registryAuthPage,
    stdlibPolicyPage
  ],
};
