import type { DocSection, DocPage } from "../types";
import { stdlib } from "./reference";

const stdlibText: DocPage = {
  slug: "stdlib-text",
  title: 'text — Strings',
  description: 'Unicode-aware text helpers: len, str, type, trim, split, join, contains, replace, char_at, substring, codepoints.',
  source: "docs/STDLIB_TEXT_MATH_COLLECTION_EN.md",
  markdown: `The \`text\` domain provides Unicode-aware string conversion and manipulation. APIs use direct AST evaluation and validate argument count and runtime types before execution.

## API reference

| Function | Signature | Returns | Behavior |
|---|---|---|---|
| \`len\` | \`len(value)\` | \`number\` | Unicode character count for text, or element count for a list/map |
| \`str\` | \`str(value)\` | \`text\` | Convert a Zap value to its display representation |
| \`type\` | \`type(value)\` | \`text\` | Runtime category: \`none\`, \`bool\`, \`number\`, \`text\`, \`list\`, \`map\`, \`object\`, \`result\`, or \`option\` |
| \`contains\` | \`contains(text, part)\` or \`contains(list, value)\` | \`bool\` | Text containment or list membership |
| \`is_empty\` | \`is_empty(value)\` | \`bool\` | True when text, list, or map has no elements |
| \`split\` | \`split(value, separator)\` | \`list<text>\` | Split text by a text separator |
| \`join\` | \`join(values, separator)\` | \`text\` | Join a list of text values with a separator |
| \`trim\` | \`trim(value)\` | \`text\` | Remove leading and trailing whitespace |
| \`lower\` | \`lower(value)\` | \`text\` | Lowercase |
| \`upper\` | \`upper(value)\` | \`text\` | Uppercase |
| \`replace\` | \`replace(value, from, to)\` | \`text\` | Replace every occurrence of one text with another |
| \`starts_with\` | \`starts_with(value, prefix)\` | \`bool\` | True when text begins with the prefix |
| \`ends_with\` | \`ends_with(value, suffix)\` | \`bool\` | True when text ends with the suffix |
| \`char_at\` | \`char_at(value, index)\` | \`text\` | One Unicode scalar at a zero-based character index |
| \`substring\` | \`substring(value, start, end)\` | \`text\` | Half-open character range \`start <= index < end\`; never slices UTF-8 bytes |
| \`codepoints\` | \`codepoints(value)\` | \`list<number>\` | Each Unicode scalar as its numeric code point |

## Unicode awareness

\`char_at\`, \`substring\`, \`codepoints\`, \`len\`, and \`reverse\` operate on **Unicode scalar values** rather than UTF-8 byte offsets. Negative indices and out-of-range \`char_at\` indices are rejected, while an out-of-range \`substring\` end produces the available suffix. \`join\` requires every list element to be text — it does not silently stringify mixed values.

## Usage

\`\`\`zap
let source: text = "  Zap Language  "

say trim(source)                          # "Zap Language"
say upper(trim(source))                   # "ZAP LANGUAGE"
say lower(source)                         # "  zap language  "
say replace("zap language", "zap", "Zap") # "Zap language"
say starts_with("Zap", "Z")               # true
say ends_with("Zap", "ap")                # true
say contains("Zap language", "lang")      # true
say split("a,b,c", ",")                    # ["a", "b", "c"]
say join(["web", "ai", "iot"], ", ")       # "web, ai, iot"

# Unicode-safe character operations
say char_at("က🙂ab", 1)                    # "🙂"
say substring("က🙂ab", 1, 3)                # "🙂a"
say codepoints("က🙂")                       # [4096, 128578]
say len("က🙂ab")                            # 4 (not 8 bytes)
\`\`\`

## Common patterns

### Normalize and split

\`\`\`zap
fn tokenize(raw: text) -> list<text>:
    let cleaned = trim(raw)
    if is_empty(cleaned):
        return []
    return split(cleaned, " ")

say tokenize("  hello zap world  ")   # ["hello", "zap", "world"]
\`\`\`

### Build a slug

\`\`\`zap
fn slug(value: text) -> text:
    let lowered = lower(trim(value))
    return replace(lowered, " ", "-")

say slug("  Hello Zap  ")   # "hello-zap"
\`\`\`

### Inspect a value's runtime category

\`\`\`zap
fn describe(v) -> text:
    return type(v) + ": " + str(v)

say describe(42)            # "number: 42"
say describe("hi")         # "text: hi"
say describe([1, 2])       # "list: [1, 2]"
\`\`\`

## Validation and errors

All stabilized helpers reject incorrect argument counts and incompatible runtime values with explicit errors:

\`\`\`zap
say join([1, 2], ",")      # error: join requires every element to be text
say char_at("Zap", 10)     # error: index out of range
say substring("Zap", -1, 2) # error: negative start
\`\`\`

Built-in helpers currently use **positional** arguments and report a clear unsupported named-argument diagnostic when called with named syntax.
`,
};

