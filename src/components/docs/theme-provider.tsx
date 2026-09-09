"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export function DocsThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="zap-docs-theme"
    >
      {children}
    </ThemeProvider>
  );
}
