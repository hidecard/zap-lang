"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { docsSections, docsPages } from "@/lib/docs/docs-data";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentSlug: string;
  onNavigate: (slug: string) => void;
}

function getIcon(name: string): LucideIcon {
  const Icon = (Icons as any)[name] as LucideIcon | undefined;
  return Icon ?? Icons.Circle;
}

export function Sidebar({ currentSlug, onNavigate }: SidebarProps) {
  // Track which sections the user has explicitly toggled. A section's
  // *effective* open state is its explicit toggle OR "contains the active
  // page", so the section you are currently viewing cannot be collapsed.
  const [explicitOpen, setExplicitOpen] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const s of docsSections) initial[s.id] = true;
      return initial;
    },
  );

  return (
    <nav
      aria-label="Documentation"
      className="flex flex-col gap-1 px-3 py-4 text-sm"
    >
      {docsSections.map((section) => {
        const Icon = getIcon(section.icon);
        const hasActive = section.pages.some(
          (p) => p.slug === currentSlug,
        );
        const isOpen = !!explicitOpen[section.id] || hasActive;
        return (
          <Collapsible
            key={section.id}
            open={isOpen}
            onOpenChange={(o) =>
              setExplicitOpen((prev) => ({ ...prev, [section.id]: o }))
            }
          >
            <CollapsibleTrigger
              className={cn(
                "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground",
                hasActive && "text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">{section.title}</span>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-muted-foreground/70 transition-transform",
                  isOpen && "rotate-90",
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-0.5">
              <ul className="mt-1 mb-2 ml-2 flex flex-col gap-0.5 border-l border-border pl-2">
                {section.pages.map((page) => {
                  const active = page.slug === currentSlug;
                  return (
                    <li key={page.slug}>
                      <button
                        type="button"
                        onClick={() => onNavigate(page.slug)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative -ml-px block w-full rounded-md px-2.5 py-1.5 text-left transition-colors",
                          "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                          active &&
                            "font-medium text-foreground bg-accent/60 border-l-2 -ml-[calc(0.5rem+1px)] pl-[calc(0.625rem+1px)] border-brand",
                        )}
                      >
                        {page.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </nav>
  );
}

// Re-export for completeness so other components can resolve the page object.
export { docsPages };