const stdlibMath: DocPage = {
  slug: "stdlib-math",
  title: 'math — Numbers',
  description: 'Integer arithmetic: abs, min, max, pow, sum, range — with checked overflow and bounded exponents.',
  source: "docs/STDLIB_TEXT_MATH_COLLECTION_EN.md",
  markdown: `The \`math\` domain provides integer numeric operations. Math helpers accept **integer** \`number\` values.

## API reference

| Function | Signature | Returns | Behavior |
|---|---|---|---|
| \`abs\` | \`abs(value)\` | \`number\` | Absolute value; the minimum signed integer is rejected on overflow |
| \`min\` | \`min(left, right)\` | \`number\` | The smaller number |
| \`max\` | \`max(left, right)\` | \`number\` | The larger number |
| \`pow\` | \`pow(base, exponent)\` | \`number\` | Integer power; exponent must be non-negative and no greater than \`1_000_000\` |
| \`sum\` | \`sum(values)\` | \`number\` | Add every number in a list using checked integer arithmetic |
| \`range\` | \`range(end)\` or \`range(start, end)\` | \`list<number>\` | Half-open integer range \`start <= value < end\` |

## Deterministic arithmetic

\`pow\` rejects negative or over-limit exponents **before** execution, uses checked exponentiation-by-squaring, and returns a deterministic overflow error instead of wrapping. Other overflow and invalid-exponent cases also produce runtime errors.

\`\`\`zap
say abs(-42)          # 42
say min(8, 3)         # 3
say max(8, 3)         # 8
say pow(2, 10)        # 1024
say sum([2, 4, 6])    # 12
say range(3)          # [0, 1, 2]
say range(2, 5)       # [2, 3, 4]
\`\`\`

## Usage

### Sum and average

\`\`\`zap
fn average(values: list<number>) -> number:
    if is_empty(values):
        return 0
    return sum(values) / len(values)

say average([10, 20, 30])   # 20
\`\`\`

### A bounded countdown

\`\`\`zap
for n in reverse(range(1, 6)):
    say n                    # 5, 4, 3, 2, 1
\`\`\`

### Clamping

\`\`\`zap
fn clamp(value: number, lo: number, hi: number) -> number:
    return min(max(value, lo), hi)

say clamp(15, 0, 10)   # 10
say clamp(-3, 0, 10)   # 0
say clamp(5, 0, 10)    # 5
\`\`\`

### Checked power

\`\`\`zap
say pow(2, 30)          # 1073741824
say pow(2, -1)          # error: negative exponent
say pow(2, 1_000_001)   # error: exponent over limit
\`\`\`

## Validation and errors

\`\`\`zap
say sum([1, "two"])           # error: sum requires every element to be a number
say abs(-9223372036854775808) # error: minimum signed integer overflows on negation
\`\`\`
`,
};

