import { useEffect, useRef, useState } from "react";
import { whenBootClears } from "../bootGate";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type CountUpProps = {
  value: number;
  /** Rendered instead of the animated number when motion is reduced. */
  format?: (current: number) => string;
  durationMs?: number;
  className?: string;
};

/**
 * Counts 0 -> value whenever the element enters the viewport, and re-arms on
 * exit so it replays alongside the reveal system.
 *
 * The final value is always what lands in the DOM at rest, so assistive tech
 * and tests never observe a partial number.
 */
export function CountUp({
  value,
  format = (current) => current.toString(),
  durationMs = 1100,
  className,
}: CountUpProps) {
  const [current, setCurrent] = useState(value);
  const elementRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    // No observer, or motion is unwanted: leave the final value in place.
    // State already initialises to `value`, so there is nothing to set here —
    // and setting it synchronously in an effect would cascade a render.
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const cancel = () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };

    const run = () => {
      cancel();
      const start = performance.now();

      const step = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1);
        // Same easing curve as the reveal transitions.
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(Math.round(eased * value));

        if (progress < 1) {
          frameRef.current = window.requestAnimationFrame(step);
        } else {
          frameRef.current = null;
        }
      };

      frameRef.current = window.requestAnimationFrame(step);
    };

    let observer: IntersectionObserver | undefined;

    // Gated on the boot overlay for the same reason as the reveals: the hero
    // metrics sit in the first viewport, so an ungated counter finishes
    // counting behind the boot screen.
    const disposeGate = whenBootClears(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            run();
          } else if (entry?.intersectionRatio === 0) {
            cancel();
            setCurrent(0);
          }
        },
        // Both boundaries matter: 0.35 starts the count, and 0 is what lets
        // the reset branch fire at all. With a single 0.35 threshold the
        // observer never reports a ratio of 0, so it would never re-arm.
        { threshold: [0, 0.35] },
      );

      observer.observe(element);
    });

    return () => {
      disposeGate();
      cancel();
      observer?.disconnect();
    };
  }, [value, durationMs]);

  return (
    <span ref={elementRef} className={className}>
      {format(current)}
    </span>
  );
}
