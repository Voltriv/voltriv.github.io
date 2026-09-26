import { describe, expect, it } from "vitest";
import {
  parseExperience,
  sortExperiences,
  type Experience,
} from "./experience";

const valid = {
  id: "libreport",
  company: "LibReport",
  role: "Project Manager",
  period: "August 2025 - November 2025",
  startDate: "2025-08",
  summary: "Directed delivery of an academic reporting suite.",
  bullets: ["Ran sprint rituals.", "Maintained migrations."],
};

describe("parseExperience", () => {
  it("accepts a complete entry", () => {
    expect(parseExperience(valid, "libreport.json")).toEqual(valid);
  });

  it("requires every displayed field", () => {
    for (const field of ["company", "role", "period", "summary"]) {
      expect(() =>
        parseExperience({ ...valid, [field]: "" }, "libreport.json"),
      ).toThrow(
        new RegExp(`libreport\\.json: "${field}" must be a non-empty string`),
      );
    }
  });

  it("requires startDate to be YYYY-MM", () => {
    for (const startDate of ["2025", "August 2025", "2025-13", "2025-1"]) {
      expect(() =>
        parseExperience({ ...valid, startDate }, "x.json"),
      ).toThrow(/"startDate" must be YYYY-MM/);
    }
  });

  it("requires at least one highlight", () => {
    expect(() => parseExperience({ ...valid, bullets: [] }, "x.json")).toThrow(
      /"bullets" must have at least one entry/,
    );
    expect(() =>
      parseExperience({ ...valid, bullets: ["  ", ""] }, "x.json"),
    ).toThrow(/"bullets" must have at least one entry/);
  });

  it("rejects non-string highlights", () => {
    expect(() =>
      parseExperience({ ...valid, bullets: ["ok", 3] }, "x.json"),
    ).toThrow(/"bullets" must be an array of strings/);
  });

  it("rejects an id that is not filename-safe", () => {
    expect(() =>
      parseExperience({ ...valid, id: "../escape" }, "x.json"),
    ).toThrow(/"id" must be lowercase kebab-case/);
  });
});

describe("sortExperiences", () => {
  it("orders newest first by startDate, not by period text", () => {
    const entries = [
      { ...valid, id: "old", company: "Old", startDate: "2024-08" },
      { ...valid, id: "new", company: "New", startDate: "2025-08" },
      { ...valid, id: "mid", company: "Mid", startDate: "2025-01" },
    ] as Experience[];

    expect(sortExperiences(entries).map((entry) => entry.id)).toEqual([
      "new",
      "mid",
      "old",
    ]);
  });

  it("does not mutate its input", () => {
    const entries = [
      { ...valid, id: "a", startDate: "2024-01" },
      { ...valid, id: "b", startDate: "2025-01" },
    ] as Experience[];

    sortExperiences(entries);
    expect(entries[0].id).toBe("a");
  });
});
