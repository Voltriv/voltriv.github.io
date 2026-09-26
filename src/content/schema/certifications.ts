import {
  optionalHttpsUrl,
  optionalString,
  optionalStringArray,
  requireId,
  requireRecord,
  requireString,
} from "./validate";

export const certificationCategories = [
  "Design",
  "Security",
  "Engineering",
  "Cloud",
] as const;

export type CertificationCategory =
  (typeof certificationCategories)[number];

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  category: CertificationCategory;
  issuedYear: string;
  credentialId?: string;
  verificationUrl?: string;
  skills?: string[];
};

/** Validates one raw record and narrows it to `Certification`. */
export function parseCertification(
  raw: unknown,
  where: string,
): Certification {
  const record = requireRecord(raw, where);

  const category = requireString(record, "category", where);
  if (!(certificationCategories as readonly string[]).includes(category)) {
    throw new Error(
      `${where}: "category" must be one of ${certificationCategories.join(
        ", ",
      )} (got ${JSON.stringify(category)})`,
    );
  }

  return {
    id: requireId(record, where),
    name: requireString(record, "name", where),
    issuer: requireString(record, "issuer", where),
    category: category as CertificationCategory,
    issuedYear: requireString(record, "issuedYear", where),
    credentialId: optionalString(record, "credentialId", where),
    verificationUrl: optionalHttpsUrl(record, "verificationUrl", where),
    skills: optionalStringArray(record, "skills", where),
  };
}

/** Newest first, then by name, so file order never leaks into the UI. */
export function sortCertifications(
  entries: readonly Certification[],
): Certification[] {
  return [...entries].sort(
    (a, b) =>
      b.issuedYear.localeCompare(a.issuedYear) || a.name.localeCompare(b.name),
  );
}
