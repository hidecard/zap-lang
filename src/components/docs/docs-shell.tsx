"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Github,
  Menu,
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { Toc } from "./toc";
import { Markdown } from "./markdown";
import { ThemeToggle } from "./theme-toggle";
import { SearchCommand } from "./search";
import { docsSections, docsPages } from "@/lib/docs/docs-data";
import { cn } from "@/lib/utils";

const VERSION = "v2.11.18";
const REPO_URL = "https://github.com/hidecard/zap";

function zapLogo() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-md bg-brand text-brand-foreground font-mono text-base font-bold shadow-sm shrink-0">
      Z
    </span>
  );
}

export function DocsShell({ onGoHome }: { onGoHome: () => void }) {
  const [slug, setSlug] = useState<string>("introduction");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);

  // Resolve initial page from the URL hash on mount.
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace(/^#/, "").trim();
      if (h && docsPages[h]) {
        setSlug(h);
      } else if (!h) {
        setSlug("introduction");
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  // Global keyboard shortcut to open search.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
      if (e.key === "/" && !isTypingTarget(e.target)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const navigate = useCallback((newSlug: string) => {
    if (!docsPages[newSlug]) return;
    setSlug(newSlug);
    if (window.location.hash.replace(/^#/, "") !== newSlug) {
      history.pushState(null, "", `#${newSlug}`);
    }
    // Scroll to top of content (or to a heading anchor if any).
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
    setMobileNavOpen(false);
  }, []);

  const page = docsPages[slug];
  const flatPages = useMemo(
    () => docsSections.flatMap((s) => s.pages.map((p) => p.slug)),
    [],
  );
  const currentIdx = flatPages.indexOf(slug);
  const prev = currentIdx > 0 ? docsPages[flatPages[currentIdx - 1]] : null;
  const next =
    currentIdx >= 0 && currentIdx < flatPages.length - 1
      ? docsPages[flatPages[currentIdx + 1]]
      : null;

  const breadcrumb = useMemo(() => {
    const section = docsSections.find((s) =>
      s.pages.some((p) => p.slug === slug),
    );
    return section ? { section: section.title, page: page?.title ?? "" } : null;
  }, [slug, page]);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText("zap new my_app");
      setCopiedSlug(true);
      setTimeout(() => setCopiedSlug(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-14 w-full max-w-[90rem] items-center gap-3 px-4 sm:px-6">
          {/* Mobile nav trigger */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[18rem] p-0 overflow-y-auto scrollbar-thin">
              <SheetTitle className="sr-only">Documentation navigation</SheetTitle>
              <div className="flex h-14 items-center gap-2 border-b border-border px-4">
                {zapLogo()}
                <span className="font-semibold">Zap Docs</span>
                <Badge variant="secondary" className="ml-auto text-[0.65rem] font-mono">
                  {VERSION}
                </Badge>
              </div>
              <Sidebar currentSlug={slug} onNavigate={navigate} />
            </SheetContent>
          </Sheet>

          {/* Logo — returns to the landing page */}
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2.5 cursor-pointer"
            aria-label="Back to Zap home"
          >
            {zapLogo()}
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight">Zap</span>
              <span className="text-muted-foreground hidden sm:inline">Docs</span>
            </div>
            <Badge
              variant="secondary"
              className="ml-1 hidden sm:inline-flex text-[0.65rem] font-mono"
            >
              {VERSION}
            </Badge>
          </button>

          {/* Search trigger */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="group ml-auto flex h-9 w-full max-w-xs items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/70 lg:ml-6"
            aria-label="Search documentation"
          >
            <SearchIcon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search docs…</span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[0.65rem] text-muted-foreground">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1 lg:ml-3">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-9 w-9"
              aria-label="Zap on GitHub"
            >
              <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
                <Github className="h-[1.1rem] w-[1.1rem]" />
              </a>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Body: sidebar + content + TOC */}
      <div className="mx-auto flex w-full max-w-[90rem] flex-1">
        {/* Desktop sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-border lg:block scrollbar-thin">
          <Sidebar currentSlug={slug} onNavigate={navigate} />
          <div className="px-4 pb-8 pt-2">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs font-semibold text-foreground">Try Zap now</p>
              <p className="mt-1 text-[0.75rem] text-muted-foreground">
                Create a complete user-managed Web project in one command.
              </p>
              <div className="mt-2.5 flex items-center gap-1.5">
                <code className="flex-1 rounded bg-background px-2 py-1.5 font-mono text-[0.72rem] text-foreground border border-border">
                  zap new my_app
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={copyInstall}
                  aria-label="Copy command"
                >
                  {copiedSlug ? (
                    <Check className="h-3.5 w-3.5 text-brand" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <a
                href={`${REPO_URL}/releases/latest`}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2.5 inline-flex items-center gap-1 text-[0.72rem] font-medium text-brand hover:underline"
              >
                Download v2.11.18 <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto flex w-full max-w-5xl">
            <article className="min-w-0 flex-1 px-5 sm:px-8 lg:px-12 py-8 lg:py-10">
              {/* Breadcrumb */}
              {breadcrumb && (
                <nav aria-label="Breadcrumb" className="mb-4">
                  <ol className="flex items-center gap-1.5 text-[0.8rem] text-muted-foreground">
                    <li>Docs</li>
                    <li aria-hidden>›</li>
                    <li>{breadcrumb.section}</li>
                  </ol>
                </nav>
              )}

              {/* Title block */}
              <header className="mb-8 border-b border-border pb-6">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {page?.title}
                </h1>
                {page?.description && (
                  <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
                    {page.description}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="font-mono">
                    {VERSION}
                  </Badge>
                  {page?.source && (
                    <a
                      href={`${REPO_URL}/blob/master/${page.source}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 hover:text-brand hover:underline"
                    >
                      View source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </header>

              {/* Render markdown body (h1 inside markdown is suppressed) */}
              <Markdown content={page?.markdown ?? ""} />

              {/* Prev / Next navigation */}
              <nav
                aria-label="Page navigation"
                className="mt-12 grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-2"
              >
                {prev ? (
                  <button
                    type="button"
                    onClick={() => navigate(prev.slug)}
                    className="group flex items-center gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:border-brand/50 hover:bg-accent/40"
                  >
                    <ChevronLeft className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
                    <span className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Previous
                      </span>
                      <span className="font-medium text-foreground">
                        {prev.title}
                      </span>
                    </span>
                  </button>
                ) : (
                  <span className="hidden sm:block" />
                )}
                {next ? (
                  <button
                    type="button"
                    onClick={() => navigate(next.slug)}
                    className="group flex items-center justify-end gap-3 rounded-lg border border-border p-4 text-right transition-colors hover:border-brand/50 hover:bg-accent/40 sm:col-start-2"
                  >
                    <span className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">Next</span>
                      <span className="font-medium text-foreground">
                        {next.title}
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                ) : null}
              </nav>

              {/* Edit / feedback footer */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <p>
                  Found a doc issue?{" "}
                  <a
                    href={`${REPO_URL}/issues/new?labels=documentation&title=Doc%20issue%3A%20${encodeURIComponent(
                      page?.title ?? "",
                    )}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-brand hover:underline"
                  >
                    Open an issue
                  </a>
                  .
                </p>
                <a
                  href={`${REPO_URL}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  <Github className="h-4 w-4" /> View repository
                </a>
              </div>
            </article>

            {/* Right TOC (desktop) */}
            <aside className="hidden xl:block w-60 shrink-0">
              <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin py-10 pr-6">
                <Toc markdown={page?.markdown ?? ""} />
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-muted/30">
        <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2">
              <button
                type="button"
                onClick={onGoHome}
                className="flex items-center gap-2 cursor-pointer"
                aria-label="Back to Zap home"
              >
                {zapLogo()}
                <span className="font-semibold">Zap</span>
                <Badge variant="secondary" className="font-mono text-[0.65rem]">
                  {VERSION}
                </Badge>
              </button>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                A readable, general-purpose programming language with{" "}
                <code className="text-xs">.zp</code> source files, indentation-based
                blocks, and a standalone native runtime.
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
                { label: "CLI Reference", slug: "cli" },
              ]}
              onNavigate={navigate}
            />
            <FooterCol
              title="Language"
              links={[
                { label: "Language Guide", slug: "language-guide" },
                { label: "Syntax Reference", slug: "syntax-reference" },
                { label: "Standard Library", slug: "stdlib" },
                { label: "Async & Tasks", slug: "async" },
              ]}
              onNavigate={navigate}
            />
            <FooterCol
              title="Project"
              links={[
                { label: "Web Framework", slug: "web-framework" },
                { label: "Packages", slug: "packages" },
                { label: "Deployment", slug: "deployment" },
                { label: "Status & Roadmap", slug: "status" },
              ]}
              onNavigate={navigate}
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
              <a
                href={`${REPO_URL}/blob/master/CHANGELOG.md`}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-foreground"
              >
                Changelog
              </a>
            </div>
          </div>
        </div>
      </footer>

      <SearchCommand
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigate={navigate}
      />
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

function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName?.toUpperCase();
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

// Suppress unused — cn kept for potential className merges in future.
void cn;
