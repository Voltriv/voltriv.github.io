import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
  Mail,
  Menu,
  Moon,
  Pause,
  Play,
  ShieldCheck,
  SunMedium,
} from "lucide-react";
import { profileData } from "@/data/profile";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import { ImageWithFallback } from "@/components/media/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { whenBootClears } from "./bootGate";
import { SCROLL_EDGE_TOLERANCE_PX, lockScrollGestures } from "./scrollLock";
import { useFullpagePager } from "./useFullpagePager";
import { CountUp } from "./components/CountUp";
import { DetailDisclosure } from "./components/DetailDisclosure";
import { OffcanvasMenu } from "./components/OffcanvasMenu";
import { SectionDotNav } from "./components/SectionDotNav";
import { SocialRail } from "./components/SocialRail";
import { getSocialIcon } from "./components/socialIcons";

type ProfileViewProps = {
  darkMode: boolean;
  onToggleDarkMode: () => void;
};

const {
  hero,
  navLinks,
  pageLinks,
  services,
  securityMeasures,
  experiences,
  projects,
  focusAreas,
  techStack,
  profileCard,
  contact,
  socialLinks,
  faqs,
  collaborations,
} = profileData;

const isExternalHref = (href: string) => /^https?:/i.test(href);

/** Accent period after a section heading — the reference site's signature. */
const AccentDot = () => (
  <span className="profile-accent-dot" aria-hidden="true">
    .
  </span>
);

// Zero: full-height sections carry enough top padding to clear the fixed
// header on their own, and the pager scrolls to exact section tops. Any other
// value here would leave anchor jumps and paged jumps landing differently.
const HEADER_SCROLL_OFFSET_PX = 0;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getScrollTargetTop = (element: HTMLElement) => {
  const maxScrollTop =
    document.documentElement.scrollHeight - window.innerHeight;
  const targetTop =
    element.getBoundingClientRect().top +
    window.scrollY -
    HEADER_SCROLL_OFFSET_PX;

  return Math.min(Math.max(targetTop, 0), Math.max(maxScrollTop, 0));
};

const updateHash = (hash: string) => {
  if (window.location.hash === hash) return;
  window.history.pushState(null, "", hash);
};

const smoothScrollToHash = (hash: string) => {
  if (!hash.startsWith("#")) return false;

  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return false;

  const targetTop = getScrollTargetTop(target);
  const smooth = !prefersReducedMotion();

  // Hold the pager off for the length of the animation: it would otherwise
  // sample the scroll position mid-flight and page from whichever section the
  // jump happens to be passing through.
  //
  // Only when the page is actually going to move, though. Clicking the nav
  // entry for the section already on screen — or the skip link while at the
  // top — resolves to the current scroll position and scrolls nowhere, and
  // arming the lock there would have the pager cancel every wheel tick and
  // arrow key for the next three quarters of a second with nothing on screen
  // to explain the freeze. Same guard the pager's own `goTo` applies.
  if (
    smooth &&
    Math.abs(targetTop - window.scrollY) > SCROLL_EDGE_TOLERANCE_PX
  ) {
    lockScrollGestures();
  }

  window.scrollTo({
    top: targetTop,
    behavior: smooth ? "smooth" : "auto",
  });
  target.focus({ preventScroll: true });
  updateHash(hash);
  return true;
};

const sectionEyebrow =
  "font-profile-mono text-[12px] uppercase tracking-[0.28em] text-[var(--profile-muted)]";
// Display-scale section headings. The reference site's sections are carried
// almost entirely by one very large heading per screen; at the previous
// text-3xl/5xl the headings read as document subheads instead.
const sectionTitle =
  "font-profile-display text-[clamp(2.75rem,6.2vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-[var(--profile-ink)]";
const sectionCopy =
  "text-lg text-[var(--profile-muted)] sm:text-xl sm:leading-relaxed";
const panelSurfaceStrong =
  "profile-card rounded-[20px] border border-[var(--profile-border)] bg-[var(--profile-surface-strong)]";

const revealStyle = (delay: number): CSSProperties =>
  ({
    "--reveal-delay": `${delay}ms`,
  }) as CSSProperties;

/** Small step, hard ceiling. */
const STAGGER_STEP_MS = 55;
const STAGGER_MAX_STEPS = 4;

/**
 * Staggered delay for a list item.
 *
 * Capped on purpose: an uncapped `index * step` keeps climbing, so the sixth
 * or seventh row in a list sits still long after the first has finished and
 * the whole group reads as lag. Past the cap the remaining items simply move
 * together.
 */
const staggerStyle = (index: number, base = 0): CSSProperties =>
  revealStyle(base + Math.min(index, STAGGER_MAX_STEPS) * STAGGER_STEP_MS);

const wordStyle = (index: number): CSSProperties =>
  ({
    "--word-index": Math.min(index, 6),
  }) as CSSProperties;

const splitWords = (text: string, offset: number) => {
  const words = text.split(" ");

  return words.map((word, index) => (
    <Fragment key={`${offset}-${index}-${word}`}>
      <span
        className="profile-word"
        style={wordStyle(offset + index)}
      >
        {word}
      </span>
      {index < words.length - 1 ? " " : null}
    </Fragment>
  ));
};

