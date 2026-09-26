/**
 * Validation primitives shared by every content schema.
 *
 * Deliberately free of `import.meta.glob`, DOM access and Node built-ins: the
 * Vite config loads these modules in plain Node (esbuild does not transform
 * `import.meta.glob`, so a module using it throws when required from the
 * config), while the browser loads them as part of the admin bundle. One set
 * of rules for both sides is the point — the admin UI cannot save a record
 * that the build would later reject.
 *
 * Every error names its source file, so a bad entry identifies itself instead
 * of failing anonymously somewhere in the build.
 */

/** Entry ids double as filenames, so they must stay path-safe. */
export const CONTENT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const requireRecord = (raw: unknown, where: string) => {
  if (!isRecord(raw)) {
    throw new Error(`${where}: expected a JSON object`);
  }
  return raw;
};

export const requireString = (
  source: Record<string, unknown>,
  field: string,
  where: string,
) => {
  const value = source[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${where}: "${field}" must be a non-empty string`);
  }
  return value.trim();
};

export const optionalString = (
  source: Record<string, unknown>,
  field: string,
  where: string,
) => {
  const value = source[field];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw new Error(`${where}: "${field}" must be a string when present`);
  }
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export const requireId = (
  source: Record<string, unknown>,
  where: string,
) => {
  const id = requireString(source, "id", where);
  if (!CONTENT_ID_PATTERN.test(id)) {
    throw new Error(
      `${where}: "id" must be lowercase kebab-case (got ${JSON.stringify(id)})`,
    );
  }
  return id;
};

/** Blank entries are dropped; an all-blank list is treated as absent. */
export const optionalStringArray = (
  source: Record<string, unknown>,
  field: string,
  where: string,
) => {
  const raw = source[field];
  if (raw === undefined || raw === null) return undefined;

  if (!Array.isArray(raw) || raw.some((item) => typeof item !== "string")) {
    throw new Error(`${where}: "${field}" must be an array of strings`);
  }

  const cleaned = (raw as string[])
    .map((item) => item.trim())
    .filter((item) => item !== "");

  return cleaned.length > 0 ? cleaned : undefined;
};

export const requireStringArray = (
  source: Record<string, unknown>,
  field: string,
  where: string,
) => {
  const cleaned = optionalStringArray(source, field, where);
  if (!cleaned) {
    throw new Error(`${where}: "${field}" must have at least one entry`);
  }
  return cleaned;
};

/**
 * An absolute https URL.
 *
 * Anything else is rejected at build time rather than hidden at render time:
 * the pages already refuse to render a non-https link, which would quietly
 * drop it instead of telling anyone it was wrong.
 */
export const optionalHttpsUrl = (
  source: Record<string, unknown>,
  field: string,
  where: string,
) => {
  const value = optionalString(source, field, where);
  if (value === undefined) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${where}: "${field}" is not a valid URL`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`${where}: "${field}" must use https`);
  }
  return value;
};

/**
 * An https URL *or* a same-site reference (`/credentials/`, `#contact`).
 *
 * Internal links are legitimate destinations, so they are allowed — but
 * everything else is refused, which is what keeps `javascript:` out of an
 * href that comes from a content file.
 */
export const requireLinkTarget = (
  source: Record<string, unknown>,
  field: string,
  where: string,
) => {
  const value = requireString(source, field, where);

  if (value.startsWith("/") || value.startsWith("#")) {
    // `//evil.example` is protocol-relative: it leaves the site despite the
    // leading slash, so it is not a same-site reference.
    if (value.startsWith("//")) {
      throw new Error(
        `${where}: "${field}" must not be protocol-relative`,
      );
    }
    return value;
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(
      `${where}: "${field}" must be an https URL or start with "/" or "#"`,
    );
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`${where}: "${field}" must use https`);
  }
  return value;
};

/** Ordering key: `YYYY-MM`. */
export const MONTH_PATTERN = /^\d{4}-(?:0[1-9]|1[0-2])$/;

export const requireMonth = (
  source: Record<string, unknown>,
  field: string,
  where: string,
) => {
  const value = requireString(source, field, where);
  if (!MONTH_PATTERN.test(value)) {
    throw new Error(
      `${where}: "${field}" must be YYYY-MM (got ${JSON.stringify(value)})`,
    );
  }
  return value;
};

/** Rejects a collection whose ids would collide as filenames. */
export function assertUniqueIds(
  entries: readonly { id: string }[],
  where: string,
) {
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.id)) {
      throw new Error(`Duplicate id ${JSON.stringify(entry.id)} in ${where}`);
    }
    seen.add(entry.id);
  }
}

/**
 * Derives a filename-safe id from a title.
 *
 * No `node:crypto` fallback, because this runs in the browser too — a value
 * with no latin characters folds to a short deterministic digest computed
 * inline instead.
 */
export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug) return slug;

  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash + value.charCodeAt(index)) >>> 0;
  }
  return `entry-${hash.toString(36)}`;
}
