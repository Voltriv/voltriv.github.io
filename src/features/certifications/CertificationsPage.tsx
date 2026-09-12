import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Award,
  ExternalLink,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import {
  certificationCategories,
  certifications,
  type Certification,
  type CertificationCategory,
} from "@/data/certifications";
import { useRiseReveal } from "@/hooks/useRiseReveal";
import "./certifications.css";

type CertificationFilter = "All" | CertificationCategory;

type CertificationsPageProps = {
  items?: readonly Certification[];
};

const searchableText = (credential: Certification) =>
  [
    credential.name,
    credential.issuer,
    credential.credentialId,
    credential.issuedYear,
    credential.category,
    ...(credential.skills ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

const safeVerificationUrl = (value?: string) => {
  if (!value) return undefined;

  try {
    return new URL(value).protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
};

export function CertificationsPage({
  items = certifications,
}: CertificationsPageProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<CertificationFilter>("All");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase();

  useRiseReveal(undefined, { stagger: true }, [normalizedQuery, activeCategory, items]);

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        certificationCategories.map((category) => [
          category,
          items.filter((credential) => credential.category === category)
            .length,
        ]),
      ) as Record<CertificationCategory, number>,
    [items],
  );

  const filteredCredentials = useMemo(
    () =>
      items.filter((credential) => {
        const matchesCategory =
          activeCategory === "All" ||
          credential.category === activeCategory;
        const matchesQuery =
          !normalizedQuery ||
          searchableText(credential).includes(normalizedQuery);

        return matchesCategory && matchesQuery;
      }),
    [activeCategory, items, normalizedQuery],
  );

  const resetFilters = () => {
    setQuery("");
    setActiveCategory("All");
    searchInputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery("");
    searchInputRef.current?.focus();
  };

  const filters: readonly CertificationFilter[] = [
    "All",
    ...certificationCategories,
  ];

  return (
    <div className="credentials-page">
      <a className="credentials-skip-link" href="#credentials-content">
        Skip to credentials
      </a>

      <main
        id="credentials-content"
        className="credentials-shell"
        tabIndex={-1}
      >
        <header className="credentials-hero">
          <div className="credentials-marker-row">
            <div className="credentials-marker" aria-hidden="true">
              <span>02</span>
              <span className="credentials-marker-line" />
              <span className="credentials-marker-label">
                <span className="credentials-marker-label-full">
                  // credential.stack
                </span>
                <span className="credentials-marker-label-short">
                  // credentials
                </span>
              </span>
            </div>

            <a
              className="credentials-back-link"
              href="/"
              aria-label="Back to profile"
            >
              <ArrowLeft aria-hidden="true" />
              Back to profile
            </a>
          </div>

          <div className="credentials-heading rise">
            <h1>Certifications &amp; credentials</h1>
            <p>
              A searchable index for confirmed training across design,
              engineering, cloud, and offensive security.
            </p>
          </div>
        </header>

        <section
          className="credentials-browser"
          aria-labelledby="credential-browser-title"
        >
          <h2 id="credential-browser-title" className="credentials-sr-only">
            Browse credentials
          </h2>

          <div className="credentials-query-row rise">
            <div className="credentials-search">
              <label
                className="credentials-sr-only"
                htmlFor="credential-search"
              >
                Search credentials
              </label>
              <Search aria-hidden="true" />
              <input
                id="credential-search"
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="QUERY :: name · issuer · id · year"
                autoComplete="off"
              />
              {query ? (
                <button
                  type="button"
                  className="credentials-search-clear"
                  onClick={clearSearch}
                  aria-label="Clear credential search"
                >
                  <X aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <p
              id="credential-results-count"
              className="credentials-match-count"
              role="status"
              aria-live="polite"
            >
              <span aria-hidden="true">
                // {filteredCredentials.length} / {items.length} matches
              </span>
              <span className="credentials-sr-only">
                Showing {filteredCredentials.length} of {items.length}{" "}
                {items.length === 1 ? "credential" : "credentials"}
              </span>
            </p>
          </div>

          <fieldset className="credentials-filters rise">
            <legend>// category</legend>
            <div className="credentials-filter-list">
              {filters.map((filter) => {
                const count =
                  filter === "All" ? items.length : categoryCounts[filter];
                const isActive = activeCategory === filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    data-category={filter}
                    aria-pressed={isActive}
                    aria-label={`${filter} ${count} ${
                      count === 1 ? "credential" : "credentials"
                    }`}
                    className={isActive ? "is-active" : undefined}
                    onClick={() => setActiveCategory(filter)}
                  >
                    <span>{filter}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {items.length === 0 ? (
            <section
              className="credentials-empty rise"
              data-empty-state
              aria-labelledby="credentials-empty-title"
            >
              <div className="credentials-empty-icon" aria-hidden="true">
                <Award />
              </div>
              <p className="credentials-empty-code">
                dataset.status :: awaiting verified records
              </p>
              <h2 id="credentials-empty-title">
                No credentials have been published yet.
              </h2>
              <p>
                Confirmed certificate names, issuers, issue years, credential
                IDs, and verification links will appear here once available.
              </p>
              <a href="/">
                <ArrowLeft aria-hidden="true" />
                Return to profile
              </a>
            </section>
          ) : filteredCredentials.length ? (
            <ol className="credentials-grid" aria-label="Credential results">
              {filteredCredentials.map((credential, index) => {
                const verificationUrl = safeVerificationUrl(
                  credential.verificationUrl,
                );

                return (
                  <li key={credential.id}>
                    <article
                      className="credential-card rise"
                      data-credential-card={credential.id}
                    >
                      <div className="credential-card-header">
                        <span>
                          // {credential.category.toLocaleUpperCase()}
                        </span>
                        <span>
                          REC.
                          {(index + 1).toString().padStart(2, "0")}
                        </span>
                      </div>

                      <div className="credential-card-body">
                        <div
                          className="credential-card-mark"
                          aria-hidden="true"
                        >
                          <Award />
                        </div>
                        <h2>{credential.name}</h2>
                        <p className="credential-card-issuer">
                          {credential.issuer}
                        </p>

                        <dl className="credential-card-meta">
                          <div>
                            <dt>Issued</dt>
                            <dd>{credential.issuedYear}</dd>
                          </div>
                          {credential.credentialId ? (
                            <div>
                              <dt>Credential ID</dt>
                              <dd>{credential.credentialId}</dd>
                            </div>
                          ) : null}
                        </dl>

                        {credential.skills?.length ? (
                          <ul
                            className="credential-skills"
                            aria-label="Covered skills"
                          >
                            {credential.skills.map((skill) => (
                              <li key={skill}>{skill}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>

                      <div className="credential-card-footer">
                        <span>
                          {verificationUrl
                            ? "Verifiable record"
                            : "Documented record"}
                        </span>
                        {verificationUrl ? (
                          <a
                            href={verificationUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            aria-label={`Verify ${credential.name} credential (opens in a new tab)`}
                          >
                            Verify credential
                            <ExternalLink aria-hidden="true" />
                          </a>
                        ) : null}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          ) : (
            <section
              className="credentials-empty credentials-empty--compact rise"
              data-no-results
              aria-labelledby="credentials-no-results-title"
            >
              <div className="credentials-empty-icon" aria-hidden="true">
                <Search />
              </div>
              <p className="credentials-empty-code">
                query.status :: zero matches
              </p>
              <h2 id="credentials-no-results-title">
                No credentials match this query.
              </h2>
              <p>Try another issuer, credential ID, year, or category.</p>
              <button type="button" onClick={resetFilters}>
                <RotateCcw aria-hidden="true" />
                Reset filters
              </button>
            </section>
          )}
        </section>

        <footer className="credentials-footer">
          <span>Elijah Meir Vinluan</span>
          <span>// credential index</span>
        </footer>
      </main>
    </div>
  );
}
