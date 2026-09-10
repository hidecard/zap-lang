import type { DocSection, DocPage } from "../types";

const webAuthPage: DocPage = {
  slug: "web-auth",
  title: 'Authentication (OAuth2/JWT)',
  description: 'Production OAuth2/OIDC and JWT authentication: bearer validation, JWKS, key rotation, and the 401/403/503 error contract.',
  source: "docs/AUTH_OAUTH2_JWT_EN.md",
  markdown: `Zap's production host adapter should act as an **OAuth2 resource server**. The identity provider performs the browser login and OAuth2 authorization-code flow; Zap receives an access token and validates it before the request reaches the gateway or repository.

> Do **not** use an ID token as an API access token. For browser clients, use Authorization Code with **PKCE** and exact redirect URI registration in the identity provider, following current OAuth 2.0 security best practice.

## What the Framework branch implements

\`host/zap-host/src/auth.rs\` provides \`JwtAuthenticator\` and a bounded OIDC/JWT configuration contract. \`AppState::from_env\` selects it when \`ZAP_AUTH_MODE=jwt\`; local default mode remains the demo authenticator so the starter can run without an identity provider. **Production deployment templates set JWT mode and reject the demo policy.**

The authenticator performs the following checks before inserting \`Identity\` into the request extensions:

| Check | Production behavior |
|---|---|
| Authorization header | Requires one \`Bearer <token>\` value and enforces a bounded token size |
| Algorithm | Requires an explicit allowlist; the deployment template allows \`RS256\` only |
| Key ID | Requires \`kid\` and looks it up in the configured JWKS document |
| Signature | Verifies the JWS signature with the selected RSA or EC JWK |
| Claims | Validates \`iss\`, \`aud\`, \`exp\`, and \`nbf\`; requires a bounded non-empty \`sub\` |
| Scopes | Accepts OAuth \`scope\` and provider-style \`scp\`, normalizes and de-duplicates values |
| Provider failure | Maps JWKS network failure to \`503\`; malformed/expired/incorrect tokens map to \`401\` |
| Key rotation | Caches JWKS for a bounded TTL; an unknown \`kid\` causes one serialized refresh, with a short refresh cooldown and **no stale-key fail-open** |

The algorithm, issuer, audience, JWKS URL, clock skew, cache TTL, and token-size limits are validated at startup. The JWKS URL must be HTTPS. Redirects are disabled on the JWKS HTTP client, and the client has bounded connection/request timeouts.

## Required production environment

Copy \`deploy/zap-web.env.example\` through a secret/configuration management process. Replace placeholders; do not commit them.

\`\`\`dotenv
ZAP_AUTH_MODE=jwt
ZAP_AUTH_ISSUER=https://login.example.com/
ZAP_AUTH_AUDIENCE=https://api.example.com
ZAP_AUTH_JWKS_URL=https://login.example.com/.well-known/jwks.json
ZAP_AUTH_ALLOWED_ALGORITHMS=RS256
ZAP_AUTH_CLOCK_SKEW_SECONDS=30
ZAP_AUTH_JWKS_CACHE_SECONDS=300
ZAP_AUTH_MAX_TOKEN_BYTES=16384
\`\`\\

The issuer and audience values must **exactly match** the access-token contract issued by the selected provider. The API should receive access tokens whose \`aud\` is the API, not a frontend client identifier. Keep the JWKS endpoint stable and publish the provider's new signing key before issuing tokens with its new \`kid\`.

## Authorization flow boundary

A browser or mobile client should use the provider's Authorization Code + PKCE flow. The client exchanges the code at the provider, obtains an access token for the Zap API, and sends it in the HTTPS \`Authorization: Bearer\` header. Zap validates the access token but does **not** implement a login page, password grant, token endpoint, refresh-token store, or browser session cookie.

After authentication, authorization remains a **separate** decision. Handlers should require scopes such as \`users:read\` or \`users:write\`, and repositories must enforce subject/tenant ownership in their queries. A valid signature alone does **not** grant access to every resource.

## HTTP error contract

| Situation | Response |
|---|---|
| Missing, malformed, expired, wrong issuer/audience, wrong signature, unsupported algorithm, or unknown \`kid\` | \`401 unauthenticated\` |
| Valid identity without the required route scope | \`403 forbidden\` |
| JWKS provider timeout or temporary fetch failure | \`503 authentication_unavailable\` |
| Invalid deployment configuration or unusable JWKS document | \`500 authentication_unavailable\` and a deployment alert |

Do **not** return provider-specific parsing details to clients. Do **not** log the raw \`Authorization\` header, access token, claims containing personal data, or the JWKS URL if it contains credentials. The existing sensitive-header middleware continues to redact authorization headers from trace output.

## Key rotation runbook

1. Publish the new public JWK with a new \`kid\` while retaining the previous public JWK.
2. Start issuing new tokens with the new key only after the JWKS endpoint is serving both keys.
3. Keep both keys available for at least the maximum access-token lifetime plus the configured cache TTL and clock skew.
4. Remove the old key only after old tokens can no longer be valid.
5. If an unknown \`kid\` appears, Zap performs one bounded refresh; repeated refresh attempts are throttled and do not accept stale keys after the cache expires.

Test rotation in staging by issuing an old-key token, adding the new JWK, issuing a new-key token, verifying both during overlap, then removing the old key after expiry. The test must also verify that:

- An algorithm-confusion token is rejected.
- A token signed by the wrong issuer is rejected.
- An ID token sent to the API is rejected.

## Deployment checklist

Run \`scripts/validate_zap_host_deployment.sh\` and \`scripts/validate_zap_web_deployment.sh\`. Confirm that:

- \`ZAP_AUTH_MODE=jwt\` is present in the managed environment.
- The JWKS URL is HTTPS.
- The deployment policy allows only the reviewed algorithm list.
- Demo authentication is disabled.

Verify \`/health\` independently from \`/ready\`; readiness should include the real repository and identity-provider dependency policy without making liveness dependent on a transient JWKS request.

## References

- RFC 9700 — Best Current Practice for OAuth 2.0 Security.
- RFC 8725 — JSON Web Token Best Current Practices.
- OpenID Connect Core 1.0.
`,
};
const webHostPage: DocPage = {
  slug: "web-host",
  title: 'Host Adapter',
  description: 'The zap-host Axum/Tower adapter: request pipeline, HTTP contract, configuration, integration seams, and the production replacement checklist.',
  source: "docs/ZAP_HOST_EN.md",
  markdown: `The \`\`host/zap-host\`\` crate is the first host-side HTTP adapter for the dependency-free Web contracts in \`frameworks/web\`. It uses **Axum** for HTTP routing and **Tower/Tower-HTTP** for bounded request handling, timeout control, sensitive-header marking, and request tracing. The adapter is intentionally separate from the Zap language core and does not claim that the native runtime is already an embeddable Rust library.

> **Boundary:** The Zap Web modules define deterministic request, DTO, authorization, rate-limit, repository, and response contracts. \`zap-host\` owns sockets, HTTP extraction, middleware ordering, process lifecycle, and translation between HTTP values and those contracts.

## Scope of this foundation

The first crate is a runnable adapter skeleton rather than a complete production deployment. It provides a real Axum router and a Tokio TCP lifecycle, but its default gateway is an in-memory demonstration repository and its default authenticator accepts a fixed demo identity. These defaults make the contract executable and testable; they **must** be replaced before deployment.

| Area | Implemented in \`zap-host\` | Production replacement required |
|---|---|---|
| HTTP listener | Tokio \`TcpListener\` and \`axum::serve\` | TLS termination, proxy policy, deployment health, and socket hardening |
| Routing | \`/\`, \`/health\`, \`/ready\`, \`/metrics\`, \`/api/users\`, \`/api/users/:id\` | Versioning, API compatibility policy, and the complete application route set |
| Request bounds | 2,048-byte path, 65,536-byte body, 128-byte request ID | Edge/proxy limits, multipart policy, decompression limits, and per-route budgets |
| Timeout | Tower \`TimeoutLayer\`, default 10 seconds | Operation-specific deadlines, cancellation propagation, and downstream timeout budgets |
| Authentication | \`Authenticator\` trait and identity extension | JWT/OIDC/API-key verification, key rotation, issuer/audience checks, and revocation policy |
| Authorization | \`users:read\` and \`users:write\` scope checks | Resource ownership, tenant isolation, policy evaluation, and audit events |
| Database | \`UserRepository\` trait plus memory demo | Parameterized SQL/driver adapter, pool/transaction policy, migrations, and retry taxonomy |
| Rate limiting | Atomic in-process fixed-window state | Shared atomic store, trusted key selection, proxy-aware identity, and fail-open/closed policy |
| Shutdown | Ctrl-C/SIGTERM graceful shutdown | Deployment drain coordination, readiness transitions, and bounded shutdown timeout |

## Request pipeline

The adapter applies boundaries before the domain gateway is called. The order is significant because it prevents oversized, unsupported, unauthenticated, or rate-exhausted requests from reaching repository code.

| Stage | Responsibility | Failure examples |
|---|---|---|
| 1. Request policy | Validate path shape, traversal markers, method, and request ID; attach or generate a correlation ID | \`400 invalid_request\`, \`405 method_not_allowed\` |
| 2. Tower bounds | Enforce body size and whole-request timeout | \`400 invalid_request\`, \`408 request_timeout\` |
| 3. Rate limiter | Atomically consume the configured key/window before the gateway | \`429 rate_limited\`, \`500 rate_limit_unavailable\` |
| 4. Authenticator | Verify external credentials outside Zap and return a typed identity | \`401 unauthenticated\`, \`500 authentication_unavailable\` |
| 5. Route handler | Check required scope, parse path/body, and invoke the gateway | \`400\`, \`403\`, \`404\`, \`409\`, \`503\` |
| 6. DTO mapper | Normalize input and expose only public output fields | \`400 invalid_name\`, \`400 invalid_email\` |
| 7. Response boundary | Serialize JSON, set security headers, and propagate \`x-request-id\` | Redacted stable response body |

The last-added middleware is the outermost Tower layer. The code keeps rate limiting **ahead** of authentication and both **ahead** of the gateway. This is a deliberate policy choice, not an incidental implementation detail.

## HTTP contract

| Method | Path | Required scope | Success | Notes |
|---|---|---|---:|---|
| \`GET\` | \`/\` | None | \`200\` | Small root response and correlation ID |
| \`GET\` | \`/health\` | None | \`200\` | Liveness-style response only; it does not prove database readiness |
| \`GET\` | \`/ready\` | None | \`200\`/\`503\` | Readiness probe result; public and dependency-aware |
| \`GET\` | \`/metrics\` | None | \`200\` | Bounded Prometheus-style process counters; no user-controlled labels |
| \`GET\` | \`/api/users\` | \`users:read\` | \`200\` | Public DTO list |
| \`GET\` | \`/api/users/:id\` | \`users:read\` | \`200\` | \`404\` for an absent user |
| \`POST\` | \`/api/users\` | \`users:write\` | \`201\` | JSON body with string \`name\` and \`email\` |

All JSON responses include \`x-content-type-options: nosniff\`, \`cache-control: no-store\`, and the validated or generated \`x-request-id\`. Authorization and cookie headers are marked sensitive for Tower diagnostics. Error responses contain stable error codes and do not expose driver messages, SQL, credentials, tokens, or internal row fields.

## Configuration

The executable reads the following environment variables. Invalid numeric values or unsafe bounds fail during startup instead of being silently accepted.

| Variable | Default | Rule |
|---|---:|---|
| \`ZAP_HOST_ADDR\` | \`127.0.0.1:3000\` | Must parse as a socket address |
| \`ZAP_HOST_MAX_BODY_BYTES\` | \`65536\` | Must be between 1 and 65,536 |
| \`ZAP_HOST_REQUEST_TIMEOUT_MS\` | \`10000\` | Must be greater than zero |
| \`ZAP_HOST_SHUTDOWN_TIMEOUT_MS\` | \`30000\` | Maximum post-signal drain duration; must be greater than zero |
| \`ZAP_HOST_RATE_LIMIT\` | \`60\` | Requests per fixed window; must be greater than zero |
| \`ZAP_HOST_RATE_WINDOW_MS\` | \`60000\` | Fixed-window duration; must be greater than zero |
| \`ZAP_HOST_RATE_KEY\` | \`demo-host\` | Must contain 1–256 bytes; replace with a trusted user/tenant key policy |

The default bind address is **loopback** to avoid accidentally exposing the demo adapter. A deployment that binds publicly must explicitly configure network policy, TLS termination, proxy trust, access logging, and readiness behavior.

## Integration seams

The adapter is designed around replaceable \`WebGateway\`, \`UserRepository\`, \`Authenticator\`, and \`ReadinessProbe\` seams. A real application should provide an \`AppState\` similar to:

\`\`\`rust
let repository = Arc::new(MySqlUserRepository::connect(pool));
let gateway: Arc<dyn WebGateway> = Arc::new(ContractGateway::new(repository));
let authenticator: Arc<dyn Authenticator> = Arc::new(OidcAuthenticator::new(issuer_config));
let state = AppState::new(config, gateway, authenticator)?;
let app = build_router(state);
\`\`\\

## Development and validation

\`\`\`bash
cd host/zap-host
cargo check --all-targets
cargo fmt -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets
cargo run
\`\`\\

The integration suite verifies public health, request-ID propagation, DTO mapping, authentication and scope failures, path/method/body rejection, rate-limit short-circuiting, and database error mapping. It uses Axum's in-process service interface and does not require a live socket, database, credential provider, or external service.

## Remaining milestone before production

This crate is the first adapter prototype. Before production, add: a reviewed runtime bridge, real authentication provider, real database adapter, shared rate-limit store, TLS/proxy policy, observability/redaction review, readiness checks, integration tests with injected dependencies, and deployment-specific load/chaos evidence. Do **not** promote the demo memory repository or fixed authenticator to a production default.
`,
};
const webDatabasePage: DocPage = {
  slug: "web-database",
  title: 'Database Production',
  description: 'SQLite-first migrations, expand-and-contract, connection-pool ownership, the repository transaction contract, and external providers.',
  source: "docs/DATABASE_PRODUCTION_EN.md",
  markdown: `Zap currently owns a deterministic, **SQLite-first** migration engine. A production application must keep schema migration, request-time database access, and connection-pool lifecycle as separate responsibilities: the migration command is a release operation; the repository owns the pool; the Web process owns readiness and graceful shutdown.

## What the native adapter owns today

The native adapter:

- Reads the \`[database]\` manifest section, supports \`driver = "sqlite"\`.
- Resolves a relative project database path or a deployment-provided \`ZAP_DATABASE_URL\`.
- Discovers declarative \`.zp\` migrations.
- Validates dependency order.
- Computes checksums.
- Applies pending operations in one SQLite transaction.
- Records the migration ID, application time, and checksum in the \`__zap_migrations\` ledger.

If an applied migration disappears or its contents change, the adapter **fails closed** and requires a new migration.

| Concern | Native Zap behavior | Production implication |
|---|---|---|
| Migration format | Declarative \`.zp\` files with bounded operations | Review and test migration files as release artifacts |
| Ordering | Explicit \`depends_on\` plus deterministic ordering | Cycles and missing dependencies fail before apply |
| Drift | SHA-256 checksum ledger | Never edit an applied migration; create a forward migration |
| Apply | One transactional SQLite apply | Backup before release and verify post-apply state |
| Rollback | No automatic down migration | Use backup/restore or a tested forward compatibility migration |
| External providers | Not implemented by native adapter | Add a provider-specific host repository and migration tool |

## Release migration procedure

\`\`\`bash
zap build --locked /srv/zap/app
zap web check /srv/zap/app
zap db check /srv/zap/app
zap db inspect --json /srv/zap/app
zap db plan --json /srv/zap/app
zap db migrate --dry-run /srv/zap/app
\`\`\\

For the current SQLite adapter, stop the Web process, take a verified copy of the database, and invoke the checked-in \`zap-web-migrate.service\`. That unit serializes migration work with \`flock\`, applies the transaction, and runs \`zap db migrate --check\` after completion. Keep the migration unit **manual** rather than attaching it to every worker boot.

## Expand-and-contract

A migration is safe only when the new application can work with **both** the old and new schema during the rollout window. Prefer expand-and-contract changes:

1. Add nullable/new columns or tables first.
2. Deploy code that can read both shapes.
3. Backfill in a bounded job.
4. Remove old columns only after all old readers are gone.

The current native migration format is intentionally smaller than a general SQL migration system; do **not** encode destructive or provider-specific assumptions in it.

## Failure and recovery

| Situation | Action |
|---|---|
| \`zap db migrate --check\` reports pending migrations | The release is not ready |
| Apply fails | Inspect the journal and preserve the database before retrying |
| Migration ledger reports checksum drift | Restore the original migration file only if the repository history proves it was intended; otherwise write a new migration |
| Destructive operation already applied | Use the tested backup/restore procedure or a forward corrective migration |

Do **not** treat a successful systemd restart as schema recovery evidence.

## SQLite guidance

For SQLite, use **one writer at a time** and keep transactions short. The native adapter already sets a bounded busy timeout and foreign-key enforcement for opened connections. A large connection pool does **not** create parallel SQLite write capacity; it can increase lock contention and file-descriptor pressure. Read/write behavior, backup strategy, WAL policy, and filesystem durability must be reviewed for the actual host filesystem.

## Connection-pool ownership

The Web framework must **not** put database credentials, SQL, or provider-specific pool objects into Zap source. The production \`UserRepository\` owns the provider pool and exposes typed operations to the \`WebGateway\`. The host adapter exposes configuration policy through \`AppConfig.database_pool\`:

| Setting | Environment variable | Default | Bound |
|---|---|---:|---:|
| Maximum connections | \`ZAP_DB_MAX_CONNECTIONS\` | 16 | 1–256 |
| Acquisition timeout | \`ZAP_DB_ACQUIRE_TIMEOUT_MS\` | 1000 ms | 1 ms–30 s |
| Query/statement timeout | \`ZAP_DB_QUERY_TIMEOUT_MS\` | 5000 ms | 1 ms–120 s |

These fields define a **contract**; they do not turn a demo repository into a real pool. Pool sizing is a deployment calculation, not a language constant: across all application instances, keep the sum of pool maxima **below** the database server's connection budget after reserving connections for administration, migrations, monitoring, and failover.

## Repository transaction contract

A production repository should implement the following boundary:

\`\`\`text
request
  -> authenticate and authorize
  -> acquire pool connection with deadline
  -> begin transaction only when multiple statements must be atomic
  -> use parameterized query and subject/tenant predicate
  -> commit or rollback
  -> release connection
  -> map provider error to typed DatabaseError
\`\`\\

The repository must **never** return raw driver errors, SQL text, credentials, password material, or internal columns to the JSON DTO layer. Duplicate-key errors map to a stable conflict result; unavailable pool/database errors map to a dependency-unavailable result; cancellation must release the connection.

## External providers

For external PostgreSQL/MySQL providers, use the provider's reviewed async pool implementation in the host adapter. Keep migrations in the provider's migration tool or a separately reviewed Zap adapter; do **not** attempt to make the SQLite \`.zp\` migration engine silently interpret another provider's SQL dialect. If a deployment has multiple Web instances, use a database advisory migration lock or an orchestrator lock instead of the local \`/run/zap\` lock.
`,
};
export const webAdditions: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "web-extras",
    title: "Web (Advanced)",
    icon: "Globe",
    pages: [
      { slug: "web-auth", title: "Authentication (OAuth2/JWT)" },
      { slug: "web-host", title: "Host Adapter" },
      { slug: "web-database", title: "Database Production" }
    ],
  },
  pages: [
    webAuthPage,
    webHostPage,
    webDatabasePage
  ],
};
