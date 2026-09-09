import type { DocSection, DocPage } from "../types";

const deployment: DocPage = {
  slug: "deployment",
  title: "Deployment",
  description:
    "Operator reference for local and public registry deployment: TLS ingress, supervision, sandbox, quotas, credentials, and egress controls.",
  source: "docs/DEPLOYMENT_EN.md",
  markdown: `## Scope

Zap includes a controlled local registry service, but a public production deployment must add an explicit operating boundary around that service. This guide defines the repository's reproducible reference policy. It is an **operator contract and validation target**; it does not provision certificates, create cloud resources, or publish a registry automatically.

## Reference artifacts

| Artifact | Purpose |
|---|---|
| \`deploy/zap-registry.service\` | Linux service supervision, least privilege, filesystem protection, quotas, and loopback-only network access |
| \`deploy/zap-registry.nginx.conf\` | TLS termination, HTTP-to-HTTPS redirect, request limits, allowed methods, and loopback upstream policy |
| \`deploy/registry.env.example\` | Redacted environment template for deployment-secret-manager integration |
| \`deploy/registry-deployment-policy.toml\` | Machine-readable deployment contract for bind address, limits, sandboxing, credentials, and egress |
| \`scripts/validate_registry_deployment.sh\` | Dependency-free CI/operator validation of the reference controls and secret-file hygiene |

## TLS and ingress

The registry process binds to \`127.0.0.1:8787\` and is **not** intended to receive public traffic directly. The reference nginx configuration:

- Terminates TLS with TLS 1.2 or TLS 1.3.
- Redirects cleartext HTTP to HTTPS.
- Limits request bodies to 1 MiB.
- Permits only \`GET\` and \`POST\`.
- Forwards requests to the loopback service with bounded proxy timeouts.

Operators must replace the example hostname and certificate paths with certificates managed by their platform. Private keys must remain outside the repository.

The backend receives only loopback traffic. The systemd unit starts it with:

\`\`\`bash
zap registry serve /var/lib/zap-registry 127.0.0.1:8787
\`\`\`

The root directory comes before the optional bind address. The service uses eight bounded request workers and a 32-connection queue, returning \`503 Service Unavailable\` rather than admitting unbounded work when the queue is full.

## Health probes

The service exposes \`GET /healthz\` and \`GET /readyz\` for local probes. They intentionally **bypass bearer authentication** so a local supervisor can check liveness and data-directory readiness; the reference nginx configuration permits those paths only from loopback. Do not make them public without replacing the allow rule with a narrowly scoped, authenticated monitoring network.

## Supervision and sandbox

The systemd unit runs the service as a dynamic \`zap-registry\` user with:

- \`NoNewPrivileges\`
- Private temporary devices
- Protected system and home paths
- A restrictive umask
- One explicit writable directory: \`/var/lib/zap-registry\`

It restarts failed services, stops the complete process group on shutdown, and uses a bounded stop timeout. \`IPAddressDeny=any\` with loopback allow rules prevents the backend from making external network connections; the TLS proxy remains the only public-facing component.

The unit is a **Linux reference**. Windows and macOS deployments must provide equivalent controls through their native service manager, sandbox, firewall, and secret-management facilities.

## Resource quotas

The reference policy limits:

| Resource | Limit |
|---|---|
| Memory | 256 MiB |
| CPU | 50 percent |
| Tasks | 64 |
| Open files | 1,024 |

Operators may lower these values after measuring workload requirements, but must **not** remove the limits without recording an explicit risk decision.

## Credentials

\`ZAP_REGISTRY_TOKEN\` and \`ZAP_REGISTRY_SIGNING_SECRET\` are required for the authenticated service. They must be:

- Injected by a deployment secret manager or an equivalent protected facility.
- Stored with mode \`0600\` when file-backed.
- Excluded from logs, archives, process arguments, and source control.

\`deploy/registry.env.example\` contains placeholders only. The validator rejects populated \`registry.env\`, private-key, and certificate files under \`deploy/\`.

## Egress controls

The registry backend is **loopback-only**. External egress is disabled in the reference policy, and the service may write only to its registry data directory. If an installation needs outbound package retrieval, that operation must be performed by a separate, explicitly allowlisted component rather than silently broadening the registry service's network permissions.

## Operations

Use the [production operations guide](https://github.com/hidecard/zap/blob/master/docs/PRODUCTION_OPERATIONS_EN.md) for the complete install, secret-management, TLS ingress, firewall, health-check, backup, rotation, rollback, and incident-response procedure.

At minimum:

1. Install the binary at \`/usr/local/bin/zap\`.
2. Install the service unit under \`/etc/systemd/system/\`.
3. Store \`/etc/zap/registry.env\` with mode \`0600\`.
4. Validate the deployment artifacts.
5. Start the service only on \`127.0.0.1:8787\`.

Before exposing the proxy, verify the service locally:

\`\`\`bash
curl --fail http://127.0.0.1:8787/healthz
curl --fail http://127.0.0.1:8787/readyz
sudo systemctl status zap-registry
sudo journalctl -u zap-registry --since '15 minutes ago'
\`\`\`

## Validation

Run the following command from the repository root before installing or publishing the service:

\`\`\`bash
scripts/validate_registry_deployment.sh
\`\`\`

The validator checks that all reference artifacts exist, that TLS and loopback ingress rules are present, that sandbox and quota controls are declared, that credentials are sourced from a secret manager, that external egress is disabled, and that no populated secret or private-key file is tracked in the deployment tree. The GitHub Actions quality workflow runs the same gate.

## Boundary and non-goals

This reference layer completes the repository-side production-boundary contract. It does **not** perform public deployment, issue certificates, configure DNS, install system packages, create a cloud firewall, or provide a universal OS sandbox abstraction. Those steps remain platform-specific operational work and must be reviewed before exposing a registry to the Internet.
`,
};

