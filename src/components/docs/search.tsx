"use client";

import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { docsSections, docsPages } from "@/lib/docs/docs-data";
import type { SearchResult } from "@/lib/docs/types";
import { FileText, Hash, CornerDownLeft, Search as SearchIcon } from "lucide-react";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when a page is chosen. */
  onNavigate: (slug: string) => void;
}

export function SearchCommand({ open, onOpenChange, onNavigate }: SearchCommandProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Build the searchable corpus once.
  const corpus = useMemo<SearchResult[]>(() => {
    const out: SearchResult[] = [];
    for (const section of docsSections) {
      for (const meta of section.pages) {
        const page = docsPages[meta.slug];
        if (!page) continue;
        out.push({
          slug: page.slug,
          title: page.title,
          description: page.description,
          section: section.title,
        });
      }
    }
    return out;
  }, []);

  // Also index headings from markdown for deeper search.
  const headingIndex = useMemo(() => {
    const map = new Map<string, { slug: string; heading: string; level: number }[]>();
    for (const page of Object.values(docsPages)) {
      const headings: { slug: string; heading: string; level: number }[] = [];
      const lines = page.markdown.split("\n");
      let inFence = false;
      for (const line of lines) {
        if (line.trim().startsWith("```")) {
          inFence = !inFence;
          continue;
        }
        if (inFence) continue;
        const m = /^(#{2,4})\s+(.+)$/.exec(line);
        if (m) {
          headings.push({
            slug: page.slug,
            heading: m[2].replace(/[*_`]/g, "").trim(),
            level: m[1].length,
          });
        }
      }
      map.set(page.slug, headings);
    }
    return map;
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return corpus.slice(0, 8);
    const pageMatches: SearchResult[] = [];
    const headingMatches: { page: SearchResult; heading: string }[] = [];
    for (const item of corpus) {
      const titleHit = item.title.toLowerCase().includes(q);
      const descHit = item.description.toLowerCase().includes(q);
      const secHit = item.section.toLowerCase().includes(q);
      if (titleHit || descHit || secHit) {
        pageMatches.push(item);
        continue;
      }
      const headings = headingIndex.get(item.slug) || [];
      for (const h of headings) {
        if (h.heading.toLowerCase().includes(q)) {
          headingMatches.push({ page: item, heading: h.heading });
          break;
        }
      }
    }
    const out: SearchResult[] = [...pageMatches];
    for (const hm of headingMatches) {
      if (!out.find((r) => r.slug === hm.page.slug)) out.push(hm.page);
    }
    return out.slice(0, 12);
  }, [query, corpus, headingIndex]);

  // Reset the active selection whenever the query changes, so arrow-key
  // navigation always starts from the top of the fresh result set.
  const updateQuery = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const chosen = results[activeIndex];
        if (chosen) {
          onNavigate(chosen.slug);
          onOpenChange(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, activeIndex, onNavigate, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0 overflow-hidden">
        <DialogTitle className="sr-only">Search Zap documentation</DialogTitle>
        <DialogDescription className="sr-only">
          Find documentation pages and sections by title or heading.
        </DialogDescription>
        <Command
          label="Search documentation"
          className="flex flex-col"
          shouldFilter={false}
          loop
        >
          <div className="flex items-center gap-2 border-b border-border px-3">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder="Search the Zap docs…"
              value={query}
              onValueChange={updateQuery}
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[0.65rem] text-muted-foreground">
              esc
            </kbd>
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto scrollbar-thin p-1">
            <Command.Empty className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;.
            </Command.Empty>
            {results.map((r, i) => (
              <Command.Item
                key={r.slug}
                value={`${r.title} ${r.section}`}
                onSelect={() => {
                  onNavigate(r.slug);
                  onOpenChange(false);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                data-active={i === activeIndex}
                className="flex flex-col gap-0.5 rounded-md px-3 py-2 aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-brand shrink-0" />
                  <span className="text-sm font-medium text-foreground">
                    {r.title}
                  </span>
                  <span className="ml-auto text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                    {r.section}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground pl-5 line-clamp-1">
                  {r.description}
                </span>
              </Command.Item>
            ))}
          </Command.List>
          <div className="flex items-center justify-between border-t border-border px-3 py-2 text-[0.7rem] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Hash className="h-3 w-3" />
              <span>{results.length} results</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-4 select-none items-center gap-0.5 rounded border border-border bg-muted px-1 font-mono text-[0.6rem]">
                ↑↓
              </kbd>
              to navigate
              <CornerDownLeft className="h-3 w-3 mx-1" />
              to select
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// Suppress unused import (next/navigation) — kept for potential future router push.
void useRouter;