const stdlibCollections: DocPage = {
  slug: "stdlib-collections",
  title: 'collections — Lists & Maps',
  description: 'keys, entries, enumerate, count, reverse, contains, is_empty, sum, sort, get — bounded, deterministic, copy-not-mutate.',
  source: "docs/STDLIB_TEXT_MATH_COLLECTION_EN.md",
  markdown: `The \`collections\` domain provides bounded helpers for lists and maps. These helpers return **new** lists and do **not** mutate the input collection. Map entry ordering is deterministic so the same input produces the same output across supported platforms.

## API reference

| Function | Signature | Returns | Behavior |
|---|---|---|---|
| \`keys\` | \`keys(value)\` | \`list<text>\` | The text keys of a map |
| \`entries\` | \`entries(value)\` | \`list<map>\` | \`{key, value}\` records in lexicographic key order |
| \`enumerate\` | \`enumerate(values)\` | \`list<map>\` | \`{index, value}\` records with zero-based indexes |
| \`count\` | \`count(values, item)\` | \`number\` | Count values equal to \`item\` in a list |
| \`reverse\` | \`reverse(values)\` | \`list<T>\` | A reversed copy; the input list is not mutated |
| \`contains\` | \`contains(values, item)\` | \`bool\` | List membership using Zap value equality |
| \`is_empty\` | \`is_empty(values)\` | \`bool\` | True when a list or map is empty |
| \`sort\` | \`sort(values)\` | \`list<T>\` | A sorted copy |
| \`get\` | \`get(value, key)\` | \`any\` | Safe lookup |

## Usage

\`\`\`zap
let values: list<number> = [1, 2, 1, 3]
say count(values, 1)         # 2
say contains(values, 3)      # true
say reverse(values)          # [3, 1, 2, 1]
say sort(values)             # [1, 1, 2, 3]

let record = {"name": "Zap", "version": 1}
say keys(record)             # ["name", "version"]
say entries(record)          # [{"key": "name", "value": "Zap"}, {"key": "version", "value": 1}]
say enumerate(["first", "second"])  # [{"index": 0, "value": "first"}, {"index": 1, "value": "second"}]
say is_empty({})             # true
\`\`\`

## Common patterns

### Iterate a map deterministically

\`entries\` returns records in lexicographic key order, so map iteration is reproducible across platforms:

\`\`\`zap
let scores = {"alice": 90, "bob": 85, "carol": 70}
for entry in entries(scores):
    say entry["key"] + ": " + str(entry["value"])
# alice: 90
# bob: 85
# carol: 70
\`\`\`

### Index-aware iteration

\`\`\`zap
for pair in enumerate(["a", "b", "c"]):
    say str(pair["index"]) + " -> " + pair["value"]
# 0 -> a
# 1 -> b
# 2 -> c
\`\`\`

### Distinct values

\`\`\`zap
fn distinct(values) -> list:
    let seen = []
    let out = []
    for v in values:
        if not contains(seen, v):
            seen = append(seen, v)
            out = append(out, v)
    return out

say distinct([1, 2, 1, 3, 2])   # [1, 2, 3]
\`\`\`

### Frequency count

\`\`\`zap
fn frequency(values) -> map:
    let f = {}
    for v in values:
        let k = str(v)
        if contains(keys(f), k):
            f[k] = f[k] + 1
        else:
            f[k] = 1
    return f

say frequency(["a", "b", "a", "c", "b", "a"])   # {"a": 3, "b": 2, "c": 1}
\`\`\`

## Bounded iteration

\`entries\` and \`enumerate\` are bounded by the runtime iteration limit. They return new lists and do not mutate the input collection; map entry ordering is deterministic so the same input produces the same output across supported platforms.

## Validation and errors

\`\`\`zap
say keys([1, 2, 3])    # error: keys expects a map
say entries("Zap")     # error: entries expects a map
\`\`\`
`,
};

