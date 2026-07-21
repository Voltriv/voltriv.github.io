import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

const createMediaQueryList = (query: string, matches = false) =>
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

const matchMediaMock = vi.fn((query: string) =>
  createMediaQueryList(query),
);

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  value: matchMediaMock,
});

Object.defineProperty(window, "scrollTo", {
  configurable: true,
  value: vi.fn(),
});

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("dark");
  window.localStorage.clear();
  vi.clearAllMocks();
  matchMediaMock.mockImplementation((query) =>
    createMediaQueryList(query),
  );
});
