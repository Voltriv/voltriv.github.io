import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lockScrollGestures, releaseScrollGestures } from "./scrollLock";
import { useFullpagePager } from "./useFullpagePager";

const SECTION_IDS = ["one", "two", "three", "four"];
const VIEWPORT_HEIGHT = 900;

/** jsdom has no layout, so the pager's three measurements are stubbed. */
type Layout = { top: number; height: number };

const applyLayout = (layouts: Layout[]) => {
  SECTION_IDS.forEach((id, index) => {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Expected a section #${id}`);

    // `top` here is the document position; a real rect reports it relative to
    // the viewport, so the current scroll offset comes back out of it.
    element.getBoundingClientRect = () => {
      const { top, height } = layouts[index];
      return {
        top: top - window.scrollY,
        bottom: top + height - window.scrollY,
        height,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: top - window.scrollY,
        toJSON: () => ({}),
      } as DOMRect;
    };
  });

  const last = layouts[layouts.length - 1];
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    value: last.top + last.height,
  });
};

const scrollTo = (top: number) => {
  Object.defineProperty(window, "scrollY", { configurable: true, value: top });
};

const Pager = () => {
  useFullpagePager(SECTION_IDS);
  return (
    <>
      {SECTION_IDS.map((id) => (
        <section key={id} id={id} />
      ))}
    </>
  );
};

/** @returns the scroll target of the wheel gesture, or null if it was ignored. */
const wheel = (deltaY: number) => {
  const scrollToSpy = vi.mocked(window.scrollTo);
  scrollToSpy.mockClear();

  const event = new WheelEvent("wheel", {
    deltaY,
    deltaX: 0,
    cancelable: true,
    bubbles: true,
  });
  window.dispatchEvent(event);

  const call = scrollToSpy.mock.calls.at(-1)?.[0] as ScrollToOptions | undefined;
  return call ? { top: call.top, prevented: event.defaultPrevented } : null;
};

describe("useFullpagePager", () => {
  beforeEach(() => {
    vi.mocked(window.matchMedia).mockImplementation(
      (query: string) =>
        ({
          matches: query === "(pointer: fine)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(() => true),
        }) as MediaQueryList,
    );
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: VIEWPORT_HEIGHT,
    });
    scrollTo(0);
  });

  afterEach(() => {
    document.documentElement.classList.remove("is-paged");
  });

  it("pages one section at a time when every section fills the viewport", () => {
    render(<Pager />);
    applyLayout([
      { top: 0, height: 900 },
      { top: 900, height: 900 },
      { top: 1800, height: 900 },
      { top: 2700, height: 900 },
    ]);

    expect(wheel(120)).toEqual({ top: 900, prevented: true });
  });

  it("does not skip a section shorter than half the viewport", () => {
    render(<Pager />);
    // #two is 300px tall: a viewport-midpoint probe would already read #three
    // while the reader is parked at the top of #two.
    applyLayout([
      { top: 0, height: 900 },
      { top: 900, height: 300 },
      { top: 1200, height: 900 },
      { top: 2100, height: 900 },
    ]);
    scrollTo(900);

    expect(wheel(120)).toEqual({ top: 1200, prevented: true });
  });

  it("pages back out of a section shorter than half the viewport", () => {
    render(<Pager />);
    applyLayout([
      { top: 0, height: 900 },
      { top: 900, height: 300 },
      { top: 1200, height: 900 },
      { top: 2100, height: 900 },
    ]);
    scrollTo(900);

    // Previously this targeted #two itself — the section already on screen —
    // so the page never moved.
    expect(wheel(-120)).toEqual({ top: 0, prevented: true });
  });

  it("lands on the bottom edge when paging up into a tall section", () => {
    render(<Pager />);
    applyLayout([
      { top: 0, height: 900 },
      { top: 900, height: 2000 },
      { top: 2900, height: 900 },
      { top: 3800, height: 900 },
    ]);
    scrollTo(2900);

    // 900 + 2000 - 900: the viewport shows the end of #two, which is where
    // the downward pass would have left off.
    expect(wheel(-120)).toEqual({ top: 2000, prevented: true });
  });

  it("scrolls through a tall section before advancing", () => {
    render(<Pager />);
    applyLayout([
      { top: 0, height: 900 },
      { top: 900, height: 2000 },
      { top: 2900, height: 900 },
      { top: 3800, height: 900 },
    ]);
    scrollTo(900);

    // Room left inside #two, so the browser keeps the gesture.
    expect(wheel(120)).toBeNull();

    scrollTo(2000);
    expect(wheel(120)).toEqual({ top: 2900, prevented: true });
  });

  it("releases the gesture at the end of the document", () => {
    render(<Pager />);
    applyLayout([
      { top: 0, height: 900 },
      { top: 900, height: 900 },
      { top: 1800, height: 900 },
      { top: 2700, height: 900 },
    ]);
    scrollTo(2700);

    expect(wheel(120)).toBeNull();
  });

  it("ignores wheel jitter and horizontal intent", () => {
    render(<Pager />);
    applyLayout([
      { top: 0, height: 900 },
      { top: 900, height: 900 },
      { top: 1800, height: 900 },
      { top: 2700, height: 900 },
    ]);

    expect(wheel(4)).toBeNull();

    const horizontal = new WheelEvent("wheel", {
      deltaY: 10,
      deltaX: 120,
      cancelable: true,
      bubbles: true,
    });
    vi.mocked(window.scrollTo).mockClear();
    window.dispatchEvent(horizontal);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("stays out of the way while the boot overlay is up", () => {
    render(
      <>
        <div id="boot" />
        <Pager />
      </>,
    );
    applyLayout([
      { top: 0, height: 900 },
      { top: 900, height: 900 },
      { top: 1800, height: 900 },
      { top: 2700, height: 900 },
    ]);

    expect(wheel(120)).toBeNull();
  });
});

