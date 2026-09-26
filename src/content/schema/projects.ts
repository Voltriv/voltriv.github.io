import {
  requireId,
  requireLinkTarget,
  requireRecord,
  requireString,
} from "./validate";

export type Project = {
  id: string;
  title: string;
  description: string;
  /** https URL, or a same-site reference starting with "/" or "#". */
  link: string;
  /** Manual ordering; lower sorts first. Defaults to 0. */
  order: number;
};

/**
 * Projects carry an explicit `order` rather than a date.
 *
 * A portfolio is curated — the piece that should lead is not necessarily the
 * newest one — so the sequence is the author's call. Without it the order
 * would fall out of the filesystem, which is arbitrary and changes when an
 * entry is renamed.
 */
export function parseProject(raw: unknown, where: string): Project {
  const record = requireRecord(raw, where);

  const rawOrder = record.order;
  let order = 0;
  if (rawOrder !== undefined && rawOrder !== null && rawOrder !== "") {
    // A number, or the numeric string the admin form posts — nothing else.
    // Coercing an arbitrary value here would turn an object into NaN, or
    // worse, into "[object Object]".
    if (typeof rawOrder !== "number" && typeof rawOrder !== "string") {
      throw new Error(`${where}: "order" must be a number`);
    }
    const parsed = typeof rawOrder === "number" ? rawOrder : Number(rawOrder);
    if (!Number.isFinite(parsed)) {
      throw new Error(`${where}: "order" must be a number`);
    }
    order = parsed;
  }

  return {
    id: requireId(record, where),
    title: requireString(record, "title", where),
    description: requireString(record, "description", where),
    link: requireLinkTarget(record, "link", where),
    order,
  };
}

/** Author order first, then title as a stable tiebreak. */
export function sortProjects(entries: readonly Project[]): Project[] {
  return [...entries].sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title),
  );
}
