import type { DocSection, DocPage } from "../types";

const languageGuide: DocPage = {
  slug: "language-guide",
  title: "Language Guide",
  description:
    "The complete path from values and variables through functions, control flow, classes, inheritance, and explicit modules.",
  source: "docs/LEARN_ZAP_EN.md",
  markdown: `## Values and variables

Zap's core values are text, numbers (integers), booleans, lists, maps, objects, functions, and \`none\`. Typed \`result<T>\` and \`option<T>\` values are available at the checked boundary.

\`\`\`zap
let language = "Zap"
let version = 2
let ready = true
let empty = none
let tools = ["parser", "runtime", "lsp"]
let user = {"name": "Developer", "active": true}

say language
say version
say ready
say tools[0]
say user["name"]
\`\`\`

Use \`let\` for a new binding and ordinary assignment for an existing binding:

\`\`\`zap
let count = 1
count = count + 1
say count
\`\`\`

A binding annotation documents and checks the expected type:

\`\`\`zap
let name: text = "Zap"
let port: number = 8080
let enabled: bool = true
let tags: list<text> = ["language", "runtime"]
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

Integer overflow and division by zero are **checked runtime errors**.

### Precedence

Operators bind from strongest to weakest:

| Level | Operators | Associativity |
|---|---|---|
| 1 | grouping \`(...)\`, calls, indexing, member access | left-to-right |
| 2 | unary \`-\`, \`not\` | right-to-left |
| 3 | exponentiation and multiplicative arithmetic | left-to-right |
| 4 | additive arithmetic and concatenation | left-to-right |
| 5 | comparisons \`<\` \`<=\` \`>\` \`>=\` \`==\` \`!=\` | left-to-right |
| 6 | \`and\` | left-to-right with short-circuiting |
| 7 | \`or\` | left-to-right with short-circuiting |

Parentheses are the normative escape hatch for ambiguous intent.

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

\`if\`/\`else\`, \`while\`, and \`for\` execute in source order. A loop condition is evaluated before every iteration. \`for ... in <list>\` currently accepts a literal list only — general iterators are deferred.

## Functions

\`\`\`zap
fn add(a: number, b: number) -> number:
    return a + b

fn greet(name):
    return "Hello, " + name
\`\`\`

Function annotations use the form \`parameter: type\` and \`-> return_type\`. Nested functions can capture values from their enclosing scope (closures).

### Default parameters

Parameters may provide a default value with \`=\`. Zap currently binds arguments positionally: omitted parameters use their defaults, while supplied arguments override them.

\`\`\`zap
fn greet(name: text = "World", punctuation: text = "!"):
    return "Hello, " + name + punctuation

say greet()
say greet("Zap", ".")
\`\`\`

A function may mix required and defaulted parameters, but every required parameter must be supplied:

\`\`\`zap
fn create_user(username: text, role: text = "member"):
    return username + " (" + role + ")"

say create_user("may")
say create_user("may", "admin")
\`\`\`

### Named arguments and first-class callables

Named arguments are supported for function and method calls. Callable function names can be assigned to variables, passed to parameters annotated as \`function\`, returned from functions, and invoked through aliases.

\`\`\`zap
fn double(x: number) -> number:
    return x * 2

let apply = double
say apply(5)        # 10
\`\`\`

Callable values display as \`<callable>\` and serialize to the deterministic \`{"__zap_variant":"callable"}\` marker; the marker is intentionally not deserializable because it does not carry executable code.

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

Object fields use a documented single-threaded \`Rc<RefCell>\` ownership model. Cyclic object graphs require an explicit cycle-breaking operation before the owning graph is discarded. The runtime is not thread-safe by default; this boundary is intentional.

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

Zap supports explicit module declarations and deterministic imports. A module declaration records the logical name of a source file, while an import may provide a local alias:

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

The dotted import path maps to a \`.zp\` file below the module root. For example, \`import app.core as core\` resolves to \`modules/app/core.zp\` when the project manifest contains:

\`\`\`toml
[package]
name = "workspace-demo"
version = "0.1.0"
main = "main.zp"

[module]
root = "modules"
entries = ["app/core.zp"]
\`\`\`

Module roots and entries must be relative, entries must end in \`.zp\`, and each listed file must exist. Explicit imports reject absolute paths, separators, empty path components, and traversal. The resolver visits imported files in deterministic source order, caches completed nodes, and reports a stable \`circular module dependency\` diagnostic containing the complete cycle when a dependency loop is found.

Legacy \`use "file.zp"\` imports remain available for compatibility; new workspace code should prefer \`module\` and \`import ... as ...\`.

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

const resultOption: DocPage = {
  slug: "result-option",
  title: "Result & Option",
  description:
    "Structured success/failure and presence values with the ? propagation operator.",
  source: "docs/SYNTAX_GUIDE_EN.md",
  markdown: `## Result and Option

Zap models success/failure and presence as first-class values rather than exceptions or sentinels.

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

Construct a success with \`ok(...)\` or a failure with \`err(...)\`. Construct a present value with \`some(...)\` or an absent value with \`option_none()\`.

## The \`?\` operator

The \`?\` operator propagates an error \`Result\` from the current function:

\`\`\`zap
fn read_value() -> result<any>:
    return err("not available")

fn use_value() -> result<any>:
    let value = read_value()?
    return ok(value)
\`\`\`

If \`read_value()\` returns an \`err\`, the \`?\` operator immediately returns that error from \`use_value()\`. If it returns \`ok\`, the inner value is unwrapped and bound to \`value\`.

## Safe access

| Helper | Behavior |
|---|---|
| \`is_ok(r)\` | True when \`r\` is \`ok\` |
| \`is_err(r)\` | True when \`r\` is \`err\` |
| \`is_some(o)\` | True when \`o\` is \`some\` |
| \`unwrap_or(v, default)\` | Inner value or a fallback |

\`\`\`zap
fn divide(a: number, b: number) -> result<number>:
    if b == 0:
        return err("division by zero")
    return ok(a / b)

let r = divide(10, 2)
if is_ok(r):
    say unwrap_or(r, 0)
else:
    say "could not divide"
\`\`\`

Use \`Result\` and \`Option\` at the boundaries of your program — I/O, parsing, external calls — and keep normal control flow in \`if\`/\`for\`/\`while\`. \`raise\`/\`try\`/\`catch\` is available for genuinely exceptional runtime paths; see [Errors](#errors).
`,
};

