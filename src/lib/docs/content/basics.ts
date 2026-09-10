import type { DocSection, DocPage } from "../types";

const valuesTypes: DocPage = {
  slug: "basics-values",
  title: "Values & Types",
  description:
    "Zap's core value categories — text, number, bool, list, map, object, function, and none — and how to read them on the page.",
  source: "docs/LEARN_ZAP_EN.md",
  markdown: `## The core values

Zap's core values are **text, numbers (integers), booleans, lists, maps, objects, functions, and \`none\`**. Typed \`result<T>\` and \`option<T>\` values are available at the checked boundary.

\`\`\`zap
let language = "Zap"          # text
let version = 2               # number (integer)
let ready = true              # bool
let empty = none              # none
let tools = ["parser", "runtime", "lsp"]   # list
let user = {"name": "Dev", "active": true} # map
\`\`\`

Use \`say\` to print any value to the terminal:

\`\`\`zap
say language
say version
say ready
say tools[0]
say user["name"]
\`\`\`

## What each type looks like

| Type | Literal example | Notes |
|---|---|---|
| \`text\` | \`"Zap"\` | UTF-8 strings; \`+\` concatenates |
| \`number\` | \`42\`, \`7\` | Integers only; overflow is a checked error |
| \`bool\` | \`true\`, \`false\` | The two boolean literals |
| \`list\` | \`[1, 2, 3]\` | Ordered, zero-indexed |
| \`map\` | \`{"k": "v"}\` | Text-or-compatible keys, bracket lookup |
| \`object\` | \`new("User", "Zap")\` | Created from a \`class\` |
| \`function\` | \`fn add(a, b): return a + b\` | First-class callable |
| \`none\` | \`none\` | The absence of a value |

## Inspecting a value

Use \`type()\` to read the runtime category of any value, and \`str()\` to convert a value to text:

\`\`\`zap
say type(42)          # "number"
say type("Zap")       # "text"
say type([1, 2])      # "list"
say str(42)           # "42"
\`\`\`

## Truthiness

Zap does **not** implicitly coerce values to booleans. Conditions in \`if\` and \`while\` must produce a \`bool\`:

\`\`\`zap
if true:
    say "explicit boolean"

let flag = 1
# if flag:    # ERROR: not a bool
if flag == 1: # OK
    say "compared explicitly"
\`\`\`

This is a deliberate design choice: explicit booleans make code easier to read and harder to misread.

## What's next

Now that you know what a value looks like, learn how to bind names to them in [Variables & Assignment](#basics-variables), and how to combine them in [Operators & Expressions](#basics-operators).
`,
};

const variables: DocPage = {
  slug: "basics-variables",
  title: "Variables & Assignment",
  description:
    "Bind a name with let, reassign existing bindings, and add optional type annotations that zap check verifies.",
  source: "docs/LEARN_ZAP_EN.md",
  markdown: `## Binding a name

Use \`let\` to create a new binding:

\`\`\`zap
let name = "Zap"
let port = 8080
let tags = ["language", "runtime"]
\`\`\`

Use ordinary assignment (no keyword) to change an **existing** binding:

\`\`\`zap
let count = 1
count = count + 1
say count     # 2
\`\`\`

\`let\` introduces a name. Reassigning with \`let\` is not allowed — use plain assignment instead.

## Optional type annotations

A binding annotation documents and checks the expected type:

\`\`\`zap
let name: text = "Zap"
let port: number = 8080
let enabled: bool = true
let tags: list<text> = ["language", "runtime"]
let scores: list<number> = [10, 20, 30]
let response: map<text, number> = {"status": 200}
\`\`\`

Available annotation names include \`text\`, \`number\`, \`bool\`, \`list\`, \`map\`, \`function\`, \`none\`, and \`any\`.

The \`function\` annotation describes a first-class callable value:

\`\`\`zap
let double: function = fn (x: number) -> number:
    return x * 2
\`\`\`

## The \`any\` escape hatch

\`any\` is an explicit annotation that opts out of static checking at that binding. It does **not** imply runtime coercion — the original value is preserved:

\`\`\`zap
let payload: any = read_text("config.json")
\`\`\`

Use \`any\` sparingly: at the boundary with external data (JSON, files, network) it is reasonable; in your own logic, prefer a precise annotation.

## What \`zap check\` catches

\`zap check\` reports known annotation mismatches before execution where sufficient information is available. This is invalid because the value is text, not a number:

\`\`\`zap
let port: number = "8080"   # TypeError: expected number, got text
\`\`\`

Run \`zap check .\` before running a project — it catches annotation, argument, return-value, and collection-element mismatches early.

## Scope

A binding is visible from the point of its \`let\` to the end of the enclosing block, function, or module. Inner blocks can read outer bindings:

\`\`\`zap
let total = 0
for n in [1, 2, 3]:
    total = total + n   # writes to the outer binding
say total               # 6
\`\`\`

A nested \`let\` with the same name shadows the outer name **inside that block only** — the outer binding is unchanged after the block ends.
`,
};

