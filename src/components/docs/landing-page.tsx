"use client";

import { useEffect, useState } from "react";
import {
  Github,
  ArrowRight,
  BookOpen,
  Terminal,
  Zap as ZapIcon,
  Box,
  Layers,
  Shield,
  Globe,
  Cpu,
  Package,
  FileCode2,
  Sparkles,
  Copy,
  Check,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

const VERSION = "v2.11.18";
const REPO_URL = "https://github.com/hidecard/zap";

function zapLogo(size = "h-9 w-9") {
  return (
    <span
      className={`grid ${size} place-items-center rounded-lg bg-brand text-brand-foreground font-mono text-lg font-bold shadow-sm shrink-0`}
    >
      Z
    </span>
  );
}

interface LandingPageProps {
  onEnterDocs: (slug?: string) => void;
}

export function LandingPage({ onEnterDocs }: LandingPageProps) {
  const { resolvedTheme } = useTheme();
  const isDark = (resolvedTheme ?? "dark") === "dark";
  const [copied, setCopied] = useState(false);

  // Smooth scroll into view for hash anchors on mount (e.g. direct #docs).
  useEffect(() => {
    const h = window.location.hash.replace(/^#/, "").trim();
    if (h === "docs" || h === "documentation") {
      onEnterDocs("introduction");
    }
  }, [onEnterDocs]);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText("zap new my_app");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const heroCode = `# hello.zp
let name = "Zap"
say "Hello, " + name

fn greet(who: text) -> text:
    return "Hello, " + who

for item in ["web", "ai", "iot"]:
    say item

say greet("Zap")`;

  const languageAtAGlance = `let scores: list<number> = [80, 45, 90]

fn passed(score: number) -> bool:
    return score >= 50

for score in scores:
    if passed(score):
        say "passed: " + str(score)`;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            {zapLogo()}
            <span className="font-semibold tracking-tight text-lg">Zap</span>
            <Badge variant="secondary" className="ml-1 font-mono text-[0.65rem]">
              {VERSION}
            </Badge>
          </div>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEnterDocs("introduction")}
              className="text-muted-foreground hover:text-foreground"
            >
              Documentation
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEnterDocs("installation")}
              className="text-muted-foreground hover:text-foreground"
            >
              Install
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEnterDocs("stdlib")}
              className="text-muted-foreground hover:text-foreground"
            >
              Standard Library
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEnterDocs("web-framework")}
              className="text-muted-foreground hover:text-foreground"
            >
              Web
            </Button>
          </nav>

          <div className="ml-auto flex items-center gap-1 md:ml-3">
            <Button variant="ghost" size="icon" asChild className="h-9 w-9" aria-label="Zap on GitHub">
              <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
                <Github className="h-[1.1rem] w-[1.1rem]" />
              </a>
            </Button>
            <ThemeToggle />
            <Button
              size="sm"
              onClick={() => onEnterDocs("introduction")}
              className="ml-1 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              Read the Docs
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Decorative background grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, #000 40%, transparent 100%)",
          }}
        />
        {/* Brand glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-12rem] -z-10 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full blur-3xl opacity-20 bg-brand"
        />

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: copy */}
            <div className="flex flex-col items-start">
              <Badge
                variant="outline"
                className="mb-5 gap-1.5 border-brand/30 text-brand bg-brand-soft/40 px-3 py-1 text-xs font-medium"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {VERSION} · Standalone native runtime
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                A readable language
                <br />
                with a{" "}
                <span className="bg-gradient-to-r from-brand to-brand/70 bg-clip-text text-transparent">
                  native runtime
                </span>
                .
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
                Zap is a general-purpose programming language with{" "}
                <code className="text-sm font-mono text-foreground/90">.zp</code>{" "}
                source files, indentation-based blocks, optional type checking,
                explicit modules, structured <code className="text-sm font-mono text-foreground/90">Result</code>/<code className="text-sm font-mono text-foreground/90">Option</code> values, and a single binary that
                creates, checks, builds, tests, and serves your project — no
                Python, Node.js, Java, or Rust required at runtime.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  onClick={() => onEnterDocs("introduction")}
                  className="bg-brand text-brand-foreground hover:bg-brand/90 h-11 px-6"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Read the Docs
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onEnterDocs("first-program")}
                  className="h-11 px-6"
                >
                  <Terminal className="mr-2 h-4 w-4" />
                  Try Zap
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                  className="h-11 px-5"
                >
                  <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              </div>

              {/* Install hint */}
              <div className="mt-8 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm font-mono">
                <span className="select-none text-muted-foreground">$</span>
                <code className="flex-1 text-foreground">zap new my_app</code>
                <button
                  type="button"
                  onClick={copyInstall}
                  aria-label="Copy command"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-brand" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Right: code preview */}
            <div className="relative">
              <div className="absolute -inset-3 -z-10 rounded-2xl bg-gradient-to-br from-brand/20 via-brand/5 to-transparent blur-2xl" />
              <div className="overflow-hidden rounded-xl border border-border bg-muted/50 shadow-2xl shadow-brand/10">
                {/* Window chrome */}
                <div className="flex items-center justify-between border-b border-border bg-muted/70 px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-400/70" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                    <span className="h-3 w-3 rounded-full bg-green-400/70" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">hello.zp</span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">zap</span>
                </div>
                <SyntaxHighlighter
                  language="python"
                  style={isDark ? oneDark : oneLight}
                  customStyle={{
                    margin: 0,
                    background: "transparent",
                    fontSize: "0.85rem",
                    padding: "1.1rem 1.25rem",
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily:
                        "var(--font-jetbrains-mono), var(--font-geist-mono), monospace",
                    },
                  }}
                >
                  {heroCode}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Source files" value=".zp" />
            <Stat label="Release line" value={VERSION} />
            <Stat label="Platforms" value="3" sub="Linux · Windows · macOS" />
            <Stat label="License" value="MIT" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">
              Why Zap
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Everything you need to build, and nothing you don't
            </h2>
            <p className="mt-4 text-muted-foreground">
              A small, readable language with a single native binary that handles
              the whole project lifecycle — no hidden application registry, no
              runtime dependencies to install.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Cpu}
              title="Standalone native runtime"
              desc="One executable creates, checks, builds, tests, and serves. No Python, Node.js, Java, or Rust on the host."
              onClick={() => onEnterDocs("installation")}
            />
            <FeatureCard
              icon={FileCode2}
              title="Readable .zp syntax"
              desc="Indentation-based blocks, optional type annotations, structured Result and Option, and explicit modules."
              onClick={() => onEnterDocs("basics-values")}
            />
            <FeatureCard
              icon={Layers}
              title="Explicit modules"
              desc="module and import resolve relative, bounded paths deterministically. Treat module boundaries as API boundaries."
              onClick={() => onEnterDocs("modules")}
            />
            <FeatureCard
              icon={Box}
              title="Structured errors"
              desc="Result/Option with the ? operator, plus raise/try/catch for exceptional paths. Deterministic, never a panic."
              onClick={() => onEnterDocs("result-option")}
            />
            <FeatureCard
              icon={Globe}
              title="Zap-native Web"
              desc="A full-stack scaffold: routes, models, migrations, middleware, admin, and a bounded dev server."
              onClick={() => onEnterDocs("web-framework")}
            />
            <FeatureCard
              icon={Shield}
              title="Bounded by design"
              desc="8 MiB safety limits, checked overflow, no shell interpretation, workspace confinement, fail-closed errors."
              onClick={() => onEnterDocs("security")}
            />
          </div>
        </div>
      </section>

      {/* Language at a glance */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">
                Language at a glance
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Typed, modular, and deterministic
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Zap includes text, numbers, booleans, lists, maps, objects,
                functions, classes, inheritance, optional annotations, closures,
                explicit modules, JSON, <code className="font-mono text-sm text-foreground/90">Result</code>/<code className="font-mono text-sm text-foreground/90">Option</code>,
                default and named arguments, bounded asynchronous tasks, and
                deterministic diagnostics — in a small, readable surface.
              </p>
              <ul className="mt-6 space-y-3">
                <ChecklistItem>
                  Indentation-based blocks — no semicolons, no braces
                </ChecklistItem>
                <ChecklistItem>
                  Optional annotations that <code className="font-mono text-xs">zap check</code> verifies
                </ChecklistItem>
                <ChecklistItem>
                  A poll-budgeted async executor — deterministic, not a reactor
                </ChecklistItem>
                <ChecklistItem>
                  Bounded standard library with pure, input-deterministic, and external-IO domains
                </ChecklistItem>
              </ul>
              <Button
                variant="outline"
                onClick={() => onEnterDocs("language-guide")}
                className="mt-8"
              >
                Read the Language Guide
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-muted/50 shadow-xl">
              <div className="flex items-center justify-between border-b border-border bg-muted/70 px-4 py-2.5">
                <span className="font-mono text-xs text-muted-foreground">glance.zp</span>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">zap</span>
              </div>
              <SyntaxHighlighter
                language="python"
                style={isDark ? oneDark : oneLight}
                customStyle={{
                  margin: 0,
                  background: "transparent",
                  fontSize: "0.85rem",
                  padding: "1.1rem 1.25rem",
                }}
                codeTagProps={{
                  style: {
                    fontFamily:
                      "var(--font-jetbrains-mono), var(--font-geist-mono), monospace",
                  },
                }}
              >
                {languageAtAGlance}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </section>

      {/* Project lifecycle */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">
              One binary, the whole lifecycle
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Create, check, build, test, and serve
            </h2>
            <p className="mt-4 text-muted-foreground">
              Zap's CLI is intentionally simple and user-managed. There is no
              hidden app registry and no Django-style <code className="font-mono text-sm">startapp</code>.
            </p>
          </div>
          <div className="mt-12 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            <div className="flex items-center justify-between border-b border-border bg-muted/70 px-4 py-2.5">
              <span className="font-mono text-xs text-muted-foreground">terminal</span>
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">bash</span>
            </div>
            <SyntaxHighlighter
              language="bash"
              style={isDark ? oneDark : oneLight}
              customStyle={{
                margin: 0,
                background: "transparent",
                fontSize: "0.85rem",
                padding: "1.1rem 1.25rem",
              }}
              codeTagProps={{
                style: {
                  fontFamily:
                    "var(--font-jetbrains-mono), var(--font-geist-mono), monospace",
                },
              }}
            >
{`zap new my_app          # create a complete user-managed Web project
cd my_app
zap check              # validate the manifest, modules, and known types
zap build --locked     # validate reproducible build inputs
zap test tests         # run *_test.zp files
zap dev                # start the bounded native development server`}
            </SyntaxHighlighter>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LifecycleCard icon={Package} step="1" title="new" desc="Generate a complete user-managed project: models, functions, ui, routes, middleware, migrations, admin, public, tests." />
            <LifecycleCard icon={FileCode2} step="2" title="check" desc="Validate the manifest, lockfile, entry file, modules, and known type annotations." />
            <LifecycleCard icon={Terminal} step="3" title="test" desc="Run *_test.zp files in deterministic order, with --filter, --fail-fast, and --json for CI." />
            <LifecycleCard icon={Globe} step="4" title="dev" desc="Run the bounded native development server on loopback, with routes, validation, and security headers." />
          </div>
        </div>
      </section>

      {/* Standard library domains */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">
              Standard library
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Bounded, deterministic, fail-closed
            </h2>
            <p className="mt-4 text-muted-foreground">
              Thirteen public domains, each with explicit input/output limits,
              a timeout policy, an error contract, and a determinism class.
            </p>
          </div>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["text", "Unicode-aware string manipulation", "pure"],
              ["math", "Integer arithmetic with checked overflow", "pure"],
              ["collections", "Lists and maps, copy-not-mutate", "pure"],
              ["filesystem", "Bounded text and asset I/O", "external-io"],
              ["json", "Deterministic encoding and typed decoding", "pure"],
              ["system", "Environment, config paths, sleep", "runtime-dependent"],
              ["time", "UTC timestamps and signed durations", "runtime-dependent"],
              ["logging", "Structured records, sorted fields", "pure"],
              ["network", "URLs, bounded HTTP, one-shot server", "external-io"],
              ["process", "Non-shell process execution", "external-io"],
              ["async", "Deterministic poll-budgeted tasks", "runtime-dependent"],
              ["runtime", "Assert and bounded memory diagnostics", "runtime-dependent"],
            ].map(([name, desc, cls]) => (
              <button
                key={name}
                type="button"
                onClick={() => onEnterDocs(`stdlib-${name}`)}
                className="group flex flex-col gap-1 rounded-lg border border-border bg-background p-4 text-left transition-all hover:border-brand/40 hover:bg-accent/40 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <code className="font-mono text-sm font-semibold text-brand">
                    {name}
                  </code>
                  <Badge
                    variant="outline"
                    className="text-[0.6rem] font-mono text-muted-foreground"
                  >
                    {cls}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </button>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => onEnterDocs("stdlib")}>
              Browse the full standard library
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-20">
          <div className="relative overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand-soft/60 via-brand/10 to-transparent px-6 py-14 text-center sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 opacity-10 bg-brand blur-3xl"
            />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Start building with Zap today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Install a single native binary and create your first project in one
              command. No runtime dependencies to manage.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => onEnterDocs("installation")}
                className="bg-brand text-brand-foreground hover:bg-brand/90 h-11 px-6"
              >
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onEnterDocs("examples")}
                className="h-11 px-6"
              >
                <ZapIcon className="mr-2 h-4 w-4" />
                View Examples
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                {zapLogo()}
                <span className="font-semibold">Zap</span>
                <Badge variant="secondary" className="font-mono text-[0.65rem]">
                  {VERSION}
                </Badge>
              </div>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                A readable, general-purpose programming language with{" "}
                <code className="text-xs">.zp</code> source files,
                indentation-based blocks, and a standalone native runtime.
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Released under the{" "}
                <a
                  href={`${REPO_URL}/blob/master/LICENSE`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-brand"
                >
                  MIT License
                </a>
                .
              </p>
            </div>
            <FooterCol
              title="Get Started"
              links={[
                { label: "Introduction", slug: "introduction" },
                { label: "Installation", slug: "installation" },
                { label: "First Program", slug: "first-program" },
                { label: "Examples", slug: "examples" },
              ]}
              onNavigate={onEnterDocs}
            />
            <FooterCol
              title="Language"
              links={[
                { label: "Language Guide", slug: "language-guide" },
                { label: "Syntax Reference", slug: "syntax-reference" },
                { label: "Standard Library", slug: "stdlib" },
                { label: "Async & Tasks", slug: "async" },
              ]}
              onNavigate={onEnterDocs}
            />
            <FooterCol
              title="Project"
              links={[
                { label: "Web Framework", slug: "web-framework" },
                { label: "Deployment", slug: "deployment" },
                { label: "Status & Roadmap", slug: "status" },
                { label: "Ecosystem", slug: "ecosystem" },
              ]}
              onNavigate={onEnterDocs}
            />
          </div>
          <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <p>Copyright © 2026 hidecard. MIT Licensed.</p>
            <div className="flex items-center gap-4">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" /> GitHub
              </a>
              <a
                href={`${REPO_URL}/releases/latest`}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-foreground"
              >
                Releases
              </a>
              <button
                type="button"
                onClick={() => onEnterDocs("introduction")}
                className="hover:text-foreground"
              >
                Documentation
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-4">
      <p className="text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
      {sub && <p className="text-[0.65rem] text-muted-foreground/80">{sub}</p>}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-background p-6 text-left transition-all hover:border-brand/40 hover:bg-accent/40 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
        Learn more <ArrowRight className="h-3 w-3" />
      </span>
    </button>
  );
}

function ChecklistItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
        <Check className="h-3 w-3" />
      </span>
      <span className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </span>
    </li>
  );
}

function LifecycleCard({
  icon: Icon,
  step,
  title,
  desc,
}: {
  icon: LucideIcon;
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative flex flex-col gap-2 rounded-xl border border-border bg-background p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground font-mono text-xs font-bold">
          {step}
        </span>
        <Icon className="h-4 w-4 text-brand" />
      </div>
      <h3 className="font-mono text-sm font-semibold text-foreground">
        zap {title}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function FooterCol({
  title,
  links,
  onNavigate,
}: {
  title: string;
  links: { label: string; slug: string }[];
  onNavigate: (slug: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
        {title}
      </p>
      <ul className="flex flex-col gap-2 text-sm">
        {links.map((l) => (
          <li key={l.slug}>
            <button
              type="button"
              onClick={() => onNavigate(l.slug)}
              className="text-left text-muted-foreground hover:text-brand transition-colors"
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