const stdlibFilesystem: DocPage = {
  slug: "stdlib-filesystem",
  title: 'filesystem — Files & Paths',
  description: 'read_text, write_text, read_lines, write_lines, exists, path_join, basename, dirname, file_metadata, atomic_write.',
  source: "docs/STDLIB_FILESYSTEM_JSON_EN.md",
  markdown: `The \`filesystem\` domain provides bounded text, line, and metadata I/O. In an active project execution, paths are resolved through a context-owned **workspace boundary**: relative paths are joined to the workspace, absolute paths must remain inside it, traversal is rejected, and symlink resolution may not leave it.

## API reference

| Function | Signature | Returns | Behavior |
|---|---|---|---|
| \`read_text\` | \`read_text(path: text)\` | \`text\` | Read a UTF-8 text file |
| \`write_text\` | \`write_text(path: text, content: text)\` | \`none\` | Write or replace a UTF-8 text file |
| \`read_lines\` | \`read_lines(path: text)\` | \`list<text>\` | Read a file as lines without trailing separators |
| \`write_lines\` | \`write_lines(path: text, lines: list<text>)\` | \`none\` | Write text lines using platform newline handling |
| \`exists\` | \`exists(path: text)\` | \`bool\` | True when a path exists |
| \`path_join\` | \`path_join(first: text, second: text, ...)\` | \`text\` | Join path components using host path rules |
| \`basename\` | \`basename(path: text)\` | \`text\` | The final path component |
| \`dirname\` | \`dirname(path: text)\` | \`text\` | The parent path |
| \`file_metadata\` | \`file_metadata(path: text)\` | \`map\` | \`{kind, size, readonly}\`; \`kind\` is \`file\`, \`directory\`, \`symlink\`, or \`other\` |
| \`atomic_write\` | \`atomic_write(path: text, content: text)\` | \`none\` | Write through a same-directory temp file, sync, and rename |

## Safety limits

- All filesystem content operations are bounded by an **8 MiB** safety limit.
- \`atomic_write\` is bounded by the same 8 MiB limit. It leaves the destination unchanged if temporary creation, writing, synchronization, or commit fails, and removes its temporary file during error cleanup. The temp file is created beside the destination so a successful rename remains on the same filesystem.
- \`file_metadata\` uses symlink metadata rather than following a link, so a symlink is reported as \`kind = "symlink"\`. The \`size\` field is the platform byte length and \`readonly\` reflects the host permission flag.

## Usage

\`\`\`zap
let path: text = path_join("data", "users.txt")
write_lines(path, ["alice", "bob"])
let users: list<text> = read_lines(path)
if exists(path):
    say basename(path)         # "users.txt"
    say dirname(path)          # "data"

let metadata = file_metadata(path)
say metadata["kind"]           # "file"
say metadata["size"]           # byte length
say metadata["readonly"]       # false

atomic_write(path, "updated atomically")
\`\`\`

## Common patterns

### Read a config file with a fallback

\`\`\`zap
fn load_config(path: text, fallback: text) -> text:
    if not exists(path):
        return fallback
    return read_text(path)

say load_config("config.txt", "default")
\`\`\`

### Append a line safely

\`\`\`zap
fn append_line(path: text, line: text):
    let lines = []
    if exists(path):
        lines = read_lines(path)
    lines = append(lines, line)
    atomic_write(path, join(lines, "\\n"))
\`\`\`

### Process a file line by line

\`\`\`zap
for line in read_lines(path_join("data", "log.txt")):
    if contains(line, "ERROR"):
        say line
\`\`\`

## Path portability

Path separators are supplied by the host runtime. Applications should use \`path_join\` instead of manually concatenating separators:

\`\`\`zap
# Good
let cfg = path_join("config", "settings.json")

# Avoid — breaks on a different OS
let bad = "config/settings.json"
\`\`\`

## Validation and errors

All filesystem functions validate their argument count and types. Read and write operations return a runtime error when the path cannot be accessed or the content cannot be decoded or written.

\`\`\`zap
say read_text("missing.txt")       # error: file not found
say read_text(path_join("..", "..", "secret"))  # error: traversal rejected
\`\`\`
`,
};

const stdlibJson: DocPage = {
  slug: "stdlib-json",
  title: 'json — Encoding & Decoding',
  description: 'json, from_json, from_json_typed — deterministic conversion with an 8 MiB safety limit and tagged option/result variants.',
  source: "docs/STDLIB_FILESYSTEM_JSON_EN.md",
  markdown: `The \`json\` domain provides deterministic JSON encoding and decoding.

## API reference

| Function | Signature | Returns | Behavior |
|---|---|---|---|
| \`json\` | \`json(value)\` | \`text\` | Encode a Zap value as JSON text |
| \`from_json\` | \`from_json(source: text)\` | \`any\` | Parse JSON text into a Zap value |
| \`from_json_typed\` | \`from_json_typed(source: text, expected: text)\` | \`any\` | Parse JSON and verify the runtime category matches \`expected\` |

The \`expected\` argument to \`from_json_typed\` is one of \`none\`, \`bool\`, \`number\`, \`text\`, \`list\`, or \`map\`.

## Conversion rules

JSON conversion is **deterministic**:

- \`none\` becomes JSON \`null\`.
- Booleans, numbers, text, lists, and maps become their corresponding JSON values.
- Zap \`option\` and \`result\` values use **tagged objects** so their variant information is preserved during a round trip.
- Callable values serialize to \`{"__zap_variant":"callable"}\` and are intentionally not deserializable as executable code.

## Usage

\`\`\`zap
let source: text = json([1, 2, 3])
let values = from_json(source)
say values[1]                  # 2

let record = from_json_typed('{"name":"Zap","version":1}', "map")
say record["name"]            # "Zap"
say record["version"]         # 1

say json({"active": true})    # '{"active":true}'
\`\`\`

## Common patterns

### Round-trip a map

\`\`\`zap
let profile = {"name": "Zap", "version": 2}
let encoded = json(profile)
let decoded = from_json(encoded)
say decoded["name"] == profile["name"]    # true
\`\`\`

### Validate a response shape

\`\`\`zap
fn parse_response(body: text) -> result<map>:
    let checked = from_json_typed(body, "map")
    if type(checked) != "map":
        return err("expected a JSON object")
    return ok(checked)
\`\`\`

### Combine with file I/O

\`\`\`zap
let cfg = from_json(read_text(path_join("config", "app.json")))
say cfg["port"]
\`\`\`

## Safety limits and errors

JSON input and output are bounded by an **8 MiB** safety limit; oversized payloads are **rejected** instead of being processed without bounds.

\`\`\`zap
let value = from_json(42)             # error: from_json requires text
let broken = from_json("{invalid}")   # error: invalid JSON
let bad = from_json_typed("[1,2]", "map")   # error: expected map, got list
\`\`\`

## Determinism

The same input always produces the same output, independent of hash-map iteration order. \`json\` accepts exactly one argument; \`from_json\` accepts exactly one text argument; \`from_json_typed\` accepts a text source and a text runtime-category name. A mismatch produces \`from_json_typed failed: expected <expected>, got <actual>\`.
`,
};

