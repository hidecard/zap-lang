// Aggregates all documentation sections and pages into a single lookup.
import type { DocSection, DocPage } from "./types";
import { gettingStarted } from "./content/getting-started";
import { basics } from "./content/basics";
import { language } from "./content/language";
import { reference } from "./content/reference";
import { stdlibDomains } from "./content/stdlib-domains";
import { webWalkthroughSection } from "./content/web-walkthrough";
import { web } from "./content/web";
import { testingToolingSection } from "./content/testing-tooling";
import { packagesSection } from "./content/packages";
import { runtimeSection } from "./content/runtime";
import { deploymentSection } from "./content/deployment";
import { examplesSection } from "./content/examples";
import { moreExamplesSection } from "./content/examples-more";
import { projectSection } from "./content/project";

const groups: { section: DocSection; pages: DocPage[] }[] = [
  gettingStarted,
  basics,
  language,
  reference,
  stdlibDomains,
  webWalkthroughSection,
  web,
  testingToolingSection,
  packagesSection,
  runtimeSection,
  deploymentSection,
  examplesSection,
  moreExamplesSection,
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
