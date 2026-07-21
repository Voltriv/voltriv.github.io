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

// Add only confirmed credentials with accurate issuer and verification details.
// Counts and category totals on the page are derived from this collection.
export const certifications: readonly Certification[] = [];
