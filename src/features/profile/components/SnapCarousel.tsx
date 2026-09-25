import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SnapCarouselProps = {
  label: string;
  children: ReactNode;
};

/**
 * Horizontal scroll-snap carousel built on native overflow scrolling — no
 * Swiper, no dependency. Keyboard arrows, trackpad swipe and touch drag all
 * work because the scroller is a real scroll container.
 */
export function SnapCarousel({ label, children }: SnapCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncBounds = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(maxScroll <= 1 || track.scrollLeft >= maxScroll - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    syncBounds();
    track.addEventListener("scroll", syncBounds, { passive: true });

    const resizeObserver =
      "ResizeObserver" in window ? new ResizeObserver(syncBounds) : undefined;
    // The track's own box is fixed by the grid, so observing only it would
    // miss scrollWidth changes from content growing (late font swap, wrapped
    // chips) and leave the next/prev disabled state stale.
    resizeObserver?.observe(track);
    Array.from(track.children).forEach((child) =>
      resizeObserver?.observe(child),
    );

    return () => {
      track.removeEventListener("scroll", syncBounds);
      resizeObserver?.disconnect();
    };
  }, [syncBounds]);

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;

    const firstChild = track.firstElementChild as HTMLElement | null;
    const step = firstChild
      ? firstChild.getBoundingClientRect().width + 20
      : track.clientWidth * 0.8;

    track.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      /* min-w-0: as a grid/flex item this would otherwise take its automatic
         content-based minimum and blow the track's full width out into the
         page instead of scrolling. */
      className="min-w-0 space-y-5"
    >
      {/* No tabIndex/onKeyDown here: browsers already make an overflowing
          scroll container keyboard-focusable and arrow-scrollable, and adding
          handlers to a plain div only fakes interactivity. Explicit keyboard
          control lives on the prev/next buttons below. */}
      <div ref={trackRef} className="profile-carousel-track">
        {children}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="profile-carousel-button"
          onClick={() => scrollByPage(-1)}
          disabled={atStart}
          /* The wrapping group is already labelled, so "previous slide" reads
             correctly in context — `Previous ${label}` produced "Previous
             Capability stack". */
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="profile-carousel-button"
          onClick={() => scrollByPage(1)}
          disabled={atEnd}
          aria-label="Next slide"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
