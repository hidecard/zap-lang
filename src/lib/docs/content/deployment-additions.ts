import type { DocSection, DocPage } from "../types";

const productionOpsPage: DocPage = {
  slug: "production-operations",
  title: 'Production Operations',
  description: 'Reference runbook for deploying the authenticated registry behind systemd + nginx TLS ingress: host prep, secrets, smoke test, monitoring, backup, and the release gate.',
  source: "docs/PRODUCTION_OPERATIONS_EN.md",
  markdown: `This runbook deploys the built-in authenticated registry behind a Linux **systemd** service and an **nginx** TLS ingress. It is a reference runbook, not an automatic cloud provisioning system. Production operators must adapt the firewall, certificate authority, secret manager, monitoring, backup, and approval steps to their environment.

> **Non-negotiable boundary:** Never expose \`zap registry serve\` directly to the Internet. Bind the backend to loopback, terminate TLS at a maintained ingress proxy, and keep the backend's filesystem and network permissions narrow.

## Architecture

The reference deployment has four components:

1. A release binary installed at \`/usr/local/bin/zap\`.
2. A systemd-managed backend bound to \`127.0.0.1:8787\`.
3. An nginx TLS virtual host that is the only public entry point.
4. An external secret/monitoring/backup system.

| Component | Required production control |
|---|---|
| Zap binary | Download from a trusted release, verify SHA-256, pin the version, and retain the previous binary for rollback. |
| Registry data | Store under \`/var/lib/zap-registry\`; back it up independently and test restoration. |
| Service | Use \`deploy/zap-registry.service\`, including \`DynamicUser\`, \`StateDirectory\`, quotas, loopback binding, and process-group cleanup. |
| Ingress | Use \`deploy/zap-registry.nginx.conf\` as a starting point; replace the example hostname and certificate paths. |
| Credentials | Inject \`ZAP_REGISTRY_TOKEN\` and \`ZAP_REGISTRY_SIGNING_SECRET\` from a secret manager or a mode-0600 environment file. |
| Monitoring | Collect systemd journal and nginx logs, host resource metrics, and external health checks. |
| Backup and recovery | Back up registry data, preserve signing-key material according to policy, and perform a restore drill before launch. |

The backend uses eight request workers and a bounded queue of 32 connections. When the queue is full it returns \`503 Service Unavailable\` rather than admitting unbounded work. The service exposes unauthenticated \`GET /healthz\` and \`GET /readyz\` for local probes; nginx restricts these paths to loopback.

## Host preparation

\`\`\`bash
sudo apt-get update
sudo apt-get install --yes nginx curl ca-certificates
sudo install -d -m 0750 /etc/zap
sudo install -d -m 0755 /var/lib/zap-registry
\`\`\\

The systemd unit uses \`StateDirectory=zap-registry\`, so systemd owns the final state-directory setup. Do **not** place secrets or private keys in the repository checkout or in \`/var/lib/zap-registry\`.

## Install and verify the binary

\`\`\`bash
sha256sum -c zap-<version>-linux-x86_64.tar.gz.sha256
install -d -m 0755 /usr/local/bin
install -m 0755 ./bin/zap /usr/local/bin/zap.new
/usr/local/bin/zap.new --version
mv /usr/local/bin/zap.new /usr/local/bin/zap
/usr/local/bin/zap --version
\`\`\\

## Configure secrets safely

\`\`\`bash
sudo install -m 0600 /dev/null /etc/zap/registry.env
sudoedit /etc/zap/registry.env
\`\`\\

Required variables:

\`\`\`text
ZAP_REGISTRY_TOKEN=generated-service-token
ZAP_REGISTRY_SIGNING_SECRET=generated-signing-secret
\`\`\\

Use high-entropy, independently generated values. Do **not** put either value in a systemd command line, nginx configuration, source file, manifest, lockfile, log, or chat message.

## Install and validate systemd

\`\`\`bash
sudo install -m 0644 deploy/zap-registry.service /etc/systemd/system/zap-registry.service
scripts/validate_registry_deployment.sh
sudo systemd-analyze verify /etc/systemd/system/zap-registry.service
sudo systemctl daemon-reload
sudo systemctl enable --now zap-registry.service
\`\`\\

The unit's command order is significant:

\`\`\`text
/usr/local/bin/zap registry serve /var/lib/zap-registry 127.0.0.1:8787
\`\`\\

## Configure nginx TLS ingress

\`\`\`bash
sudo install -m 0644 deploy/zap-registry.nginx.conf /etc/nginx/conf.d/zap-registry.conf
sudoedit /etc/nginx/conf.d/zap-registry.conf
sudo nginx -t
sudo systemctl reload nginx
\`\`\\

The reference proxy redirects HTTP to HTTPS, allows TLS 1.2 and TLS 1.3, limits request bodies, permits only \`GET\` and \`POST\`, sets bounded proxy timeouts, and forwards to \`127.0.0.1:8787\`.

## Smoke test before public traffic

\`\`\`bash
curl --fail http://127.0.0.1:8787/healthz
curl --fail http://127.0.0.1:8787/readyz
sudo journalctl -u zap-registry --since '5 minutes ago' --no-pager
sudo nginx -t
curl --fail --silent --show-error https://registry.example/healthz
\`\`\\

## Monitoring and alerting

Zap does not expose built-in Prometheus metrics or a durable job queue. At minimum, monitor:

- systemd service state and restart count
- CPU/memory/task/file-descriptor pressure
- nginx 4xx/5xx rates
- TLS certificate expiry
- disk usage under \`/var/lib/zap-registry\`
- health/readiness failures
- authentication failures

## Backup, restore, and rollback

\`\`\`bash
sudo systemctl stop zap-registry
sudo tar --xattrs --acls -czf /secure-backup/zap-registry-$(date -u +%Y%m%dT%H%M%SZ).tar.gz /var/lib/zap-registry
sudo systemctl start zap-registry
sudo curl --fail http://127.0.0.1:8787/readyz
\`\`\\

A backup is not complete until a clean restore has been tested.

## Release gate

Before accepting production traffic, obtain evidence for every row:

| Gate | Evidence |
|---|---|
| Artifact integrity | Release checksum/signature verified and version recorded. |
| Dependency security | RustSec audit passed in CI with the current advisory database. |
| Runtime quality | Locked format/check/Clippy/tests passed. |
| Deployment contract | \`scripts/validate_registry_deployment.sh\` and \`systemd-analyze verify\` passed. |
| Network boundary | Backend listens only on loopback; firewall blocks 8787; TLS ingress is active. |
| Secrets | Secret manager injection verified; repository and logs contain no secret values. |
| Recovery | Backup and clean restore drill passed. |
| Observability | Logs, health checks, certificate alerts, resource alerts, and 5xx alerts are active. |
| Rollback | Previous binary and operator-approved rollback procedure are available. |

Only after all gates pass should DNS or the public load balancer route production traffic to the ingress.

## Security boundaries

The runtime's \`ZAP_UNTRUSTED=1\` mode provides capability denials and bounded execution behavior, but it is **not** a universal kernel sandbox. For untrusted customer code, use a separate VM or container policy with read-only source mounts, a dedicated writable directory, a minimal environment, no host credentials, CPU/memory/process/time quotas, syscall/network policy, and an explicit egress allowlist.
`,
};
const releasePolicyPage: DocPage = {
  slug: "release-policy",
  title: 'Release Version Policy',
  description: 'Single-source-of-truth version policy: authoritative Cargo.toml version, required release surfaces, validation, and the release workflow.',
  source: "docs/RELEASE_VERSION_POLICY_EN.md",
  markdown: `The native package version in \`native/Cargo.toml\` is the **authoritative** Zap release version. \`native/Cargo.lock\` must record the same \`zap-native\` package version, and the compiled CLI must report the same value through \`zap --version\`.

No release workflow may publish artifacts when the package version, tag, CLI output, changelogs, bilingual README onboarding, security policy, or release notes disagree. The version is intentionally **validated** rather than inferred from an older document or manually copied across release surfaces.

## Required release surfaces

| Surface | Required contract |
|---|---|
| \`native/Cargo.toml\` | Authoritative semantic version |
| \`native/Cargo.lock\` | Matching \`zap-native\` package version |
| \`zap --version\` | Matching CLI output |
| \`CHANGELOG.md\`, \`CHANGELOG_EN.md\`, \`CHANGELOG_MM.md\` | Current release version is mentioned |
| \`README.md\`, \`README_MM.md\` | Current release line, release URL, and all three platform archive names are current |
| \`SECURITY.md\` | Supported release line and official release-integrity URL are current |
| \`docs/RELEASE_<VERSION>_EN.md\`, \`docs/RELEASE_<VERSION>_MM.md\` | Bilingual release notes exist for the version |
| Git tag \`v<VERSION>\` | Matches the authoritative package version when a tag is supplied |

## Validation and evidence

\`\`\`bash
EXPECTED_VERSION=2.11.18 \\
RELEASE_TAG=v2.11.18 \\
ZAP_VERSION_REPORT=target/version-consistency.tsv \\
scripts/validate_release_version.sh 2.11.18
scripts/test_validate_release_version.sh
\`\`\\

The validator emits deterministic TSV evidence and **fails closed** on:

- package/lockfile drift
- CLI drift
- stale onboarding links or archive names
- stale security links
- missing bilingual release notes
- a hard-coded release template version
- a mismatched tag

Plain branch refs such as \`master\` are **not** treated as release tags; implicit tag validation activates only for semver-shaped \`v<VERSION>\` refs, while an explicitly supplied \`RELEASE_TAG\` is always enforced.

## Release workflow

1. Use \`scripts/bump_release.sh\` in dry-run mode first.
2. Review its generated Cargo and changelog diff.
3. Update the versioned bilingual release notes.
4. Run the version gate and full release preflight.
5. Commit the result.
6. Only then create and push the matching annotated tag.

The tag-triggered workflow repeats the gate on the tagged source before building or publishing assets.

> A documentation-only release mismatch is a **release-blocking** defect because it can direct a new user to an older binary. Do **not** bypass the version gate with \`ALLOW_DIRTY\`, an unrelated tag, or a manually edited artifact name.
`,
};
const releaseSigningPage: DocPage = {
  slug: "release-signing",
  title: 'Release Signing & Rollback',
  description: 'Ephemeral CI GPG keyring, public verification, key rotation, the release gates, and the rollback and quarantine runbook.',
  source: "docs/RELEASE_SIGNING_EN.md",
  markdown: `Zap release signing uses an **ephemeral CI GPG keyring**. The repository contains scripts and policy only; it never contains a private signing key or passphrase. The release workflow **fails closed** when the required private-key secret is unavailable.

## Required protected secrets

Configure these values in the protected GitHub Actions release environment:

| Secret | Required | Purpose |
|---|---:|---|
| \`ZAP_RELEASE_GPG_PRIVATE_KEY\` | Yes | ASCII-armored private key used only inside the ephemeral runner keyring |
| \`ZAP_RELEASE_GPG_PASSPHRASE\` | Optional | Passphrase for a protected private key; omit only for an intentionally unprotected CI signing key |

The private key must be imported only into the runner's temporary \`GNUPGHOME\`. It must **not** be committed, placed in an example file, printed in logs, or included in a release asset.

## Public verification artifact

The workflow exports only the public portion of the configured signing key:

\`\`\`bash
GNUPGHOME="$GNUPGHOME" \\
SIGNING_KEY_ID="$SIGNING_KEY_ID" \\
  bash scripts/export_release_public_key.sh \\
    "artifacts/zap-\${GITHUB_REF_NAME#v}-release-signing-key.asc"
\`\`\\

The public key is distributed with the release so users and downstream automation can verify the \`.asc\` signatures. The helper rejects empty output and refuses to publish output containing a private-key armor block.

## Local verification

After downloading a release and importing the trusted public key into an isolated verification keyring:

\`\`\`bash
GNUPGHOME=/secure/verification/gnupg \\
  bash scripts/verify_published_release.sh 2.11.18 ./published-release
\`\`\\

The verifier checks:

- The archive set
- Per-artifact checksums
- Aggregate checksums
- Manifest/provenance consistency
- Expected archive entries
- Detached signatures

It **fails closed** on missing assets, mismatched hashes, missing signatures, unsafe names, or invalid provenance.

## Key rotation

Key rotation requires:

1. A new key ID.
2. A protected secret update.
3. Public-key distribution.
4. A successful signed fixture and release verification run.
5. A bilingual release notice.

If the old key is revoked, the revocation and the first release signed by the new key must be announced together. Existing releases must remain verifiable with their original trusted key unless a security incident requires quarantine.

## Release gates

A public release requires **all** of the following:

- Release preflight
- Deterministic artifact manifest
- Aggregate checksum
- Provenance
- Signatures
- Post-publish verification
- Manual approval in the protected release environment

Automatic tag creation, automatic secret rotation, and private-key export are **disabled by policy**.

## Rollback runbook

Rollback is a **controlled change**. Do **not** delete evidence, rewrite an existing tag, or silently replace a published asset. Quarantine the affected release, preserve logs and hashes, and direct users to the last known-good release until the incident is reviewed.

### Severity and trigger conditions

| Trigger | Initial severity | Required action |
|---|---:|---|
| Missing release asset or incomplete upload | High | Stop promotion and quarantine the release |
| Checksum mismatch | Critical | Do not install or distribute the affected asset |
| Signature or provenance verification failure | Critical | Quarantine all release assets until key and artifact state are reviewed |
| Installer failure or unsafe upgrade | High | Stop further promotion and direct users to the previous stable version |
| Registry index or cache corruption | Critical | Freeze writes and restore the last known-good signed state |
| Credential or signing-key exposure | Critical | Revoke/rotate credentials and quarantine related releases |
| Post-release functional regression | High | Stop promotion and begin rollback assessment |

### Immediate containment

1. Record the release tag, commit SHA, workflow run ID, publication timestamp, reporter, and first observed symptom.
2. Do **not** delete the GitHub Release or move the tag. Preserve the original state for evidence.
3. Mark the release as quarantined and stop any pending promotion.
4. Point release documentation and operator communication to the last known-good version.
5. If credentials or signing material may be exposed, revoke or rotate them before rebuilding any artifact.

### Return-to-service checklist

| Check | Evidence required |
|---|---|
| Corrected source tag is immutable | Commit and tag references |
| Preflight passes | CI run link and preflight summary |
| All platform artifacts exist | Artifact manifest |
| Checksums match | Aggregate and per-artifact checksum output |
| Signatures verify | Public-key verification output |
| Provenance matches intended source | Provenance JSON and commit comparison |
| Install/upgrade checks pass | Platform installer test results |
| Registry state is trusted | Restored signed index and service health evidence |
| Documentation is updated | English/Burmese release notes and rollback notice |
| Reviewer approval recorded | Incident and release approval record |

Only after every check passes may the release be unquarantined, the corrected release announced, and registry or marketplace promotion resumed.

## Operational boundary

Secret provisioning, key custody, public-key trust distribution, and key rotation are **operator responsibilities**. The repository provides reproducible procedures and validation scripts but does not contain production credentials or authorize production access by itself.
`,
};
export const deploymentAdditions: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "deployment-extras",
    title: "Deployment (Advanced)",
    icon: "Server",
    pages: [
      { slug: "production-operations", title: "Production Operations" },
      { slug: "release-policy", title: "Release Version Policy" },
      { slug: "release-signing", title: "Release Signing & Rollback" }
    ],
  },
  pages: [
    productionOpsPage,
    releasePolicyPage,
    releaseSigningPage
  ],
};
