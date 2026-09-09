import type { DocSection, DocPage } from "../types";

const introduction: DocPage = {
  slug: "introduction",
  title: "Introduction",
  description:
    "Zap is a readable, general-purpose programming language with .zp source files, indentation-based blocks, optional type checking, explicit modules, and a standalone native runtime.",
  source: "README.md",
  markdown: `## What is Zap

Zap is a readable, general-purpose programming language with \`.zp\` source files, indentation-based blocks, optional type annotations, structured \`Result\` and \`Option\` values, explicit modules, a native command-line runtime, deterministic project validation, and a practical path from scripts to Web applications.

Zap is distributed as a **single native executable**. After Zap is installed, a project can be created, checked, built, tested, and served without installing Python, Node.js, Java, or Rust as application runtime dependencies. HTML, CSS, plain JavaScript, or the built output of React, Vue, Svelte, and other frontend tools can be placed under the project's \`public/\` directory and served by Zap.

The normal execution pipeline is **source &rarr; lexer &rarr; AST parser &rarr; evaluator**. The Rust toolchain is used to build Zap itself; it is **not** a runtime dependency of a \`.zp\` application.

## Current release

| Item | Status |
|---|---|
| Current release line | \`v2.11.18\` |
| Source files | \`.zp\`, commonly \`main.zp\` |
| Project manifest | \`zap.toml\` |
| Lockfile | \`zap.lock\` |
| Runtime | Standalone native executable |
| Platforms | Linux x86_64, Windows x86_64, macOS ARM64 |
| Bootstrap stage | **B0** — provisional corpus-limited Zap candidates |
| License | MIT |

## Design principles

- **Readable first.** Indentation-based blocks and a small set of value categories keep source close to intent.
- **No hidden runtime.** A single \`zap\` executable is sufficient for project validation, testing, and serving.
- **Explicit modules.** \`module\` and \`import\` resolve relative, bounded paths in deterministic source order.
- **Structured errors.** \`Result\`/\`Option\` plus \`raise\`/\`try\`/\`catch\` keep exceptional paths deterministic.
- **Bounded async.** A deterministic, poll-budgeted executor — not a production I/O reactor.
- **Convention without magic.** A Zap Web project is a directory you own; there is no hidden app registry.

## First taste

\`\`\`zap
let scores: list<number> = [80, 45, 90]

fn passed(score: number) -> bool:
    return score >= 50

for score in scores:
    if passed(score):
        say "passed: " + str(score)
\`\`\`

The language includes text, numbers, booleans, lists, maps, objects, functions, classes, inheritance, optional annotations, closures, explicit modules, JSON, \`Result\`/\`Option\`, default and named arguments, bounded asynchronous tasks, and deterministic diagnostics.

## What this documentation covers

This site mirrors the canonical bilingual (English / Burmese) documentation set shipped with the Zap repository. Each page links to the upstream source file on GitHub so you can verify every claim against the reference implementation.

> **Normative behavior** is defined by the language specification and executable tests. **Compatibility** behavior exists for older projects. **Deferred** behavior is designed but not enabled. When a guide says a feature is deferred, do not depend on it yet.

## Where to go next

| Goal | Start here |
|---|---|
| Install and learn Zap from beginner to advanced | [Installation](#installation) &middot; [Language Guide](#language-guide) |
| Searchable syntax reference | [Syntax Reference](#syntax-reference) |
| Normative language behavior | [Language Specification](#syntax-reference) |
| Standard library | [Standard Library](#stdlib) |
| Web framework and frontend integration | [Web Framework](#web-framework) |
| Runtime, memory, and async | [Runtime State](#runtime) |
| Host adapter and deployment | [Deployment](#deployment) |
`,
};