const errors: DocPage = {
  slug: "errors",
  title: "Structured Errors",
  description: "raise, try, and catch for deterministic exceptional control flow.",
  source: "docs/SYNTAX_GUIDE_EN.md",
  markdown: `## \`raise\`, \`try\`, and \`catch\`

Zap supports deterministic structured control flow for exceptional runtime paths. \`raise <expression>\` evaluates the expression and immediately propagates its value through the current function, loop, and module boundary until a matching \`try\`/\`catch\` handles it. A bare \`raise\` is rejected during parsing with \`raise expects an expression\`.

\`\`\`zap
fn load_config():
    raise "configuration unavailable"

try:
    load_config()
catch error:
    say "handled: " + error
\`\`\`

A \`try\` block must be followed by a same-level \`catch <binding>:\` clause with an indented body. The raised value is bound to the catch name, which may shadow an existing variable only for the catch body; the previous value is restored afterward.

## Re-raising

If the catch body executes \`raise\` again, the new or original value continues outward:

\`\`\`zap
let error = "outer"
try:
    try:
        raise {"code": 503, "message": "offline"}
    catch error:
        say error["code"]
        raise error
catch error:
    say error["message"]

say error # outer
\`\`\`

## Control-flow preservation

Catch blocks also preserve normal control flow:

- They do **not** execute when the \`try\` body completes normally.
- \`return\`, \`break\`, and \`continue\` from a catch body retain their usual enclosing-function or enclosing-loop behavior.

At the process boundary, an uncaught value is reported deterministically as \`raised error: <value>\`.

## Result vs. raise

Use \`Result\`/\`Option\` for **expected** outcomes (a file may not exist, a number may not parse). Use \`raise\`/\`try\`/\`catch\` for **unexpected** runtime failures that should abort a computation and be handled at a higher boundary. Both are deterministic; neither uses hidden exceptions or panics.
`,
};

const asyncPage: DocPage = {
  slug: "async",
  title: "Async & Tasks",
  description:
    "async fn, await, executor-backed ScheduledFuture handles, cooperative cancellation, and deterministic poll budgets.",
  source: "docs/SYNTAX_GUIDE_EN.md",
  markdown: `## Async functions and await

Prefix a function declaration with \`async\` to return a deterministic \`Future\`. Use \`await\` to unwrap the completed result:

\`\`\`zap
async fn load() -> number:
    return 7

let pending = load()
let value: number = await pending
say value
\`\`\`

\`await\` is an expression and may also be applied directly to a call:

\`\`\`zap
async fn answer() -> number:
    return 42

say (await answer()) + 1
\`\`\`

## Deterministic executor

The current runtime executes async bodies deterministically and does **not** create background threads. Language async results are executor-backed \`ScheduledFuture\` handles owned by the current run.

> This language scheduler is **not** a production I/O reactor. Deterministic timers, task budgets, and suspension controls remain supported. See [Async Boundaries](#async-boundaries) for the production boundary contract.

## Cancellation and timeouts

Use \`task_cancel(handle)\` for cooperative cancellation, \`task_join(handle)\` to consume a result, and \`task_join_timeout(handle, poll_budget)\` to enforce a deterministic poll budget:

\`\`\`zap
async fn load() -> number:
    return 7

let handle = load()
say task_is_ready(handle)        # false before executor polling
say task_join_timeout(handle, 1) # 7
\`\`\`

A cancelled join reports a deterministic \`Cancelled\` failure, while an exhausted poll budget reports \`TimedOut\`.

## Capability reporting

\`async_capabilities()\` reports which work is deterministic, worker-backed, bounded, cancellable, deferred, or unsupported; it reports runtime-state scheduling, cooperative language cancellation, and poll-budget timeouts, while typed resource-limit preflight remains enforced and does not start any worker, network, or process operation.

\`\`\`zap
say async_capabilities()
\`\`\`

## Other task helpers

| Helper | Behavior |
|---|---|
| \`spawn\` | Schedule a new deterministic task |
| \`task_join(handle)\` | Consume a task's result |
| \`task_is_ready(handle)\` | Observe readiness without polling |
| \`task_cancel(handle)\` | Cooperatively cancel a task |
| \`task_join_timeout(handle, budget)\` | Enforce a deterministic poll budget |

For the full executor and editor-protocol details, see the [Async/LSP guide](https://github.com/hidecard/zap/blob/master/docs/ASYNC_LSP_EN.md).
`,
};

export const language: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "language",
    title: "Language",
    icon: "Code2",
    pages: [
      { slug: "language-guide", title: "Language Guide" },
      { slug: "result-option", title: "Result & Option" },
      { slug: "errors", title: "Structured Errors" },
      { slug: "async", title: "Async & Tasks" },
    ],
  },
  pages: [languageGuide, resultOption, errors, asyncPage],
};
