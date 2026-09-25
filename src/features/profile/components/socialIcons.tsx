import { Link as LinkIcon, Mail } from "lucide-react";

/**
 * Maps a social link label to its icon.
 *
 * Brand marks are inline SVG rather than lucide imports — lucide dropped its
 * brand icon set, so `Github` and `Linkedin` are no longer exported.
 *
 * The paths are inlined rather than extracted into named components on
 * purpose: a module that exports a helper *and* defines components trips
 * react-refresh/only-export-components.
 */
export const getSocialIcon = (label: string) => {
  switch (label.toLowerCase()) {
    case "linkedin":
      return (
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.34 7.43a2.06 2.06 0 1 0 0-4.12 2.06 2.06 0 0 0 0 4.12ZM3.86 20.45h2.95V9H3.86v11.45ZM9.35 9v11.45h3.55v-5.67c0-1.49.28-2.94 2.14-2.94 1.82 0 1.85 1.71 1.85 3.04v5.57h3.56v-6.28c0-3.09-.67-5.46-4.27-5.46-1.73 0-2.9.95-3.37 1.85h-.05V9H9.35Z" />
        </svg>
      );
    case "github":
      return (
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 .5C5.73.5.9 5.33.9 11.6c0 4.9 3.17 9.06 7.57 10.53.55.1.75-.24.75-.53v-1.9c-3.08.67-3.73-1.3-3.73-1.3-.5-1.29-1.23-1.63-1.23-1.63-1.01-.69.08-.67.08-.67 1.11.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.7-1.49-2.46-.28-5.05-1.23-5.05-5.48 0-1.21.43-2.2 1.14-2.98-.11-.28-.5-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.56 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.22 2.66.11 2.94.71.78 1.14 1.77 1.14 2.98 0 4.26-2.6 5.2-5.07 5.47.4.35.76 1.03.76 2.08v3.08c0 .3.2.64.76.53 4.4-1.47 7.56-5.63 7.56-10.53C23.1 5.33 18.27.5 12 .5Z" />
        </svg>
      );
    case "email":
      return <Mail className="size-4" aria-hidden="true" />;
    default:
      return <LinkIcon className="size-4" aria-hidden="true" />;
  }
};
