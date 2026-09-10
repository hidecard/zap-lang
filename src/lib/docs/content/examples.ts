import type { DocSection, DocPage } from "../types";

const examples: DocPage = {
  slug: "examples",
  title: "Examples",
  description:
    "Runnable .zp programs: hello, collections, error handling, modules, and tasks — straight from the examples/ directory.",
  source: "examples",
  markdown: `These examples ship in the repository's [\`examples/\`](https://github.com/hidecard/zap/tree/master/examples) directory. Save any of them as a \`.zp\` file and run with \`zap <file>.zp\`.

## Hello

A minimal Zap program: a binding, a \`say\` statement, and a \`for\` loop over a literal list.

\`\`\`zap
# Basic Zap program
let name = "Zap"
say "Hello, " + name

for item in ["web", "ai", "iot"]:
    say item
\`\`\`

## Collections

Lists and maps are first-class values. Append to a list in a loop, then index into a map by key.

\`\`\`zap
# Collections example
let numbers = [1, 2, 3, 4, 5]
let doubled = []
for n in numbers:
    doubled = append(doubled, n * 2)
say doubled

let scores = {"alice": 90, "bob": 85}
say scores["alice"]
\`\`\`

## Error handling

A typed function with a guarded division. Annotations (\`number\`, \`text\`) document intent and are checked by \`zap check\`.

\`\`\`zap
# Error handling example
fn divide(a: number, b: number) -> text:
    if b == 0:
        return "error: division by zero"
    return str(a / b)

let result = divide(10, 2)
say "Result: " + result

let bad = divide(10, 0)
say "Error: " + bad
\`\`\`

## Modules

A module declaration records the logical name of a source file. Functions defined at the top level become callable values.

\`\`\`zap
# Modules example
module greetings

fn hello(name: text) -> text:
    return "Hello, " + name

say "Module 'greetings' declared with fn hello"
\`\`\`

## Tasks

Aggregate over a list of maps, count completed tasks, and assert a structural invariant.

\`\`\`zap
fn completed_count(tasks):
    let total = 0
    for task in tasks:
        if task["done"]:
            total = total + 1
    return total

let tasks = [
    {"title": "learn syntax", "done": true},
    {"title": "write a program", "done": true},
    {"title": "build a project", "done": false}
]

let completed = completed_count(tasks)
let summary = {
    "total": len(tasks),
    "completed": completed,
    "remaining": len(tasks) - completed
}

assert(summary["total"] > 0, "task list must not be empty")
say json(summary)
\`\`\`

## What to try next

- Wrap \`tasks\` in an \`async fn\` and consume it with \`await\` (see [Async & Tasks](#async)).
- Return \`ok(...)\`/\`err(...)\` from \`divide\` instead of a text sentinel (see [Result & Option](#result-option)).
- Move \`greetings\` into \`modules/greetings.zp\` and \`import greetings\` from \`main.zp\` (see [Language Guide &rsaquo; Modules](#language-guide)).
`,
};

export const examplesSection: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "examples",
    title: "Examples",
    icon: "FlaskConical",
    pages: [{ slug: "examples", title: "Examples" }],
  },
  pages: [examples],
};
