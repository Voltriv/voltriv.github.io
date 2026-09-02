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
  Link,
  Mail,
  Menu,
  Moon,
  Pause,
  Play,
  ShieldCheck,
  SunMedium,
  X,
} from "lucide-react";
import { profileData } from "@/data/profile";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

type ProfileViewProps = {
  darkMode: boolean;
  onToggleDarkMode: () => void;
};

const {
  hero,
  navLinks,
  pageLinks,
  services,
  experiences,
  projects,
  focusAreas,
  securityMeasures,
  techStack,
  profileCard,
  contact,
  socialLinks,
  faqs,
  collaborations,
} = profileData;

const LinkedInIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-4"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M5.34 7.43a2.06 2.06 0 1 0 0-4.12 2.06 2.06 0 0 0 0 4.12ZM3.86 20.45h2.95V9H3.86v11.45ZM9.35 9v11.45h3.55v-5.67c0-1.49.28-2.94 2.14-2.94 1.82 0 1.85 1.71 1.85 3.04v5.57h3.56v-6.28c0-3.09-.67-5.46-4.27-5.46-1.73 0-2.9.95-3.37 1.85h-.05V9H9.35Z" />
  </svg>
);

const getSocialIcon = (label: string) =>
  label.toLowerCase() === "linkedin" ? (
    <LinkedInIcon />
  ) : (
    <Link className="size-4" aria-hidden="true" />
  );

const isExternalHref = (href: string) => /^https?:/i.test(href);

const HEADER_SCROLL_OFFSET_PX = 96;

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
  window.scrollTo({
    top: targetTop,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
  target.focus({ preventScroll: true });
  updateHash(hash);
  return true;
};

const sectionEyebrow =
  "font-profile-mono text-[12px] uppercase tracking-[0.28em] text-[var(--profile-muted)]";
const sectionTitle =
  "font-profile-display text-3xl leading-[1.15] text-[var(--profile-ink)] sm:text-4xl lg:text-5xl";
const sectionCopy = "text-base text-[var(--profile-muted)] sm:text-lg";
const panelSurface =
  "profile-card rounded-[18px] border border-[var(--profile-border)] bg-[var(--profile-surface)]";
const panelSurfaceStrong =
  "profile-card rounded-[20px] border border-[var(--profile-border)] bg-[var(--profile-surface-strong)]";

const revealStyle = (delay: number): CSSProperties =>
  ({
    "--reveal-delay": `${delay}ms`,
  }) as CSSProperties;

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

type TechLogoProps = {
  name: string;
  logo?: string;
};

const TechLogo = ({ name, logo }: TechLogoProps) => {
  const [failedLogo, setFailedLogo] = useState<string>();
  const showLogo = Boolean(logo && failedLogo !== logo);
  const monogram = name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="flex size-7 items-center justify-center rounded-full bg-white text-[10px] font-semibold tracking-normal text-neutral-800">
      {showLogo ? (
        <img
          src={logo}
          alt=""
          width={16}
          height={16}
          loading="lazy"
          className="profile-logo h-4 w-4"
          onError={() => setFailedLogo(logo)}
        />
      ) : (
        <span aria-hidden="true">{monogram}</span>
      )}
    </span>
  );
};