const comments: DocPage = {
  slug: "basics-comments",
  title: "Comments",
  description: "Use # for line comments. Comments run to the end of the line and are ignored by the parser.",
  source: "docs/SYNTAX_GUIDE_EN.md",
  markdown: `## Line comments

Comments begin with \`#\` and continue to the end of the line. The parser ignores them:

\`\`\`zap
# This whole line is a comment.
say "This statement runs"   # trailing comment
\`\`\`

## What comments are for

- Explain **why**, not what. The code already shows what it does.
- Leave context that a future reader (or you, in six months) will need.
- Mark TODOs and follow-ups explicitly.

\`\`\`zap
# TODO: replace with a real adapter when the postgres contract lands
let url = "sqlite://data/zap.sqlite3"
\`\`\`

## What comments are not

- Block comments (\`/* ... */\`) are **not** supported. Use multiple \`#\` lines.
- Comments inside string literals are literal text, not comments:

\`\`\`zap
say "the # here is part of the text"
\`\`\`

## Commenting out code

\`\`\`zap
# say "temporarily disabled"
say "this runs"
\`\`\`

Prefer deleting dead code and relying on version control rather than leaving long blocks commented out. \`zap fmt\` and \`zap lint\` can help you keep source clean.
`,
};

const operators: DocPage = {
  slug: "basics-operators",
  title: "Operators & Expressions",
  description:
    "Arithmetic, comparison, and boolean operators — plus precedence, short-circuiting, and the checked runtime errors you can hit.",
  source: "docs/LEARN_ZAP_EN.md",
  markdown: `## The operator table

| Operators | Meaning |
|---|---|
| \`+\`, \`-\`, \`*\`, \`/\`, \`%\` | Arithmetic; \`+\` also joins text where applicable |
| \`==\`, \`!=\`, \`<\`, \`<=\`, \`>\`, \`>=\` | Comparison |
| \`and\`, \`or\`, \`not\` | Boolean logic with short-circuiting |
| \`(...)\` | Grouping |
| \`[]\` | List/map indexing |
| \`.\` | Member access and method calls |

\`\`\`zap
let total = (10 + 5) * 2
let remainder = 17 % 4
let message = "total=" + str(total)
let allowed = total >= 20 and not false

say total
say remainder
say message
say allowed
\`\`\`

## Precedence (strongest to weakest)

| Level | Operators | Associativity |
|---|---|---|
| 1 | grouping \`(...)\`, calls, indexing, member access | left-to-right |
| 2 | unary \`-\`, \`not\` | right-to-left |
| 3 | exponentiation and multiplicative arithmetic | left-to-right |
| 4 | additive arithmetic and concatenation | left-to-right |
| 5 | comparisons \`<\` \`<=\` \`>\` \`>=\` \`==\` \`!=\` | left-to-right |
| 6 | \`and\` | left-to-right with short-circuiting |
| 7 | \`or\` | left-to-right with short-circuiting |

Parentheses are the normative escape hatch for ambiguous intent. When in doubt, parenthesize.

## Short-circuiting

Boolean operators short-circuit — the right-hand operand is **not** evaluated when the left already determines the result:

\`\`\`zap
let enabled = false
if enabled and expensive_check():
    say "this branch is not reached"
\`\`\`

Because \`enabled\` is \`false\`, \`and\` stops immediately and \`expensive_check()\` is never called. Use this for cheap guards:

\`\`\`zap
if list and len(list) > 0:
    say list[0]
\`\`\`

## Text concatenation

\`+\` joins text where both operands are text. To concatenate a non-text value, convert it explicitly with \`str()\`:

\`\`\`zap
let total = 12
say "total=" + str(total)   # "total=12"
\`\`\`

## Checked runtime errors

The following are **checked runtime errors**, not silent fallbacks:

- Integer overflow
- Division by zero
- Invalid indexing (index out of range)
- Invalid member access

They are reported through the structured diagnostic contract, not as undocumented Rust panics or unstable strings.

\`\`\`zap
let x = 1 / 0           # runtime error: division by zero
let list = [1, 2, 3]
say list[10]            # runtime error: index out of range
\`\`\`

## Comparison examples

\`\`\`zap
say 3 == 3             # true
say 3 != 4             # true
say 3 < 4              # true
say 3 <= 3             # true
say "a" == "a"         # true (text equality by value)
\`\`\`

## Negation

\`not\` inverts a boolean; unary \`-\` negates a number:

\`\`\`zap
say not true           # false
say -5                 # -5
say -(2 + 3)           # -5
\`\`\`
`,
};

