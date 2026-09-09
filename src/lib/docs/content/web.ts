import type { DocSection, DocPage } from "../types";

const webFramework: DocPage = {
  slug: "web-framework",
  title: "Web Framework",
  description:
    "Zap-native full-stack Web framework: one project structure, routing, models, migrations, middleware, admin, testing, and deployment checks — without hidden magic.",
  source: "docs/ZAP_WEB_NATIVE_EN.md",
  markdown: `## Goal

Zap Web is being designed as a **Zap-native full-stack Web framework**. The goal is similar to the developer experience Django provides — one coherent project structure, routing, application modules, models, migrations, authentication, administration, testing, and deployment checks — without turning Zap into Python syntax or reproducing Django's implementation.

The guiding principle is:

> **Write less. Understand more. Deploy safely.**

The framework should provide safe defaults and integrated tooling while keeping the behavior visible in ordinary Zap modules. Convention is welcome; hidden magic is not.

## What is runnable today

The current repository contains a runnable Web project scaffold. It uses Zap source files and the native Zap project checker; it does not require a Python or JavaScript application layer.

\`\`\`bash
zap new shop
cd shop
zap check
zap web check
zap web routes
zap db check
zap db inspect --json
zap db plan
zap db migrate --dry-run
zap db migrate --check
zap db migrate
zap test tests
zap run main.zp
zap dev
\`\`\`

\`zap new <directory>\` is the single canonical project generator. There is deliberately no Django-style \`startapp\` command: after generation, users own and manage the files.

## Project and app model

A Zap Web project is the deployable site boundary. The generated directories are ordinary user-managed Zap modules, **not** hidden framework registrations. A project may organize cohesive features under any of these directories, and users can add or remove files without running a separate app-generation command.

\`\`\`text
my_app/
├── zap.toml
├── zap.lock
├── main.zp
├── web.zp
├── server.zp
├── models/
│   └── user.zp
├── functions/
│   └── user_functions.zp
├── ui/
│   └── ui.zp
├── routes/
│   └── routes.zp
├── middleware/
│   └── middleware.zp
├── migrations/
│   └── 0001_initial.zp
├── admin/
│   └── admin.zp
├── public/
│   ├── index.html
│   └── assets/
│       ├── app.css
│       └── app.js
└── tests/
    └── web_test.zp
\`\`\`

| Directory | Owns |
|---|---|
| \`routes/routes.zp\` | Route catalog |
| \`models/\` | Data metadata |
| \`functions/\` | Business operations and request handlers |
| \`ui/ui.zp\` | Browser-facing UI metadata |
| \`public/\` | HTML/CSS/JavaScript assets |
| \`middleware/middleware.zp\` | Ordered cross-cutting policy |
| \`migrations/\` | Versioned schema intent |
| \`admin/admin.zp\` | Explicit management registration |
| \`tests/\` | Project tests |

## Runtime independence and frontend integration

An installed Zap executable is sufficient for project validation, testing, and server execution. Users should **not** need Python, Node.js, Rust, Java, or another language runtime on the deployment host. Rust is used to implement and distribute the native Zap executable; it is not a runtime dependency of a Zap project.

The browser boundary is deliberately ordinary. A project can serve HTML, CSS, JavaScript, images, fonts, and Wasm from the declared \`public\` directory through \`web_static\`, and a browser application can call Zap JSON routes. React, Vue, Svelte, Alpine, or another JavaScript framework may be used as an optional build-time toolchain; the emitted files can be copied into \`public/assets/\`, after which the deployed process needs only Zap and those emitted files.

## Difference from Django

| Concern | Django-inspired idea | Zap-native choice |
|---|---|---|
| Syntax | Python modules, classes, decorators | Plain Zap modules first; new syntax only through parser/AST RFCs |
| Defaults | Convention over configuration | Safe conventions with inspectable manifest and route metadata |
| ORM | Broad dynamic model/query API | Smaller typed boundary with explicit DTO and adapter capabilities |
| Async | Framework adapts sync/async callables | Zap must expose I/O boundaries and avoid hiding blocking behavior |
| Errors | Exceptions mapped by framework | Result/Option and centralized response mapping, with explicit error classification |
| Admin | Model-centric internal interface | Explicit registration, least-privilege fields, and permission policy |
| Deployment | External WSGI/ASGI server choices | Native Zap server target, but only after runtime and operational gates pass |

## Production rule

A Zap Web project becomes production-ready only when the native runtime, HTTP server, database adapter, identity system, rate-limit store, migrations, admin, observability, deployment, and security test evidence are **all** versioned and verified together. The current scaffold is the first Zap-native project layer; it is not yet that complete platform.
`,
};

