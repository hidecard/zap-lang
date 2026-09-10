// Aggregates all documentation sections and pages into a single lookup.
import type { DocSection, DocPage } from "./types";
import { gettingStarted } from "./content/getting-started";
import { basics } from "./content/basics";
import { language } from "./content/language";
import { reference } from "./content/reference";
import { web } from "./content/web";
import { packagesSection } from "./content/packages";
import { runtimeSection } from "./content/runtime";
import { deploymentSection } from "./content/deployment";
import { examplesSection } from "./content/examples";
import { projectSection } from "./content/project";

const groups: { section: DocSection; pages: DocPage[] }[] = [
  gettingStarted,
  basics,
  language,
  reference,
  web,
  packagesSection,
  runtimeSection,
  deploymentSection,
  examplesSection,
  projectSection,
];

export const docsSections: DocSection[] = groups.map((g) => g.section);

export const docsPages: Record<string, DocPage> = Object.fromEntries(
  groups.flatMap((g) => g.pages.map((p) => [p.slug, p] as const)),
);

export function getPage(slug: string): DocPage | undefined {
  return docsPages[slug];
}

export const ZAP_VERSION = "v2.11.18";
export const REPO_URL = "https://github.com/hidecard/zap";