const statements: DocPage = {
  slug: "basics-statements",
  title: "say & Statements",
  description:
    "The statement forms you will use every day: say, assignment, return, expression statements, and how blocks are delimited by indentation.",
  source: "docs/LEARN_ZAP_EN.md",
  markdown: `## Statements and lines

Statements are normally separated by **new lines**. Zap does **not** require semicolons for ordinary statements:

\`\`\`zap
let name = "Zap"
say name
name = name + "!"
say name
\`\`\`

## \`say\` — print a value

\`say\` writes a value to the terminal:

\`\`\`zap
say "Hello from Zap"
say 42
say true
say [1, 2, 3]
say {"name": "Zap"}
\`\`\`

\`say\` is the primary way to observe a value during development and in scripts. For structured logs, prefer the \`logging\` domain (\`log_record\`, \`log_json\`) — see [Standard Library](#stdlib).

## Assignment statements

A binding introduced with \`let\` can be reassigned with plain assignment:

\`\`\`zap
let count = 0
count = count + 1
count = count + 1
say count   # 2
\`\`\`

## \`return\` — exit a function

\`return\` exits the current function only. A bare \`return\` returns \`none\`:

\`\`\`zap
fn maybe(limit: number):
    if limit <= 0:
        return          # returns none
    say "got " + str(limit)
\`\`\`

A function without an explicit \`return\` produces \`none\`:

\`\`\`zap
fn hello():
    say "hi"

let result = hello()
say result              # none
say type(result)        # "none"
\`\`\`

## Expression statements

Any expression may appear as a statement on its own line. The most common case is calling a function for its side effect:

\`\`\`zap
say "hello"
assert(1 + 1 == 2, "arithmetic failed")
\`\`\`

## Blocks and indentation

Blocks begin after a colon and are delimited by **indentation**. Four spaces per level are recommended:

\`\`\`zap
if true:
    say "inside the block"
say "outside the block"
\`\`\`

Do **not** mix indentation styles within one block. Parser diagnostics identify malformed indentation and missing block bodies instead of allowing an uncontrolled runtime failure.

## A complete small program

\`\`\`zap
# hello.zp
let name = "Zap"

fn greet(who: text) -> text:
    return "Hello, " + who

say greet(name)
for item in ["web", "ai", "iot"]:
    say item
\`\`\`

Run it with:

\`\`\`bash
zap hello.zp
\`\`\`
`,
};