const webRoutes: DocPage = {
  slug: "web-routes",
  title: "Routes & Middleware",
  description:
    "The current route declaration contract, request/response model, and ordered middleware pipeline.",
  source: "docs/ZAP_WEB_NATIVE_EN.md",
  markdown: `## Current route declaration contract

The current language parser does not yet implement a first-class \`route GET "/..." fn(req)\` statement. The scaffold therefore uses an ordinary exported Zap function that returns a route table:

\`\`\`zap
export fn routes():
    return [
        {"method": "GET", "path": "/", "handler": "home", "scope": ""},
        {"method": "GET", "path": "/users/:id", "handler": "get_user", "scope": "users:read"}
    ]
\`\`\`

This is intentional. It makes the current project runnable and inspectable while reserving a future parser/AST change for a compatibility-reviewed RFC.

\`zap web routes\` executes this factory without opening a listener, checks that method/path registrations are unique, and prints the resolved table in text or JSON form. The live Web server performs the same conflict check and additionally requires every named handler to resolve before it accepts traffic.

> A future concise route form may look like \`route GET "/users/:id" handler get_user scope "users:read"\`, but it is **design notation and must not be copied into a current project until the parser contract is implemented**.

The long-term design should support ordered matching, typed path parameters, route names, reverse URL generation, conflict detection, method policy, and centralized \`400\`/\`404\`/\`405\`/\`500\` handling. The route catalog must remain inspectable through tooling so framework defaults never become invisible behavior.

## Request and response model

JSON is the default API representation for map and list values. HTML rendering should be explicit through a future standard template surface, not inferred from an ambiguous return value. The current Web contract already enforces path length, body length, request-ID bounds, method policy, traversal rejection, security headers, and stable error shapes.

A production route pipeline should follow this order:

| Order | Boundary | Responsibility |
|---:|---|---|
| 1 | Transport | Parse HTTP, enforce protocol and connection limits |
| 2 | Request policy | Normalize method/path, reject traversal, enforce request ID and body bounds |
| 3 | Correlation | Create or validate a request ID without echoing invalid untrusted values |
| 4 | Middleware | Apply security headers, trusted proxy policy, rate limit, session, and identity context |
| 5 | Router | Match an ordered route and convert path parameters |
| 6 | Authorization | Enforce scopes/permissions before application data access |
| 7 | Validation | Convert bounded JSON input to a typed DTO and return field errors |
| 8 | Service | Execute business policy and transaction boundary |
| 9 | Repository | Execute parameterized database operations through an injected adapter |
| 10 | Response | Serialize an explicit DTO and redact internal fields |

## Middleware design

Middleware is an **ordered** request/response pipeline, not a collection of decorators. Each middleware entry should identify its name, stage, order, and short-circuit behavior. A middleware may reject a request before the handler, enrich the request context, or add response headers on the way out.

The scaffold demonstrates request-ID handling, authentication placement, and security headers:

\`\`\`zap
export fn middleware_stack():
    return [
        {"name": "request_id", "stage": "before", "order": 10},
        {"name": "auth", "stage": "before_handler", "order": 40},
        {"name": "security_headers", "stage": "after", "order": 90}
    ]
\`\`\`

The framework should reject duplicate names, invalid order values, impossible dependencies, and unsafe placement such as authorization after a database operation. Middleware order must be shown by \`zap web check\` or a future \`zap routes\`/\`zap explain\` command.

## Authorization

Authentication answers "who is this?" Authorization answers "what may this identity do?" Zap Web should keep them separate. The host or a standard identity adapter verifies a credential and passes a small verified identity object into the application. Raw bearer tokens, cookies, passwords, or private keys must **not** be exposed to arbitrary handlers or written to logs.

The application contract should support users, groups or roles, scopes/permissions, session or token identity, password hashing through a reviewed standard library, CSRF policy for cookie sessions, login throttling, and audit events. Authorization must run before repository access, and admin routes must require an explicit administrative permission plus a secure session policy.

The current scaffold only records a scope in a route table, and \`web_serve\` treats that field as metadata rather than enforcing authorization. Applications must perform explicit authorization before protected operations.
`,
};

