"use client";

import { useCallback, useEffect, useState } from "react";
import { DocsShell } from "@/components/docs/docs-shell";
import { LandingPage } from "@/components/docs/landing-page";
import { DocsThemeProvider } from "@/components/docs/theme-provider";
import { docsPages } from "@/lib/docs/docs-data";

type View = "landing" | "docs";

// We keep a stable hash convention so the back/forward buttons and shared
// links behave predictably:
//   - "" or "#home"          -> landing
//   - "#docs"                 -> docs at the introduction page
//   - "#<page-slug>"          -> docs at that page (when the slug exists)
// Any unknown hash is treated as the landing page.
export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [pageSlug, setPageSlug] = useState<string>("introduction");

  // Resolve the initial view from the URL hash before first paint.
  useEffect(() => {
    const resolve = () => {
      const raw = window.location.hash.replace(/^#/, "").trim();
      if (!raw || raw === "home") {
        setView("landing");
        return;
      }
      if (raw === "docs" || raw === "documentation") {
        setView("docs");
        setPageSlug("introduction");
        return;
      }
      if (docsPages[raw]) {
        setView("docs");
        setPageSlug(raw);
        return;
      }
      // Unknown hash — fall back to the landing page.
      setView("landing");
    };
    resolve();
    window.addEventListener("hashchange", resolve);
    return () => window.removeEventListener("hashchange", resolve);
  }, []);

  const enterDocs = useCallback((slug?: string) => {
    const target = slug && docsPages[slug] ? slug : "introduction";
    setPageSlug(target);
    setView("docs");
    if (window.location.hash.replace(/^#/, "") !== target) {
      history.pushState(null, "", `#${target}`);
    }
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }, []);

  const goHome = useCallback(() => {
    setView("landing");
    if (window.location.hash) {
      history.pushState(null, "", window.location.pathname + window.location.search);
    }
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }, []);

  return (
    <DocsThemeProvider>
      {view === "landing" ? (
        <LandingPage onEnterDocs={enterDocs} />
      ) : (
        <DocsShell key={pageSlug} onGoHome={goHome} />
      )}
    </DocsThemeProvider>
  );
}