const installation: DocPage = {
  slug: "installation",
  title: "Installation",
  description:
    "Download, verify, and install the native Zap executable on Linux, macOS ARM64, or Windows.",
  source: "README.md",
  markdown: `## Download

Download the archive matching your operating system and CPU architecture from the [v2.11.18 release page](https://github.com/hidecard/zap/releases/tag/v2.11.18). Verify its checksum and signature, extract it, and place the \`zap\` executable on \`PATH\`.

## Linux

\`\`\`bash
tar -xzf zap-2.11.18-linux-x86_64.tar.gz
cd zap
bash install.sh
zap --version
\`\`\`

If you do not have administrator access, keep the executable in a user-owned directory and add that directory to \`PATH\`:

\`\`\`bash
mkdir -p "$HOME/.local/bin"
install -m 0755 zap/bin/zap "$HOME/.local/bin/zap"
export PATH="$HOME/.local/bin:$PATH"
zap --version
\`\`\`

## macOS ARM64

\`\`\`bash
tar -xzf zap-2.11.18-macos-arm64.tar.gz
cd zap
chmod +x install.sh
./install.sh
zap --version
\`\`\`

## Windows

The expected archive is \`zap-2.11.18-windows-x86_64.zip\`.

\`\`\`bat
cd C:\\Zap
install_windows.bat
zap.exe --version
\`\`\`

If you do not have administrator access, keep the executable in a user-owned directory and add that directory to \`PATH\`.

## Verify the installation

A successful installation prints the installed runtime version and the supported command list:

\`\`\`bash
zap --version
zap --help
\`\`\`

If the shell reports that \`zap\` cannot be found, the executable is not on \`PATH\`. If the version is older than the project documentation, update the executable before relying on newer commands or language behavior.

## Build from source

Zap itself is implemented in Rust. To build the runtime from source, install the pinned toolchain described by \`rust-toolchain.toml\`, then run:

\`\`\`bash
cargo test --manifest-path native/Cargo.toml --all-targets
cargo build --release --manifest-path native/Cargo.toml
\`\`\`

Before contributing, run \`make doctor\` to distinguish missing environment prerequisites from test failures.
`,
};

const firstProgram: DocPage = {
  slug: "first-program",
  title: "Your First Program",
  description: "Run a single Zap file, print to the terminal, and learn the basics of comments and blocks.",
  source: "docs/LEARN_ZAP_EN.md",
  markdown: `## Hello, Zap

Create a file named \`hello.zp\`:

\`\`\`zap
say "Hello from Zap"
\`\`\`

Run it directly:

\`\`\`bash
zap hello.zp
\`\`\`

The explicit form is equivalent:

\`\`\`bash
zap run hello.zp
\`\`\`

Expected output:

\`\`\`text
Hello from Zap
\`\`\`

\`say\` writes a value to the terminal. Statements are normally separated by new lines. Zap does **not** require semicolons for ordinary statements.

## Comments

Comments begin with \`#\` and continue to the end of the line:

\`\`\`zap
# This comment is ignored.
say "This statement runs"
\`\`\`

## Blocks

Blocks begin after a colon and are delimited by indentation. Four spaces per level are recommended:

\`\`\`zap
if true:
    say "inside the block"
say "outside the block"
\`\`\`

Do not mix indentation styles within one block. Parser diagnostics identify malformed indentation and missing block bodies instead of allowing an uncontrolled runtime failure.

## A function with input

\`\`\`zap
fn greet(name: text) -> text:
    return "Hello, " + name

say greet("Zap")
\`\`\`

Save it as \`hello.zp\` and run with \`zap hello.zp\`. The function uses an explicit \`text\` annotation for \`name\` and a \`-> text\` return annotation. Both are optional but recommended.

## Language at a glance

\`\`\`zap
let scores: list<number> = [80, 45, 90]

fn passed(score: number) -> bool:
    return score >= 50

for score in scores:
    if passed(score):
        say "passed: " + str(score)
\`\`\`

You now have everything you need to read the [Language Guide](#language-guide) and start a real project with [Create a Project](#create-project).
`,
};

const createProject: DocPage = {
  slug: "create-project",
  title: "Create a Project",
  description: "Generate a complete user-managed Web project with zap new, understand the directory layout, and run it without another language runtime.",
  source: "README.md",
  markdown: `## One command

Zap intentionally uses a simple, user-managed project workflow. There is no Django-style \`startapp\` command and no hidden app registry.

\`\`\`bash
zap new my_app
cd my_app
zap check
zap build --locked
zap test tests
zap dev
\`\`\`

The single generator creates the following structure:

\`\`\`text
my_app/
├── zap.toml
├── zap.lock
├── main.zp
├── web.zp
├── server.zp
├── models/
├── functions/
├── ui/
├── routes/
├── middleware/
├── migrations/
├── admin/
├── public/
└── tests/
\`\`\`

These are ordinary user-owned directories. Add, remove, rename, and organize modules directly inside the project as it grows.

## Directory responsibilities

| Directory | Owns |
|---|---|
| \`models/\` | Data shape and validation metadata |
| \`functions/\` | Business logic and use cases |
| \`ui/\` | Browser-facing UI metadata |
| \`routes/\` | HTTP route declarations |
| \`middleware/\` | Request/response policy |
| \`migrations/\` | Versioned schema intent |
| \`admin/\` | Explicit administration registrations |
| \`public/\` | Browser assets (HTML, CSS, JS) |
| \`tests/\` | Executable checks |

## Run without another runtime

\`\`\`bash
zap check
zap build --locked
zap test tests
zap dev
\`\`\`

\`zap dev\` starts the bounded native development server declared by \`server.zp\`. It is a **development/reference server**, not a claim that all production Web concerns are solved. The generated \`public/\` directory contains a plain HTML entrypoint, CSS, and a browser ES module that consumes \`/api/tasks\`; it does not require Node.js to run.

## Frontend integration

Plain HTML, CSS, and JavaScript work without a JavaScript runtime in production:

\`\`\`html
<script type="module" src="/assets/app.js"></script>
\`\`\`

A React, Vue, Svelte, or other frontend project may be built separately and its output copied into \`public/\`. Zap serves the resulting files; it does not require npm or Node.js at deployment time. See [Frontend Integration](#web-frontend) for the full guide.
`,
};

