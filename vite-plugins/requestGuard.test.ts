import { describe, expect, it } from "vitest";
import { RateLimiter, hasAllowedOrigin, hasLocalHost } from "./requestGuard";

type Headers = Record<string, string | undefined>;

/** Only `headers` is read, so the rest of the request is irrelevant here. */
const request = (headers: Headers) =>
  ({ headers }) as unknown as Parameters<typeof hasLocalHost>[0];

describe("hasLocalHost", () => {
  it("accepts loopback hosts, with or without a port", () => {
    for (const host of [
      "localhost",
      "localhost:5173",
      "127.0.0.1",
      "127.0.0.1:5173",
      "[::1]",
      "[::1]:5173",
      "LOCALHOST:5173",
    ]) {
      expect(hasLocalHost(request({ host }))).toBe(true);
    }
  });

  it("rejects a rebound hostname that resolves to loopback", () => {
    // The whole point: the DNS answer is 127.0.0.1 but the Host header still
    // carries the attacker's domain.
    for (const host of [
      "evil.example",
      "evil.example:5173",
      "localhost.evil.example",
      "127.0.0.1.evil.example",
    ]) {
      expect(hasLocalHost(request({ host }))).toBe(false);
    }
  });

  it("rejects a missing Host header", () => {
    expect(hasLocalHost(request({}))).toBe(false);
  });
});

describe("hasAllowedOrigin", () => {
  it("allows an absent Origin, which same-origin GETs omit", () => {
    expect(hasAllowedOrigin(request({}))).toBe(true);
  });

  it("allows the dev server's own origin", () => {
    for (const origin of [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://[::1]:5173",
    ]) {
      expect(hasAllowedOrigin(request({ origin }))).toBe(true);
    }
  });

  it("rejects a foreign origin", () => {
    for (const origin of [
      "https://evil.example",
      "http://localhost.evil.example",
      "null",
    ]) {
      expect(hasAllowedOrigin(request({ origin }))).toBe(false);
    }
  });
});

describe("RateLimiter", () => {
  /** Controllable clock, so the tests never depend on wall time. */
  const at = (start = 0) => {
    let now = start;
    return {
      now: () => now,
      advance: (ms: number) => {
        now += ms;
      },
    };
  };

  it("allows a burst up to capacity, then refuses", () => {
    const clock = at();
    const limiter = new RateLimiter(3, 1, clock.now);

    expect(limiter.take().allowed).toBe(true);
    expect(limiter.take().allowed).toBe(true);
    expect(limiter.take().allowed).toBe(true);

    const refused = limiter.take();
    expect(refused.allowed).toBe(false);
    expect(refused.retryAfter).toBeGreaterThanOrEqual(1);
  });

  it("refills over time", () => {
    const clock = at();
    const limiter = new RateLimiter(2, 2, clock.now);

    limiter.take();
    limiter.take();
    expect(limiter.take().allowed).toBe(false);

    // 2 tokens/second, so half a second buys exactly one.
    clock.advance(500);
    expect(limiter.take().allowed).toBe(true);
    expect(limiter.take().allowed).toBe(false);
  });

  it("never refills beyond capacity", () => {
    const clock = at();
    const limiter = new RateLimiter(2, 10, clock.now);

    clock.advance(60_000);

    expect(limiter.take().allowed).toBe(true);
    expect(limiter.take().allowed).toBe(true);
    expect(limiter.take().allowed).toBe(false);
  });

  it("is not fooled by a clock that goes backwards", () => {
    const clock = at(10_000);
    const limiter = new RateLimiter(1, 1, clock.now);

    expect(limiter.take().allowed).toBe(true);

    clock.advance(-5_000);
    expect(limiter.take().allowed).toBe(false);
  });
});
