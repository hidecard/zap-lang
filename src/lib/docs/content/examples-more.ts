import type { DocSection, DocPage } from "../types";

const moreExamples: DocPage = {
  slug: "examples-more",
  title: 'More Examples',
  description: 'Larger runnable programs: a report builder, a CLI argument parser, JSON processing, an HTTP echo, and a complete small app.',
  source: "docs/LEARN_ZAP_EN.md",
  markdown: `These are larger, self-contained Zap programs that combine values, functions, collections, JSON, conditions, and assertions. Save any of them as a \`.zp\` file and run with \`zap <file>.zp\`.

## Report builder

This program combines typed functions, collections, JSON, conditions, and assertions:

\`\`\`zap
fn describe(name: text, score: number) -> map:
    return {
        "name": name,
        "score": score,
        "passed": score >= 50
    }

let students = [
    describe("Aye", 80),
    describe("Min", 45)
]

let report = {
    "language": "Zap",
    "students": students,
    "count": len(students)
}

assert(report["count"] == 2, "student count is wrong")
say json(report)
\`\`\`

Save it as \`main.zp\`, then run:

\`\`\`bash
zap fmt main.zp
zap check .
zap run main.zp
\`\`\`

## A small CLI

Read arguments from the environment, parse a number, and print a result. Zap does not yet expose \`argv\` directly; emulate a CLI with environment variables:

\`\`\`zap
fn double(x: number) -> number:
    return x * 2

let raw = env_get("ZAP_INPUT", "21")
let value = from_json_typed(raw, "number")

say "input:  " + str(value)
say "double: " + str(double(value))
\`\`\`

Run it with:

\`\`\`bash
ZAP_INPUT=42 zap run cli.zp
\`\`\`

## JSON processing

Parse a JSON document, transform it, and re-encode:

\`\`\`zap
let raw = '{"users":[{"name":"Aye","score":80},{"name":"Min","score":45}]}'
let doc = from_json_typed(raw, "list")

let passed = []
for user in doc:
    if user["score"] >= 50:
        passed = append(passed, user["name"])

say json({"passed": passed, "count": len(passed)})
\`\`\`

Output:

\`\`\`text
{"count":1,"passed":["Aye"]}
\`\`\`

## HTTP echo

Serve exactly one local HTTP request and return its metadata:

\`\`\`zap
say "listening on http://127.0.0.1:8080 ..."
let served = http_serve_once(8080, "Hello from Zap")
say served["method"]     # "GET"
say served["path"]       # "/"
say served["headers"]
\`\`\`

In another terminal:

\`\`\`bash
curl http://127.0.0.1:8080/
\`\`\`

\`http_serve_once\` binds to \`127.0.0.1\`, serves **exactly one** request, enforces a 64 KiB request limit, an 8 MiB response limit, and a 10-second wait limit.

## Structured log line

Build a deterministic structured log line and emit it:

\`\`\`zap
let now = utc_now()
let line = log_json("info", "request completed", {
    "method": "GET",
    "path": "/api/tasks",
    "status": 200,
    "duration_ms": 12,
    "unix_millis": now["unix_millis"]
})
say line
\`\`\`

Field names are sorted alphabetically and the output is a single JSON line — ready for any log aggregator that parses JSON.

## A recursive function

\`\`\`zap
fn factorial(n: number) -> number:
    if n <= 1:
        return 1
    return n * factorial(n - 1)

for i in range(1, 7):
    say str(i) + "! = " + str(factorial(i))
\`\`\`

## A closure factory

\`\`\`zap
fn make_multiplier(factor: number):
    fn multiply(x: number) -> number:
        return x * factor
    return multiply

let triple = make_multiplier(3)
let quadruple = make_multiplier(4)

say triple(5)       # 15
say quadruple(5)    # 20
\`\`\`

## Classes with inheritance

\`\`\`zap
class Animal:
    fn init(self, name: text):
        self.name = name

    fn speak(self) -> text:
        return self.name + " makes a sound"

class Dog extends Animal:
    fn speak(self) -> text:
        return self.name + " says woof"

class Cat extends Animal:
    fn speak(self) -> text:
        return self.name + " says meow"

let pets = [new("Dog", "Rex"), new("Cat", "Mia")]
for pet in pets:
    say pet.speak()
\`\`\`

## Result and the \`?\` operator

\`\`\`zap
fn load_user() -> result<map>:
    return err("user not found")

fn profile() -> result<map>:
    let user = load_user()?
    return ok(user)

let r = profile()
if is_err(r):
    say "could not load profile: " + str(unwrap_or(r, "unknown error"))
else:
    say "loaded"
\`\`\`

## A module and an import

\`\`\`zap
# modules/math.zp
module app.math

export fn square(value: number) -> number:
    return value * value
\`\`\`

\`\`\`zap
# main.zp
module app.main
import app.math as math

say math.square(5)   # 25
\`\`\`

The dotted import path maps to a \`.zp\` file below the module root. Module entries must be relative, must end in \`.zp\`, and must exist.

## When your program grows

When the program grows, move reusable declarations into a module, put tests in \`tests/\`, and create a \`zap.toml\` project instead of keeping everything in one file. See [Build a Web App](#web-walkthrough) for a full end-to-end project.
`,
};

export const moreExamplesSection: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "more-examples",
    title: "More Examples",
    icon: "FlaskConical",
    pages: [{ slug: "examples-more", title: "More Examples" }],
  },
  pages: [moreExamples],
};
