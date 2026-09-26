/**
 * Clickjacking defence for a host that cannot send headers.
 *
 * The usual answer is `Content-Security-Policy: frame-ancestors 'none'` (or
 * `X-Frame-Options`), but both are *header-only*: the CSP spec explicitly
 * ignores `frame-ancestors` when a policy arrives in a `<meta>` tag, and
 * GitHub Pages offers no way to set response headers. So the check has to
 * happen in the page itself.
 *
 * It runs from the bundle rather than an inline `<script>`, which keeps it
 * compatible with the `script-src 'self'` policy already in both entrypoints.
 *
 * Two stages, because the first one is not always permitted:
 *
 *  1. Try to navigate the top frame to this page. A same-origin framer lets
 *     this through and the visitor simply lands on the real site.
 *  2. A cross-origin framer — the case that actually matters — blocks that
 *     navigation with a `SecurityError`. There is no way to escape, so the
 *     content is removed instead: an attacker cannot overlay a transparent
 *     frame onto bait if the frame has nothing left to show.
 *
 * Deliberately *not* active in dev: framing a dev server is something you do
 * on purpose (a preview pane, a screenshot tool), and a guard that blanks the
 * page during that is worse than the risk it removes on a static portfolio.
 */

/** Rendered only when escape is impossible, so it cannot rely on React. */
const renderBlockedNotice = (href: string) => {
  const document_ = window.document;

  document_.body.replaceChildren();
  document_.body.style.cssText =
    "margin:0;min-height:100vh;display:grid;place-content:center;gap:1rem;" +
    "background:#000;color:#ededed;font:500 15px/1.6 ui-sans-serif,system-ui,sans-serif;" +
    "text-align:center;padding:2rem";

  const message = document_.createElement("p");
  message.style.cssText = "margin:0;color:#949494";
  message.textContent = "This page cannot be displayed inside a frame.";

  const link = document_.createElement("a");
  link.href = href;
  link.target = "_top";
  link.rel = "noopener noreferrer";
  link.style.cssText = "color:#fff;text-underline-offset:4px";
  link.textContent = "Open the site directly";

  document_.body.append(message, link);
};

/**
 * @returns whether the page was found to be framed, so callers (and tests)
 *          can tell the two paths apart.
 */
export function guardAgainstFraming(): boolean {
  if (typeof window === "undefined") return false;
  // `window.top` is null only when the browsing context is already detached.
  if (window.top === null || window.top === window.self) return false;

  const href = window.location.href;

  try {
    // Throws on a cross-origin parent — which is the whole point of the catch.
    window.top.location.replace(href);
    return true;
  } catch {
    renderBlockedNotice(href);
    return true;
  }
}
