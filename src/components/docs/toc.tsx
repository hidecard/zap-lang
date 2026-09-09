"use client";

import { useEffect, useState } from "react";
import { markdownSlugify, markdownExtractText } from "./markdown";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TocProps {
  markdown: string;
}

/**
 * Extract an outline of H2/H3 headings from a markdown body, ignoring lines
 * inside fenced code blocks.
 */
export function buildToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = markdown.split("\n");
  let inFence = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+)$/.exec(line);
    if (m) {
      const text = markdownExtractText(m[2].replace(/[*_`]/g, "")).trim();
      items.push({
        id: markdownSlugify(text),
        text,
        level: m[1].length,
      });
    }
  }
  return items;
}

export function Toc({ markdown }: TocProps) {
  const toc = buildToc(markdown);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (toc.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: [0, 1],
      },
    );
    for (const item of toc) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="flex flex-col gap-1.5 border-l border-border">
        {toc.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  history.replaceState(null, "", `#${item.id}`);
                }
              }}
              className={[
                "block w-full -ml-px border-l-2 py-0.5 leading-snug transition-colors",
                item.level === 2 ? "pl-3" : "pl-7 text-[0.82rem]",
                activeId === item.id
                  ? "border-brand text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              ].join(" ")}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