const webModels: DocPage = {
  slug: "web-models",
  title: "Models & Migrations",
  description:
    "Models as database schema intent, DTOs as request/response boundaries, and SQLite-first additive migrations.",
  source: "docs/ZAP_WEB_NATIVE_EN.md",
  markdown: `## Models vs. DTOs

A **model** is the source of database schema intent. A **DTO** is the boundary for request and response data. These concepts must **not** be collapsed: accepting a model directly from an untrusted request can expose fields, bypass validation, or make a schema change an accidental API change.

The current scaffold records model metadata in ordinary Zap functions:

\`\`\`zap
export fn user_model():
    return {
        "name": "User",
        "table": "users",
        "fields": {
            "id": "number primary_key",
            "name": "text required",
            "email": "email unique"
        }
    }
\`\`\`

## ORM direction

The planned ORM is deliberately smaller than a general-purpose dynamic ORM. It should provide:

- Typed model metadata
- Explicit field nullability and uniqueness
- Relationships
- Parameterized query construction
- Transaction handles
- Bounded pool acquisition
- Cancellation/deadlines
- Stable database error classification

Query construction should be inspectable and should **never** concatenate untrusted values into SQL.

A production repository must be injected behind a provider-neutral interface. The deterministic \`database_contract.zp\` and \`WebGateway\` seam remain useful for contract tests, but they are not a real database driver. The native runtime now includes a **SQLite-first adapter** for the structured migration workflow; PostgreSQL, MySQL, and other backends still require explicit adapters with separate capability, query, transaction, and migration tests.

## Migrations

Migrations are versioned schema intent committed with the application. The scaffold begins with:

\`\`\`zap
export fn migration():
    return {
        "id": "0001_initial",
        "depends_on": [],
        "operations": [
            {
                "kind": "create_table",
                "table": "users",
                "columns": {
                    "id": "integer primary key",
                    "name": "text not null",
                    "email": "text not null unique"
                }
            }
        ]
    }
\`\`\`

The first native adapter is **SQLite-first**. Migration files must contain one exported, zero-argument \`migration()\` function whose return value is a literal map/list tree. The supported first operations are \`create_table\` and \`add_column\`; identifiers are allow-listed, column types/modifiers are bounded, and arbitrary SQL, function calls, names, and interpolation are **rejected**.

## Database commands

| Command | Behavior |
|---|---|
| \`zap db check\` | Validate migration declarations and compile their deterministic SQL plan without opening a database |
| \`zap db plan [--json]\` | Read the SQLite migration ledger when present and print pending SQL |
| \`zap db inspect [--json]\` | Read-only adapter/status view; does **not** create the SQLite file when absent |
| \`zap db migrate --dry-run\` | Perform the same read-only plan |
| \`zap db migrate --check [--json]\` | Validate the ledger; exit 0 only when no migration is pending |
| \`zap db migrate\` | Create the SQLite database, apply pending migrations in one transaction, enable foreign keys, and record each applied migration in \`__zap_migrations\` with a checksum |

A previously applied migration **cannot** be edited silently; the command fails and requires a new migration. \`ZAP_DATABASE_URL\` may override the manifest URL for a controlled deployment or test environment.

## Production workflow

The production migration workflow should still be:

1. Generate or write a migration.
2. Inspect its dependency graph and SQL plan.
3. Apply it in an isolated environment.
4. Run compatibility checks.
5. Deploy application code that supports both schema versions during rolling updates.
6. Record the applied migration atomically.

The current native slice deliberately supports only additive table/column operations; destructive operations, PostgreSQL/MySQL adapters, distributed migration locks, rollback orchestration, connection pools, and production deployment policy remain future work.

## Admin direction

Admin is an internal, model-centric management surface. It should be **opt-in and explicit**, never automatically expose every database column. The scaffold records a User registration with public fields and separate admin permissions:

\`\`\`zap
export fn admin_registry():
    return [
        {
            "model": "User",
            "list": ["id", "name", "email"],
            "permissions": ["admin:read", "admin:write"]
        }
    ]
\`\`\`

A future built-in admin package should use the same model/DTO/authorization boundaries as public APIs. Secret hashes, credentials, internal flags, and audit internals must be excluded by default. The admin is not a replacement for a product front end.
`,
};

