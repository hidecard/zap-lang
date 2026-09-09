import type { DocSection, DocPage } from "../types";

const syntaxReference: DocPage = {
  slug: "syntax-reference",
  title: "Syntax Reference",
  description:
    "Normative, searchable syntax reference for Zap language users, linked to the canonical specification and executable contracts.",
  source: "docs/SYNTAX_GUIDE_EN.md",
  markdown: `> **Supported version:** Zap v2.11.18

This reference summarizes the syntax supported by the current Zap runtime. Zap source files use the \`.zp\` extension and blocks are defined by indentation.

## Running programs

\`\`\`bash
zap main.zp
zap init hello-zap
zap check .
zap check --json .
zap build .
zap test .
zap fmt main.zp
zap lint main.zp
zap run main.zp
\`\`\`

## Comments and values

\`\`\`zap
# comment
say "text"
say 42
say true
say none
say [1, 2, 3]
say {"name": "Zap"}
\`\`\`

Supported core values are \`text\`, integer \`number\`, \`bool\`, \`list\`, \`map\`, and \`none\`.

## Variables and annotations

\`\`\`zap
let name = "Zap"
let port: number = 8080
let enabled: bool = true
port = 9090
\`\`\`

Available annotation names include \`text\`, \`number\`, \`bool\`, \`list\`, \`map\`, \`function\`, \`none\`, and \`any\`. The \`function\` annotation describes a first-class callable value. \`zap check\` reports known annotation mismatches.

## Operators

| Operator | Meaning |
|---|---|
| \`+\`, \`-\`, \`*\`, \`/\`, \`%\` | Arithmetic and text concatenation where applicable |
| \`==\`, \`!=\`, \`<\`, \`<=\`, \`>\`, \`>=\` | Comparison |
| \`and\`, \`or\`, \`not\` | Boolean logic |

\`\`\`zap
let total = (10 + 5) * 2
let allowed = total >= 20 and not false
\`\`\`

Integer overflow and division by zero are checked runtime errors.

## Blocks and control flow

\`\`\`zap
if score >= 80:
    say "Excellent"
else:
    say "Keep practising"

for item in ["web", "ai", "iot"]:
    say item

let index = 0
while index < 3:
    say index
    index = index + 1
\`\`\`

Use \`break\` and \`continue\` inside loops.

## Functions

\`\`\`zap
fn add(a: number, b: number) -> number:
    return a + b

fn greet(name):
    return "Hello, " + name
\`\`\`

Function annotations use the form \`parameter: type\` and \`-> return_type\`. Nested functions can capture values from their enclosing scope.

### Default parameters

\`\`\`zap
fn greet(name: text = "World", punctuation: text = "!"):
    return "Hello, " + name + punctuation

say greet()
say greet("Zap", ".")
\`\`\`

### Named arguments

Named arguments are supported for function and method calls. Callable function names can be assigned to variables, passed to parameters annotated as \`function\`, returned from functions, and invoked through aliases.

### Async functions and await

\`\`\`zap
async fn load() -> number:
    return 7

let pending = load()
let value: number = await pending
say value
\`\`\`

See [Async & Tasks](#async) for cancellation, timeouts, and the executor contract.

## Classes

\`\`\`zap
class User:
    fn init(self, name):
        self.name = name

    fn greet(self):
        return "Hello, " + self.name

let user = new("User", "Zap")
say user.greet()
\`\`\`

Inheritance uses \`extends\` and methods can be overridden:

\`\`\`zap
class Animal:
    fn speak(self):
        return "sound"

class Dog extends Animal:
    fn speak(self):
        return "woof"
\`\`\`

## Lists, maps, and JSON

\`\`\`zap
let items = ["a", "b", "c"]
say items[0]
say len(items)
say join(items, ",")

let user = {"name": "Zap", "active": true}
say user["name"]
say keys(user)
say json(user)
say from_json("{\\"ok\\": true}")
\`\`\`

Collection helpers include \`contains\`, \`get\`, \`is_empty\`, \`sum\`, \`reverse\`, and \`sort\`.

## Modules and workspaces

\`\`\`zap
# modules/app/core.zp
module app.core

fn version():
    return "2.0"
\`\`\`

\`\`\`zap
# main.zp
module app.main
import app.core as core

say core
\`\`\`

The dotted import path maps to a \`.zp\` file below the module root. Module roots and entries must be relative, entries must end in \`.zp\`, and each listed file must exist. Explicit imports reject absolute paths, separators, empty path components, and traversal. The resolver reports a stable \`circular module dependency\` diagnostic containing the complete cycle when a dependency loop is found.

## Result and Option

\`\`\`zap
let success = ok(42)
let failure = err("failed")
let value = some("Zap")
let missing = option_none()

say is_ok(success)
say is_err(failure)
say is_some(value)
say unwrap_or(failure, 0)
say unwrap_or(missing, "default")
\`\`\`

The \`?\` operator propagates an error \`Result\` from the current function.

## Structured errors

\`\`\`zap
fn load_config():
    raise "configuration unavailable"

try:
    load_config()
catch error:
    say "handled: " + error
\`\`\`

A \`try\` block must be followed by a same-level \`catch <binding>:\` clause with an indented body. See [Structured Errors](#errors) for the full contract.

## Files, paths, time, and environment

\`\`\`zap
let path = path_join("data", "note.txt")
if exists(path):
    say read_text(path)
else:
    write_text(path, "Hello from Zap")

say now()
if has_env("PATH"):
    say env("PATH")
\`\`\`

Available helpers include \`read_text\`, \`write_text\`, \`read_lines\`, \`write_lines\`, \`basename\`, \`dirname\`, \`exists\`, \`sleep\`, \`env\`, \`has_env\`, \`abs\`, \`min\`, \`max\`, \`pow\`, and \`sqrt\`.

## Diagnostics and tests

\`\`\`zap
assert(1 + 1 == 2, "arithmetic failed")
\`\`\`

Test files conventionally use the \`_test.zp\` suffix. \`zap check --json\` emits structured diagnostics with fields such as \`kind\`, \`message\`, \`file\`, \`line\`, and \`column\`.
`,
};