const security: DocPage = {
  slug: "security",
  title: "Security",
  description:
    "Zap's security posture: bounded builtins, no shell interpretation, deterministic errors, and the security policy.",
  source: "SECURITY.md",
  markdown: `## Bounded by construction

Zap's security posture comes from **bounded builtins and deterministic errors**, not from a runtime that silently accepts invalid input:

- All public builtins use explicit argument validation and return structured runtime errors rather than silently accepting invalid input.
- \`process_run\` invokes a program **directly without shell interpretation**, accepts only a text command and list of text arguments, and rejects output larger than 1 MiB.
- HTTP requests accept only \`http\` and \`https\` URLs and use bounded connect, read, and write timeouts.
- \`http_serve_once\` binds to \`127.0.0.1\` and enforces a 64 KiB request limit, an 8 MiB response limit, and a 10-second wait limit.
- \`web_static\` confines a requested asset to a declared root and rejects traversal.
- \`config_path\` accepts only one relative file name and rejects path separators and traversal components.
- Filesystem, JSON, and HTTP response operations use documented 8 MiB safety limits; URL inputs are limited to 8 KiB.

## Plain HTTP rejected

Plain HTTP is rejected unless \`ZAP_ALLOW_INSECURE_HTTP=1\` is explicitly set for local fixtures. \`http_serve_once\` binds to loopback only.

## Credentials

- Registry tokens and signing secrets must be injected by a deployment secret manager.
- Stored with mode \`0600\` when file-backed.
- Excluded from logs, archives, process arguments, and source control.
- Raw bearer tokens, cookies, passwords, or private keys must **not** be exposed to arbitrary handlers or written to logs.

## Reporting a vulnerability

The Zap repository ships a [SECURITY.md](https://github.com/hidecard/zap/blob/master/SECURITY.md) policy. Report security issues through the GitHub security advisory flow rather than public issues.

## Release provenance

Release artifacts are published only after version consistency, native tests, cross-platform builds, security checks (\`cargo-audit\`), documentation checks, and installer verification pass. The current source baseline is v2.11.18; the canonical current-status page records the active B0 boundary and the signed provenance fields for the latest published release.

## Dependency auditing

CI and release \`cargo-audit\` gates enforce RustSec audit evidence. The [RustSec audit evidence](https://github.com/hidecard/zap/blob/master/docs/RUSTSEC_AUDIT_EN.md) page records the active audit boundary.
`,
};

export const deploymentSection: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "deployment",
    title: "Deployment",
    icon: "Server",
    pages: [
      { slug: "deployment", title: "Deployment Guide" },
      { slug: "security", title: "Security" },
    ],
  },
  pages: [deployment, security],
};
