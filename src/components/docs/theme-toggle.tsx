"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical next-themes mounted guard to avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  const isDark = (mounted ? resolvedTheme : theme) === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle color theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-9 w-9 text-muted-foreground hover:text-foreground"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-[1.1rem] w-[1.1rem]" />
        ) : (
          <Moon className="h-[1.1rem] w-[1.1rem]" />
        )
      ) : (
        <div className="h-[1.1rem] w-[1.1rem]" />
      )}
    </Button>
  );
}