const stdlib: DocPage = {
  slug: "stdlib",
  title: "Standard Library",
  description:
    "Public standard-library domains: text, math, collections, filesystem, web, json, system, time, logging, runtime, async, network, and process.",
  source: "docs/STDLIB_INDEX_EN.md",
  markdown: `Zap's standard library is organized into stable public domains. The runtime dispatch remains centralized for compatibility, while this domain index provides a deterministic public organization for documentation, tooling, and future package modules.

## Public modules

| Public module | Scope | Representative APIs |
|---|---|---|
| \`text\` | Text conversion and manipulation | \`len\`, \`str\`, \`type\`, \`upper\`, \`lower\`, \`trim\`, \`split\`, \`join\`, \`contains\`, \`replace\`, \`char_at\`, \`substring\`, \`codepoints\` |
| \`math\` | Numeric operations | \`abs\`, \`min\`, \`max\`, \`pow\`, \`sqrt\` |
| \`collections\` | Lists and maps | \`sum\`, \`range\`, \`keys\`, \`entries\`, \`enumerate\`, \`count\`, \`reverse\`, \`sort\`, \`get\` |
| \`filesystem\` | Bounded text, line, and Web asset I/O | \`read_text\`, \`write_text\`, \`read_lines\`, \`write_lines\`, \`exists\`, \`file_metadata\`, \`atomic_write\`, \`web_static\`, \`web_static_spa\` |
| \`web\` | Bounded typed request validation and Result-aware response boundary | \`web_validate_request\` |
| \`json\` | JSON serialization and runtime-category validation | \`json\`, \`from_json\`, \`from_json_typed\` |
| \`system\` | Environment, configuration, and paths | \`env\`, \`has_env\`, \`env_get\`, \`config_dir\`, \`config_path\`, \`path_join\`, \`basename\`, \`dirname\`, \`now\`, \`sleep\` |
| \`time\` | UTC timestamps and signed duration decomposition | \`utc_now\`, \`duration_parts\`, \`duration_between\` |
| \`logging\` | Deterministic structured log records and JSON lines | \`log_record\`, \`log_json\` |
| \`runtime\` | Assertions, bounded memory diagnostics, lifecycle counters, and capability reporting | \`assert\`, \`memory_stats\` |
| \`async\` | Deterministic executor-backed tasks, cancellation, timeout, and capability reporting | \`spawn\`, \`task_join\`, \`task_is_ready\`, \`task_cancel\`, \`task_join_timeout\`, \`async_capabilities\` |
| \`network\` | URL handling, bounded HTTP requests, and a local one-request server | \`url_parse\`, \`url_encode\`, \`url_decode\`, \`http_get\`, \`http_request\`, \`http_serve_once\` |
| \`process\` | Non-shell process execution | \`process_run\` |

## Bounded by design

All public builtins use explicit argument validation and return structured runtime errors rather than silently accepting invalid input.

- The \`runtime\` domain exposes \`assert(condition, message)\` for fail-fast validation and \`memory_stats()\` with live-object, allocation/deallocation, validation/cleanup lifecycle, logical budget, value-size-limit, and deferred-capability fields.
- Filesystem, JSON, and HTTP response operations use documented **8 MiB** safety limits.
- URL inputs are limited to **8 KiB**.
- \`process_run\` invokes a program directly **without shell interpretation**, accepts only a text command and list of text arguments, captures UTF-8 stdout/stderr, and rejects output larger than **1 MiB**.
- HTTP requests accept only \`http\` and \`https\` URLs and use bounded connect, read, and write timeouts.
- \`http_serve_once\` binds to \`127.0.0.1\`, serves exactly one HTTP request, and enforces a 64 KiB request limit, an 8 MiB response limit, and a 10-second wait limit.

## Worked example

\`\`\`zap
let endpoint = url_parse("https://example.com:8443/api?q=zap")
say endpoint["host"]
say url_encode("a b/c")

let result = process_run("printf", ["zap"])
say result["success"]
say result["stdout"]

let fallback = env_get("ZAP_OPTIONAL_SETTING", "default")
let settings = config_path("settings.json")

let current = utc_now()
let elapsed = duration_between(current["unix_millis"], current["unix_millis"] - 1500)
say elapsed["milliseconds"]

let event = log_record("info", "server started", {"port": 8080, "mode": "dev"})
say log_json(event["level"], event["message"], event["fields"])

# Bind to loopback, serve one request, then return request metadata.
let served = http_serve_once(8080, "Hello from Zap")
say served["path"]
\`\`\`

## Time and logging details

The \`time\` APIs use UTC and integer millisecond precision:

- \`utc_now()\` returns \`unix_seconds\` and \`unix_millis\`.
- \`duration_parts(milliseconds)\` returns signed \`days\`, \`hours\`, \`minutes\`, \`seconds\`, \`millis\`, and \`milliseconds\`.
- \`duration_between(end_millis, start_millis)\` decomposes the checked difference \`end_millis - start_millis\`. Overflow is reported as a runtime error rather than wrapping.

The \`logging\` APIs are **pure record builders**: \`log_record(level, message, fields)\` returns a map, while \`log_json(level, message, fields)\` returns one canonical JSON line with alphabetically ordered field names. Levels are limited to \`trace\`, \`debug\`, \`info\`, \`warn\`, and \`error\`; messages are limited to 8 KiB, fields to 64 entries, field names to 256 bytes, and encoded output to 64 KiB. These APIs do **not** write to process streams — applications choose their own sink, which keeps output deterministic.

## Stability

Every listed domain and builtin is cataloged as stable for the v2.11.7 development line with no active deprecation window, the release-target platform matrix, and an explicit schema-2 determinism class. Namespace import syntax and remote standard-library packages remain later ecosystem milestones after P1 verification.
`,
};

export const reference: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "reference",
    title: "Reference",
    icon: "BookText",
    pages: [
      { slug: "syntax-reference", title: "Syntax Reference" },
      { slug: "stdlib", title: "Standard Library" },
    ],
  },
  pages: [syntaxReference, stdlib],
};
