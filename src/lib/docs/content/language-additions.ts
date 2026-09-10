import type { DocSection, DocPage } from "../types";

const modulesPage: DocPage = {
  slug: "modules",
  title: 'Modules & Workspaces',
  description: 'Explicit module declarations, deterministic imports, aliases, the module root, and legacy use.',
  source: "docs/SYNTAX_GUIDE_EN.md",
  markdown: `Zap supports explicit module declarations and deterministic imports. A **module** is a logical name recorded at the top of a source file; an **import** binds another module into the current file under an optional alias. Module boundaries are API boundaries: export the smallest useful surface and keep helpers private.

## Module declaration

\`\`\`zap
# modules/app/core.zp
module app.core

export fn version() -> text:
    return "2.0"

export fn helper() -> text:
    return "internal"
\`\`\`

## Import with an alias

\`\`\`zap
# main.zp
module app.main
import app.core as core

say core.version()   # "2.0"
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

## Module root rules

- Module roots and entries must be **relative**.
- Entries must end in \`.zp\`.
- Each listed file must exist.
- Explicit imports reject absolute paths, separators, empty path components, and traversal.
- The resolver visits imported files in **deterministic source order**, caches completed nodes, and reports a stable \`circular module dependency\` diagnostic containing the complete cycle when a dependency loop is found.

## Legacy compatibility imports

Legacy \`use "file.zp"\` imports remain available for compatibility:

\`\`\`zap
use "modules/math"
\`\`\\

New workspace code should prefer \`module\` and \`import ... as ...\`. Local \`use "math"\` or \`use "math.zp"\` imports are searched relative to the main file, then \`modules/\`, and then \`lib/\`.

## Export

Use \`export\` to mark a function as part of a module's public surface. Only exported symbols should be part of another module's public API:

\`\`\`zap
module app.math

export fn square(value: number) -> number:
    return value * value

# Not exported — internal helper
fn internal_check():
    return true
\`\`\\

## Treat module boundaries as API boundaries

- Export the smallest useful surface.
- Keep helpers private.
- Avoid circular dependencies; if you hit one, split shared declarations into a lower-level module.
- Module entries must be relative, must end in \`.zp\`, and must exist.

## Workspace validation

\`\`\`bash
zap check .
zap build --locked .
\`\`\\

\`zap check\` validates the manifest, lockfile, entry file, modules, and known types. \`zap build --locked\` requires a valid canonical lockfile and rejects graph changes.

See also [Language Guide &rsaquo; Modules and Workspaces](#language-guide) and [Troubleshooting](#testing-tooling) for \`module not found\` and \`circular module dependency\` diagnostics.
`,
};
const defaultParametersPage: DocPage = {
  slug: "default-parameters",
  title: 'Default Parameters',
  description: 'Positional and named arguments with default values, typed defaults, methods, and the validation rules.',
  source: "docs/DEFAULT_PARAMETERS_EN.md",
  markdown: `Default function parameters let a function provide a value when the caller omits that argument. They are useful for optional configuration, friendly defaults, and APIs that should remain concise for common cases.

## Basic syntax

A default parameter is written with \`=\` in the parameter list:

\`\`\`zap
fn greet(name = "World"):
    return "Hello, " + name

say greet()        # "Hello, World"
say greet("Zap")   # "Hello, Zap"
\`\`\\

When \`greet()\` is called without an argument, Zap binds \`name\` to \`"World"\`. When \`greet("Zap")\` is called, the provided value takes precedence over the default.

## Typed default parameters

A parameter may include both a type annotation and a default expression. The annotation is written before the default value:

\`\`\`zap
fn repeat_message(message: text = "Zap", times: number = 1):
    let index = 0
    while index < times:
        say message
        index = index + 1

repeat_message()
repeat_message("Learning", 2)
\`\`\\

The default expression must produce a value compatible with the parameter annotation. The following declaration is invalid because the default is text while the parameter requires a number:

\`\`\`zap
fn square(value: number = "one") -> number:   # error
    return value * value
\`\`\\

Use \`zap check\` to detect annotation mismatches before running a project.

## Positional and named binding

Zap supports both positional arguments and named arguments. Positional arguments bind from left to right. A named argument uses \`parameter = expression\` inside the call and binds directly to the parameter with that name. Omitted parameters use their declared defaults.

\`\`\`zap
fn connect(host: text = "localhost", port: number = 8080, secure: bool = false):
    return host + ":" + str(port) + ":" + str(secure)

say connect()                                          # "localhost:8080:false"
say connect("api.example.com")                         # "api.example.com:8080:false"
say connect(host = "api.example.com", secure = true)   # "api.example.com:8080:true"
say connect(port = 443, host = "api.example.com")     # "api.example.com:443:false"
\`\`\\

Named arguments are useful when overriding a later default without supplying every earlier default. Positional arguments may appear before named arguments, but a positional argument may **not** follow a named argument. Thus \`f(10, c = 30)\` is valid while \`f(a = 10, 20)\` is rejected.

## Required and defaulted parameters together

A function can mix required parameters with defaulted parameters. A call must always provide every required parameter, while defaulted parameters may be omitted.

\`\`\`zap
fn create_user(username: text, role: text = "member", active: bool = true):
    return {
        "username": username,
        "role": role,
        "active": active
    }

say create_user("may")                  # username=may, role=member, active=true
say create_user("may", "admin", false)  # username=may, role=admin, active=false
\`\`\\

## Default expressions

A default is stored as an expression and evaluated **when the argument is omitted** — at call time, not at declaration time:

\`\`\`zap
fn welcome(prefix: text = "Hello", name: text = "World"):
    return prefix + ", " + name

say welcome()                       # "Hello, World"
say welcome("Mingalaba", "Zap")    # "Mingalaba, Zap"
\`\`\\

Default expressions are evaluated in the function call's local environment. Defaults should therefore be kept simple and deterministic. A default can refer to values already available to the function's closure, but it should **not** depend on a later parameter that has not been bound yet.

## Methods and constructors

The same positional default behavior applies to class methods and constructors. The implicit \`self\` parameter is supplied by the runtime and is not written by the caller as an ordinary method argument.

\`\`\`zap
class User:
    fn init(self, name: text = "Guest"):
        self.name = name

    fn label(self, prefix: text = "User"):
        return prefix + ": " + self.name

let guest = new("User")                   # name = "Guest"
let developer = new("User", "Developer")  # name = "Developer"
say guest.label()                         # "User: Guest"
say developer.label("Account")            # "Account: Developer"
\`\`\\

For methods, the runtime checks the arguments after \`self\`. Constructor and method defaults follow the same omission and override rules as ordinary functions. The built-in \`new(...)\` call is a separate constructor boundary: it accepts a text class name, positional constructor arguments, and an optional positional map of explicit fields. **Named arguments are intentionally rejected** with a deterministic diagnostic; named binding remains supported for user-defined functions and methods.

## Return types and defaults

Default parameters work with return annotations. Runtime and static validation still apply to the supplied or defaulted value and to the returned value.

\`\`\`zap
fn port_or_default(port: number = 8080) -> number:
    return port

say port_or_default()    # 8080
say port_or_default(3000) # 3000
\`\`\\

## Validation rules

| Rule | Example | Result |
|---|---|---|
| A default requires a non-empty expression | \`fn f(value =):\` | Rejected during parsing |
| Duplicate parameter names are rejected | \`fn f(value, value):\` | Rejected during parsing |
| A supplied argument must match its annotation | \`fn f(n: number = 1):\` then \`f(n = "x")\` | Runtime/static type error |
| A default must match its annotation | \`fn f(n: number = "x"):\` | Type-checking error when checked |
| Too few required arguments are rejected | \`fn f(a, b = 2):\` then \`f()\` | Missing-argument error |
| Too many arguments are rejected | \`fn f(a = 1):\` then \`f(1, 2)\` | Argument-count error |
| Unknown names are rejected | \`fn f(a):\` then \`f(b = 1)\` | Unknown named-argument error |
| Duplicate names are rejected | \`f(a = 1, a = 2)\` | Duplicate named-argument error |
| Positional-after-named is rejected | \`f(a = 1, 2)\` | Binding-order error |
| Named binding selects parameters directly | \`f(second = 20, first = 10)\` | Values bind by name |
| Built-in constructor names are rejected | \`new("User", name = "Guest")\` | Deterministic unsupported-named-argument error |

A typical missing-argument diagnostic for a function with one required and two defaulted parameters is:

\`\`\`text
function expects 1 to 3 arguments, got 0
\`\`\\

## Complete example

The following file is the repository example \`examples/default_parameters.zp\`:

\`\`\`zap
fn greet(name: text = "World", punctuation: text = "!"):
    return "Hello, " + name + punctuation

fn rectangle_area(width: number, height: number = 1) -> number:
    return width * height

fn describe_user(username: text, role: text = "member", active: bool = true):
    say "username=" + username
    say "role=" + role
    say "active=" + str(active)

say greet()
say greet("Zap", ".")
say rectangle_area(8)
say rectangle_area(8, 3)
describe_user("developer")
describe_user("admin", "administrator", false)
\`\`\\

Run it with:

\`\`\`bash
zap examples/default_parameters.zp
\`\`\\

## Related references

- [Syntax Reference](#syntax-reference) for the general syntax overview.
- [Language Guide &rsaquo; Functions](#basics-functions) for the function basics.
- The implementation is covered by the native regression test \`applies_default_function_parameters\`.
`,
};
const typeNarrowingPage: DocPage = {
  slug: "type-narrowing",
  title: 'Type Narrowing',
  description: 'Branch-local narrowing for option<T> and result<T> with is_some, is_ok, is_err, and restoration.',
  source: "docs/TYPE_NARROWING_EN.md",
  markdown: `Zap supports **branch-local narrowing** for \`option<T>\` and \`result<T>\` values. A successful guard changes the static type only inside the guarded block; after the block, the original wrapper type is restored.

## Guarded payload access

Use \`is_some\`, \`is_ok\`, or \`is_err\` to prove the payload shape before passing a value to a function that expects the payload type.

\`\`\`zap
fn use_number(value: number):
    say value

let maybe: option<number> = some(7)
let result: result<number> = ok(9)

if is_some(maybe):
    use_number(maybe)      # maybe is narrowed to number inside this block

if is_ok(result):
    use_number(result)     # result is narrowed to number inside this block
\`\`\\

\`is_err(result)\` narrows the value to the error payload type when the result annotation carries an error type.

## Boolean conjunctions

With \`and\`, each safe guard contributes a narrowing to the same branch:

\`\`\`zap
let maybe: option<number> = some(7)
let result: result<number> = ok(9)

if is_some(maybe) and is_ok(result):
    let first: number = maybe     # narrowed
    let second: number = result   # narrowed
\`\`\\

This behavior is intentionally branch-local. A guard that cannot be proven safe does **not** silently narrow a value.

## Safe disjunctions

A disjunction is narrowed only when every alternative establishes the same variable and payload type. This avoids unsoundly narrowing a value when one side of an \`or\` expression provides a different fact:

\`\`\`zap
let maybe: option<number> = some(7)

if is_some(maybe) or is_some(maybe):
    let value: number = maybe     # narrowed
\`\`\\

When alternatives do not establish the same fact, keep the wrapper type or use separate branches.

## Alias variables

Aliases retain the inferred \`option<T>\` or \`result<T>\` type and can be narrowed independently:

\`\`\`zap
let original: option<number> = some(7)
let alias = original

if is_some(alias):
    let value: number = alias     # narrowed
\`\`\\

Narrowing an alias does **not** mutate the static type of the original variable.

## \`else\` branches and restoration

The successful branch receives the payload type. The \`else\` branch retains the negative information that the success condition was not established, so the value remains an option/result wrapper rather than becoming a payload automatically:

\`\`\`zap
let maybe: option<number> = some(7)

if is_some(maybe):
    let value: number = maybe       # narrowed in the true branch
else:
    let still_wrapped: option<number> = maybe   # still wrapped in the else branch
\`\`\\

After the conditional, \`maybe\` is again \`option<number>\` in both paths. Passing it directly to a function that requires \`number\` is rejected by \`zap check\` unless it is guarded or explicitly unwrapped.

## \`is_option_none\` else-body

The distinct negative predicate form has one bounded reference/candidate case:

\`\`\`zap
let maybe: option<number> = option_none()
if is_option_none(maybe):
    let none_value: option<number> = maybe
else:
    let payload: number = maybe
\`\`\\

For this exact direct shape, the true body retains \`option<number>\` and the single indented \`else\` body receives \`number\`. The current Zap candidate covers only one tracked \`option<number>\` variable and does not generalize this fact to compound guards, mutation, aliases, nested control flow, or arbitrary predicates.

## Scope and diagnostics

Narrowing applies to nested statements whose indentation belongs to the guarded block. It does **not** leak into sibling statements or code after the conditional. The checker reports the expected and actual types — including wrapper types such as \`option<number>\` and \`result<number>\` — when a narrowed value is used outside its valid scope.

## Current boundary

The native reference implementation covers:

- Direct predicate guards
- Boolean \`and\`/\`or\` combinations with safe common facts
- Inferred aliases
- Branch restoration

More advanced flow facts such as arbitrary user-defined predicates, mutation-sensitive alias analysis, reassignment invalidation, and complex loop invariants remain future static-checker work.

## Practical guidance

- **Prefer explicit unwraps** (\`unwrap_or\`) when you need a value regardless of narrowing.
- **Use narrowing** to make safe payload access self-documenting and checkable.
- **Do not rely on narrowing across mutations**; the checker intentionally restores wrapper types after a guarded block.
`,
};
const diagnosticsModelPage: DocPage = {
  slug: "diagnostics-model",
  title: 'Diagnostics Model',
  description: 'The structured diagnostic contract: codes, kinds, severity, fields, and stable error categories shared by the CLI and LSP.',
  source: "docs/DIAGNOSTIC_MODEL_EN.md",
  markdown: `Zap exposes one structured diagnostic contract across the CLI project validator and the language server. The contract is designed to make machine-readable errors stable without changing the human-readable message.

## Fields

| Field | Meaning |
|---|---|
| \`code\` | Stable machine-readable identifier such as \`ZAP-TYPE-001\`; this is the compatibility key for editors and CI. |
| \`kind\` | Stable user-facing category such as \`SyntaxError\`, \`NameError\`, or \`TypeError\`. |
| \`severity\` | Current values are \`error\`; the field is reserved for future warning and information diagnostics. |
| \`file\` | Source file associated with the diagnostic, when available. |
| \`line\` / \`column\` | One-based source position for CLI JSON output. |
| \`message\` | Normalized user-facing diagnostic message. |
| \`notes\` | Deterministic follow-up observations that explain the likely cause. |
| \`help\` | Optional deterministic remediation guidance. |

The CLI JSON mode emits \`notes\` as an array and \`help\` as either a string or \`null\`. LSP diagnostics retain the standard \`severity\`, \`source\`, \`code\`, \`range\`, and \`message\` fields and place the additional Zap metadata in the \`data\` object.

## Stable code registry

| Code | Kind | Meaning |
|---|---|---|
| \`ZAP-SYNTAX-001\` | \`SyntaxError\` | Source syntax or parsing failure. |
| \`ZAP-NAME-001\` | \`NameError\` | Unknown or undefined name. |
| \`ZAP-TYPE-001\` | \`TypeError\` | Value or expression type mismatch. |
| \`ZAP-VALUE-001\` | \`ValueError\` | Invalid value or operation. |
| \`ZAP-IO-001\` | \`IOError\` | General input/output failure. |
| \`ZAP-FILE-001\` | \`FileNotFound\` | Required file does not exist. |
| \`ZAP-KEY-001\` | \`KeyError\` | Object or map key is missing. |
| \`ZAP-PERM-001\` | \`PermissionError\` | The operation is not permitted. |
| \`ZAP-OVERFLOW-001\` | \`OverflowError\` | A bounded numeric or resource operation overflowed. |
| \`ZAP-RUNTIME-001\` | \`Error\` | Stable uncaught runtime failure. |
| \`ZAP-BORROW-001\` | \`BorrowError\` | Checked object-field or lexical-EnvFrame borrow conflict; the runtime returns an error instead of panicking. |
| \`ZAP-MEMORY-001\` | \`MemoryError\` | Run-owned logical byte, object, task, output, or bounded value-lifecycle limit was exceeded. |
| \`ZAP-PROJECT-001\` | \`ProjectError\` | Project, manifest, or dependency validation failure. |

Codes are **additive** compatibility identifiers. A diagnostic kind or message may become more specific in a future release, but an existing code must not be silently reused for a different failure category.

## Reading diagnostics

### CLI (human-readable)

\`\`\`bash
zap check .
\`\`\\

### CLI (machine-readable JSON)

\`\`\`bash
zap check --json .
\`\`\\

A JSON diagnostic contains structured fields:

\`\`\`json
{"ok":false,"kind":"TypeError","file":"main.zp","line":4,"column":12,"message":"expected number, got text"}
\`\`\\

### LSP

The command-line checker and the LSP share the **same** semantic diagnostic categories. When an editor reports an error, reproduce it with \`zap check --json\` first — this separates a language diagnostic from an editor transport or presentation problem.

## Diagnostic guidance

Type diagnostics currently include the note \`Check the expression type and the expected annotation.\` and the help text \`Use a compatible value or update the type annotation.\`

Borrow diagnostics use stable guidance for finishing the active object-field or lexical-frame access before attempting a competing read or mutation; the object-field wording remains \`Avoid reading and mutating the same object fields at the same time.\` with help \`Finish the active object-field access before mutating the object.\`

Memory diagnostics use deterministic guidance to reduce the value, task, or output admission, or clear cyclic object fields before retrying.

## Compatibility rules

Diagnostic codes, field names, severity values, and message normalization are part of the tooling contract:

- New fields may be added without removing existing fields.
- Human-readable rendering may evolve, but CLI JSON and LSP snapshots must remain deterministic.
- Snapshots must **not** include secrets or environment-specific paths unless the source itself contains them.
- Canonical equality traversals are bounded by \`max_value_nodes\`, short-circuit previously visited object pairs, and use callable handle identity so cyclic values cannot trigger unbounded recursion.
`,
};
export const languageAdditions: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "language-extras",
    title: "Language (Advanced)",
    icon: "Code2",
    pages: [
      { slug: "modules", title: "Modules & Workspaces" },
      { slug: "default-parameters", title: "Default Parameters" },
      { slug: "type-narrowing", title: "Type Narrowing" },
      { slug: "diagnostics-model", title: "Diagnostics Model" }
    ],
  },
  pages: [
    modulesPage,
    defaultParametersPage,
    typeNarrowingPage,
    diagnosticsModelPage
  ],
};
