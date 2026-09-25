import { act, fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import { profileData } from "@/data/profile";
import { ProfileView } from "@/features/profile/ProfileView";

const renderProfile = () =>
  render(<ProfileView darkMode={false} onToggleDarkMode={vi.fn()} />);

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

  it("opens the offcanvas navigation and closes it with Escape", () => {
    renderProfile();
    const menuButton = getRequiredElement<HTMLButtonElement>(
      'button[aria-label="Open navigation menu"]',
    );

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    const offcanvas = getRequiredElement<HTMLElement>("#primary-navigation");
    expect(offcanvas).toHaveClass("is-open");
    expect(offcanvas).toHaveAttribute("aria-hidden", "false");
    expect(offcanvas.querySelectorAll("a")).toHaveLength(
      profileData.navLinks.length + profileData.pageLinks.length,
    );
    expect(
      offcanvas.querySelector('a[href="/certifications/"]'),
    ).toHaveTextContent("Credentials");
    // The menu owns page scrolling while it is open.
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveFocus();
    expect(offcanvas).not.toHaveClass("is-open");
    expect(document.body.style.overflow).toBe("");
  });

  it("traps Tab focus inside the open offcanvas menu", () => {
    renderProfile();
    const menuButton = getRequiredElement<HTMLButtonElement>(
      'button[aria-label="Open navigation menu"]',
    );

    fireEvent.click(menuButton);

    const offcanvas = getRequiredElement<HTMLElement>("#primary-navigation");
    const focusable = Array.from(
      offcanvas.querySelectorAll<HTMLElement>("a[href], button"),
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(first).toHaveFocus();

    first.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
  });

  it("marks the section dot navigation with the active section", () => {
    renderProfile();
    const dotNav = getRequiredElement<HTMLElement>(".profile-dotnav");

    expect(dotNav.querySelectorAll("a")).toHaveLength(
      profileData.navLinks.length,
    );

    // Exactly one dot is current, and it names a real section. The *which*
    // is deliberately not asserted: jsdom reports scrollHeight as 0, so
    // useSectionObserver's bottom-of-page clamp always wins here — pinning a
    // specific section would test the layout stub rather than the component.
    const current = dotNav.querySelectorAll('a[aria-current="location"]');
    expect(current).toHaveLength(1);
    expect(profileData.navLinks.map((link) => link.href)).toContain(
      current[0].getAttribute("href"),
    );
  });

  it("renders social rail links including GitHub and email", () => {
    renderProfile();
    const rail = getRequiredElement<HTMLElement>(".profile-social-rail");
    const hrefs = Array.from(rail.querySelectorAll("a")).map((anchor) =>
      anchor.getAttribute("href"),
    );

    expect(hrefs).toContain("https://github.com/Voltriv");
    expect(
      hrefs.some((href) => href?.startsWith("mailto:")),
    ).toBe(true);
    expect(rail.querySelectorAll("a")).toHaveLength(
      profileData.socialLinks.length + 1,
    );
  });

  it("renders count-up metrics at their final value", () => {
    renderProfile();
    const countUps = document.querySelectorAll(".profile-countup");

    expect(countUps.length).toBeGreaterThan(0);
    // The resting DOM value is always the final number, so assistive tech
    // and tests never observe a partially-counted figure.
    expect(countUps[0]).toHaveTextContent(
      profileData.experiences.length.toString(),
    );
  });

  it("opts tall sections out of scroll snapping", () => {
    renderProfile();

    expect(document.getElementById("proof")).toHaveClass(
      "profile-section--free",
    );
    expect(document.getElementById("faq")).toHaveClass(
      "profile-section--free",
    );
    expect(document.getElementById("overview")).not.toHaveClass(
      "profile-section--free",
    );
    expect(document.getElementById("contact")).toHaveClass("profile-section");
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

    expect(
      document.querySelectorAll(".profile-reveal:not(.is-visible)"),
    ).toHaveLength(0);

    fireEvent.click(
      getRequiredElement<HTMLAnchorElement>('a[href="#main-content"]'),
    );

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "auto" }),
    );
    expect(document.getElementById("main-content")).toHaveFocus();
  });

  it("persists theme changes and exposes the next theme action", () => {
    render(<App />);
    // The landing page opens dark by design, so the offered action is light.
    expect(document.documentElement).toHaveClass("dark");
    const themeButton = getRequiredElement<HTMLButtonElement>(
      'button[aria-label="Switch to light theme"]',
    );

    fireEvent.click(themeButton);

    expect(document.documentElement).not.toHaveClass("dark");
    expect(window.localStorage.getItem("theme")).toBe("light");
    expect(themeButton).toHaveAccessibleName("Switch to dark theme");
  });

  it("reveals content when IntersectionObserver is unavailable", () => {
    const originalObserver = globalThis.IntersectionObserver;
    vi.stubGlobal("IntersectionObserver", undefined);

    try {
      renderProfile();

      expect(
        document.querySelectorAll(".profile-reveal:not(.is-visible)"),
      ).toHaveLength(0);
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

  it("tilts the portrait on fine-pointer motion and clears it on cancel", () => {
    vi.mocked(window.matchMedia).mockImplementation((query) =>
      createMediaQueryList(query, query === "(pointer: fine)"),
    );
    const requestFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback(0);
        return 1;
      });
    const cancelFrame = vi
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation(() => undefined);

    try {
      renderProfile();
      const portrait = getRequiredElement<HTMLDivElement>(
        ".profile-portrait-stage",
      );
      vi.spyOn(portrait, "getBoundingClientRect").mockReturnValue({
        left: 0,
        top: 0,
        right: 200,
        bottom: 400,
        width: 200,
        height: 400,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      // The cursor-spotlight effect was removed for the minimal UI, so there
      // is deliberately no window-level pointermove behaviour left to assert.
      fireEvent.pointerEnter(portrait, { pointerType: "mouse" });
      fireEvent.pointerMove(portrait, {
        pointerType: "mouse",
        clientX: 180,
        clientY: 100,
      });
      expect(
        portrait.style.getPropertyValue("--portrait-rotate-y"),
      ).not.toBe("");

      fireEvent.pointerCancel(portrait, { pointerType: "mouse" });
      expect(portrait.style.getPropertyValue("--portrait-rotate-y")).toBe("");
      expect(portrait.style.getPropertyValue("--portrait-shift-x")).toBe("");
    } finally {
      requestFrame.mockRestore();
      cancelFrame.mockRestore();
    }
  });

  it("opens dark even when the system prefers light, and honours a stored choice", () => {
    // System explicitly prefers light; the page should ignore it on first visit.
    vi.mocked(window.matchMedia).mockImplementation((query) =>
      createMediaQueryList(query, false),
    );

    const first = render(<App />);

    expect(document.documentElement).toHaveClass("dark");
    // Nothing is written until the visitor actually chooses.
    expect(window.localStorage.getItem("theme")).toBeNull();

    first.unmount();
    document.documentElement.classList.remove("dark");

    // A stored preference still wins over the dark default.
    window.localStorage.setItem("theme", "light");
    render(<App />);

    expect(document.documentElement).not.toHaveClass("dark");
    expect(
      getRequiredElement<HTMLButtonElement>(
        'button[aria-label="Switch to dark theme"]',
      ),
    ).toBeInTheDocument();
  });
});