describe("useFullpagePager scroll lock", () => {
  beforeEach(() => {
    releaseScrollGestures();
    vi.mocked(window.matchMedia).mockImplementation(
      (query: string) =>
        ({
          matches: query === "(pointer: fine)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(() => true),
        }) as MediaQueryList,
    );
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: VIEWPORT_HEIGHT,
    });
    scrollTo(0);
  });

  afterEach(() => {
    releaseScrollGestures();
    document.documentElement.classList.remove("is-paged");
  });

  it("swallows gestures while an anchor jump is still animating", () => {
    render(<Pager />);
    applyLayout([
      { top: 0, height: 900 },
      { top: 900, height: 900 },
      { top: 1800, height: 900 },
      { top: 2700, height: 900 },
    ]);

    // What a nav click does before handing the scroll to the browser.
    lockScrollGestures();

    expect(wheel(120)).toBeNull();

    releaseScrollGestures();
    expect(wheel(120)).toEqual({ top: 900, prevented: true });
  });
});

describe("useFullpagePager measurement cache", () => {
  beforeEach(() => {
    releaseScrollGestures();
    vi.mocked(window.matchMedia).mockImplementation(
      (query: string) =>
        ({
          matches: query === "(pointer: fine)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(() => true),
        }) as MediaQueryList,
    );
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: VIEWPORT_HEIGHT,
    });
    scrollTo(0);
  });

  afterEach(() => {
    releaseScrollGestures();
    document.documentElement.classList.remove("is-paged");
  });

  it("measures each section once per gesture rather than per lookup", () => {
    render(<Pager />);
    applyLayout([
      { top: 0, height: 900 },
      { top: 900, height: 900 },
      { top: 1800, height: 900 },
      { top: 2700, height: 900 },
    ]);

    const spies = SECTION_IDS.map((id) => {
      const element = document.getElementById(id)!;
      return vi.spyOn(element, "getBoundingClientRect");
    });

    wheel(120);
    // currentIndex, hasRoomWithin and destinationFor all consult the bounds;
    // an uncached read forces a layout on every one of them.
    expect(spies.every((spy) => spy.mock.calls.length === 1)).toBe(true);

    releaseScrollGestures();
    scrollTo(900);
    wheel(120);
    expect(spies.every((spy) => spy.mock.calls.length === 1)).toBe(true);
  });

  it("re-measures after a resize changes the layout", () => {
    render(<Pager />);
    applyLayout([
      { top: 0, height: 900 },
      { top: 900, height: 900 },
      { top: 1800, height: 900 },
      { top: 2700, height: 900 },
    ]);

    expect(wheel(120)).toEqual({ top: 900, prevented: true });

    // Viewport got shorter, so every section below the first moved up.
    releaseScrollGestures();
    scrollTo(0);
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 600,
    });
    applyLayout([
      { top: 0, height: 600 },
      { top: 600, height: 600 },
      { top: 1200, height: 600 },
      { top: 1800, height: 600 },
    ]);
    window.dispatchEvent(new Event("resize"));

    expect(wheel(120)).toEqual({ top: 600, prevented: true });
  });
});