const conditionals: DocPage = {
  slug: "basics-conditionals",
  title: "if & if-else",
  description:
    "Conditional execution with if, else, nesting, and the explicit-boolean rule.",
  source: "docs/LEARN_ZAP_EN.md",
  markdown: `## \`if\`

\`if\` runs its block only when its condition is true. The condition must produce a \`bool\`:

\`\`\`zap
let score = 85

if score >= 80:
    say "Excellent"
\`\`\`

## \`if\` / \`else\`

\`else\` runs when the condition is false:

\`\`\`zap
let score = 85

if score >= 80:
    say "Excellent"
else:
    say "Keep practising"
\`\`\`

## Nesting

\`if\` blocks can contain other \`if\` blocks. Indentation defines the nesting:

\`\`\`zap
let score = 75

if score >= 80:
    say "Excellent"
else:
    if score >= 60:
        say "Good"
    else:
        say "Keep practising"
\`\`\`

## Chained comparisons (no \`elif\`)

Zap does **not** have an \`elif\` / \`else if\` keyword. Chain conditions by nesting, or by returning early from a function:

\`\`\`zap
fn grade(score: number) -> text:
    if score >= 80:
        return "A"
    if score >= 60:
        return "B"
    if score >= 40:
        return "C"
    return "F"

say grade(85)   # "A"
say grade(55)   # "C"
say grade(20)   # "F"
\`\`\

The early-return style is usually clearer than deep nesting.

## Conditions must be booleans

Zap does **not** implicitly coerce values to booleans. \`if 1:\` is an error — write \`if 1 == 1:\` instead:

\`\`\`zap
let flag = 1

# if flag:          # ERROR: not a bool
if flag == 1:       # OK
    say "compared explicitly"
\`\`\

## Combining conditions

Combine conditions with \`and\`, \`or\`, and \`not\` (see [Operators](#basics-operators)). They short-circuit, so cheap checks should come first:

\`\`\`zap
let items = []
if is_empty(items) or len(items) == 0:
    say "nothing to do"
\`\`\

## What \`if\` is not

- \`if\` is a **statement**, not an expression. You cannot write \`let x = if cond: 1 else: 2\` — use a function with \`return\` instead.
- \`if\` does not return a value. A branch that should produce a value must \`return\` it from a function.
`,
};

const loops: DocPage = {
  slug: "basics-loops",
  title: "Loops: for & while",
  description: "Iterate over a list or range with for, repeat while a condition holds with while, and control iteration with break and continue.",
  source: "docs/LEARN_ZAP_EN.md",
  markdown: `## \`for\` — iterate a list or range

\`for\` iterates over a list or a \`range()\`:

\`\`\`zap
for item in ["web", "ai", "iot"]:
    say item

for number in range(3):
    say number        # 0, 1, 2
\`\`\

\`for ... in <list>\` currently accepts a **literal list** (or a value that produces one). General iterators are a deferred design gate.

## \`range()\`

\`range(n)\` produces \`[0, 1, ..., n-1]\`. It is the standard way to drive a counted loop:

\`\`\`zap
for i in range(5):
    say "iteration " + str(i)
\`\`\

## \`while\` — repeat while a condition holds

\`while\` re-evaluates its condition before every iteration:

\`\`\`zap
let count = 0
while count < 3:
    say count
    count = count + 1
\`\`\

Output:

\`\`\`text
0
1
2
\`\`\

## \`break\` — stop a loop

\`break\` exits the enclosing \`for\` or \`while\` immediately:

\`\`\`zap
for number in range(10):
    if number == 5:
        break
    say number
\`\`\

Prints \`0 1 2 3 4\` and stops.

## \`continue\` — skip the rest of this iteration

\`continue\` jumps to the next iteration of the enclosing loop:

\`\`\`zap
for number in range(10):
    if number == 2:
        continue
    if number == 5:
        break
    say number
\`\`\

Prints \`0 1 3 4\` — \`2\` is skipped by \`continue\`, and the loop stops at \`5\` because of \`break\`.

## Looping over a map

Maps do not have a built-in \`for ... in map\` form yet. Use \`keys()\` and index lookup:

\`\`\`zap
let scores = {"alice": 90, "bob": 85}
for name in keys(scores):
    say name + ": " + str(scores[name])
\`\`\

## Bounded loops

Zap applies bounded loop and execution limits. A loop that never terminates is **not** a valid production strategy — redesign it around a finite collection, a bounded counter, or an explicit external service boundary.

\`\`\`zap
# Bad: unbounded
let i = 0
while true:
    i = i + 1

# Good: bounded
let i = 0
while i < 1000:
    i = i + 1
\`\`\

## Patterns

### Filtered iteration

\`\`\`zap
let numbers = [1, 2, 3, 4, 5]
let evens = []
for n in numbers:
    if n % 2 == 0:
        evens = append(evens, n)
say evens     # [2, 4]
\`\`\

### Accumulation

\`\`\`zap
let total = 0
for n in [10, 20, 30]:
    total = total + n
say total     # 60
\`\`\

### Searching (early exit)

\`\`\`zap
fn find_first_odd(items):
    for n in items:
        if n % 2 == 1:
            return n
    return none

say find_first_odd([2, 4, 7, 8])   # 7
\`\`\

## What's next

Loops plus [conditionals](#basics-conditionals) cover most everyday control flow. For reusable blocks of logic, see [Functions](#basics-functions).
`,
};