// TechLogo lived here to render the stack chips. Those went with the card
// grids; profileData.techStack is untouched and still feeds the hero count.

export function ProfileView({
  darkMode,
  onToggleDarkMode,
}: ProfileViewProps) {
  const sectionIds = useMemo(
    () => navLinks.map((link) => link.href.replace("#", "")),
    [],
  );
  const activeSection = useSectionObserver(sectionIds);
  // Its own list, not navLinks: the collaborations strip is a stop for the
  // pager but deliberately not a nav entry.
  const pagerIds = useMemo(
    () => [
      "overview",
      "services",
      "signal",
      "capabilities",
      "security",
      "proof",
      "faq",
      "contact",
    ],
    [],
  );
  useFullpagePager(pagerIds);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [navOpen, setNavOpen] = useState(false);
  const [marqueePaused, setMarqueePaused] = useState(false);
  const navButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const profileRootRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const portraitBoundsRef = useRef<DOMRect | null>(null);
  const portraitFrameRef = useRef<number | null>(null);
  const portraitMotionRef = useRef<{
    element: HTMLDivElement;
    rotateX: number;
    rotateY: number;
    shiftX: number;
    shiftY: number;
  } | null>(null);

  const handleAnchorClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (smoothScrollToHash(href)) {
      event.preventDefault();
    }
  };

  const handlePortraitPointerEnter = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (
      event.pointerType !== "mouse" ||
      prefersReducedMotion() ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }

    portraitBoundsRef.current = event.currentTarget.getBoundingClientRect();
  };

  const handlePortraitPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerType !== "mouse" || !portraitBoundsRef.current) return;

    const bounds =
      portraitBoundsRef.current ?? event.currentTarget.getBoundingClientRect();
    portraitBoundsRef.current = bounds;
    if (!bounds.width || !bounds.height) return;

    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;

    portraitMotionRef.current = {
      element: event.currentTarget,
      rotateX: vertical * -5,
      rotateY: horizontal * 7,
      shiftX: horizontal * 8,
      shiftY: vertical * 8,
    };

    if (portraitFrameRef.current === null) {
      portraitFrameRef.current = window.requestAnimationFrame(() => {
        portraitFrameRef.current = null;
        const motion = portraitMotionRef.current;
        if (!motion) return;

        motion.element.style.setProperty(
          "--portrait-rotate-x",
          `${motion.rotateX}deg`,
        );
        motion.element.style.setProperty(
          "--portrait-rotate-y",
          `${motion.rotateY}deg`,
        );
        motion.element.style.setProperty(
          "--portrait-shift-x",
          `${motion.shiftX}px`,
        );
        motion.element.style.setProperty(
          "--portrait-shift-y",
          `${motion.shiftY}px`,
        );
      });
    }
  };

  const resetPortraitPosition = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (portraitFrameRef.current !== null) {
      window.cancelAnimationFrame(portraitFrameRef.current);
      portraitFrameRef.current = null;
    }
    portraitMotionRef.current = null;
    portraitBoundsRef.current = null;
    event.currentTarget.style.removeProperty("--portrait-rotate-x");
    event.currentTarget.style.removeProperty("--portrait-rotate-y");
    event.currentTarget.style.removeProperty("--portrait-shift-x");
    event.currentTarget.style.removeProperty("--portrait-shift-y");
  };

  useEffect(() => {
    let frameId: number | null = null;

    const updateScrollProgress = () => {
      frameId = null;

      const maxScrollTop =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        maxScrollTop > 0
          ? Math.min(Math.max(window.scrollY / maxScrollTop, 0), 1)
          : 0;

      scrollProgressRef.current?.style.setProperty(
        "transform",
        `scaleX(${nextProgress})`,
      );

      // Transparent over the hero, solid once past it. Reuses this listener
      // rather than registering a second scroll handler.
      headerRef.current?.classList.toggle(
        "is-scrolled",
        window.scrollY > window.innerHeight * 0.8,
      );
    };

    const scheduleUpdate = () => {
      portraitBoundsRef.current = null;
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateScrollProgress);
    };

    updateScrollProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    const resizeObserver =
      "ResizeObserver" in window
        ? new ResizeObserver(scheduleUpdate)
        : undefined;
    resizeObserver?.observe(document.body);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, []);

  // The cursor-spotlight effect and its global pointermove listener are gone
  // along with the glow element. This keeps the portrait-tilt frame teardown
  // that used to ride along in that effect's cleanup.
  useEffect(
    () => () => {
      if (portraitFrameRef.current !== null) {
        window.cancelAnimationFrame(portraitFrameRef.current);
        portraitFrameRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".profile-reveal"),
    );
    if (!elements.length) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    if (typeof IntersectionObserver === "undefined") {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    let observer: IntersectionObserver | undefined;

    const arm = () => {
      // Reveals replay on every entry rather than firing once, so scrolling
      // back up re-animates a section instead of showing a static page.
      //
      // The add/remove thresholds are deliberately asymmetric: elements reveal
      // at 15% visible but only reset once fully out of view. A symmetric test
      // makes items sitting on a section boundary flicker as they cross it.
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
            } else if (entry.intersectionRatio === 0) {
              entry.target.classList.remove("is-visible");
            }
          });
        },
        { threshold: [0, 0.15], rootMargin: "0px 0px -12% 0px" },
      );

      elements.forEach((element) => observer?.observe(element));
    };

    const disposeGate = whenBootClears(arm);

    return () => {
      disposeGate();
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return undefined;

    const handleVisibilityChange = () => {
      marquee.classList.toggle("is-page-hidden", document.hidden);
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          marquee.classList.toggle("is-offscreen", !entry?.isIntersecting);
        },
        { rootMargin: "120px 0px" },
      );
      observer.observe(marquee);
    }

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Esc handling, focus trapping and focus restoration all live in
  // OffcanvasMenu now, so the menu owns its own keyboard contract.

  const totalStackItems = techStack.reduce(
    (sum: number, group) => sum + group.items.length,
    0,
  );
  // `count`/`ratio` are paired and optional: a metric without a number gets
  // no meter, because a full bar under a non-quantity like "PH / Remote"
  // implies a measurement that does not exist.
  const metrics: Array<{
    label: string;
    value: string;
    count?: number;
    /** 0-1, drives the meter fill width. Only set alongside `count`. */
    ratio?: number;
  }> = [
    { label: "Base", value: "PH / Remote" },
    {
      label: "Delivery highlights",
      value: experiences.length.toString(),
      count: experiences.length,
      ratio: Math.min(experiences.length / 5, 1),
    },
    {
      label: "Tools in rotation",
      value: totalStackItems.toString(),
      count: totalStackItems,
      ratio: Math.min(totalStackItems / 20, 1),
    },
  ];
  // Looked up by scheme rather than by index so reordering contact.details
  // cannot silently point the rail at a phone number.
  const mailtoHref = contact.details.find((detail) =>
    detail.href?.startsWith("mailto:"),
  )?.href;
  const railLinks = [
    ...socialLinks,
    ...(mailtoHref ? [{ label: "Email", href: mailtoHref }] : []),
  ];
  const marqueeItems = [...collaborations, ...collaborations];
  const heroLines = hero.headline.map((line, index) => ({
    text: line,
    className: index === 1 ? "text-[var(--profile-accent)]" : "",
  }));

  return (
    <div
      ref={profileRootRef}
      /* `profile-clip-x` (overflow-x: clip) rather than overflow-x-hidden:
         `hidden` would make this element a scroll container, which would steal
         scroll-snap away from the document and break the sticky aside. */
      className="profile-theme profile-clip-x min-h-screen bg-[var(--profile-bg)] text-[var(--profile-ink)]"
    >
      <a
        href="#main-content"
        onClick={(event) => handleAnchorClick(event, "#main-content")}
        className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-full bg-[var(--profile-ink)] px-4 py-2 text-sm font-semibold text-[var(--profile-bg)] shadow-lg transition-transform focus-visible:translate-y-0"
      >
        Skip to main content
      </a>
      <div
        ref={scrollProgressRef}
        className="profile-scroll-progress"
        aria-hidden="true"
      />
      {/* No ambient layer here by design: the page reads as paper, and the
          atmosphere gradients, grid, corner glow and vignette that used to sit
          here were all standing in for photographic depth this layout does not
          want. Structure now comes from type, whitespace and hairlines. */}
      <div className="relative">
        <SectionDotNav
          links={navLinks}
          activeSection={activeSection}
          onNavigate={handleAnchorClick}
        />
        <SocialRail links={railLinks} />
        <OffcanvasMenu
          open={navOpen}
          navLinks={navLinks}
          pageLinks={pageLinks}
          activeSection={activeSection}
          onClose={(options) => {
            setNavOpen(false);
            if (options?.restoreFocus !== false) {
              navButtonRef.current?.focus();
            }
          }}
          onNavigate={handleAnchorClick}
        />

        <header
          ref={headerRef}
          className="profile-header fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-5"
        >
          <div className="profile-header-shell mx-auto flex max-w-6xl items-center justify-between px-3 py-3 sm:px-4">
            <div className="flex items-center gap-3">
              <div className="profile-brand-mark flex size-10 items-center justify-center rounded-lg border border-[var(--profile-border-strong)] bg-[var(--profile-surface)] font-profile-mono text-xs font-semibold tracking-[0.14em] text-[var(--profile-ink)]">
                <span className="profile-mark-grid" aria-hidden="true" />
                <span
                  className="profile-mark-corner profile-mark-corner--tl"
                  aria-hidden="true"
                />
                <span
                  className="profile-mark-corner profile-mark-corner--br"
                  aria-hidden="true"
                />
                <span className="relative z-[1]">EV</span>
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="flex items-center gap-2 font-profile-mono text-[10px] uppercase tracking-[0.24em] text-[var(--profile-muted)]">
                  <span className="profile-status-dot" aria-hidden="true" />
                  {hero.availability}
                </p>
                {/* From profileData, not a hardcoded string: this used to read
                    "Elijah / designer + engineer", which was neither the real
                    name nor derived from anywhere. */}
                <p className="mt-1 max-w-[260px] truncate text-xs font-semibold">
                  {profileCard.name}
                </p>
              </div>
            </div>
            {/* Inline on desktop, offcanvas below xl. The header previously
                had no visible navigation at any width. */}
            <nav
              className="hidden items-center gap-1 xl:flex"
              aria-label="Primary"
            >
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.replace("#", "");

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(event) => handleAnchorClick(event, link.href)}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "profile-navlink px-2.5 py-2 font-profile-mono text-[10px] uppercase tracking-[0.16em]",
                      isActive
                        ? "is-active text-[var(--profile-ink)]"
                        : "text-[var(--profile-muted)] hover:text-[var(--profile-ink)]",
                    )}
                  >
                    {link.label}
                  </a>
                );
              })}
              {pageLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="profile-navlink px-2.5 py-2 font-profile-mono text-[10px] uppercase tracking-[0.16em] text-[var(--profile-muted)] hover:text-[var(--profile-ink)]"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <button
                ref={navButtonRef}
                type="button"
                onClick={() => setNavOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={navOpen}
                aria-controls="primary-navigation"
                className="profile-icon-button inline-flex size-10 items-center justify-center rounded-xl border border-[var(--profile-border)] bg-[var(--profile-surface)] text-[var(--profile-ink)] xl:hidden"
              >
                <Menu className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onToggleDarkMode}
                aria-label={
                  darkMode ? "Switch to light theme" : "Switch to dark theme"
                }
                className="profile-icon-button inline-flex size-10 items-center justify-center rounded-xl border border-[var(--profile-border)] bg-[var(--profile-surface)] text-[var(--profile-ink)] transition-colors"
              >
                {darkMode ? (
                  <SunMedium className="size-4" aria-hidden="true" />
                ) : (
                  <Moon className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="relative mx-auto max-w-6xl px-5 sm:px-6"
        >
          <section
            id="overview"
            tabIndex={-1}
            className="profile-section relative isolate space-y-10"
          >
            {/* Two columns from md, not lg: snapping is mandatory from 768px
                and a stacked hero would overflow the viewport there, which is
                exactly the state that traps a mandatory-snap scroller. */}
            <div className="grid items-center gap-10 md:grid-cols-12 md:gap-8">
              <div className="space-y-7 md:col-span-7">
                <div
                  className="profile-reveal flex flex-wrap items-center gap-3"
                  style={revealStyle(0)}
                >
                  <span className="profile-index-mark font-profile-mono text-xs font-semibold text-[var(--profile-ink)]">
                    01
                  </span>
                  <span
                    className="h-px w-10 bg-[var(--profile-border-strong)]"
                    aria-hidden="true"
                  />
                  <span className={sectionEyebrow}>{hero.marker}</span>
                </div>
                <div className="space-y-6">
                  <p
                    className="profile-reveal font-profile-mono text-[11px] uppercase tracking-[0.18em] text-[var(--profile-muted)]"
                    style={staggerStyle(1)}
                  >
                    {profileCard.name} / {hero.role}
                  </p>
                  <h1
                    className="profile-heading profile-reveal font-profile-display text-[clamp(3.25rem,7.2vw,6.8rem)] font-semibold leading-[0.9] tracking-[-0.065em]"
                    style={staggerStyle(2)}
                  >
                    {heroLines.map((line, lineIndex) => (
                      <span
                        key={line.text}
                        className={cn("block", line.className)}
                      >
                        {splitWords(line.text, lineIndex * 8)}
                        {lineIndex < heroLines.length - 1 ? " " : null}
                      </span>
                    ))}
                  </h1>
                  <p
                    className={cn(
                      sectionCopy,
                      "profile-reveal max-w-2xl text-lg leading-relaxed",
                    )}
                    style={staggerStyle(3)}
                  >
                    {hero.intro}
                  </p>
                </div>
                <div
                  className="profile-reveal flex flex-wrap items-center gap-3"
                  style={staggerStyle(4)}
                >
                  {profileCard.actions.map((cta) => {
                    const isPrimary = cta.variant === "primary";
                    const shouldOpenNewTab = isExternalHref(cta.href);

                    return (
                      <Button
                        key={cta.label}
                        asChild
                        size="lg"
                        variant={isPrimary ? "default" : "outline"}
                        className={cn(
                          "profile-button rounded-full px-6 text-sm font-semibold",
                          isPrimary
                            ? "bg-[var(--profile-accent-strong)] text-[var(--profile-on-accent)] hover:bg-[var(--profile-accent-strong)]"
                            : "border-[var(--profile-accent)] bg-[var(--profile-surface)] text-[var(--profile-ink)] hover:bg-[var(--profile-accent-soft)]",
                        )}
                      >
                        <a
                          href={cta.href}
                          target={shouldOpenNewTab ? "_blank" : undefined}
                          rel={shouldOpenNewTab ? "noreferrer noopener" : undefined}
                          className="inline-flex items-center gap-2"
                        >
                          <Mail className="size-4" />
                          {cta.label}
                          <ArrowUpRight className="profile-cta-arrow size-4" />
                        </a>
                      </Button>
                    );
                  })}
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="profile-button rounded-full border-[var(--profile-border)] bg-[var(--profile-surface)] text-[var(--profile-ink)] hover:bg-[var(--profile-surface-strong)]"
                  >
                    <a
                      href={pageLinks[0].href}
                      className="inline-flex items-center gap-2"
                    >
                      View credentials
                      <ArrowUpRight className="profile-cta-arrow size-4" />
                    </a>
                  </Button>
                </div>
                <div
                  className="profile-reveal flex items-center gap-3 font-profile-mono text-[10px] uppercase tracking-[0.2em] text-[var(--profile-muted)]"
                  style={staggerStyle(4)}
                >
                  <span className="profile-status-dot" aria-hidden="true" />
                  <span>{hero.availability}</span>
                  <span aria-hidden="true">·</span>
                  <span>{profileCard.location}</span>
                </div>
              </div>
              <div
                className="profile-reveal md:col-span-5"
                style={staggerStyle(2)}
              >
                <div
                  className="profile-portrait-stage relative mx-auto max-w-sm"
                  onPointerEnter={handlePortraitPointerEnter}
                  onPointerMove={handlePortraitPointerMove}
                  onPointerLeave={resetPortraitPosition}
                  onPointerCancel={resetPortraitPosition}
                >
                  <p
                    className="absolute -top-7 left-0 font-profile-mono text-[9px] uppercase tracking-[0.24em] text-[var(--profile-muted)]"
                    aria-hidden="true"
                  >
                    VISUAL / IMG.01 / 16.0433° N
                  </p>
                  <div
                    className={cn(
                      "profile-portrait-frame relative z-10 overflow-hidden rounded-[20px] border border-[var(--profile-border-strong)] bg-[var(--profile-surface)] p-2",
                    )}
                  >
                    <span
                      className="profile-frame-corner profile-frame-corner--tl"
                      aria-hidden="true"
                    />
                    <span
                      className="profile-frame-corner profile-frame-corner--br"
                      aria-hidden="true"
                    />
                    <div className="relative overflow-hidden rounded-[13px] bg-black">
                      <ImageWithFallback
                        src={profileCard.avatar}
                        alt={`${profileCard.name} portrait`}
                        width={864}
                        height={1184}
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        sizes="(min-width: 768px) 24rem, 100vw"
                        /* 3/4 is within a hair of the file's native 864x1184,
                           so almost nothing is cropped away; 4/5 was cutting
                           into the frame. */
                        className="profile-image block aspect-[3/4] w-full object-cover object-top"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-16">
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-sm font-semibold">
                            {profileCard.name}
                          </span>
                        </div>
                        <p className="font-profile-mono text-[10px] uppercase tracking-[0.18em] text-white/65">
                          Designer / engineer / Philippines
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-1 pb-1 pt-3 font-profile-mono text-[9px] uppercase tracking-[0.18em] text-[var(--profile-muted)]">
                      <span>Signal stable</span>
                      <span>EV / 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="profile-status-rail profile-reveal grid overflow-hidden rounded-[18px] border border-[var(--profile-border)] bg-[var(--profile-surface)] md:grid-cols-3"
              style={staggerStyle(3)}
            >
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className="profile-status-cell flex flex-col gap-4 p-5 sm:p-6"
                >
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className={sectionEyebrow}>{metric.label}</p>
                      <p className="mt-2 text-xl font-semibold text-[var(--profile-ink)]">
                        {typeof metric.count === "number" ? (
                          <CountUp
                            value={metric.count}
                            className="profile-countup"
                          />
                        ) : (
                          metric.value
                        )}
                      </p>
                    </div>
                    <span className="font-profile-mono text-[10px] text-[var(--profile-muted)]">
                      0{index + 1}
                    </span>
                  </div>
                  {typeof metric.ratio === "number" ? (
                    <div
                      className="profile-meter"
                      style={
                        {
                          "--meter-value": metric.ratio,
                          "--reveal-delay": `${240 + index * 110}ms`,
                        } as CSSProperties
                      }
                      aria-hidden="true"
                    >
                      <i />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section
            id="services"
            tabIndex={-1}
            className="profile-section space-y-12"
          >
            <div
              className="profile-reveal space-y-4"
              style={revealStyle(0)}
            >
              <p className={sectionEyebrow}>// 02 / process</p>
              <h2 className={sectionTitle}>
                From discovery to launch
                <AccentDot />
              </h2>
              <p className={sectionCopy}>
                Structured engagements that keep scope clear, quality high, and
                collaboration smooth.
              </p>
            </div>
            {/* Rule-separated rows, not cards: each step is a line, and its
                "Includes" list stays folded until asked for. */}
            <ul className="border-t border-[var(--profile-border)]">
              {services.map((service, index) => (
                <li
                  key={service.title}
                  className="profile-reveal border-b border-[var(--profile-border)] py-5"
                  style={staggerStyle(index, 55)}
                >
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="font-profile-mono text-[10px] text-[var(--profile-accent)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="shrink-0 text-lg font-semibold text-[var(--profile-ink)] sm:w-36">
                      {service.title}
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-[var(--profile-muted)]">
                      {service.summary}
                    </span>
                  </div>
                  <div className="mt-2 pl-8">
                    <DetailDisclosure label="Includes">
                      <ul className="space-y-2">
                        {service.includes.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-3 font-profile-mono text-[10px] uppercase tracking-[0.18em] text-[var(--profile-muted)]"
                          >
                            <span
                              className="h-px w-4 bg-[var(--profile-accent)]"
                              aria-hidden="true"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </DetailDisclosure>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Needs an id so the pager can stop here. Without one it sits
              between two paged sections and a gesture would jump clean over
              it, making the strip unreachable. It stays out of navLinks. */}
          <section id="signal" className="profile-section">
            <div
              className="profile-signal-strip profile-reveal overflow-hidden border-y border-[var(--profile-border)] py-6"
              style={revealStyle(0)}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <h2 className={sectionEyebrow}>// signal / collaborations</h2>
                  <p className="text-sm text-[var(--profile-muted)]">
                    Teams and communities I have supported.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMarqueePaused((isPaused) => !isPaused)}
                  className="profile-motion-control inline-flex w-fit items-center gap-2 rounded-full border border-[var(--profile-border)] bg-[var(--profile-surface-strong)] px-4 py-2 text-xs font-semibold text-[var(--profile-ink)]"
                >
                  {marqueePaused ? (
                    <Play className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Pause className="size-3.5" aria-hidden="true" />
                  )}
                  {marqueePaused ? "Resume movement" : "Pause movement"}
                </button>
              </div>
              <div className="mt-6 overflow-hidden">
                <div
                  ref={marqueeRef}
                  className={cn(
                    "profile-marquee flex w-max gap-4",
                    marqueePaused && "is-paused",
                  )}
                >
                  {marqueeItems.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex max-w-full flex-wrap items-center gap-3 rounded-full border border-[var(--profile-border)] bg-[var(--profile-surface-strong)] px-4 py-2 text-xs font-profile-mono uppercase tracking-[0.2em] text-[var(--profile-muted)]"
                      aria-hidden={index >= collaborations.length}
                    >
                      <span className="text-[var(--profile-ink)]">
                        {item.name}
                      </span>
                      <span>{item.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="capabilities"
            tabIndex={-1}
            className="profile-section space-y-12"
          >
            {/* Single column now that the stack carousel is gone. */}
            <div>
              <div
                className="profile-reveal space-y-6"
                style={revealStyle(0)}
              >
                <p className={sectionEyebrow}>// 03 / capability.stack</p>
                <h2 className={sectionTitle}>
                  The toolkit behind the work
                  <AccentDot />
                </h2>
                <p className={cn(sectionCopy, "max-w-3xl")}>
                  A blend of UI craft, dependable services, and security-aware
                  practices that keep products steady.
                </p>
                {/* A rule-separated list rather than cards — the one place
                    these three still appear. */}
                <ul className="border-t border-[var(--profile-border)]">
                  {focusAreas.map((area, index) => (
                    <li
                      key={area.title}
                      className="profile-reveal flex items-baseline gap-4 border-b border-[var(--profile-border)] py-3"
                      style={staggerStyle(index, 55)}
                    >
                      <span className="font-profile-mono text-[10px] text-[var(--profile-accent)]">
                        0{index + 1}
                      </span>
                      <span className="shrink-0 text-base font-semibold text-[var(--profile-ink)] sm:w-40">
                        {area.title}
                      </span>
                      <span className="text-sm text-[var(--profile-muted)]">
                        {area.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* The toolkit itself, as plain rows — the heading promises it,
                  so it has to be on the page. Names only: no chips, no
                  logos, no boxes. */}
              <ul className="mt-10 border-t border-[var(--profile-border)]">
                {techStack.map((group, index) => (
                  <li
                    key={group.title}
                    className="profile-reveal flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-[var(--profile-border)] py-3"
                    style={staggerStyle(index, 110)}
                  >
                    <span className="shrink-0 font-profile-mono text-[10px] uppercase tracking-[0.24em] text-[var(--profile-muted)] sm:w-44">
                      {group.title}
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-[var(--profile-ink)]">
                      {group.items.map((item) => item.name).join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section
            id="security"
            tabIndex={-1}
            className="profile-section"
          >
            {/* No panel wrapper: the surrounding card is gone, the content
                is not. Only the reveal hook remains on this element. */}
            <div className="profile-reveal" style={revealStyle(0)}>
              <div className="grid gap-8 lg:grid-cols-[0.62fr_0.38fr] lg:items-end">
                <div className="space-y-4">
                  <p className={sectionEyebrow}>// 04 / secure.delivery</p>
                  <h2 className={sectionTitle}>
                    Security measures baked in
                    <AccentDot />
                  </h2>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--profile-border)] text-[var(--profile-accent)]">
                    <ShieldCheck className="size-4" aria-hidden="true" />
                  </div>
                  <p className={sectionCopy}>
                    Practical steps that reduce risk, protect users, and keep
                    delivery accountable from discovery through launch.
                  </p>
                </div>
              </div>
              {/* Back as rows rather than the SEC.0x card grid: title and
                  description on a line, controls folded away. */}
              <ul className="mt-10 border-t border-[var(--profile-border)]">
                {securityMeasures.map((measure, index) => (
                  <li
                    key={measure.title}
                    className="profile-reveal border-b border-[var(--profile-border)] py-4"
                    style={staggerStyle(index, 55)}
                  >
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="font-profile-mono text-[10px] text-[var(--profile-accent)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="shrink-0 text-base font-semibold text-[var(--profile-ink)] sm:w-44">
                        {measure.title}
                      </span>
                      <span className="min-w-0 flex-1 text-sm text-[var(--profile-muted)]">
                        {measure.description}
                      </span>
                    </div>
                    <div className="mt-2 pl-8">
                      <DetailDisclosure label="Controls">
                        <ul className="space-y-2 text-[11px] font-profile-mono uppercase tracking-[0.24em] text-[var(--profile-muted)]">
                          {measure.items.map((item) => (
                            <li key={item} className="flex items-center gap-2">
                              <span className="size-1.5 rounded-full bg-[var(--profile-accent)]" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </DetailDisclosure>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Free-scrolling: the timeline plus its sticky aside will not fit a
              single viewport, and nesting a scroller inside a snap point is
              worse than opting out of snap. */}
          <section
            id="proof"
            tabIndex={-1}
            className="profile-section profile-section--free space-y-12"
          >
            <div
              className="profile-reveal space-y-4"
              style={revealStyle(0)}
            >
              <p className={sectionEyebrow}>// 05 / selected.work</p>
              <h2 className={sectionTitle}>
                Selected delivery highlights
                <AccentDot />
              </h2>
            </div>
            <div className="grid gap-10 lg:grid-cols-[0.66fr_0.34fr]">
              <div className="profile-timeline border-t border-[var(--profile-border)]">
                {experiences.map((experience, index) => (
                  <article
                    key={experience.company}
                    className="profile-experience-entry profile-reveal border-b border-[var(--profile-border)] py-7 sm:grid sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-8"
                    style={staggerStyle(index, 55)}
                  >
                    <div className="mb-5 font-profile-mono text-[10px] uppercase tracking-[0.2em] text-[var(--profile-muted)] sm:mb-0">
                      <span className="block text-[var(--profile-accent)]">
                        0{index + 1}
                      </span>
                      <span className="mt-2 block">Archive</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 font-profile-mono text-[10px] uppercase tracking-[0.18em] text-[var(--profile-muted)]">
                        <span>{experience.period}</span>
                        <span
                          className="inline-block h-px w-8 bg-[var(--profile-border)]"
                          aria-hidden="true"
                        />
                        <span>{experience.role}</span>
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold text-[var(--profile-ink)]">
                        {experience.company}
                      </h3>
                      <p className="mt-3 text-base text-[var(--profile-muted)]">
                        {experience.summary}
                      </p>
                      <ul className="mt-6 space-y-3 text-sm text-[var(--profile-muted)]">
                        {experience.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-3">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--profile-accent)]" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div
                  className={cn(
                    panelSurfaceStrong,
                    "profile-availability-card profile-reveal space-y-4 p-6",
                  )}
                  style={staggerStyle(2)}
                >
                  <p className={sectionEyebrow}>// availability</p>
                  <p className="text-2xl font-semibold text-[var(--profile-ink)]">
                    Open for new collaborations
                  </p>
                  <p className="text-sm text-[var(--profile-muted)]">
                    I work with teams that value clarity, ethics, and measurable
                    outcomes. Reach out to align on scope and timing.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="profile-button rounded-full bg-[var(--profile-accent-strong)] text-[var(--profile-on-accent)] hover:bg-[var(--profile-accent-strong)]"
                  >
                    <a
                      href="#contact"
                      onClick={(event) => handleAnchorClick(event, "#contact")}
                      className="inline-flex items-center gap-2"
                    >
                      Start a project
                      <ArrowUpRight className="profile-cta-arrow size-4" />
                    </a>
                  </Button>
                  <div className="border-t border-[var(--profile-border)] pt-5">
                    <p className={sectionEyebrow}>Case studies</p>
                    {projects.length ? (
                      <div className="mt-4 space-y-4">
                        {projects.map((project) => (
                          <div key={project.title} className="space-y-2">
                            <p className="font-semibold text-[var(--profile-ink)]">
                              {project.title}
                            </p>
                            <p className="text-sm text-[var(--profile-muted)]">
                              {project.description}
                            </p>
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--profile-ink)]"
                            >
                              View case study
                              <ExternalLink className="size-4" />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[var(--profile-muted)]">
                        Detailed case studies are being prepared. The delivery
                        summary remains available above.
                      </p>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </section>

          {/* Free-scrolling: an expanded accordion can exceed the viewport. */}
          <section
            id="faq"
            tabIndex={-1}
            className="profile-section profile-section--free space-y-10"
          >
            <div
              className="profile-reveal space-y-4"
              style={revealStyle(0)}
            >
              <p className={sectionEyebrow}>// 06 / common.queries</p>
              <h2 className={sectionTitle}>
                Questions, answered
                <AccentDot />
              </h2>
            </div>
            <div className="border-t border-[var(--profile-border)]">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                const triggerId = `faq-trigger-${index}`;
                const panelId = `faq-panel-${index}`;
                return (
                  <div
                    key={faq.question}
                    className="profile-faq-row profile-reveal overflow-hidden border-b border-[var(--profile-border)]"
                    style={staggerStyle(index, 55)}
                  >
                    <h3>
                      <button
                        id={triggerId}
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="profile-faq-trigger grid w-full grid-cols-[2rem_1fr_auto] items-center gap-4 py-6 text-left sm:grid-cols-[4rem_1fr_auto]"
                      >
                        <span className="font-profile-mono text-[10px] tracking-[0.18em] text-[var(--profile-accent)]">
                          0{index + 1}
                        </span>
                        <span className="text-base font-semibold text-[var(--profile-ink)]">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={cn(
                            "size-5 text-[var(--profile-muted)] transition",
                            isOpen && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      hidden={!isOpen}
                      className="pb-6 pl-12 pr-10 sm:pl-20"
                    >
                      <p className="text-sm text-[var(--profile-muted)]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section
            id="contact"
            tabIndex={-1}
            className="profile-section"
          >
            {/* Card wrapper removed to match the other sections; only the
                reveal hook remains on this element. */}
            <div className="profile-reveal" style={revealStyle(0)}>
              <div className="grid gap-8 lg:grid-cols-[0.62fr_0.38fr] lg:items-end">
                <div>
                  <p className={sectionEyebrow}>// 07 / open.channel</p>
                  <h2 className={cn(sectionTitle, "mt-5 max-w-3xl")}>
                    {contact.title}
                    <AccentDot />
                  </h2>
                </div>
                <div>
                  <p className="text-base leading-relaxed text-[var(--profile-muted)]">
                    {contact.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {contact.ctas.map((cta) => {
                      const shouldOpenNewTab = isExternalHref(cta.href);

                      return (
                        <Button
                          key={cta.label}
                          className="profile-button rounded-full bg-[var(--profile-ink)] px-6 text-sm font-semibold text-[var(--profile-bg)] hover:bg-black"
                          size="lg"
                          asChild
                        >
                          <a
                            href={cta.href}
                            target={shouldOpenNewTab ? "_blank" : undefined}
                            rel={
                              shouldOpenNewTab
                                ? "noreferrer noopener"
                                : undefined
                            }
                            className="inline-flex items-center gap-2"
                          >
                            {cta.label}
                            <Mail className="size-4" />
                            <ArrowUpRight className="profile-cta-arrow size-4" />
                          </a>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="profile-contact-grid mt-10 grid border-t border-[var(--profile-border)] sm:grid-cols-2 lg:grid-cols-3">
                {contact.details.map((detail) => {
                  const detailIsExternal = detail.href
                    ? isExternalHref(detail.href)
                    : false;

                  return (
                    <div
                      key={detail.label}
                      className="profile-contact-cell min-w-0 py-5 sm:px-4 sm:first:pl-0 lg:py-6"
                    >
                      <p className={sectionEyebrow}>{detail.label}</p>
                      {detail.href ? (
                        <a
                          href={detail.href}
                          className="mt-2 block break-words text-sm font-semibold text-[var(--profile-ink)] hover:underline"
                          target={detailIsExternal ? "_blank" : undefined}
                          rel={
                            detailIsExternal
                              ? "noreferrer noopener"
                              : undefined
                          }
                        >
                          {detail.value}
                        </a>
                      ) : (
                        <p className="mt-2 text-sm font-semibold text-[var(--profile-ink)]">
                          {detail.value}
                        </p>
                      )}
                    </div>
                  );
                })}
                {socialLinks.map((link) => (
                  <div
                    key={link.label}
                    className="profile-contact-cell py-5 sm:px-4 lg:py-6"
                  >
                    <p className={sectionEyebrow}>Social</p>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--profile-ink)] hover:underline"
                    >
                      {getSocialIcon(link.label)}
                      {link.label}
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                ))}
                <div className="profile-contact-cell py-5 sm:px-4 lg:py-6">
                  <p className={sectionEyebrow}>Credentials</p>
                  <a
                    href={pageLinks[0].href}
                    className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--profile-ink)] hover:underline"
                  >
                    Certification index
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t border-[var(--profile-border)] pt-5 font-profile-mono text-[9px] uppercase tracking-[0.18em] text-[var(--profile-muted)] sm:flex-row sm:items-center sm:justify-between">
                <span>{profileCard.name}</span>
                <span>Clear systems / thoughtful delivery / open channel</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