const stdlibSystem: DocPage = {
  slug: "stdlib-system",
  title: 'system — Env, Config & Paths',
  description: 'env, has_env, env_get, config_dir, config_path, path_join, basename, dirname, now, sleep.',
  source: "docs/STDLIB_INDEX_EN.md",
  markdown: `The \`system\` domain provides environment access, configuration paths, and basic timing helpers.

## API reference

| Function | Signature | Returns | Behavior |
|---|---|---|---|
| \`env\` | \`env(name: text)\` | \`text\` | Read an environment variable; errors if missing |
| \`has_env\` | \`has_env(name: text)\` | \`bool\` | True when the environment variable is set |
| \`env_get\` | \`env_get(name: text, fallback: text)\` | \`text\` | Read with a deterministic fallback; never mutates the process environment |
| \`config_dir\` | \`config_dir()\` | \`text\` | Platform configuration directory |
| \`config_path\` | \`config_path(name: text)\` | \`text\` | One relative config file name; rejects separators and traversal |
| \`path_join\` | \`path_join(first: text, second: text, ...)\` | \`text\` | Join path components using host path rules |
| \`basename\` | \`basename(path: text)\` | \`text\` | Final path component |
| \`dirname\` | \`dirname(path: text)\` | \`text\` | Parent path |
| \`now\` | \`now()\` | \`number\` | Current Unix timestamp in seconds |
| \`sleep\` | \`sleep(milliseconds)\` | \`none\` | Bounded wall-clock delay |

## Platform config directory

\`config_dir\` resolves the platform configuration directory using:

- **XDG configuration rules** on Unix-like systems
- \`Application Support\` on macOS
- \`APPDATA\` / \`LOCALAPPDATA\` on Windows

## Usage

\`\`\`zap
# Required environment variable
if has_env("ZAP_ENV"):
    say env("ZAP_ENV")
else:
    say "development"

# Optional with a fallback
let port = env_get("ZAP_PORT", "3000")
say port

# Deterministic config file path
let cfg = config_path("settings.json")
say cfg
\`\`\`

## Common patterns

### Read configuration with defaults

\`\`\`zap
fn app_port() -> number:
    let raw = env_get("ZAP_PORT", "3000")
    return from_json_typed(raw, "number")

say app_port()   # 3000 unless overridden
\`\`\`

### Detect the runtime environment

\`\`\`zap
fn environment() -> text:
    return env_get("ZAP_ENV", "development")

if environment() == "production":
    say "production mode"
else:
    say "development mode"
\`\`\`

## Safety

- Environment variables are **external input**. Do not expose secrets in diagnostics, JSON responses, logs, or source-control files.
- \`env_get\` provides a deterministic text fallback **without** mutating the process environment.
- \`config_path\` accepts only one relative file name and rejects path separators and traversal components.

\`\`\`zap
say config_path("../secret.txt")   # error: traversal rejected
say config_path("a/b.txt")         # error: separator rejected
\`\`\`
`,
};

