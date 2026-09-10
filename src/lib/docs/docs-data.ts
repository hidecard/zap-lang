// Aggregates all documentation sections and pages into a single lookup.
import type { DocSection, DocPage } from "./types";
import { gettingStarted } from "./content/getting-started";
import { basics } from "./content/basics";
import { language } from "./content/language";
import { languageAdditions } from "./content/language-additions";
import { reference } from "./content/reference";
import { stdlibDomains } from "./content/stdlib-domains";
import { webWalkthroughSection } from "./content/web-walkthrough";
import { web } from "./content/web";
import { webAdditions } from "./content/web-additions";
import { testingToolingSection } from "./content/testing-tooling";
import { testingAdditions } from "./content/testing-additions";
import { packagesSection } from "./content/packages";
import { packagesAdditions } from "./content/packages-additions";
import { runtimeSection } from "./content/runtime";
import { runtimeAdditions } from "./content/runtime-additions";
import { deploymentSection } from "./content/deployment";
import { deploymentAdditions } from "./content/deployment-additions";
import { examplesSection } from "./content/examples";
import { moreExamplesSection } from "./content/examples-more";
import { projectSection } from "./content/project";
import { projectAdditions } from "./content/project-additions";

const groups: { section: DocSection; pages: DocPage[] }[] = [
  gettingStarted,
  basics,
  language,
  languageAdditions,
  reference,
  stdlibDomains,
  webWalkthroughSection,
  web,
  webAdditions,
  testingToolingSection,
  testingAdditions,
  packagesSection,
  packagesAdditions,
  runtimeSection,
  runtimeAdditions,
  deploymentSection,
  deploymentAdditions,
  examplesSection,
  moreExamplesSection,
  projectSection,
  projectAdditions,
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
