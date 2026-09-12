import { useEffect } from "react";

type UseRiseRevealOptions = {
  stagger?: boolean;
};

export function useRiseReveal(
  containerRef?: React.RefObject<HTMLElement | null>,
  { stagger = false }: UseRiseRevealOptions = {},
  // Extra dependencies (e.g. a filtered list) that should re-scan the DOM
  // for newly rendered `.rise` elements once the initial reveal has fired.
  deps: readonly unknown[] = [],
) {
  useEffect(() => {
    const root: ParentNode = containerRef?.current ?? document;
    const elements = Array.from(root.querySelectorAll<HTMLElement>(".rise"));
    if (!elements.length) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      elements.forEach((element) => element.classList.add("in"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 },
    );

    elements.forEach((element, index) => {
      if (stagger) {
        element.style.transitionDelay = `${(index % 5) * 70}ms`;
      }
      observer.observe(element);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, stagger, ...deps]);
}
