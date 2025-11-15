import { useEffect, useState } from "react";

const DEFAULT_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: "-45% 0px -45% 0px",
  threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
};

export function useSectionObserver(
  sectionIds: string[],
  options: IntersectionObserverInit = DEFAULT_OPTIONS,
) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible[0]?.target.id) {
        setActiveSection(visible[0].target.id);
        return;
      }

      // fallback: find nearest section above viewport
      const topEntry = entries.find((entry) => entry.boundingClientRect.top >= 0);
      if (topEntry?.target.id) {
        setActiveSection(topEntry.target.id);
      }
    }, options);

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [options, sectionIds]);

  return activeSection;
}
