import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Certification } from "@/data/certifications";
import { CertificationsPage } from "@/features/certifications/CertificationsPage";

const fixtureCredentials: readonly Certification[] = [
  {
    id: "fixture-design",
    name: "Interface Systems",
    issuer: "Example Design Institute",
    category: "Design",
    issuedYear: "2023",
    credentialId: "DES-100",
    skills: ["Design systems", "Accessibility"],
  },
  {
    id: "fixture-security",
    name: "Application Security",
    issuer: "Example Security Academy",
    category: "Security",
    issuedYear: "2024",
    credentialId: "SEC-200",
    verificationUrl: "https://example.com/credentials/SEC-200",
    skills: ["Threat modeling"],
  },
  {
    id: "fixture-cloud",
    name: "Cloud Foundations",
    issuer: "Example Cloud Academy",
    category: "Cloud",
    issuedYear: "2025",
    credentialId: "CLD-300",
  },
  {
    id: "fixture-engineering",
    name: "Build Systems",
    issuer: "Example Learning Lab",
    category: "Engineering",
    issuedYear: "2022",
    credentialId: "ENG-400",
    skills: ["Delivery automation"],
  },
];

const unsafeVerificationFixture: Certification = {
  id: "fixture-unsafe",
  name: "Unsafe Verification Fixture",
  issuer: "Example Test Issuer",
  category: "Engineering",
  issuedYear: "2025",
  verificationUrl: "javascript:alert('unsafe')",
};

const getRequiredElement = <ElementType extends Element>(selector: string) => {
  const element = document.querySelector<ElementType>(selector);
  if (!element) {
    throw new Error(`Expected an element matching ${selector}`);
  }
  return element;
};

const visibleCards = () =>
  document.querySelectorAll<HTMLElement>("[data-credential-card]");

describe("CertificationsPage", () => {
  it("renders an honest empty state with data-derived counts", () => {
    render(<CertificationsPage />);

    expect(document.querySelector("h1")).toHaveTextContent(
      "Certifications & credentials",
    );
    expect(document.querySelector("[data-empty-state]")).toHaveTextContent(
      "No credentials have been published yet.",
    );
    expect(document.getElementById("credentials-content")).toHaveAttribute(
      "tabindex",
      "-1",
    );
    expect(
      document.querySelector('label[for="credential-search"]'),
    ).toHaveTextContent("Search credentials");
    expect(document.getElementById("credential-results-count")).toHaveTextContent(
      "// 0 / 0 matches",
    );
    expect(
      getRequiredElement<HTMLButtonElement>('button[data-category="All"]'),
    ).toHaveTextContent("All0");
    expect(
      getRequiredElement<HTMLButtonElement>('button[data-category="All"]'),
    ).toHaveAccessibleName("All 0 credentials");
  });

  it("searches every supported field and combines search with categories", () => {
    render(<CertificationsPage items={fixtureCredentials} />);
    const search = getRequiredElement<HTMLInputElement>("#credential-search");

    const searches = [
      ["Interface Systems", "Interface Systems"],
      ["Example Security Academy", "Application Security"],
      ["SEC-200", "Application Security"],
      ["2025", "Cloud Foundations"],
      ["Engineering", "Build Systems"],
      ["Delivery automation", "Build Systems"],
    ] as const;

    searches.forEach(([value, expectedCredential]) => {
      fireEvent.change(search, { target: { value } });
      expect(visibleCards()).toHaveLength(1);
      expect(visibleCards()[0]).toHaveTextContent(expectedCredential);
    });

    const clearSearch = getRequiredElement<HTMLButtonElement>(
      'button[aria-label="Clear credential search"]',
    );
    clearSearch.focus();
    fireEvent.click(clearSearch);
    expect(search).toHaveFocus();
    expect(search).toHaveValue("");

    expect(document.getElementById("credential-results-count")).toHaveTextContent(
      "// 4 / 4 matches",
    );

    fireEvent.change(search, { target: { value: "Example" } });
    fireEvent.click(
      getRequiredElement<HTMLButtonElement>(
        'button[data-category="Cloud"]',
      ),
    );

    expect(visibleCards()).toHaveLength(1);
    expect(visibleCards()[0]).toHaveTextContent("Cloud Foundations");
    expect(
      getRequiredElement<HTMLButtonElement>(
        'button[data-category="Cloud"]',
      ),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      getRequiredElement<HTMLButtonElement>(
        'button[data-category="Cloud"]',
      ),
    ).toHaveAccessibleName("Cloud 1 credential");
  });

  it("resets a zero-result query and category selection", () => {
    render(<CertificationsPage items={fixtureCredentials} />);
    const search = getRequiredElement<HTMLInputElement>("#credential-search");

    fireEvent.click(
      getRequiredElement<HTMLButtonElement>(
        'button[data-category="Security"]',
      ),
    );
    fireEvent.change(search, { target: { value: "not-a-credential" } });

    expect(document.querySelector("[data-no-results]")).toHaveTextContent(
      "No credentials match this query.",
    );

    const resetButton = getRequiredElement<HTMLButtonElement>(
      "[data-no-results] button",
    );
    resetButton.focus();
    fireEvent.click(resetButton);

    expect(search).toHaveValue("");
    expect(search).toHaveFocus();
    expect(visibleCards()).toHaveLength(fixtureCredentials.length);
    expect(
      getRequiredElement<HTMLButtonElement>('button[data-category="All"]'),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("announces a singular total with correct grammar", () => {
    render(<CertificationsPage items={[fixtureCredentials[0]]} />);

    expect(
      document.querySelector(
        "#credential-results-count .credentials-sr-only",
      ),
    ).toHaveTextContent("Showing 1 of 1 credential");
  });

  it("uses safe external verification links only when a URL exists", () => {
    render(
      <CertificationsPage
        items={[...fixtureCredentials, unsafeVerificationFixture]}
      />,
    );
    const verificationLinks = document.querySelectorAll<HTMLAnchorElement>(
      '.credential-card-footer a[target="_blank"]',
    );

    expect(verificationLinks).toHaveLength(1);
    expect(verificationLinks[0]).toHaveAttribute(
      "href",
      "https://example.com/credentials/SEC-200",
    );
    expect(verificationLinks[0]).toHaveAccessibleName(
      "Verify Application Security credential (opens in a new tab)",
    );
    expect(verificationLinks[0]).toHaveAttribute(
      "rel",
      expect.stringContaining("noopener"),
    );
    expect(verificationLinks[0]).toHaveAttribute(
      "rel",
      expect.stringContaining("noreferrer"),
    );
    expect(
      document.querySelector(
        '[data-credential-card="fixture-unsafe"]',
      ),
    ).toHaveTextContent("Documented record");
  });
});
