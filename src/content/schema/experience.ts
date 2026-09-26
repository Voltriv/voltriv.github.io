import {
  requireId,
  requireMonth,
  requireRecord,
  requireString,
  requireStringArray,
} from "./validate";

export type Experience = {
  id: string;
  company: string;
  role: string;
  /** Display string, shown verbatim — e.g. "August 2025 - November 2025". */
  period: string;
  /** Ordering key only, `YYYY-MM`. Never rendered. */
  startDate: string;
  summary: string;
  bullets: string[];
};

/**
 * `period` and `startDate` are separate on purpose.
 *
 * `period` is free text because it is what the reader sees, and the existing
 * entries are already phrased the way they should stay. Sorting on it is
 * impossible — "August 2025 - November 2025" has no reliable order — so
 * `startDate` carries a machine-readable key alongside it. The small
 * duplication buys a deterministic newest-first order that does not depend on
 * filenames, and leaves the rendered text byte-for-byte unchanged.
 */
export function parseExperience(raw: unknown, where: string): Experience {
  const record = requireRecord(raw, where);

  return {
    id: requireId(record, where),
    company: requireString(record, "company", where),
    role: requireString(record, "role", where),
    period: requireString(record, "period", where),
    startDate: requireMonth(record, "startDate", where),
    summary: requireString(record, "summary", where),
    bullets: requireStringArray(record, "bullets", where),
  };
}

/** Newest first, then by company, so file order never leaks into the UI. */
export function sortExperiences(
  entries: readonly Experience[],
): Experience[] {
  return [...entries].sort(
    (a, b) =>
      b.startDate.localeCompare(a.startDate) ||
      a.company.localeCompare(b.company),
  );
}
