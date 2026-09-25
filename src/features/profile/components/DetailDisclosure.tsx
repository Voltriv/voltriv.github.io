import type { ReactNode } from "react";

type DetailDisclosureProps = {
  label: string;
  children: ReactNode;
};

/**
 * Supporting detail, folded away so a section reads as a headline and a lede
 * rather than a document.
 *
 * Native <details>/<summary>: keyboard operable, announced correctly, and
 * findable by in-page search in browsers that search collapsed content — all
 * of which a div-plus-onClick would have to reimplement.
 */
export function DetailDisclosure({ label, children }: DetailDisclosureProps) {
  return (
    <details className="profile-disclosure">
      <summary>
        <span>{label}</span>
        <i aria-hidden="true" />
      </summary>
      <div className="profile-disclosure-body">{children}</div>
    </details>
  );
}
