import { act, fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { profileData } from "@/data/profile";
import { ProfileView } from "@/features/profile/ProfileView";

const renderProfile = () => render(<ProfileView />);

const getRequiredElement = <ElementType extends Element>(selector: string) => {
  const element = document.querySelector<ElementType>(selector);
  if (!element) {
    throw new Error(`Expected an element matching ${selector}`);
  }
  return element;
};

const createMediaQueryList = (query: string, matches: boolean) =>
  ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  }) satisfies MediaQueryList;

describe("ProfileView interactions", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("opens the mobile navigation and closes it with Escape", () => {
    renderProfile();
    const menuButton = getRequiredElement<HTMLButtonElement>(
      'button[aria-label="Open navigation menu"]',
    );

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    const mobileNavigation = getRequiredElement<HTMLElement>(
      'nav[aria-label="Mobile primary"]',
    );
    expect(mobileNavigation.querySelectorAll("a")).toHaveLength(
      profileData.navLinks.length + profileData.pageLinks.length,
    );
    expect(
      mobileNavigation.querySelector('a[href="/certifications/"]'),
    ).toHaveTextContent("Credentials");

    fireEvent.keyDown(window, { key: "Escape" });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveFocus();
    expect(document.getElementById("mobile-navigation")).toHaveAttribute(
      "hidden",
    );
  });

  it("toggles FAQ panels with accurate expanded state", () => {
    renderProfile();
    const question = profileData.faqs[0].question;
    const trigger = getRequiredElement<HTMLButtonElement>("#faq-trigger-0");
    const panel = document.getElementById("faq-panel-0");

    expect(trigger).toHaveTextContent(question);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("hidden");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("hidden");
  });

  it("pauses and resumes the collaboration marquee", () => {
    renderProfile();
    const marquee = document.querySelector(".profile-marquee");
    const control = getRequiredElement<HTMLButtonElement>(
      ".profile-motion-control",
    );

    expect(control).toHaveTextContent("Pause movement");
    fireEvent.click(control);

    expect(marquee).toHaveClass("is-paused");
    expect(control).toHaveTextContent("Resume movement");

    fireEvent.click(control);

    expect(marquee).not.toHaveClass("is-paused");
  });

  it("uses reduced-motion behavior for reveals and in-page navigation", () => {
    vi.mocked(window.matchMedia).mockImplementation((query) =>
      createMediaQueryList(
        query,
        query === "(prefers-reduced-motion: reduce)",
      ),
    );
    renderProfile();

    expect(document.querySelectorAll(".rise:not(.in)")).toHaveLength(0);

    fireEvent.click(
      getRequiredElement<HTMLAnchorElement>('a[href="#main-content"]'),
    );

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "auto" }),
    );
    expect(document.getElementById("main-content")).toHaveFocus();
  });

  it("reveals content when IntersectionObserver is unavailable", () => {
    const originalObserver = globalThis.IntersectionObserver;
    vi.stubGlobal("IntersectionObserver", undefined);

    try {
      renderProfile();

      expect(document.querySelectorAll(".rise:not(.in)")).toHaveLength(0);
    } finally {
      vi.stubGlobal("IntersectionObserver", originalObserver);
    }
  });

  it("pauses the marquee automatically while it is offscreen", () => {
    const originalObserver = globalThis.IntersectionObserver;
    const callbacks: IntersectionObserverCallback[] = [];

    class ObserverMock {
      constructor(callback: IntersectionObserverCallback) {
        callbacks.push(callback);
      }

      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }

    vi.stubGlobal("IntersectionObserver", ObserverMock);

    try {
      renderProfile();
      const marquee = getRequiredElement<HTMLElement>(".profile-marquee");
      const marqueeObserver = callbacks.at(-1);
      if (!marqueeObserver) {
        throw new Error("Expected the marquee observer to be registered");
      }

      act(() => {
        marqueeObserver(
          [
            {
              isIntersecting: false,
              target: marquee,
            } as unknown as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver,
        );
      });

      expect(marquee).toHaveClass("is-offscreen");

      act(() => {
        marqueeObserver(
          [
            {
              isIntersecting: true,
              target: marquee,
            } as unknown as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver,
        );
      });

      expect(marquee).not.toHaveClass("is-offscreen");
    } finally {
      vi.stubGlobal("IntersectionObserver", originalObserver);
    }
  });
});
