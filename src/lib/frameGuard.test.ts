import { afterEach, describe, expect, it, vi } from "vitest";
import { guardAgainstFraming } from "./frameGuard";

/**
 * jsdom reports `window.top === window.self`, so framing is simulated by
 * swapping `window.top` for a stand-in parent.
 */
const setTopFrame = (top: unknown) => {
  Object.defineProperty(window, "top", { configurable: true, value: top });
};

afterEach(() => {
  setTopFrame(window.self);
  document.body.replaceChildren();
  document.body.style.cssText = "";
});

describe("guardAgainstFraming", () => {
  it("does nothing when the page is the top frame", () => {
    document.body.innerHTML = "<div id='root'>content</div>";

    expect(guardAgainstFraming()).toBe(false);
    expect(document.getElementById("root")).not.toBeNull();
  });

  it("treats a detached browsing context as unframed", () => {
    setTopFrame(null);
    document.body.innerHTML = "<div id='root'>content</div>";

    expect(guardAgainstFraming()).toBe(false);
    expect(document.getElementById("root")).not.toBeNull();
  });

  it("sends a reachable parent to this page instead of rendering", () => {
    const replace = vi.fn();
    setTopFrame({ location: { replace } });
    document.body.innerHTML = "<div id='root'>content</div>";

    expect(guardAgainstFraming()).toBe(true);
    expect(replace).toHaveBeenCalledWith(window.location.href);
    // Escape is under way, so the content is left alone.
    expect(document.getElementById("root")).not.toBeNull();
  });

  it("strips the document when a cross-origin parent blocks escape", () => {
    setTopFrame({
      get location(): never {
        // What a browser throws when reaching across origins.
        throw new DOMException("Blocked a frame", "SecurityError");
      },
    });
    document.body.innerHTML = "<div id='root'>bait</div>";

    expect(guardAgainstFraming()).toBe(true);
    expect(document.getElementById("root")).toBeNull();
    expect(document.body.textContent).toContain("cannot be displayed");

    const escapeLink = document.querySelector("a");
    expect(escapeLink).not.toBeNull();
    expect(escapeLink).toHaveAttribute("target", "_top");
    expect(escapeLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
