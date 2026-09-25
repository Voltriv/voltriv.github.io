import type { SocialLink } from "@/data/profile";
import { getSocialIcon } from "./socialIcons";

type SocialRailProps = {
  links: SocialLink[];
};

/**
 * Fixed vertical social strip, desktop only (CSS hides it below 1280px, where
 * the same links remain reachable from the contact grid).
 *
 * A rule above and below the icons, spanning the viewport height. The rules
 * are decorative `<i>` elements rather than borders so they can flex to fill
 * whatever space is left around the icons.
 */
export function SocialRail({ links }: SocialRailProps) {
  if (!links.length) return null;

  return (
    <div className="profile-social-rail">
      <i className="profile-rail-line" aria-hidden="true" />

      <div className="profile-social-rail__links">
        {links.map((link) => {
          const isExternal = /^https?:/i.test(link.href);

          return (
            <a
              key={link.label}
              href={link.href}
              aria-label={link.label}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer noopener" : undefined}
            >
              {getSocialIcon(link.label)}
            </a>
          );
        })}
      </div>

      <i className="profile-rail-line" aria-hidden="true" />
    </div>
  );
}
