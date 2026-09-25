import { useEffect } from "react";

/** Roughly the reference site's page-transition speed, plus settle time. */
const TRANSITION_MS = 760;
/** Ignore trackpad jitter and inertial tail-off. */
const WHEEL_THRESHOLD_PX = 8;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Full-page paging: one wheel gesture, arrow key or PageUp/PageDown moves
 * exactly one section, instead of scrolling freely through the document.
 *
 * This hijacks the *input*, not the layout. Sections stay in normal document
 * flow and the page is still genuinely scrolled — so deep links, in-page find,
 * the scrollbar and screen-reader reading order all keep working, which a
 * transform-based "pile" of absolutely positioned panels would break.
 *
 * A section taller than the viewport scrolls through internally first and only
 * advances at its edge, mirroring how the reference site marks its sections
 * scrollable.
 *
 * Deliberately desktop-only (`pointer: fine`). On touch, paging has to cancel
 * `touchmove` to work, which fights iOS Safari's URL-bar collapse and its
 * overscroll; there the CSS scroll-snap fallback gives near-identical results
 * without fighting the OS. Disabled outright under reduced-motion.
 */
export function useFullpagePager(sectionIds: string[]) {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sections.length < 2) return undefined;

    const root = document.documentElement;
    // Turns off CSS snapping, which would otherwise fight the programmatic
    // smooth scrolls. The class is the single switch between the two modes.
    root.classList.add("is-paged");

    let lockedUntil = 0;

    /** The boot overlay and the offcanvas menu both own scrolling while open. */
    const isBlocked = () =>
      document.getElementById("boot") !== null ||
      document.body.style.overflow === "hidden";

    const currentIndex = () => {
      const probe = window.scrollY + window.innerHeight / 2;
      let index = 0;
      sections.forEach((section, i) => {
        if (section.offsetTop <= probe) index = i;
      });
      return index;
    };

    const goTo = (index: number) => {
      const target = sections[index];
      if (!target) return;
      lockedUntil = performance.now() + TRANSITION_MS;
      window.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    };

    /** True while a taller-than-viewport section still has room to scroll. */
    const hasRoomWithin = (index: number, direction: 1 | -1) => {
      const section = sections[index];
      if (!section) return false;

      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;

      return direction === 1
        ? window.scrollY + window.innerHeight < bottom - 2
        : window.scrollY > top + 2;
    };

    const navigate = (direction: 1 | -1, event: Event) => {
      if (isBlocked()) return;

      // Mid-transition: swallow the gesture so an inertial trackpad flick
      // cannot skip several sections at once.
      if (performance.now() < lockedUntil) {
        event.preventDefault();
        return;
      }

      const index = currentIndex();
      if (hasRoomWithin(index, direction)) return;

      const next = index + direction;
      if (next < 0 || next >= sections.length) return;

      event.preventDefault();
      goTo(next);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // pinch-zoom
      // Horizontal intent belongs to the capability carousel, never to paging.
      // This also covers wheeling over the carousel itself: a vertical gesture
      // there should still page, so there is deliberately no element check.
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (Math.abs(event.deltaY) < WHEEL_THRESHOLD_PX) return;

      navigate(event.deltaY > 0 ? 1 : -1, event);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowDown":
        case "PageDown":
          navigate(1, event);
          break;
        case "ArrowUp":
        case "PageUp":
          navigate(-1, event);
          break;
        case "Home":
          if (isBlocked()) return;
          event.preventDefault();
          goTo(0);
          break;
        case "End":
          if (isBlocked()) return;
          event.preventDefault();
          goTo(sections.length - 1);
          break;
        default:
          break;
      }
    };

    // Not passive: the whole point is being able to cancel the scroll.
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      root.classList.remove("is-paged");
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sectionIds]);
}
