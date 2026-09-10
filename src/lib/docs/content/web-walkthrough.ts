import type { DocSection, DocPage } from "../types";

const webWalkthrough: DocPage = {
  slug: "web-walkthrough",
  title: 'Build a Web App',
  description: 'An end-to-end walkthrough: scaffold a project, declare routes, validate requests, store data, serve a frontend, and run the dev server.',
  source: "docs/ZAP_WEB_NATIVE_EN.md",
  markdown: `This walkthrough builds a small **task tracker** with the Zap Web scaffold: routes, request validation, a JSON handler, a static asset handler, an SPA fallback, and the bounded native development server.

> The scaffold is a development/reference Web slice. It is not by itself a production server, ORM, admin UI, authentication system, or deployment supervisor — see [Production rule](#web-framework).

## 1. Scaffold the project

\`\`\`bash
zap new tasks
cd tasks
\`\`\`

The generator creates a complete user-managed project:

\`\`\`text
tasks/
├── zap.toml
├── zap.lock
├── main.zp
├── web.zp
├── server.zp
├── models/
├── functions/
├── ui/
├── routes/
│   └── routes.zp
├── middleware/
├── migrations/
├── admin/
├── public/
│   ├── index.html
│   └── assets/
│       ├── app.css
│       └── app.js
└── tests/
\`\`\`

## 2. Validate and inspect

\`\`\`bash
zap check
zap web check
zap web routes
\`\`\`

\`zap web routes\` executes the exported \`routes()\` factory and prints the route table **without** opening a listener, and checks that method/path registrations are unique.

## 3. Declare the routes

Edit \`routes/routes.zp\`. The current parser does not yet implement a first-class \`route\` statement, so the scaffold uses an ordinary exported function that returns a route table:

\`\`\`zap
export fn routes():
    return [
        {"method": "GET",  "path": "/",            "handler": "home",   "scope": ""},
        {"method": "GET",  "path": "/api/tasks",   "handler": "tasks",   "scope": "tasks:read"},
        {"method": "POST", "path": "/api/tasks",   "handler": "create",  "scope": "tasks:write"},
        {"method": "GET",  "path": "/assets/*path", "handler": "asset",   "scope": ""},
        {"method": "GET",  "path": "/*path",        "handler": "spa",     "scope": ""}
    ]
\`\`\`

Keep API and asset routes **before** the final SPA wildcard so they take priority.

## 4. Validate the request body

The native runtime provides \`web_validate_request(body, schema)\` as a bounded typed boundary. \`body\` may be an already-parsed map or raw JSON text no larger than 64 KiB. A schema can contain at most 64 fields; field specifications support \`text\`, \`number\`, \`bool\`, \`map\`, \`list\`, and \`none\`, with optional \`required\` and text-only \`max_len\` options.

\`\`\`zap
export fn create(request):
    let schema = {
        "title": {"type": "text", "max_len": 200, "required": true},
        "done": {"type": "bool"}
    }
    let checked = web_validate_request(request["body"], schema)
    if is_err(checked):
        return checked
    let payload = unwrap(checked)
    return ok({"status": 201, "body": json({"created": true, "body": payload})})
\`\`\`

Unknown fields, missing required fields, invalid JSON, type mismatches, and length violations return a \`ResultErr\` map containing \`status\`, \`code\`, \`message\`, and an optional \`field\`. Returning that error directly lets the native Web boundary map it to a stable JSON response.

## 5. Return a JSON response

\`\`\`zap
export fn tasks(request):
    return {
        "status": 200,
        "body": json({"tasks": [], "request_id": request["request_id"]})
    }
\`\`\`

JSON is the default API representation for map and list values. The current Web contract enforces path length, body length, request-ID bounds, method policy, traversal rejection, security headers, and stable error shapes.

## 6. Serve static assets and the SPA fallback

\`\`\`zap
export fn asset(request):
    return web_static("assets/" + request["params"]["path"], "public")

export fn spa(request):
    return web_static_spa(request["params"]["path"], "public", "index.html")
\`\`\`

- \`web_static\` confines assets to the project root, rejects traversal and unsupported extensions, and returns binary assets through a bounded response representation.
- \`web_static_spa(asset, root, fallback)\` serves the requested asset when present and otherwise serves the validated fallback document, making client-side React/Vue/Svelte routes explicit without running a JavaScript toolchain.

## 7. Write a model and a migration

\`\`\`zap
# models/task.zp
export fn task_model():
    return {
        "name": "Task",
        "table": "tasks",
        "fields": {
            "id": "number primary_key",
            "title": "text required",
            "done": "bool"
        }
    }
\`\`\`

\`\`\`zap
# migrations/0001_initial.zp
export fn migration():
    return {
        "id": "0001_initial",
        "depends_on": [],
        "operations": [
            {
                "kind": "create_table",
                "table": "tasks",
                "columns": {
                    "id": "integer primary key",
                    "title": "text not null",
                    "done": "integer not null default 0"
                }
            }
        ]
    }
\`\`\`

Inspect and apply:

\`\`\`bash
zap db check
zap db plan
zap db inspect --json
zap db migrate --dry-run
zap db migrate --check
zap db migrate
\`\`\`

\`zap db migrate --check\` is deployment-friendly: it validates the migration ledger and exits successfully only when no migration is pending.

## 8. Run the dev server

\`\`\`bash
zap dev
\`\`\`

\`zap dev\` runs the manifest-declared \`server.zp\` entrypoint. The generated server reads \`ZAP_WEB_PORT\` and defaults to \`3000\`, accepts bounded HTTP/1.0 or HTTP/1.1 requests on loopback, resolves exact, \`:parameter\`, and final \`*wildcard\` route segments, passes a request map to a Zap handler, and returns a framed response with security headers.

For a different local port:

\`\`\`bash
ZAP_WEB_PORT=3100 zap dev
\`\`\`

The server is intentionally single-threaded and blocking; it is a development/reference server until concurrency, cancellation, TLS/edge policy, readiness integration, and operational evidence are complete.

## 9. Add a frontend

Plain HTML, CSS, and JavaScript require no frontend package manager:

\`\`\`html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/assets/app.css">
  </head>
  <body>
    <main id="app"></main>
    <script type="module" src="/assets/app.js"></script>
  </body>
</html>
\`\`\`

\`\`\`javascript
// public/assets/app.js
fetch("/api/tasks")
  .then((r) => r.json())
  .then((data) => {
    document.getElementById("app").textContent = JSON.stringify(data);
  });
\`\`\`

React, Vue, Svelte, Alpine, or another frontend system may be used as an optional build-time toolchain. Build its output, copy the output into \`public/\`, and deploy the generated files with Zap. The deployed runtime does **not** execute npm, Node.js, a bundler, or the framework compiler.

## 10. Test the contract

\`\`\`zap
# tests/web_test.zp
export fn test_tasks_response():
    let response = {"status": 200, "body": json({"tasks": [], "request_id": "test"})}
    let body = from_json(response["body"])
    assert(body["request_id"] == "test", "request id must echo")
    assert(is_empty(body["tasks"]), "tasks must start empty")
\`\`\`

\`\`\`bash
zap test tests
\`\`\`

\`zap test tests\` discovers nested \`*_test.zp\` files and resolves imports from the nearest project root containing \`zap.toml\`.

## Recap

You now have a runnable Zap Web app: a validated manifest, a route table, a typed request boundary, a JSON response, static + SPA asset handlers, a SQLite-first migration, and a bounded native dev server — all without Python, Node.js, Java, or Rust on the application host.

Continue with [Frontend Integration](#web-frontend) and [Deployment](#deployment).
`,
};

export const webWalkthroughSection: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "web-walkthrough-section",
    title: "Walkthrough",
    icon: "Map",
    pages: [{ slug: "web-walkthrough", title: "Build a Web App" }],
  },
  pages: [webWalkthrough],
};
