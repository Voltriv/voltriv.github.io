/** Roughly the reference site's page-transition speed, plus settle time. */
export const SCROLL_TRANSITION_MS = 760;
/**
 * Slack for sub-pixel scroll positions and smooth-scroll landings.
 *
 * Shared, because every caller that arms the lock first has to decide whether
 * the page is going to move at all, and they have to draw that line in the
 * same place as the pager does.
 */
export const SCROLL_EDGE_TOLERANCE_PX = 2;

let lockedUntil = 0;

/**
 * A shared "a programmatic scroll is in flight" window.
 *
 * Both the pager and the nav anchors drive the page with `scrollTo({ behavior:
 * "smooth" })`, and a smooth scroll is not atomic: it takes most of a second,
 * during which every wheel tick and arrow key still reaches the pager. Without
 * a shared window the pager reads the scroll position mid-flight, decides it
 * is in whatever section it is currently passing through, and pages from
 * there — so a click on "Contact" lands two sections short.
 *
 * Module-level rather than a ref: the pager's listeners are bound once outside
 * React, and the anchors live in a different component.
 */
export const lockScrollGestures = (durationMs = SCROLL_TRANSITION_MS) => {
  if (durationMs <= 0) return;
  lockedUntil = Math.max(lockedUntil, performance.now() + durationMs);
};

export const scrollGesturesLocked = () => performance.now() < lockedUntil;

/** Test seam; also lets a teardown drop a stale lock. */
export const releaseScrollGestures = () => {
  lockedUntil = 0;
};