const stdlibTime: DocPage = {
  slug: "stdlib-time",
  title: 'time — UTC & Durations',
  description: 'utc_now, duration_parts, duration_between, sleep — integer-millisecond, deterministic, overflow-checked.',
  source: "docs/STDLIB_TIME_EN.md",
  markdown: `The \`time\` domain provides deterministic UTC timestamps and integer-millisecond duration helpers. All APIs use UTC and integer millisecond precision — they do **not** depend on the local timezone.

## API reference

| API | Arguments | Result |
|---|---|---|
| \`utc_now()\` | None | A map with \`unix_seconds\` and \`unix_millis\` |
| \`duration_parts(milliseconds)\` | One integer millisecond duration | A map with \`milliseconds\`, \`days\`, \`hours\`, \`minutes\`, \`seconds\`, and \`millis\` |
| \`duration_between(end_millis, start_millis)\` | Two integer millisecond timestamps | The same duration map for the checked difference \`end_millis - start_millis\` |
| \`sleep(milliseconds)\` | One non-negative integer, at most \`60_000\` | \`none\` after the bounded delay |

## Determinism

- \`utc_now()\` is based on Unix time in UTC and does not depend on the local timezone. Its millisecond value is consistent with its seconds value: it is at least \`unix_seconds * 1000\` and less than \`(unix_seconds + 1) * 1000\`.
- \`duration_parts\` preserves the **sign** of its input. The component fields are truncated toward zero at each unit boundary, so callers can use \`milliseconds\` when the exact signed value is required.
- \`duration_between\` uses **checked** subtraction and returns a runtime error if the two timestamps would overflow the signed integer range. Duration decomposition also rejects values that cannot be represented safely.
- \`sleep\` is a bounded system operation: negative values and values greater than \`60_000\` return deterministic errors **before** sleeping. It is not a scheduler, reactor, or lazy async continuation.

## Usage

\`\`\`zap
let now = utc_now()
say now["unix_seconds"]
say now["unix_millis"]

let started = now["unix_millis"] - 90_061_007
let elapsed = duration_between(now["unix_millis"], started)
say elapsed["days"]       # 1
say elapsed["hours"]      # 1
say elapsed["minutes"]    # 1
say elapsed["seconds"]    # 1
say elapsed["millis"]     # 7
say elapsed["milliseconds"] # -90061007 (signed exact)
\`\`\`

## Common patterns

### Time a short operation

\`\`\`zap
let start = utc_now()["unix_millis"]
sleep(15)
let end = utc_now()["unix_millis"]
say duration_between(end, start)["milliseconds"]   # ~15
\`\`\`

### Format a duration as text

\`\`\`zap
fn humanize(ms: number) -> text:
    let parts = duration_parts(ms)
    return str(parts["minutes"]) + "m " + str(parts["seconds"]) + "s"

say humanize(75_000)   # "1m 15s"
\`\`\`

### Combine with logging

Structured logging does not add timestamps implicitly. Applications that need event time explicitly combine \`utc_now()\` with the fields map:

\`\`\`zap
let current = utc_now()
let event = log_record("debug", "poll completed", {
    "unix_millis": current["unix_millis"],
    "items": 12
})
say log_json(event["level"], event["message"], event["fields"])
\`\`\`

## Validation and errors

\`\`\`zap
say sleep(-1)          # error: negative duration
say sleep(60_001)      # error: duration exceeds 60s limit
\`\`\`
`,
};

const stdlibLogging: DocPage = {
  slug: "stdlib-logging",
  title: 'logging — Structured Records',
  description: 'log_record, log_json — pure record builders with sorted fields, 64 KiB output cap, and no implicit sink.',
  source: "docs/STDLIB_LOGGING_EN.md",
  markdown: `The \`logging\` domain provides deterministic structured-record builders for machine-readable events. The runtime validates each event and returns data; it does **not** write directly to stdout or stderr. Applications therefore choose their own output sink.

## API reference

| Function | Signature | Returns | Behavior |
|---|---|---|---|
| \`log_record\` | \`log_record(level, message, fields)\` | \`map\` | A map with \`level\`, \`message\`, and \`fields\` |
| \`log_json\` | \`log_json(level, message, fields)\` | \`text\` | One JSON line containing the same logical record |

## Levels and limits

Levels are limited to \`trace\`, \`debug\`, \`info\`, \`warn\`, and \`error\`.

| Item | Limit |
|---|---:|
| Message size | 8 KiB |
| Number of fields | 64 |
| Field-name size | 256 bytes |
| Encoded JSON output | 64 KiB |

## Determinism guarantee

\`log_json\` sorts field names and applies fixed size limits. It **never** depends on hash-map iteration order and **never** wraps or truncates oversized data. Top-level keys are emitted in canonical order: \`fields\`, \`level\`, then \`message\`. Field names are sorted alphabetically.

## Usage

\`\`\`zap
let event = log_record("info", "server started", {"port": 8080, "mode": "dev"})
say event["level"]              # "info"
say event["fields"]["port"]    # 8080

let line = log_json("warn", "slow request", {"path": "/health", "duration_ms": 250})
say line   # '{"fields":{"duration_ms":250,"path":"/health"},"level":"warn","message":"slow request"}'
\`\`\`

## Common patterns

### Choose your own sink

Because the logging APIs return data rather than writing to a stream, the application decides where events go:

\`\`\`zap
fn emit(event):
    # In production, write to a file, a queue, or an HTTP log drain.
    # In development, just say it.
    say log_json(event["level"], event["message"], event["fields"])

emit(log_record("info", "boot", {"version": "1.0"}))
\`\`\`

### Persist a log snapshot atomically

\`\`\`zap
let line = log_json("error", "db unavailable", {"retry_ms": 5000})
atomic_write(path_join("logs", "fatal.jsonl"), line + "\\n")
\`\`\`

### Add an explicit timestamp

Structured logging does not add timestamps implicitly. Combine \`utc_now()\` with the fields map:

\`\`\`zap
let now = utc_now()
say log_json("debug", "poll completed", {
    "unix_millis": now["unix_millis"],
    "items": 12
})
\`\`\`

## Validation and errors

Invalid levels, empty messages, non-map fields, oversized messages, oversized field names, and more than 64 fields return stable runtime errors.

\`\`\`zap
say log_record("tracey", "x", {})   # error: invalid level
say log_record("info", "", {})      # error: empty message
say log_json("info", "x", "not a map")  # error: fields must be a map
\`\`\`
`,
};