const functions: DocPage = {
  slug: "basics-functions",
  title: "Functions",
  description:
    "Declare functions with fn, annotate parameters and returns, give parameters defaults, call with named arguments, and capture state with closures.",
  source: "docs/LEARN_ZAP_EN.md",
  markdown: `## Declaring a function

Declare functions with \`fn\`. Parameters and return values may be annotated:

\`\`\`zap
fn add(a: number, b: number) -> number:
    return a + b

fn greet(name: text) -> text:
    return "Hello, " + name

say add(4, 6)       # 10
say greet("Zap")    # "Hello, Zap"
\`\`\

A function without an explicit \`return\` produces \`none\`.

## Default arguments

A parameter can provide a default value with \`=\`:

\`\`\`zap
fn greet(name: text = "World", punctuation: text = "!") -> text:
    return "Hello, " + name + punctuation

say greet()             # "Hello, World!"
say greet("Zap")        # "Hello, Zap!"
say greet("Zap", ".")   # "Hello, Zap."
\`\`\

A function may mix required and defaulted parameters, but **every required parameter must be supplied**:

\`\`\`zap
fn create_user(username: text, role: text = "member") -> text:
    return username + " (" + role + ")"

say create_user("may")            # "may (member)"
say create_user("may", "admin")   # "may (admin)"
\`\`\

## Named arguments

Named arguments are useful when a function has several optional parameters:

\`\`\`zap
fn connect(host: text, port: number = 8080, secure: bool = true):
    return {"host": host, "port": port, "secure": secure}

let local = connect("localhost", secure = false)
say local["port"]    # 8080
say local["secure"]  # false
\`\`\

Rules:
- Required parameters must be supplied.
- Duplicate, unknown, or multiply supplied arguments are errors.
- Defaults are evaluated when the corresponding argument is omitted.

## First-class callables

A function name is a **first-class callable value**. It may be assigned, passed, returned, and invoked through an alias:

\`\`\`zap
fn double(value: number) -> number:
    return value * 2

let operation = double
say operation(7)     # 14

fn apply(fn: function, x: number) -> number:
    return fn(x)

say apply(double, 5) # 10
\`\`\

Callable values display as \`<callable>\` and serialize to the deterministic \`{"__zap_variant":"callable"}\` marker; the marker is intentionally not deserializable because it does not carry executable code.

## Closures

A nested function can read a binding from its enclosing function:

\`\`\`zap
fn make_greeting(prefix: text):
    fn greet(name: text) -> text:
        return prefix + ", " + name
    return greet

let say_hello = make_greeting("Hello")
say say_hello("Developer")   # "Hello, Developer"
\`\`\

Closures use parent-linked lexical frames. Keep captured state small and explicit. Object and callable cycles are subject to the runtime's bounded memory and explicit cycle policy rather than an automatic garbage collector.

## Recursion

A function may call itself. Use it for naturally recursive problems; use a loop for plain repetition:

\`\`\`zap
fn factorial(n: number) -> number:
    if n <= 1:
        return 1
    return n * factorial(n - 1)

say factorial(5)     # 120
\`\`\

## The \`?\` operator for early error return

Inside a function returning \`result<T>\`, the \`?\` operator propagates an error \`Result\` from the current function:

\`\`\`zap
fn load_user() -> result<map>:
    return err("user not found")

fn profile() -> result<map>:
    let user = load_user()?
    return ok(user)
\`\`\

See [Result & Option](#result-option) for the full contract.

## What's next

Functions plus [Loops](#basics-loops) and [Conditionals](#basics-conditionals) cover everyday imperative programming. To bundle state with behavior, see [Classes & Objects](#basics-classes).
`,
};

