import { certificationCategories } from "@/content/schema/certifications";

/**
 * What the admin form knows about each collection.
 *
 * A declarative spec rather than three hand-written forms: the fields are the
 * only thing that differs between them, and three copies of the same
 * save/delete/list logic would drift the moment one schema changed.
 *
 * Validation deliberately lives on the server side of the dev endpoint, which
 * runs the very parser the build uses. These specs describe *shape* only —
 * they are a convenience, never the authority.
 */

export type FieldSpec = {
  key: string;
  label: string;
  /** `list` edits a string array as one comma- or newline-separated box. */
  kind: "text" | "textarea" | "select" | "list" | "number";
  required?: boolean;
  options?: readonly string[];
  placeholder?: string;
  hint?: string;
};

export type CollectionSpec = {
  key: string;
  label: string;
  /** Which field seeds the generated id, and titles rows in the list. */
  titleField: string;
  subtitleFields: string[];
  fields: FieldSpec[];
};

export const COLLECTIONS: CollectionSpec[] = [
  {
    key: "certifications",
    label: "Credentials",
    titleField: "name",
    subtitleFields: ["issuer", "category", "issuedYear"],
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "issuer", label: "Issuer", kind: "text", required: true },
      {
        key: "category",
        label: "Category",
        kind: "select",
        required: true,
        options: certificationCategories,
      },
      {
        key: "issuedYear",
        label: "Issued year",
        kind: "text",
        required: true,
        placeholder: "2026",
      },
      { key: "credentialId", label: "Credential ID", kind: "text" },
      {
        key: "verificationUrl",
        label: "Verification URL",
        kind: "text",
        placeholder: "https://",
        hint: "Must be https.",
      },
      { key: "skills", label: "Skills", kind: "list" },
    ],
  },
  {
    key: "experience",
    label: "Experience",
    titleField: "company",
    subtitleFields: ["role", "period"],
    fields: [
      { key: "company", label: "Company", kind: "text", required: true },
      { key: "role", label: "Role", kind: "text", required: true },
      {
        key: "period",
        label: "Period",
        kind: "text",
        required: true,
        placeholder: "August 2025 - November 2025",
        hint: "Shown to readers exactly as typed.",
      },
      {
        key: "startDate",
        label: "Start date",
        kind: "text",
        required: true,
        placeholder: "2025-08",
        hint: "YYYY-MM. Used only to order entries, never displayed.",
      },
      {
        key: "summary",
        label: "Summary",
        kind: "textarea",
        required: true,
      },
      {
        key: "bullets",
        label: "Highlights",
        kind: "list",
        required: true,
        hint: "One per line.",
      },
    ],
  },
  {
    key: "projects",
    label: "Projects",
    titleField: "title",
    subtitleFields: ["link"],
    fields: [
      { key: "title", label: "Title", kind: "text", required: true },
      {
        key: "description",
        label: "Description",
        kind: "textarea",
        required: true,
      },
      {
        key: "link",
        label: "Link",
        kind: "text",
        required: true,
        placeholder: "https://",
        hint: 'An https URL, or a same-site path starting with "/" or "#".',
      },
      {
        key: "order",
        label: "Order",
        kind: "number",
        placeholder: "0",
        hint: "Lower sorts first.",
      },
    ],
  },
];

/** Fields edited as a string array rather than a scalar. */
export const isListField = (spec: FieldSpec) => spec.kind === "list";