const webFrontend: DocPage = {
  slug: "web-frontend",
  title: "Frontend Integration",
  description:
    "Serve HTML, CSS, and JS without a JavaScript runtime; integrate React, Vue, Svelte, or other build-time frameworks as optional tooling.",
  source: "docs/FRONTEND_INTEGRATION_EN.md",
  markdown: `## Plain HTML, CSS, and JavaScript

Plain HTML, CSS, and JavaScript work without a JavaScript runtime in production:

\`\`\`html
<script type="module" src="/assets/app.js"></script>
\`\`\`

The generated \`public/\` directory contains a plain HTML entrypoint, CSS, and a browser ES module that consumes \`/api/tasks\`. The browser calls Zap JSON routes; Zap serves the static files.

## Build-time frameworks

A React, Vue, Svelte, or other frontend project may be built separately and its output copied into \`public/\`. Zap serves the resulting files; it does **not** require npm or Node.js at deployment time. Keep API route declarations in \`routes/\` and browser assets in \`public/\`.

> Zap does not install npm packages, execute a JavaScript framework, or replace its compiler/bundler. The build is your responsibility; Zap is the runtime.

## Static asset serving

The \`web_static\` builtin confines assets to the project root, rejects traversal and unsupported extensions, and returns binary assets through a bounded response representation.

\`web_static_spa(asset, root, fallback)\` serves the requested asset when present and otherwise serves the validated fallback document, making client-side React/Vue/Svelte routes explicit without running a JavaScript toolchain:

\`\`\`zap
# Serve a client-side routed SPA from public/.
let resp = web_static_spa(request["path"], "public", "index.html")
\`\`\`

The final \`*name\` route wildcard supports nested paths such as \`/assets/chunks/app.js\`; route ordering must keep API and asset paths **before** the SPA fallback.

> Cache fingerprinting, server-side rendering, and a production static-file CDN remain deployment concerns.

## Typed request validation

The native runtime provides \`web_validate_request(body, schema)\` as a bounded typed boundary. \`body\` may be an already-parsed map or raw JSON text no larger than 64 KiB. A schema can contain at most 64 fields; field specifications support \`text\`, \`number\`, \`bool\`, \`map\`, \`list\`, and \`none\`, with optional \`required\` and text-only \`max_len\` options.

Unknown fields, missing required fields, invalid JSON, type mismatches, and length violations return a \`ResultErr\` map containing \`status\`, \`code\`, \`message\`, and an optional \`field\`.

\`\`\`zap
export fn create_user(request):
    let schema = {
        "name": {"type": "text", "max_len": 120},
        "email": {"type": "text", "max_len": 254}
    }
    let checked = web_validate_request(request["body"], schema)
    if is_err(checked):
        return checked
    let payload = unwrap(checked)
    return ok({"status": 201, "body": json({"created": true, "body": payload})})
\`\`\`

The native server acts as the centralized \`Result\` response middleware: \`ResultOk(response_map)\` uses the existing response encoder, while an error map with a 400–599 status and safe error code becomes a JSON error response with \`error\`, \`message\`, and the request ID. The validator deliberately uses \`400\` for malformed JSON, invalid body shape, invalid schema, and field-level request violations; a handler may choose \`422\` for a semantically invalid payload.

## Testing model

\`zap test tests\` discovers nested \`*_test.zp\` files and resolves imports from the nearest project root containing \`zap.toml\`. The test layers should grow in this order:

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
`,
};

export const web: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "web",
    title: "Web Framework",
    icon: "Globe",
    pages: [
      { slug: "web-framework", title: "Overview" },
      { slug: "web-routes", title: "Routes & Middleware" },
      { slug: "web-models", title: "Models & Migrations" },
      { slug: "web-frontend", title: "Frontend Integration" },
    ],
  },
  pages: [webFramework, webRoutes, webModels, webFrontend],
};
