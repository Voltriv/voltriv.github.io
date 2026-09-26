import { useEffect } from "react";
import {
  SCROLL_EDGE_TOLERANCE_PX as EDGE_TOLERANCE_PX,
  SCROLL_TRANSITION_MS,
  lockScrollGestures,
  releaseScrollGestures,
  scrollGesturesLocked,
} from "./scrollLock";

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

    /** The boot overlay and the offcanvas menu both own scrolling while open. */
    const isBlocked = () =>
      document.getElementById("boot") !== null ||
      document.body.style.overflow === "hidden";

    const maxScrollTop = () =>
      Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

    /**
     * Every section's position in document coordinates — the same space as
     * `window.scrollY`, and the same measurement the nav anchors use.
     *
     * Not `offsetTop`, which is relative to the nearest positioned ancestor.
     * `<main>` is `position: relative`, so `offsetTop` is measured from there
     * and only happens to match the document because `<main>` currently sits
     * at y=0. Any header, banner or padding placed above it in the flow would
     * skew every paging decision by that offset, silently.
     *
     * Measured lazily and cached until the layout can actually have changed.
     * `getBoundingClientRect` forces a synchronous layout, a trackpad emits
     * wheel events faster than frames, and each one asks about every section
     * — so measuring per call meant hundreds of forced layouts a second on a
     * single flick, the page burning CPU purely to decide it should not move
     * yet. Geometry only changes on resize or reflow, so that is where the
     * cache is dropped.
     */
    let boundsCache: { top: number; bottom: number }[] | null = null;

    const invalidateBounds = () => {
      boundsCache = null;
    };

    const allBounds = () => {
      if (!boundsCache) {
        const offset = window.scrollY;
        boundsCache = sections.map((section) => {
          const rect = section.getBoundingClientRect();
          const top = rect.top + offset;
          return { top, bottom: top + rect.height };
        });
      }
      return boundsCache;
    };

    const boundsAt = (index: number) => allBounds()[index];

    /**
     * The section the reader is currently parked in.
     *
     * Measured from the scroll position itself, which is the landing point
     * `goTo` aligns to — not from the middle of the viewport. The two
     * disagree for any section shorter than half a viewport: standing at the
     * top of one, a midpoint probe already reports the *next* section, so
     * paging down skips a section and paging up targets the one the reader is
     * already parked in, which scrolls nowhere and reads as a dead gesture.
     */
    const currentIndex = () => {
      // Parked against the end of the document. `destinationFor` clamps to
      // `maxScrollTop`, so a final section shorter than the viewport lands
      // *above* its own top — and probing by scroll position alone would then
      // name the section before it. Paging up from there would find room
      // still left in that earlier section and hand the gesture back to the
      // browser, so the pager would look dead at the bottom of the page.
      if (window.scrollY >= maxScrollTop() - EDGE_TOLERANCE_PX) {
        return sections.length - 1;
      }

      const probe = window.scrollY + EDGE_TOLERANCE_PX;
      let index = 0;
      allBounds().forEach((bounds, i) => {
        if (bounds.top <= probe) index = i;
      });
      return index;
    };

    /**
     * Where a section should land, given the direction travelled.
     *
     * Downwards is its top. Upwards is its *bottom* edge when it is taller
     * than the viewport, so the reader resumes where the downward pass would
     * have left them instead of being thrown over content they never saw —
     * the mirror of the `hasRoomWithin` scroll-through. Sections that fit the
     * viewport top-align either way.
     */
    const destinationFor = (index: number, direction: 1 | -1) => {
      const { top, bottom } = boundsAt(index);
      const destination =
        direction === -1 ? Math.max(top, bottom - window.innerHeight) : top;

      return Math.min(Math.max(destination, 0), maxScrollTop());
    };

    /** @returns whether a scroll was actually started. */
    const goTo = (index: number, direction: 1 | -1) => {
      if (!sections[index]) return false;

      const destination = destinationFor(index, direction);

      // Already parked on the destination: the document has nothing left to
      // give this way. Arming the lock on a scroll that will not happen would
      // swallow the next gesture too, which is what makes a stuck pager feel
      // broken rather than merely at the end.
      if (Math.abs(destination - window.scrollY) <= EDGE_TOLERANCE_PX) {
        return false;
      }

      lockScrollGestures(SCROLL_TRANSITION_MS);
      window.scrollTo({ top: destination, behavior: "smooth" });
      return true;
    };

    /** True while a taller-than-viewport section still has room to scroll. */
    const hasRoomWithin = (index: number, direction: 1 | -1) => {
      if (!sections[index]) return false;

      const { top, bottom } = boundsAt(index);

      return direction === 1
        ? window.scrollY + window.innerHeight < bottom - EDGE_TOLERANCE_PX
        : window.scrollY > top + EDGE_TOLERANCE_PX;
    };

    const navigate = (direction: 1 | -1, event: Event) => {
      if (isBlocked()) return;

      // Mid-transition: swallow the gesture so an inertial trackpad flick
      // cannot skip several sections at once, and so a nav click's smooth
      // scroll is not hijacked halfway by a stray wheel tick.
      if (scrollGesturesLocked()) {
        event.preventDefault();
        return;
      }

      const index = currentIndex();
      if (hasRoomWithin(index, direction)) return;

      const next = index + direction;
      if (next < 0 || next >= sections.length) return;

      // Only claim the gesture if it actually moves the page; otherwise let
      // the browser have it back.
      if (goTo(next, direction)) event.preventDefault();
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // pinch-zoom
      // Horizontal intent is never paging — it belongs to whatever the
      // pointer is over. Compared by axis rather than by element so a
      // vertical gesture over a horizontally scrollable area still pages.
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
          if (goTo(0, 1)) event.preventDefault();
          break;
        case "End":
          if (isBlocked()) return;
          // Direction 1 on purpose: End means the top of the last section,
          // not its bottom edge.
          if (goTo(sections.length - 1, 1)) event.preventDefault();
          break;
        default:
          break;
      }
    };

    // Not passive: the whole point is being able to cancel the scroll.
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", invalidateBounds);

    // Sections reflow without a resize too — a FAQ row opening, a font
    // swapping in, an image finally landing. ResizeObserver catches those at
    // the source instead of re-measuring on every gesture.
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(invalidateBounds);
    sections.forEach((section) => resizeObserver?.observe(section));

    return () => {
      releaseScrollGestures();
      root.classList.remove("is-paged");
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", invalidateBounds);
      resizeObserver?.disconnect();
    };
  }, [sectionIds]);
}
