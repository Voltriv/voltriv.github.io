import { useEffect, useRef, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { X } from "lucide-react";
import type { NavLink } from "@/data/profile";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export type CloseOptions = {
  /**
   * Whether the caller should pull focus back to the trigger. False after a
   * navigation, where smoothScrollToHash has already focused the target
   * section and stealing focus back would undo it.
   */
  restoreFocus?: boolean;
};

type OffcanvasMenuProps = {
  open: boolean;
  navLinks: NavLink[];
  pageLinks: NavLink[];
  activeSection: string;
  onClose: (options?: CloseOptions) => void;
  onNavigate: (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => void;
};

const itemStyle = (index: number): CSSProperties =>
  ({ "--item-index": index }) as CSSProperties;

/**
 * Full-screen navigation overlay.
 *
 * Scroll locking uses `document.body`, deliberately not `documentElement` —
 * BootIntro owns the inline overflow style on the root element, and clobbering
 * it here would unlock the page mid-boot.
 */
export function OffcanvasMenu({
  open,
  navLinks,
  pageLinks,
  activeSection,
  onClose,
  onNavigate,
}: OffcanvasMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      // No visibility filtering: the trap only runs while the panel is open,
      // and `offsetParent` is unreliable outside a real layout engine.
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      // Focus restoration is the caller's job (see ProfileView's onClose).
      // Doing it here too would run after the caller's focus() during commit
      // and steal focus back to whatever was active when the menu opened.
    };
  }, [open, onClose]);

  const entries = [...navLinks, ...pageLinks];

  return (
    <div
      ref={panelRef}
      id="primary-navigation"
      className={`profile-offcanvas${open ? " is-open" : ""}`}
      aria-hidden={!open}
      /* `visibility: hidden` in the closed state already removes every
         descendant from the tab order, so no `inert` polyfill is needed. */
    >
      <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-8">
        <nav aria-label="Primary" className="min-w-0 flex-1">
          {entries.map((link, index) => {
            const isSection = link.href.startsWith("#");
            const isActive =
              isSection && activeSection === link.href.replace("#", "");

            return (
              <div
                key={link.href}
                className="profile-offcanvas-item"
                style={itemStyle(index)}
              >
                <a
                  href={link.href}
                  className="profile-offcanvas-link"
                  aria-current={isActive ? "location" : undefined}
                  onClick={(event) => {
                    if (isSection) {
                      onNavigate(event, link.href);
                      // The section now holds focus — leave it there.
                      onClose({ restoreFocus: false });
                      return;
                    }
                    onClose();
                  }}
                >
                  <span className="profile-offcanvas-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{link.label}</span>
                </a>
              </div>
            );
          })}
        </nav>
        <button
          ref={closeButtonRef}
          type="button"
          /* Wrapped, not passed directly: as a handler the click event would
             arrive as the `options` argument. */
          onClick={() => onClose()}
          aria-label="Close navigation menu"
          className="profile-icon-button inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--profile-border)] bg-[var(--profile-surface)] text-[var(--profile-ink)]"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