const classesObjects: DocPage = {
  slug: "basics-classes",
  title: "Classes & Objects",
  description:
    "Define classes with init and methods, instantiate with new, inherit with extends, and override methods.",
  source: "docs/LEARN_ZAP_EN.md",
  markdown: `## A simple class

Zap supports classes, fields, methods, initialization, and inheritance:

\`\`\`zap
class User:
    fn init(self, name: text):
        self.name = name

    fn greet(self) -> text:
        return "Hello, " + self.name

let user = new("User", "Zap")
say user.greet()     # "Hello, Zap"
\`\`\

## \`init\` and \`self\`

\`init\` is the constructor. The first parameter is conventionally named \`self\` and refers to the new instance. Assign to \`self.<field>\` to set fields:

\`\`\`zap
class Point:
    fn init(self, x: number, y: number):
        self.x = x
        self.y = y

    fn describe(self) -> text:
        return "(" + str(self.x) + ", " + str(self.y) + ")"

let p = new("Point", 3, 4)
say p.describe()    # "(3, 4)"
say p.x              # 3
\`\`\

## Methods

Methods are functions declared inside a class. They always take \`self\` as the first parameter and are called on an instance with \`.\`:

\`\`\`zap
class Counter:
    fn init(self):
        self.count = 0

    fn bump(self):
        self.count = self.count + 1
        return self.count

let c = new("Counter")
say c.bump()   # 1
say c.bump()   # 2
\`\`\

## Inheritance with \`extends\`

\`extends\` declares that a class inherits from another. Methods can be overridden:

\`\`\`zap
class Animal:
    fn speak(self) -> text:
        return "sound"

class Dog extends Animal:
    fn speak(self) -> text:
        return "woof"

let dog = new("Dog")
say dog.speak()    # "woof"
\`\`\

## Constructor and field contract

Constructors and inherited initialization must follow the current constructor contract. Use **explicit** fields and methods instead of relying on undocumented dynamic properties. Object fields are managed through the runtime's checked object boundary; invalid field access is a typed error rather than a Rust panic.

\`\`\`zap
let u = new("User", "Zap")
say u.name        # "Zap" — declared in init
say u.missing     # typed error: invalid field access
\`\`\

## Object identity and ownership

Object fields use a documented single-threaded \`Rc<RefCell>\` ownership model. Cyclic object graphs require an **explicit** cycle-breaking operation before the owning graph is discarded. The runtime is not thread-safe by default; this boundary is intentional.

## What's not enabled yet

Traits and composition have a reviewed design direction but are **not** enabled as a complete user-defined syntax in the current release. Prefer classes, modules, functions, and explicit composition until the language specification enables that feature.

## What's next

You now have values, variables, operators, statements, conditionals, loops, functions, and classes. To organize code across files, see [Modules & Imports](#language-guide) in the Language Guide.
`,
};