const stdlibNetwork: DocPage = {
  slug: "stdlib-network",
  title: 'network — URLs & HTTP',
  description: 'url_parse, url_encode, url_decode, http_get, http_request, http_serve_once — bounded, loopback-only, no shell.',
  source: "docs/STDLIB_INDEX_EN.md",
  markdown: `The \`network\` domain provides URL handling, bounded HTTP requests, and a local one-request server.

## API reference

| Function | Signature | Returns | Behavior |
|---|---|---|---|
| \`url_parse\` | \`url_parse(url: text)\` | \`map\` | Decompose a URL into its parts |
| \`url_encode\` | \`url_encode(text)\` | \`text\` | Percent-encode text for use in a URL |
| \`url_decode\` | \`url_decode(text)\` | \`text\` | Decode percent-encoded text |
| \`http_get\` | \`http_get(url: text)\` | \`map\` | Bounded GET request |
| \`http_request\` | \`http_request(method, url, headers, body)\` | \`map\` | Bounded request with method, headers, body |
| \`http_serve_once\` | \`http_serve_once(port, body)\` | \`map\` | Bind to loopback, serve exactly one request |

## Safety limits

- URL inputs are limited to **8 KiB**.
- HTTP requests accept only \`http\` and \`https\` URLs and use bounded connect, read, and write timeouts.
- \`http_serve_once\` binds to \`127.0.0.1\`, serves **exactly one** HTTP request, and enforces a 64 KiB request limit, an 8 MiB response limit, and a 10-second wait limit.
- Plain HTTP is rejected unless \`ZAP_ALLOW_INSECURE_HTTP=1\` is explicitly set for local fixtures.

## Usage

### URL parsing and encoding

\`\`\`zap
let endpoint = url_parse("https://example.com:8443/api?q=zap")
say endpoint["scheme"]   # "https"
say endpoint["host"]     # "example.com"
say endpoint["port"]     # 8443
say endpoint["path"]     # "/api"
say endpoint["query"]    # "q=zap"

say url_encode("a b/c")  # "a%20b%2Fc"
say url_decode("a%20b%2Fc")  # "a b/c"
\`\`\`

### A simple GET

\`\`\`zap
let response = http_get("https://example.com")
say response["status"]
say response["body"]
\`\`\`

### One-shot local server

\`\`\`zap
# Bind to loopback, serve one request, then return request metadata.
let served = http_serve_once(8080, "Hello from Zap")
say served["method"]   # "GET"
say served["path"]     # "/"
say served["headers"]
\`\`\`

\`http_serve_once\` is useful for tests, OAuth callbacks, and local integrations. It is **not** a production server.

## Common patterns

### Build a query string

\`\`\`zap
fn build_query(params: map) -> text:
    let parts = []
    for k in keys(params):
        parts = append(parts, url_encode(k) + "=" + url_encode(str(params[k])))
    return join(parts, "&")

say build_query({"q": "zap", "page": 1})   # "q=zap&page=1"
\`\`\`

### Fetch and decode JSON

\`\`\`zap
let response = http_get("https://example.com/api/status")
if response["status"] == 200:
    let body = from_json_typed(response["body"], "map")
    say body["ok"]
\`\`\`

## Validation and errors

\`\`\`zap
say http_get("ftp://example.com")       # error: only http and https are accepted
say url_parse("not a url")              # error: malformed URL
say http_serve_once(8080, "x")          # waits up to 10s for a single request
\`\`\`

## What this is not

The network domain is a bounded capability, not a production HTTP client or server. It does not provide connection pooling, streaming uploads, WebSocket, TLS termination, or horizontal scaling. Those are deployment concerns handled by the host or a separate adapter.
`,
};

