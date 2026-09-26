import type { Connect } from "vite";

/**
 * Guards for the dev-only content endpoint.
 *
 * The dev server listens on localhost, which feels private but is not: every
 * page open in the same browser can reach it. Two concrete attacks follow,
 * and neither is hypothetical.
 *
 *  1. **Cross-site request forgery.** A page on any site can issue
 *     `fetch("http://localhost:5173/__content/projects", { method: "PUT" })`.
 *     A JSON PUT is preflighted, and since this endpoint never answers
 *     `OPTIONS` with permissive CORS headers the browser drops it — but a
 *     `GET` is a *simple* request and goes straight through, so a hostile
 *     page could enumerate the content collections without the origin check
 *     below.
 *
 *  2. **DNS rebinding.** An attacker's domain re-resolves to 127.0.0.1, at
 *     which point the browser considers the request same-origin and sends it
 *     with no preflight at all. Origin checks alone do not stop this; the
 *     defence is validating the `Host` header, because a rebound request
 *     still carries the attacker's hostname.
 *
 * Rate limiting sits on top as a blunt backstop: it caps how much damage any
 * runaway or automated caller can do, including one that is simply buggy.
 */

type Request = Parameters<Connect.NextHandleFunction>[0];

/** Hostnames that genuinely mean "this machine". */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

const hostnameOf = (value: string) => {
  // Strip the port. IPv6 literals are bracketed, so split on the last colon
  // only when it is not inside brackets.
  if (value.startsWith("[")) {
    const end = value.indexOf("]");
    return end === -1 ? value.toLowerCase() : value.slice(0, end + 1).toLowerCase();
  }
  const [host] = value.split(":");
  return host.toLowerCase();
};

/**
 * Rejects requests whose `Host` is not a loopback name.
 *
 * This is the anti-rebinding check: a browser tricked into treating
 * `evil.example` as 127.0.0.1 still sends `Host: evil.example`.
 */
export const hasLocalHost = (request: Request) => {
  const host = request.headers.host;
  if (!host) return false;
  return LOCAL_HOSTS.has(hostnameOf(host));
};

/**
 * Rejects a cross-origin caller.
 *
 * A same-origin `fetch` from the admin page sends no `Origin` on GET, and the
 * dev server's own origin on PUT/DELETE — so an absent header is allowed,
 * while a *present and foreign* one is not.
 */
export const hasAllowedOrigin = (request: Request) => {
  const origin = request.headers.origin;
  if (!origin) return true;

  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }
  return LOCAL_HOSTS.has(hostnameOf(parsed.host));
};

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the next token, for the `Retry-After` header. */
  retryAfter: number;
};

/**
 * A token bucket.
 *
 * Chosen over a fixed window because editing is bursty — saving four entries
 * in quick succession is normal — while the sustained rate should still be
 * low. The bucket absorbs the burst and then throttles to the refill rate.
 *
 * Per-process and in-memory on purpose: it exists to bound a runaway client,
 * not to be a durable quota, and a dev server that restarts has nothing worth
 * carrying over.
 */
export class RateLimiter {
  private tokens: number;
  private updatedAt: number;

  constructor(
    private readonly capacity: number,
    private readonly refillPerSecond: number,
    private readonly now: () => number = () => Date.now(),
  ) {
    this.tokens = capacity;
    this.updatedAt = now();
  }

  take(): RateLimitResult {
    const at = this.now();
    const elapsed = Math.max(0, at - this.updatedAt) / 1000;

    this.tokens = Math.min(
      this.capacity,
      this.tokens + elapsed * this.refillPerSecond,
    );
    this.updatedAt = at;

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return { allowed: true, retryAfter: 0 };
    }

    const deficit = 1 - this.tokens;
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil(deficit / this.refillPerSecond)),
    };
  }
}
