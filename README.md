# Zap

> A readable, general-purpose programming language with indentation-based syntax and a standalone native runtime.

[![Live Documentation](https://img.shields.io/badge/docs-live-0ea5e9)](https://zap-lang.hidecard1500.workers.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/hidecard/zap-lang/blob/main/LICENSE)

Zap is a small, readable programming language built around `.zp` source files, indentation-based blocks, explicit modules, optional type checking, and structured `Result` / `Option` values. Its native runtime is designed to handle the complete project lifecycle without requiring Python, Node.js, Java, or Rust at runtime.

## Highlights

- **Readable syntax** with indentation-based blocks and no semicolons or braces.
- **Optional type annotations** with checking through `zap check`.
- **Explicit modules** with deterministic, bounded path resolution.
- **Structured errors** using `Result`, `Option`, `?`, and explicit exception handling.
- **Native project lifecycle** for creating, checking, building, testing, and serving projects.
- **Built-in web capabilities** for routes, models, migrations, middleware, admin tools, and a bounded development server.
- **Bounded by design** with safety limits, checked overflow, workspace confinement, and fail-closed errors.
- **Deterministic standard library** covering text, math, collections, filesystem, JSON, time, logging, networking, processes, async tasks, and runtime diagnostics.

## Example

```zap
let name = "Zap"

fn greet(who: text) -> text:
  return "Hello, " + who

say greet(name)
```

A simple project workflow looks like this:

```bash
zap new my_app
cd my_app
zap check
zap build --locked
zap test tests
zap dev
```

## Language at a glance

Zap supports text, numbers, booleans, lists, maps, objects, functions, classes, inheritance, closures, JSON, default and named arguments, explicit modules, optional annotations, and bounded asynchronous tasks.

The language is intended to remain small and predictable while providing the building blocks needed for application development.

## Standard library

The standard library is organized into explicit domains with clear input/output limits, timeout policies, error contracts, and determinism guarantees. Core domains include:

- `text`, `math`, and `collections`
- `filesystem` and `json`
- `system`, `time`, and `logging`
- `network` and `process`
- `async` and `runtime`

## Documentation

Read the live documentation site:

**[zap-lang.hidecard1500.workers.dev](https://zap-lang.hidecard1500.workers.dev/)**

The documentation includes getting started instructions, installation, examples, the language guide, syntax reference, standard library reference, web framework guidance, deployment notes, and project status.

## Deployment

The documentation site is deployed to Cloudflare Workers using [OpenNext](https://opennext.js.org/cloudflare/). The repository includes the Worker configuration and build scripts required for deployment:

```bash
bun install --frozen-lockfile
bun run build
npx wrangler deploy
```

For local development:

```bash
bun run dev
```

## Project status

Zap is under active development. Language features, standard-library domains, tooling, and web capabilities may evolve between releases. Check the documentation site and the repository history for the current release status.

## License

Zap is released under the [MIT License](LICENSE).