export function ProfileView({
  darkMode,
  onToggleDarkMode,
}: ProfileViewProps) {
  const sectionIds = useMemo(
    () => navLinks.map((link) => link.href.replace("#", "")),
    [],
  );
  const activeSection = useSectionObserver(sectionIds);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [marqueePaused, setMarqueePaused] = useState(false);
  const mobileNavButtonRef = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    const root = profileRootRef.current;
    if (!root) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const finePointer = window.matchMedia("(pointer: fine)");
    if (reduceMotion.matches || !finePointer.matches) return undefined;

    let frameId: number | null = null;
    let nextX = window.innerWidth / 2;
    let nextY = window.innerHeight / 3;

    const updateSpotlight = () => {
      frameId = null;
      root.style.setProperty("--pointer-x", `${nextX}px`);
      root.style.setProperty("--pointer-y", `${nextY}px`);
    };

    const scheduleSpotlight = (event: PointerEvent) => {
      nextX = event.clientX;
      nextY = event.clientY;
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateSpotlight);
      }
    };

    updateSpotlight();
    window.addEventListener("pointermove", scheduleSpotlight, {
      passive: true,
    });

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      if (portraitFrameRef.current !== null) {
        window.cancelAnimationFrame(portraitFrameRef.current);
        portraitFrameRef.current = null;
      }
      window.removeEventListener("pointermove", scheduleSpotlight);
    };
  }, []);

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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -12% 0px" },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
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

  useEffect(() => {
    if (!mobileNavOpen) return undefined;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
        mobileNavButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileNavOpen]);

  useEffect(() => {
    const desktopBreakpoint = window.matchMedia("(min-width: 1280px)");
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileNavOpen(false);
      }
    };

    desktopBreakpoint.addEventListener("change", closeAtDesktop);
    return () =>
      desktopBreakpoint.removeEventListener("change", closeAtDesktop);
  }, []);

  const totalStackItems = techStack.reduce(
    (sum: number, group) => sum + group.items.length,
    0,
  );
  const metrics = [
    { label: "Base", value: "PH / Remote" },
    { label: "Delivery highlights", value: experiences.length.toString() },
    { label: "Tools in rotation", value: totalStackItems.toString() },
  ];
  const marqueeItems = [...collaborations, ...collaborations];
  const heroLines = hero.headline.map((line, index) => ({
    text: line,
    className: index === 1 ? "text-[var(--profile-accent)]" : "",
  }));

  return (
    <div
      ref={profileRootRef}
      className="profile-theme min-h-screen overflow-x-hidden bg-[var(--profile-bg)] text-[var(--profile-ink)]"
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
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 profile-grid opacity-70 dark:opacity-50"
          aria-hidden="true"
        />
        <div className="profile-pointer-glow" aria-hidden="true" />
        <div className="profile-corner-glow" aria-hidden="true" />

        <header className="profile-header fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-5">
          <div className="profile-header-shell mx-auto flex max-w-6xl items-center justify-between px-3 py-3 sm:px-4">
            <div className="flex items-center gap-3">
              <div className="profile-brand-mark flex size-10 items-center justify-center rounded-xl border border-[var(--profile-border)] bg-[var(--profile-ink)] font-profile-mono text-xs font-semibold tracking-[0.14em] text-[var(--profile-bg)]">
                EV
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="flex items-center gap-2 font-profile-mono text-[10px] uppercase tracking-[0.24em] text-[var(--profile-muted)]">
                  <span className="profile-status-dot" aria-hidden="true" />
                  {hero.availability}
                </p>
                <p className="mt-1 max-w-[250px] truncate text-xs font-semibold">
                  Elijah / designer + engineer
                </p>
              </div>
            </div>
            <nav
              className="hidden items-center gap-1 xl:flex"
              aria-label="Primary"
            >
              {navLinks.map((link) => {
                const isActive =
                  activeSection === link.href.replace("#", "");
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(event) => handleAnchorClick(event, link.href)}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "profile-navlink rounded-lg px-2.5 py-2 font-profile-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                      isActive
                        ? "is-active bg-[var(--profile-accent-soft)] text-[var(--profile-ink)]"
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
                  className="profile-navlink rounded-lg px-2.5 py-2 font-profile-mono text-[10px] uppercase tracking-[0.16em] text-[var(--profile-muted)] transition-colors hover:text-[var(--profile-ink)]"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <button
                ref={mobileNavButtonRef}
                type="button"
                onClick={() => setMobileNavOpen((isOpen) => !isOpen)}
                aria-label={
                  mobileNavOpen ? "Close navigation menu" : "Open navigation menu"
                }
                aria-expanded={mobileNavOpen}
                aria-controls="mobile-navigation"
                className="profile-icon-button inline-flex size-10 items-center justify-center rounded-xl border border-[var(--profile-border)] bg-[var(--profile-surface)] text-[var(--profile-ink)] xl:hidden"
              >
                {mobileNavOpen ? (
                  <X className="size-4" aria-hidden="true" />
                ) : (
                  <Menu className="size-4" aria-hidden="true" />
                )}
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
          <nav
            id="mobile-navigation"
            hidden={!mobileNavOpen}
            className={cn(
              "profile-mobile-nav mx-auto mt-2 max-w-6xl grid-cols-2 gap-2 rounded-2xl border border-[var(--profile-border)] p-3 xl:hidden",
              mobileNavOpen ? "grid" : "hidden",
            )}
            aria-label="Mobile primary"
          >
            {navLinks.map((link) => {
              const isActive =
                activeSection === link.href.replace("#", "");

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) => {
                    handleAnchorClick(event, link.href);
                    setMobileNavOpen(false);
                  }}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "rounded-xl px-3 py-2 font-profile-mono text-[11px] uppercase tracking-[0.18em]",
                    isActive
                      ? "bg-[var(--profile-accent-soft)] text-[var(--profile-ink)]"
                      : "text-[var(--profile-muted)] hover:bg-[var(--profile-surface)] hover:text-[var(--profile-ink)]",
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
                className="rounded-xl px-3 py-2 font-profile-mono text-[11px] uppercase tracking-[0.18em] text-[var(--profile-muted)] hover:bg-[var(--profile-surface)] hover:text-[var(--profile-ink)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="relative mx-auto max-w-6xl px-5 pb-28 pt-32 sm:px-6 sm:pt-36"
        >
          <section
            id="overview"
            tabIndex={-1}
            className="scroll-mt-28 space-y-10"
          >
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
              <div className="space-y-8 lg:col-span-7">
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
                    style={revealStyle(60)}
                  >
                    {profileCard.name} / {hero.role}
                  </p>
                  <h1
                    className="profile-heading profile-reveal font-profile-display text-[clamp(3.25rem,7.2vw,6.8rem)] font-semibold leading-[0.9] tracking-[-0.065em]"
                    style={revealStyle(100)}
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
                    style={revealStyle(180)}
                  >
                    {hero.intro}
                  </p>
                </div>
                <div
                  className="profile-reveal flex flex-wrap items-center gap-3"
                  style={revealStyle(240)}
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
                            ? "bg-[var(--profile-accent-strong)] text-black hover:bg-[var(--profile-accent-strong)]"
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
                  style={revealStyle(240)}
                >
                  <span className="profile-status-dot" aria-hidden="true" />
                  <span>{hero.availability}</span>
                  <span aria-hidden="true">·</span>
                  <span>{profileCard.location}</span>
                </div>
              </div>
              <div
                className="profile-reveal profile-reveal--right lg:col-span-5"
                style={revealStyle(140)}
              >
                <div
                  className="profile-portrait-stage relative mx-auto max-w-sm"
                  onPointerEnter={handlePortraitPointerEnter}
                  onPointerMove={handlePortraitPointerMove}
                  onPointerLeave={resetPortraitPosition}
                  onPointerCancel={resetPortraitPosition}
                >
                  <div
                    className="profile-portrait-orbit absolute -inset-6"
                    aria-hidden="true"
                  >
                    <span />
                  </div>
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
                        className="profile-image block aspect-[4/5] w-full object-cover object-top"
                      />
                      <div
                        className="profile-portrait-scan"
                        aria-hidden="true"
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
              style={revealStyle(220)}
            >
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className="profile-status-cell flex items-end justify-between gap-4 p-5 sm:p-6"
                >
                  <div>
                    <p className={sectionEyebrow}>{metric.label}</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--profile-ink)]">
                      {metric.value}
                    </p>
                  </div>
                  <span className="font-profile-mono text-[10px] text-[var(--profile-muted)]">
                    0{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section
            id="services"
            tabIndex={-1}
            className="mt-28 scroll-mt-28 space-y-12"
          >
            <div
              className="profile-reveal space-y-4"
              style={revealStyle(0)}
            >
              <p className={sectionEyebrow}>// 02 / process</p>
              <h2 className={sectionTitle}>From discovery to launch</h2>
              <p className={sectionCopy}>
                Structured engagements that keep scope clear, quality high, and
                collaboration smooth.
              </p>
            </div>
            <div className="profile-process-grid grid overflow-hidden rounded-[18px] border border-[var(--profile-border)] bg-[var(--profile-surface)] lg:grid-cols-3">
              {services.map((service, index) => (
                <article
                  key={service.title}
                  className={cn(
                    "profile-process-step profile-reveal flex min-h-full flex-col p-6 sm:p-8",
                    index % 2 === 0
                      ? "profile-reveal--left"
                      : "profile-reveal--right",
                  )}
                  style={revealStyle(100 + index * 70)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-profile-mono text-xs uppercase tracking-[0.22em] text-[var(--profile-muted)]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <span
                      className="profile-process-signal size-2 rounded-full border border-[var(--profile-accent)]"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-16 space-y-3">
                    <h3 className="text-2xl font-semibold text-[var(--profile-ink)]">
                      {service.title}
                    </h3>
                    <p className="text-sm text-[var(--profile-muted)]">
                      {service.summary}
                    </p>
                  </div>
                  <div className="mt-8 space-y-3 border-t border-[var(--profile-border)] pt-5">
                    <p className="font-profile-mono text-xs uppercase tracking-[0.22em] text-[var(--profile-muted)]">
                      Includes
                    </p>
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
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-20">
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
            className="mt-28 scroll-mt-28 space-y-12"
          >
            <div className="grid gap-10 lg:grid-cols-[0.4fr_0.6fr]">
              <div
                className="profile-reveal profile-reveal--blur profile-reveal--left space-y-6"
                style={revealStyle(0)}
              >
                <p className={sectionEyebrow}>// 03 / capability.stack</p>
                <h2 className={sectionTitle}>The toolkit behind the work</h2>
                <p className={sectionCopy}>
                  A blend of UI craft, dependable services, and security-aware
                  practices that keep products steady.
                </p>
                <div className="space-y-4">
                  {focusAreas.map((area, index) => (
                    <div
                      key={area.title}
                      className={cn(
                        panelSurface,
                        "profile-reveal profile-reveal--scale p-5",
                        index % 2 === 0
                          ? "profile-reveal--left"
                          : "profile-reveal--right",
                      )}
                      style={revealStyle(100 + index * 60)}
                    >
                      <p className="text-lg font-semibold text-[var(--profile-ink)]">
                        {area.title}
                      </p>
                      <p className="mt-2 text-sm text-[var(--profile-muted)]">
                        {area.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {techStack.map((group, index) => (
                  <article
                    key={group.title}
                    className={cn(
                      panelSurface,
                      "profile-tech-card profile-reveal flex h-full flex-col p-6",
                      (group.title === "Frontend" ||
                        group.title.startsWith("Cybersecurity")) &&
                        "lg:col-span-2",
                      index % 2 === 0
                        ? "profile-reveal--right"
                        : "profile-reveal--left",
                    )}
                    style={revealStyle(100 + index * 45)}
                  >
                    <div>
                      <h3 className={sectionEyebrow}>{group.title}</h3>
                      <p className="mt-3 text-sm text-[var(--profile-muted)]">
                        {group.description}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {group.items.map((item) => (
                        <span
                          key={item.name}
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--profile-border)] bg-[var(--profile-surface-strong)] px-3 py-2 text-[11px] font-profile-mono uppercase tracking-[0.24em] text-[var(--profile-ink)]"
                        >
                          <TechLogo name={item.name} logo={item.logo} />
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section
            id="security"
            tabIndex={-1}
            className="mt-28 scroll-mt-28"
          >
            <div
              className="profile-security-panel profile-reveal overflow-hidden rounded-[20px] border border-[var(--profile-border)] p-6 sm:p-10"
              style={revealStyle(0)}
            >
              <div className="grid gap-8 lg:grid-cols-[0.62fr_0.38fr] lg:items-end">
                <div className="space-y-4">
                  <p className={sectionEyebrow}>// 04 / secure.delivery</p>
                  <h2 className={sectionTitle}>
                    Security measures baked in
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
              <div className="profile-security-grid mt-10 grid border-t border-[var(--profile-border)] md:grid-cols-2">
                {securityMeasures.map((measure, index) => (
                  <article
                    key={measure.title}
                    className={cn(
                      "profile-security-step profile-reveal space-y-5 py-7 md:p-7",
                      index % 2 === 0
                        ? "profile-reveal--right"
                        : "profile-reveal--left",
                    )}
                    style={revealStyle(80 + index * 45)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-[var(--profile-ink)]">
                        {measure.title}
                      </h3>
                      <span className="font-profile-mono text-[10px] tracking-[0.18em] text-[var(--profile-muted)]">
                        SEC.{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--profile-muted)]">
                      {measure.description}
                    </p>
                    <ul className="space-y-2 text-[11px] font-profile-mono uppercase tracking-[0.24em] text-[var(--profile-muted)]">
                      {measure.items.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-[var(--profile-accent)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section
            id="proof"
            tabIndex={-1}
            className="mt-28 scroll-mt-28 space-y-12"
          >
            <div
              className="profile-reveal space-y-4"
              style={revealStyle(0)}
            >
              <p className={sectionEyebrow}>// 05 / selected.work</p>
              <h2 className={sectionTitle}>Selected delivery highlights</h2>
            </div>
            <div className="grid gap-10 lg:grid-cols-[0.66fr_0.34fr]">
              <div className="profile-timeline border-t border-[var(--profile-border)]">
                {experiences.map((experience, index) => (
                  <article
                    key={experience.company}
                    className={cn(
                      "profile-experience-entry profile-reveal border-b border-[var(--profile-border)] py-7 sm:grid sm:grid-cols-[5rem_1fr] sm:gap-6 sm:py-8",
                      index % 2 === 0
                        ? "profile-reveal--left"
                        : "profile-reveal--right",
                    )}
                    style={revealStyle(80 + index * 60)}
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
                    "profile-reveal--right",
                  )}
                  style={revealStyle(120)}
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
                    className="profile-button rounded-full bg-[var(--profile-accent-strong)] text-black hover:bg-[var(--profile-accent-strong)]"
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

          <section
            id="faq"
            tabIndex={-1}
            className="mt-28 scroll-mt-28 space-y-10"
          >
            <div
              className="profile-reveal space-y-4"
              style={revealStyle(0)}
            >
              <p className={sectionEyebrow}>// 06 / common.queries</p>
              <h2 className={sectionTitle}>Questions, answered</h2>
            </div>
            <div className="border-t border-[var(--profile-border)]">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                const triggerId = `faq-trigger-${index}`;
                const panelId = `faq-panel-${index}`;
                return (
                  <div
                    key={faq.question}
                    className={cn(
                      "profile-faq-row profile-reveal overflow-hidden border-b border-[var(--profile-border)]",
                      index % 2 === 0
                        ? "profile-reveal--left"
                        : "profile-reveal--right",
                    )}
                    style={revealStyle(70 + index * 35)}
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
            className="mt-28 scroll-mt-28"
          >
            <div
              className="profile-contact-panel profile-reveal overflow-hidden rounded-[20px] border border-[var(--profile-border)] p-6 sm:p-10"
              style={revealStyle(0)}
            >
              <div className="grid gap-8 lg:grid-cols-[0.62fr_0.38fr] lg:items-end">
                <div>
                  <p className={sectionEyebrow}>// 07 / open.channel</p>
                  <h2 className="mt-5 max-w-3xl font-profile-display text-4xl font-semibold leading-[1] tracking-[-0.04em] text-[var(--profile-ink)] sm:text-5xl lg:text-6xl">
                    {contact.title}
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
              <div className="profile-contact-grid mt-10 grid border-t border-[var(--profile-border)] sm:grid-cols-2 lg:grid-cols-5">
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
