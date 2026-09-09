"use client";

import { DocsShell } from "@/components/docs/docs-shell";
import { DocsThemeProvider } from "@/components/docs/theme-provider";

export default function Home() {
  return (
    <DocsThemeProvider>
      <DocsShell />
    </DocsThemeProvider>
  );
}
