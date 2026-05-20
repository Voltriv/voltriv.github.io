import { useEffect, useState } from "react";

const ACTIVE_SECTION_OFFSET_PX = 140;

export function useSectionObserver(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) {
      return undefined;
    }

    let frameId: number | null = null;

    const updateActiveSection = () => {
      frameId = null;

      const scrollPosition = window.scrollY + ACTIVE_SECTION_OFFSET_PX;
      let currentSection = elements[0];

      for (const element of elements) {
        if (element.offsetTop > scrollPosition) break;
        currentSection = element;
      }

      if (currentSection.id) {
        setActiveSection(currentSection.id);
      }
    };

    const scheduleUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [sectionIds]);

  return activeSection;
}