const collections: DocPage = {
  slug: "basics-collections",
  title: "Lists, Maps & JSON",
  description:
    "Index lists, look up maps, use the collection helpers, and convert to and from JSON explicitly.",
  source: "docs/LEARN_ZAP_EN.md",
  markdown: `## Lists

List indexes start at **zero**. Use \`len()\` for the length and \`[]\` to read an element:

\`\`\`zap
let languages = ["Zap", "Rust", "Go"]
say languages[0]       # "Zap"
say len(languages)     # 3
\`\`\

Append to a list with \`append()\`:

\`\`\`zap
let numbers = [1, 2, 3]
numbers = append(numbers, 4)
say numbers            # [1, 2, 3, 4]
\`\`\

## Maps

Maps use text (or compatible) keys and bracket lookup:

\`\`\`zap
let profile = {"name": "Zap User", "age": 20, "active": true}
say profile["name"]       # "Zap User"
say profile["active"]     # true
say keys(profile)         # ["name", "age", "active"]
\`\`\

## Collection helpers

| Helper | Purpose |
|---|---|
| \`len(x)\` | Length of a list or map |
| \`contains(x, v)\` | True if \`x\` contains \`v\` |
| \`get(x, k)\` | Safe lookup |
| \`is_empty(x)\` | True if empty |
| \`sum(list)\` | Sum of a numeric list |
| \`reverse(list)\` | A reversed copy |
| \`sort(list)\` | A sorted copy |
| \`join(list, sep)\` | Concatenate a text list with a separator |
| \`keys(map)\` | The keys of a map |
| \`entries(map)\` | Key/value pairs |
| \`enumerate(list)\` | Index/value pairs |
| \`count(list)\` | Number of elements |

\`\`\`zap
let scores = [80, 45, 90]
say sum(scores)              # 215
say sort(scores)             # [45, 80, 90]
say reverse(scores)          # [90, 45, 80]
say contains(scores, 45)     # true

let words = ["a", "b", "c"]
say join(words, "-")         # "a-b-c"
\`\`\

## Typed collections

Use bounded generic annotations to document the element type:

\`\`\`zap
let scores: list<number> = [10, 20, 30]
let response: map<text, number> = {"status": 200}
\`\`\

\`zap check\` validates the declared element type where the implementation has enough information.

## JSON

JSON conversion is **explicit**. \`json()\` encodes a value; \`from_json()\` decodes text back to a value:

\`\`\`zap
let profile = {"name": "Zap", "active": true}
let encoded = json(profile)
let decoded = from_json(encoded)

say encoded              # '{"active":true,"name":"Zap"}'
say decoded["name"]      # "Zap"
\`\`\

For typed payload checks, use \`from_json_typed()\`:

\`\`\`zap
let decoded = from_json_typed('{"port": 8080}', {"port": "number"})
say decoded["port"]      # 8080
\`\`\

## What JSON cannot do

- JSON serialization is bounded and cycle-safe. A cyclic object graph **cannot** be serialized as an infinite structure.
- Callable values serialize to a deterministic marker but are intentionally not deserializable as executable code.

## Common patterns

### Build a map from a list

\`\`\`zap
let pairs = [["a", 1], ["b", 2]]
let m = {}
for pair in pairs:
    m[pair[0]] = pair[1]
say m            # {"a": 1, "b": 2}
\`\`\

### Iterate a map's entries

\`\`\`zap
let scores = {"alice": 90, "bob": 85}
for entry in entries(scores):
    say entry[0] + ": " + str(entry[1])
\`\`\

## What's next

You have now seen every core building block: values, variables, operators, statements, conditionals, loops, functions, classes, and collections. Continue to the [Language Guide](#language-guide) for the complete reference, or jump to [Examples](#examples) for runnable programs.
`,
};

export const basics: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "basics",
    title: "Basics",
    icon: "GraduationCap",
    pages: [
      { slug: "basics-values", title: "Values & Types" },
      { slug: "basics-variables", title: "Variables & Assignment" },
      { slug: "basics-comments", title: "Comments" },
      { slug: "basics-operators", title: "Operators & Expressions" },
      { slug: "basics-statements", title: "say & Statements" },
      { slug: "basics-conditionals", title: "if & if-else" },
      { slug: "basics-loops", title: "Loops: for & while" },
      { slug: "basics-functions", title: "Functions" },
      { slug: "basics-classes", title: "Classes & Objects" },
      { slug: "basics-collections", title: "Lists, Maps & JSON" },
    ],
  },
  pages: [
    valuesTypes,
    variables,
    comments,
    operators,
    statements,
    conditionals,
    loops,
    functions,
    classesObjects,
    collections,
  ],
};
