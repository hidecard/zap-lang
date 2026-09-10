// Type definitions for the Zap documentation site.

export interface DocPageMeta {
  /** Unique slug used in the URL hash and lookup. */
  slug: string;
  /** Display title shown in the sidebar. */
  title: string;
}

export interface DocSection {
  /** Section identifier (stable, used for collapsible state). */
  id: string;
  /** Section label shown in the sidebar. */
  title: string;
  /** Lucide icon name from lucide-react. */
  icon: string;
  /** Ordered pages within this section. */
  pages: DocPageMeta[];
}

export interface DocPage {
  /** Matches a DocPageMeta.slug. */
  slug: string;
  /** Page H1 title. */
  title: string;
  /** Short description used for SEO + search results. */
  description: string;
  /** Optional GitHub source path (relative to repo root). */
  source?: string;
  /** Markdown body. */
  markdown: string;
}

export interface SearchResult {
  slug: string;
  title: string;
  description: string;
  section: string;
}