const cli: DocPage = {
  slug: "cli",
  title: "CLI Reference",
  description: "Every zap command and flag, from running a single file to publishing a registry package.",
  source: "README.md",
  markdown: `## CLI essentials

\`\`\`bash
zap file.zp                 # run a source file
zap new my_app              # create a complete user-managed Web project
zap check .                 # validate a Zap project directory
zap check --json .          # emit structured diagnostics
zap build --locked .        # validate reproducible build inputs
zap test tests              # run Zap tests
zap fmt main.zp             # format source
zap lint main.zp            # report style issues
zap lock                    # generate canonical lock data
zap install                 # validate locked dependencies
zap update                  # regenerate lock data after manifest changes
zap web check               # validate Web configuration
zap dev                     # start the bounded development server
zap --help                  # show all commands
\`\`\`

## Running programs

\`\`\`bash
zap main.zp
zap run main.zp
zap check --json .
zap build .
zap test .
zap fmt main.zp
zap lint main.zp
\`\`\`

## Project commands

| Command | Purpose |
|---|---|
| \`zap check\` | Validate the manifest, lockfile, entry file, and static source checks |
| \`zap lock\` | Generate or regenerate the canonical \`zap.lock\` |
| \`zap lock-migrate [dir]\` | Explicitly migrate a legacy lockfile when registry metadata is available |
| \`zap add <name> <version> [dir]\` | Add a deterministic version dependency and invalidate the lockfile |
| \`zap install [dir]\` | Validate the existing manifest and lockfile without changing them |
| \`zap update [dir]\` | Regenerate the canonical lockfile and validate the local dependency graph |
| \`zap build\` | Validate and prepare a Zap project |
| \`zap test\` | Run project test files |
| \`zap fmt main.zp\` | Format a Zap source file |
| \`zap lint main.zp\` | Report style issues |

## Web and database commands

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

- \`zap web check\` validates project structure.
- \`zap web routes\` executes the exported \`routes()\` factory and prints the route table without opening a listener.
- \`zap db check\` validates structured migration declarations and their deterministic SQL plan.
- \`zap db inspect\` is a read-only adapter/status view; it does **not** create the SQLite file when it is absent.
- \`zap db migrate --check\` is a deployment-friendly check: it validates the migration ledger and exits successfully only when no migration is pending. With \`--json\`, the check includes \`ok: true\` or \`ok: false\` for automation.
- \`zap dev\` runs the manifest-declared \`server.zp\` entrypoint. For a different local port, run \`ZAP_WEB_PORT=3100 zap dev\`.

## Registry commands

| Command | Purpose |
|---|---|
| \`zap registry check <index.json>\` | Validate a local deterministic registry index |
| \`zap registry fetch <index-url>\` | Validate a local, file-backed, or HTTPS registry index |
| \`zap registry cache <index.json> <source> <name> <version> [cache]\` | Cache a package source after SHA-256 verification |
| \`zap registry gc [--dry-run] [dir]\` | Remove unreferenced cache files using the project lockfile |
| \`zap registry serve <root> [bind]\` | Run the authenticated loopback registry service |
| \`zap registry publish <url> <archive> <name> <version> <sha256>\` | Publish a checksum-verified archive to an HTTPS endpoint |

Run \`zap --help\` for the full, up-to-date command list installed on your machine.
`,
};

export const gettingStarted: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "getting-started",
    title: "Getting Started",
    icon: "Rocket",
    pages: [
      { slug: "introduction", title: "Introduction" },
      { slug: "installation", title: "Installation" },
      { slug: "first-program", title: "Your First Program" },
      { slug: "create-project", title: "Create a Project" },
      { slug: "cli", title: "CLI Reference" },
    ],
  },
  pages: [introduction, installation, firstProgram, createProject, cli],
};
