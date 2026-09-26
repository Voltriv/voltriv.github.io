import { describe, expect, it } from "vitest";
import {
  parseCertification,
  sortCertifications,
  type Certification,
} from "./certifications";
import { assertUniqueIds, slugify } from "./validate";

const valid = {
  id: "cissp",
  name: "CISSP",
  issuer: "ISC2",
  category: "Security",
  issuedYear: "2025",
};

describe("parseCertification", () => {
  it("accepts a minimal entry and drops absent optional fields", () => {
    const entry = parseCertification(valid, "cissp.json");

    expect(entry).toMatchObject({ id: "cissp", category: "Security" });
    expect(entry.credentialId).toBeUndefined();
    expect(entry.verificationUrl).toBeUndefined();
    expect(entry.skills).toBeUndefined();
  });

  it("names the offending file and field when a required value is missing", () => {
    expect(() =>
      parseCertification({ ...valid, issuer: "" }, "cissp.json"),
    ).toThrow(/cissp\.json: "issuer" must be a non-empty string/);
  });

  it("rejects a category outside the allowed set", () => {
    expect(() =>
      parseCertification({ ...valid, category: "Marketing" }, "x.json"),
    ).toThrow(/"category" must be one of Design, Security, Engineering, Cloud/);
  });

  it("rejects an id that is not filename-safe", () => {
    for (const id of ["../escape", "Has Spaces", "UPPER", "trailing-"]) {
      expect(() => parseCertification({ ...valid, id }, "x.json")).toThrow(
        /"id" must be lowercase kebab-case/,
      );
    }
  });

  it("rejects a non-https verification URL rather than hiding the link", () => {
    expect(() =>
      parseCertification(
        { ...valid, verificationUrl: "http://example.com/v" },
        "x.json",
      ),
    ).toThrow(/"verificationUrl" must use https/);

    expect(() =>
      parseCertification(
        { ...valid, verificationUrl: "javascript:alert(1)" },
        "x.json",
      ),
    ).toThrow(/"verificationUrl" must use https/);
  });

  it("rejects a malformed verification URL", () => {
    expect(() =>
      parseCertification({ ...valid, verificationUrl: "not a url" }, "x.json"),
    ).toThrow(/"verificationUrl" is not a valid URL/);
  });

  it("requires skills to be strings", () => {
    expect(() =>
      parseCertification({ ...valid, skills: ["ok", 7] }, "x.json"),
    ).toThrow(/"skills" must be an array of strings/);
  });

  it("trims values and discards blank skills", () => {
    const entry = parseCertification(
      { ...valid, name: "  CISSP  ", skills: ["  risk ", "", "   "] },
      "x.json",
    );

    expect(entry.name).toBe("CISSP");
    expect(entry.skills).toEqual(["risk"]);
  });

  it("rejects anything that is not an object", () => {
    for (const raw of [null, [], "text", 42]) {
      expect(() => parseCertification(raw, "x.json")).toThrow(
        /expected a JSON object/,
      );
    }
  });
});

describe("sortCertifications", () => {
  it("orders newest first, then by name", () => {
    const entries = [
      { ...valid, id: "b", name: "B", issuedYear: "2024" },
      { ...valid, id: "c", name: "C", issuedYear: "2026" },
      { ...valid, id: "a", name: "A", issuedYear: "2026" },
    ] as Certification[];

    expect(sortCertifications(entries).map((entry) => entry.id)).toEqual([
      "a",
      "c",
      "b",
    ]);
  });

  it("does not mutate its input", () => {
    const entries = [
      { ...valid, id: "b", issuedYear: "2024" },
      { ...valid, id: "a", issuedYear: "2026" },
    ] as Certification[];

    sortCertifications(entries);
    expect(entries[0].id).toBe("b");
  });
});

describe("assertUniqueIds", () => {
  it("fails the build on colliding ids, naming the collection", () => {
    expect(() =>
      assertUniqueIds(
        [{ ...valid } as Certification, { ...valid } as Certification],
        "src/content/certifications/",
      ),
    ).toThrow(/Duplicate id "cissp" in src\/content\/certifications\//);
  });

  it("passes a distinct collection", () => {
    expect(() =>
      assertUniqueIds(
        [
          { ...valid } as Certification,
          { ...valid, id: "other" } as Certification,
        ],
        "src/content/certifications/",
      ),
    ).not.toThrow();
  });
});

describe("slugify", () => {
  it("produces filename-safe ids the parser accepts", () => {
    expect(slugify("AWS Certified Solutions Architect – Associate")).toBe(
      "aws-certified-solutions-architect-associate",
    );
    expect(slugify("  CISSP  ")).toBe("cissp");
  });

  it("falls back to a stable digest when nothing latin survives", () => {
    const first = slugify("認定資格");
    expect(first).toMatch(/^entry-[a-z0-9]+$/);
    expect(slugify("認定資格")).toBe(first);
  });
});
