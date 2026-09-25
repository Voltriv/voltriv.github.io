import type { MouseEvent as ReactMouseEvent } from "react";
import type { NavLink } from "@/data/profile";

type SectionDotNavProps = {
  links: NavLink[];
  activeSection: string;
  onNavigate: (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => void;
};

/**
 * Fixed section indicator. Purely presentational — the active section is
 * already computed by useSectionObserver, which the header shares.
 *
 * Rendered as real anchors so it degrades to a usable list of links when
 * JavaScript scroll handling is unavailable.
 */
export function SectionDotNav({
  links,
  activeSection,
  onNavigate,
}: SectionDotNavProps) {
  return (
    <nav className="profile-dotnav" aria-label="Section">
      {links.map((link) => {
        const isActive = activeSection === link.href.replace("#", "");

        return (
          <a
            key={link.href}
            href={link.href}
            onClick={(event) => onNavigate(event, link.href)}
            aria-current={isActive ? "location" : undefined}
          >
            <span>{link.label}</span>
            <i aria-hidden="true" />
          </a>
        );
      })}
    </nav>
  );
}
