import { loadCollection } from "./load";
import {
  parseCertification,
  sortCertifications,
  type Certification,
} from "./schema/certifications";
import {
  parseExperience,
  sortExperiences,
  type Experience,
} from "./schema/experience";
import {
  parseProject,
  sortProjects,
  type Project,
} from "./schema/projects";

/**
 * The single public surface for editable content.
 *
 * Entries live one-per-file under `entries/`, written by the local admin UI
 * (`/admin/`, dev only — see vite-plugins/contentApi.ts) and committed like
 * any other change. Git is the store: no runtime CMS and no network call, so
 * both pages keep their strict `connect-src 'self'` policy and stay plain
 * static artefacts.
 *
 * Leaving TypeScript costs compile-time checking of the content, so the
 * `parse*` functions take over at module load. A malformed entry therefore
 * fails `npm run build` and the dev server, instead of reaching production as
 * a blank card.
 *
 * `import.meta.glob` cannot take a variable — Vite resolves it statically at
 * build time — so each collection spells its own glob out here rather than
 * going through a helper.
 */

export const certifications: readonly Certification[] = loadCollection(
  import.meta.glob<{ default: unknown }>("./entries/certifications/*.json", {
    eager: true,
  }),
  parseCertification,
  sortCertifications,
  "src/content/entries/certifications/",
);

export const experiences: readonly Experience[] = loadCollection(
  import.meta.glob<{ default: unknown }>("./entries/experience/*.json", {
    eager: true,
  }),
  parseExperience,
  sortExperiences,
  "src/content/entries/experience/",
);

export const projects: readonly Project[] = loadCollection(
  import.meta.glob<{ default: unknown }>("./entries/projects/*.json", {
    eager: true,
  }),
  parseProject,
  sortProjects,
  "src/content/entries/projects/",
);

export { certificationCategories } from "./schema/certifications";
export type {
  Certification,
  CertificationCategory,
} from "./schema/certifications";
export type { Experience } from "./schema/experience";
export type { Project } from "./schema/projects";
