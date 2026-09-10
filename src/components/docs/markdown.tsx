"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { memo, useMemo } from "react";
import Link from "next/link";

interface MarkdownProps {
  content: string;
}

// Map Zap's language hint to a registered Prism language.
// Zap code fences use ```zap; we render them as a custom grammar close to
// Python/Rust hybrid. We fall back to "markup" for plain text.
function langFor(fence: string | undefined): string {
  if (!fence) return "text";
  const f = fence.toLowerCase().trim();
  if (f === "zap" || f === "zp") return "python"; // closest existing grammar
  if (f === "bash" || f === "sh" || f === "shell") return "bash";
  if (f === "toml") return "toml";
  if (f === "json") return "json";
  if (f === "text" || f === "plain") return "text";
  if (f === "html") return "markup";
  if (f === "css" || f === "js" || f === "javascript") return "javascript";
  if (f === "typescript" || f === "ts") return "typescript";
  return f;
}

// Component name shown above code blocks; Zap fences render as "zap".
function langLabel(fence: string | undefined): string {
  if (!fence) return "text";
  const f = fence.toLowerCase().trim();
  if (f === "zp") return "zap";
  return f || "text";
}

export const Markdown = memo(function Markdown({ content }: MarkdownProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const components = useMemo(
    () => ({
      // Render headings with scroll anchor ids derived from text.
      h1: ({ children }: any) => null, // title rendered separately by the page header
      h2({ children }: any) {
        const id = slugify(extractText(children));
        return <h2 id={id}>{children}</h2>;
      },
      h3({ children }: any) {
        const id = slugify(extractText(children));
        return <h3 id={id}>{children}</h3>;
      },
      h4({ children }: any) {
        const id = slugify(extractText(children));
        return <h4 id={id}>{children}</h4>;
      },
      a({ href, children }: any) {
        if (!href) return <a>{children}</a>;
        const isInternal = href.startsWith("#");
        if (isInternal) {
          return (
            <a href={href} onClick={(e) => handleHashClick(e, href)}>
              {children}
            </a>
          );
        }
        const ext = /^https?:\/\//.test(href);
        return (
          <a
            href={href}
            target={ext ? "_blank" : undefined}
            rel={ext ? "noreferrer noopener" : undefined}
          >
            {children}
          </a>
        );
      },
      code(props: any) {
        const { className, children, node, ...rest } = props;
        const fence = /language-(\w+)/.exec(className || "")?.[1];
        const isBlock = (node as any)?.position?.start.line !== (node as any)?.position?.end.line || String(children).includes("\n");
        if (isBlock && fence) {
          return (
            <CodeBlock
              fence={fence}
              isDark={isDark}
            >
              {String(children).replace(/\n$/, "")}
            </CodeBlock>
          );
        }
        if (isBlock && !fence) {
          // Block without language hint: render as plain pre.
          return (
            <CodeBlock fence="text" isDark={isDark}>
              {String(children).replace(/\n$/, "")}
            </CodeBlock>
          );
        }
        return (
          <code className={className} {...rest}>
            {children}
          </code>
        );
      },
    }),
    [isDark],
  );

  return (
    <div className="docs-content">
      <ReactMarkdown components={components as any}>{content}</ReactMarkdown>
    </div>
  );
});

function CodeBlock({
  fence,
  isDark,
  children,
}: {
  fence: string;
  isDark: boolean;
  children: string;
}) {
  return (
    <div className="group relative my-5">
      <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-border bg-muted/70 px-3 py-1.5">
        <span className="font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
          {langLabel(fence)}
        </span>
      </div>
      <SyntaxHighlighter
        language={langFor(fence)}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: "0.5rem",
          borderBottomRightRadius: "0.5rem",
          fontSize: "0.86rem",
          background: "transparent",
          padding: "0.9rem 1rem",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              "var(--font-jetbrains-mono), var(--font-geist-mono), monospace",
          },
        }}
        showLineNumbers={false}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function extractText(children: any): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children?.props?.children) return extractText(children.props.children);
  return "";
}

function handleHashClick(e: React.MouseEvent, href: string) {
  e.preventDefault();
  const id = href.slice(1);
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }
}

export { slugify as markdownSlugify, extractText as markdownExtractText };