const stdlibProcess: DocPage = {
  slug: "stdlib-process",
  title: 'process — Non-shell Execution',
  description: 'process_run — invoke a program directly without shell interpretation, with a 1 MiB output cap.',
  source: "docs/STDLIB_INDEX_EN.md",
  markdown: `The \`process\` domain provides non-shell process execution.

## API reference

| Function | Signature | Returns | Behavior |
|---|---|---|---|
| \`process_run\` | \`process_run(command: text, args: list<text>)\` | \`map\` | Invoke a program directly without shell interpretation |

The returned map contains:

- \`success\` — \`bool\`, true when the program exited with status 0
- \`status\` — \`number\`, the exit code
- \`stdout\` — \`text\`, captured UTF-8 stdout
- \`stderr\` — \`text\`, captured UTF-8 stderr

## Safety limits

\`process_run\`:

- Invokes a program **directly without shell interpretation**.
- Accepts only a text command and a list of text arguments.
- Captures UTF-8 stdout/stderr.
- **Rejects** output larger than **1 MiB**.

Because there is no shell, shell-injection is **not possible** by construction. Arguments are passed literally to the program:

\`\`\`zap
let result = process_run("printf", ["zap"])
say result["success"]   # true
say result["stdout"]    # "zap"
say result["status"]    # 0
\`\`\`

## Usage

### Run a command and check success

\`\`\`zap
let r = process_run("echo", ["hello"])
if r["success"]:
    say "output: " + r["stdout"]
else:
    say "failed with status " + str(r["status"])
    say r["stderr"]
\`\`\`

### Use a program as a filter

\`\`\`zap
fn sort_lines(input: text) -> text:
    # Pass input on stdin is not supported in the current slice; use a temp file.
    let path = path_join("data", "to_sort.txt")
    atomic_write(path, input)
    let r = process_run("sort", [path])
    if not r["success"]:
        return ""
    return r["stdout"]

say sort_lines("c\\na\\nb")   # "a\\nb\\nc\\n"
\`\`\`

### A safe git log

Because arguments are passed literally and never interpreted by a shell, user-controlled values cannot escape into a shell command:

\`\`\`zap
let author = "May"
let r = process_run("git", ["log", "--author=" + author, "--oneline"])
if r["success"]:
    say r["stdout"]
\`\`\`

## Validation and errors

\`\`\`zap
say process_run("no-such-program", [])   # error: program not found
# A program that produces > 1 MiB of output:
say process_run("yes", [])               # error: output exceeds 1 MiB limit
\`\`\`

## What this is not

\`process_run\` is **not** a general subprocess library: it does not stream output, pipe between processes, or manage a child's environment. For untrusted Zap source, run inside an operating-system isolation profile with an explicit filesystem, process, network, identity, and secret policy.
`,
};
export const stdlibDomains: { section: DocSection; pages: DocPage[] } = {
  section: {
    id: "stdlib-domains",
    title: "Standard Library",
    icon: "Library",
    pages: [
      { slug: "stdlib", title: "Overview" },
      { slug: "stdlib-text", title: "text — Strings" },
      { slug: "stdlib-math", title: "math — Numbers" },
      { slug: "stdlib-collections", title: "collections — Lists & Maps" },
      { slug: "stdlib-filesystem", title: "filesystem — Files & Paths" },
      { slug: "stdlib-json", title: "json — Encoding & Decoding" },
      { slug: "stdlib-system", title: "system — Env, Config & Paths" },
      { slug: "stdlib-time", title: "time — UTC & Durations" },
      { slug: "stdlib-logging", title: "logging — Structured Records" },
      { slug: "stdlib-network", title: "network — URLs & HTTP" },
      { slug: "stdlib-process", title: "process — Non-shell Execution" },
    ],
  },
  pages: [
    stdlib,
    stdlibText,
    stdlibMath,
    stdlibCollections,
    stdlibFilesystem,
    stdlibJson,
    stdlibSystem,
    stdlibTime,
    stdlibLogging,
    stdlibNetwork,
    stdlibProcess,
  ],
};
