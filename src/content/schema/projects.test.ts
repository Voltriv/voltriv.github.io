import { describe, expect, it } from "vitest";
import { parseProject, sortProjects, type Project } from "./projects";

const valid = {
  id: "libreport",
  title: "LibReport",
  description: "An academic reporting suite for campus libraries.",
  link: "https://example.com/libreport",
};

describe("parseProject", () => {
  it("accepts a minimal entry and defaults order to 0", () => {
    expect(parseProject(valid, "libreport.json")).toEqual({
      ...valid,
      order: 0,
    });
  });

  it("accepts same-site links", () => {
    for (const link of ["/certifications/", "#contact"]) {
      expect(parseProject({ ...valid, link }, "x.json").link).toBe(link);
    }
  });

  it("rejects a protocol-relative link that would leave the site", () => {
    expect(() =>
      parseProject({ ...valid, link: "//evil.example/x" }, "x.json"),
    ).toThrow(/"link" must not be protocol-relative/);
  });

  it("rejects a javascript: link", () => {
    expect(() =>
      parseProject({ ...valid, link: "javascript:alert(1)" }, "x.json"),
    ).toThrow(/"link" must use https/);
  });

  it("rejects plain http", () => {
    expect(() =>
      parseProject({ ...valid, link: "http://example.com" }, "x.json"),
    ).toThrow(/"link" must use https/);
  });

  it("rejects an unparseable link", () => {
    expect(() =>
      parseProject({ ...valid, link: "not a url" }, "x.json"),
    ).toThrow(/must be an https URL or start with "\/" or "#"/);
  });

  it("accepts a numeric string for order, as the form posts it", () => {
    expect(parseProject({ ...valid, order: "3" }, "x.json").order).toBe(3);
    expect(parseProject({ ...valid, order: 3 }, "x.json").order).toBe(3);
    expect(parseProject({ ...valid, order: "" }, "x.json").order).toBe(0);
  });

  it("rejects a non-numeric order", () => {
    expect(() => parseProject({ ...valid, order: "soon" }, "x.json")).toThrow(
      /"order" must be a number/,
    );
  });

  it("requires title and description", () => {
    for (const field of ["title", "description"]) {
      expect(() => parseProject({ ...valid, [field]: "" }, "x.json")).toThrow(
        new RegExp(`"${field}" must be a non-empty string`),
      );
    }
  });
});

describe("sortProjects", () => {
  it("honours author order, then title", () => {
    const entries = [
      { ...valid, id: "c", title: "C", order: 1 },
      { ...valid, id: "a", title: "A", order: 0 },
      { ...valid, id: "b", title: "B", order: 0 },
    ] as Project[];

    expect(sortProjects(entries).map((entry) => entry.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});
