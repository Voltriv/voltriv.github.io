import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { ChevronDown, ExternalLink, Link, Menu, Pause, Play, X } from "lucide-react";
import { profileData } from "@/data/profile";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import { useRiseReveal } from "@/hooks/useRiseReveal";
import { HERO_CARDS, heroCardSvg } from "./HeroCards";
import { cn } from "@/components/ui/utils";

const {
  hero,
  navLinks,
  pageLinks,
  services,
  experiences,
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

const revealStyle = (delay: number): CSSProperties =>
  ({
    "--reveal-delay": `${delay}ms`,
  }) as CSSProperties;

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
    <span className="flex size-6 items-center justify-center rounded-full bg-white text-[9px] font-semibold tracking-normal text-neutral-800">
      {showLogo ? (
        <img
          src={logo}
          alt=""
          width={14}
          height={14}
          loading="lazy"
          className="h-3.5 w-3.5"
          onError={() => setFailedLogo(logo)}
        />
      ) : (
        <span aria-hidden="true">{monogram}</span>
      )}
    </span>
  );
};

export function ProfileView() {
  const sectionIds = useMemo(
    () => navLinks.map((link) => link.href.replace("#", "")),
    [],
  );
  const activeSection = useSectionObserver(sectionIds);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [marqueePaused, setMarqueePaused] = useState(false);
  const mobileNavButtonRef = useRef<HTMLButtonElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useRiseReveal();

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

  useEffect(() => {
    const zone = zoneRef.current;
    const heroEl = heroRef.current;
    if (!zone || !heroEl) return undefined;
    if (prefersReducedMotion()) return undefined;

    let ticking = false;

    const apply = () => {
      ticking = false;
      const range = zone.offsetHeight - window.innerHeight;
      if (range <= 0) return;
      const p = Math.min(
        Math.max(-zone.getBoundingClientRect().top / range, 0),
        1,
      );

      heroEl.style.transform = `scale(${(1 + p * 1.35).toFixed(4)})`;
      heroEl.style.opacity = `${(1 - Math.max(0, (p - 0.55) / 0.45)).toFixed(3)}`;

      HERO_CARDS.forEach((card, index) => {
        const el = cardRefs.current[index];
        if (!el) return;
        el.style.transform = `translate3d(${(card.dx * p).toFixed(2)}vw, ${(card.dy * p).toFixed(2)}vh, 0) scale(${(1 + p * 0.35).toFixed(3)})`;
        el.style.opacity = `${(0.8 - Math.max(0, (p - 0.35) / 0.5) * 0.8).toFixed(3)}`;
      });
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(apply);
      }
    };

    const timeoutId = setTimeout(() => {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      apply();
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
  const emailDetail = contact.details.find((detail) => detail.label === "Email");

  return (
    <div className="profile-theme min-h-screen overflow-x-hidden bg-[var(--profile-bg)] text-[var(--profile-ink)]">
      <a
        href="#main-content"
        onClick={(event) => handleAnchorClick(event, "#main-content")}
        className="fixed left-4 top-4 z-[70] -translate-y-24 bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--paper)] transition-transform focus-visible:translate-y-0"
      >
        Skip to main content
      </a>

      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="profile-header-shell mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a
            href="#overview"
            onClick={(event) => handleAnchorClick(event, "#overview")}
            className="profile-brand-mark flex size-9 items-center justify-center font-profile-mono text-[11px] font-semibold tracking-[0.1em] text-[var(--profile-ink)]"
          >
            EV
          </a>

          <nav
            className="hidden items-center gap-5 xl:flex"
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
                    "profile-navlink pb-1 font-profile-mono text-[10px] uppercase tracking-[0.18em]",
                    isActive
                      ? "is-active"
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
                className="profile-navlink pb-1 font-profile-mono text-[10px] uppercase tracking-[0.18em] text-[var(--profile-muted)] hover:text-[var(--profile-ink)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            ref={mobileNavButtonRef}
            type="button"
            onClick={() => setMobileNavOpen((isOpen) => !isOpen)}
            aria-label={
              mobileNavOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-navigation"
            className="profile-icon-button inline-flex size-9 items-center justify-center border border-[var(--profile-border)] text-[var(--profile-ink)] xl:hidden"
          >
            {mobileNavOpen ? (
              <X className="size-4" aria-hidden="true" />
            ) : (
              <Menu className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <nav
          id="mobile-navigation"
          hidden={!mobileNavOpen}
          className={cn(
            "mx-auto max-w-6xl grid-cols-2 gap-1 border-t border-[var(--profile-border)] bg-[var(--paper)] px-4 py-3 xl:hidden",
            mobileNavOpen ? "grid" : "hidden",
          )}
          aria-label="Mobile primary"
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace("#", "");

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
                  "px-2 py-2 font-profile-mono text-[11px] uppercase tracking-[0.18em]",
                  isActive
                    ? "text-[var(--profile-ink)]"
                    : "text-[var(--profile-muted)]",
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
              className="px-2 py-2 font-profile-mono text-[11px] uppercase tracking-[0.18em] text-[var(--profile-muted)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <div id="overview" className="scrollzone" ref={zoneRef}>
        <div className="stage">
          {HERO_CARDS.map((card, index) => (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={`card ${card.id}`}
              aria-hidden="true"
            >
              {heroCardSvg(card.id)}
            </div>
          ))}
          <div className="hero" ref={heroRef}>
            <p className="kicker">{hero.kicker}</p>
            <h1 className="name">{profileCard.name}</h1>
            <p className="disciplines">{hero.disciplines}</p>
          </div>
        </div>
      </div>

      <main id="main-content" tabIndex={-1} className="relative">
        <div className="panels bg-[var(--paper)]">
          <section className="panel">
            <p className="label rise">00 — Profile</p>
            <h2 className="statement wide rise" style={revealStyle(60)}>
              {hero.headline[0]} {hero.headline[1]}
            </h2>
            <p className="lede rise" style={revealStyle(120)}>
              {hero.intro}
            </p>
            <div
              className="rise mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 font-profile-mono text-[11px] uppercase tracking-[0.18em] text-[var(--profile-muted)]"
              style={revealStyle(160)}
            >
              <span className="inline-flex items-center gap-2">
                <span className="profile-status-dot" aria-hidden="true" />
                {hero.availability}
              </span>
              <span aria-hidden="true">·</span>
              <span>{profileCard.location}</span>
            </div>
            <div
              className="rise mt-8 flex flex-wrap gap-x-8 gap-y-3"
              style={revealStyle(200)}
            >
              {profileCard.actions.map((cta) => {
                const shouldOpenNewTab = isExternalHref(cta.href);
                return (
                  <a
                    key={cta.label}
                    href={cta.href}
                    target={shouldOpenNewTab ? "_blank" : undefined}
                    rel={shouldOpenNewTab ? "noreferrer noopener" : undefined}
                    className="link-underline font-profile-mono text-xs uppercase tracking-[0.14em]"
                  >
                    {cta.label}
                  </a>
                );
              })}
              <a
                href={pageLinks[0].href}
                className="link-underline font-profile-mono text-xs uppercase tracking-[0.14em]"
              >
                View credentials
              </a>
            </div>
            <div
              className="rise mt-16 grid gap-6 border-t border-[var(--profile-border)] pt-8 sm:grid-cols-3"
              style={revealStyle(240)}
            >
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <p className="font-profile-mono text-[10px] uppercase tracking-[0.2em] text-[rgba(23,21,15,.4)]">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-lg font-medium text-[var(--profile-ink)]">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section id="services" className="panel">
            <p className="label rise">01 — Process</p>
            <h2 className="statement rise">From discovery to launch.</h2>
            <ul className="index">
              {services.map((service, index) => (
                <li
                  key={service.title}
                  className="rise"
                  style={revealStyle(index * 70)}
                >
                  <i className="n">{String(index + 1).padStart(3, "0")}</i>
                  <b>{service.title}</b>
                  <span>
                    {service.summary} {service.includes.join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border-y border-[var(--profile-border)] px-[clamp(1.5rem,8vw,8rem)] py-8">
            <div
              className="rise flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              style={revealStyle(0)}
            >
              <p className="font-profile-mono text-[11px] uppercase tracking-[0.22em] text-[var(--profile-muted)]">
                // signal — collaborations
              </p>
              <button
                type="button"
                onClick={() => setMarqueePaused((isPaused) => !isPaused)}
                className="profile-motion-control link-underline inline-flex w-fit items-center gap-2 font-profile-mono text-[11px] uppercase tracking-[0.16em]"
              >
                {marqueePaused ? (
                  <Play className="size-3" aria-hidden="true" />
                ) : (
                  <Pause className="size-3" aria-hidden="true" />
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
                    className="flex max-w-full flex-wrap items-center gap-3 border border-[var(--profile-border)] px-4 py-2 font-profile-mono text-xs uppercase tracking-[0.16em] text-[var(--profile-muted)]"
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
          </section>

          <section id="capabilities" className="panel">
            <p className="label rise">02 — Stack</p>
            <h2 className="statement wide rise">
              The toolkit behind the work.
            </h2>
            <div className="mt-12 grid gap-12 lg:grid-cols-[0.42fr_0.58fr] lg:gap-10">
              <ul className="index mt-0">
                {focusAreas.map((area, index) => (
                  <li
                    key={area.title}
                    className="rise"
                    style={revealStyle(index * 70)}
                  >
                    <i className="n">{String(index + 1).padStart(3, "0")}</i>
                    <b>{area.title}</b>
                    <span>{area.description}</span>
                  </li>
                ))}
              </ul>
              <div className="grid gap-5 sm:grid-cols-2">
                {techStack.map((group, index) => (
                  <article
                    key={group.title}
                    className={cn(
                      "tech-card rise flex h-full flex-col",
                      (group.title === "Frontend" ||
                        group.title.startsWith("Cybersecurity")) &&
                        "sm:col-span-2",
                    )}
                    style={revealStyle(index * 60)}
                  >
                    <p className="font-profile-mono text-[10px] uppercase tracking-[0.2em] text-[#8A8A8A]">
                      {group.title}
                    </p>
                    <p className="mt-2 text-sm text-[#bdbdbd]">
                      {group.description}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item.name}
                          className="inline-flex items-center gap-2 border border-[#2A2A2A] px-3 py-1.5 font-profile-mono text-[10px] uppercase tracking-[0.16em] text-[var(--bone)]"
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

          <section id="security" className="panel">
            <p className="label rise">03 — Security</p>
            <h2 className="statement wide rise">
              Security measures baked into delivery.
            </h2>
            <p className="lede rise">
              Practical steps that reduce risk, protect users, and keep
              delivery accountable from discovery through launch.
            </p>
            <ul className="index">
              {securityMeasures.map((measure, index) => (
                <li
                  key={measure.title}
                  className="rise"
                  style={revealStyle(index * 70)}
                >
                  <i className="n">{String(index + 1).padStart(3, "0")}</i>
                  <b>{measure.title}</b>
                  <span>
                    {measure.description} — {measure.items.join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section id="proof" className="panel">
            <p className="label rise">04 — Work</p>
            <h2 className="statement wide rise">
              Selected delivery highlights.
            </h2>
            <div className="mt-12 grid gap-10 lg:grid-cols-[0.66fr_0.34fr]">
              <div className="grid gap-5 sm:grid-cols-2">
                {experiences.map((experience, index) => (
                  <article
                    key={experience.company}
                    className="project-card rise flex flex-col"
                    style={revealStyle(index * 70)}
                  >
                    <div className="flex items-center justify-between font-profile-mono text-[10px] uppercase tracking-[0.18em] text-[#8A8A8A]">
                      <span>0{index + 1}</span>
                      <span>{experience.period}</span>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-[var(--bone)]">
                      {experience.company}
                    </h3>
                    <p className="mt-2 font-profile-mono text-[10px] uppercase tracking-[0.16em] text-[#8A8A8A]">
                      {experience.role}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-[#bdbdbd]">
                      {experience.summary}
                    </p>
                    <ul className="mt-5 space-y-2 text-xs text-[#9a9a9a]">
                      {experience.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <span className="mt-1.5 size-1 shrink-0 bg-[#565656]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div
                  className="rise border border-[var(--profile-border)] p-6"
                  style={revealStyle(120)}
                >
                  <p className="font-profile-mono text-[11px] uppercase tracking-[0.22em] text-[var(--profile-muted)]">
                    // availability
                  </p>
                  <p className="mt-3 text-xl font-semibold text-[var(--profile-ink)]">
                    Open for new collaborations
                  </p>
                  <p className="mt-3 text-sm text-[var(--profile-muted)]">
                    I work with teams that value clarity, ethics, and
                    measurable outcomes. Reach out to align on scope and
                    timing.
                  </p>
                  <a
                    href="#contact"
                    onClick={(event) => handleAnchorClick(event, "#contact")}
                    className="link-underline mt-6 inline-block font-profile-mono text-xs uppercase tracking-[0.14em]"
                  >
                    Start a project
                  </a>
                </div>
              </aside>
            </div>
          </section>

          <section id="faq" className="panel">
            <p className="label rise">05 — FAQ</p>
            <h2 className="statement rise">Questions, answered.</h2>
            <div className="mt-10 border-t border-[var(--profile-border)]">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                const triggerId = `faq-trigger-${index}`;
                const panelId = `faq-panel-${index}`;
                return (
                  <div
                    key={faq.question}
                    className="profile-faq-row rise border-b border-[var(--profile-border)]"
                    style={revealStyle(index * 40)}
                  >
                    <h3>
                      <button
                        id={triggerId}
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="profile-faq-trigger grid w-full grid-cols-[2.75rem_1fr_auto] items-baseline gap-4 py-6 text-left sm:grid-cols-[3.5rem_1fr_auto]"
                      >
                        <i className="font-profile-mono text-[10px] tracking-[0.14em] text-[rgba(23,21,15,.3)]">
                          {String(index + 1).padStart(3, "0")}
                        </i>
                        <b className="text-[1.05rem] font-medium tracking-[-0.015em] text-[var(--profile-ink)]">
                          {faq.question}
                        </b>
                        <ChevronDown
                          className={cn(
                            "size-4 text-[var(--profile-muted)] transition",
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
                      className="pb-6 pl-11 pr-8 sm:pl-14"
                    >
                      <p className="font-profile-mono text-[13px] leading-relaxed text-[rgba(23,21,15,.45)]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="contact" className="panel">
            <p className="label rise">06 — Contact</p>
            <h2 className="statement wide rise">{contact.title}</h2>
            <p className="lede rise">{contact.description}</p>
            <div
              className="rise mt-8 flex flex-wrap gap-6"
              style={revealStyle(120)}
            >
              {contact.ctas.map((cta) => {
                const shouldOpenNewTab = isExternalHref(cta.href);
                return (
                  <a
                    key={cta.label}
                    href={cta.href}
                    target={shouldOpenNewTab ? "_blank" : undefined}
                    rel={shouldOpenNewTab ? "noreferrer noopener" : undefined}
                    className="link-underline font-profile-mono text-xs uppercase tracking-[0.14em]"
                  >
                    {cta.label}
                  </a>
                );
              })}
            </div>
            <div
              className="rise mt-16 grid gap-8 border-t border-[var(--profile-border)] pt-8 sm:grid-cols-2 lg:grid-cols-5"
              style={revealStyle(160)}
            >
              {contact.details.map((detail) => {
                const detailIsExternal = detail.href
                  ? isExternalHref(detail.href)
                  : false;

                return (
                  <div
                    key={detail.label}
                    className="profile-contact-cell min-w-0 py-1 sm:px-6 sm:first:pl-0"
                  >
                    <p className="font-profile-mono text-[10px] uppercase tracking-[0.2em] text-[rgba(23,21,15,.4)]">
                      {detail.label}
                    </p>
                    {detail.href ? (
                      <a
                        href={detail.href}
                        className="link-underline mt-2 inline-block break-words text-sm font-medium text-[var(--profile-ink)]"
                        target={detailIsExternal ? "_blank" : undefined}
                        rel={
                          detailIsExternal ? "noreferrer noopener" : undefined
                        }
                      >
                        {detail.value}
                      </a>
                    ) : (
                      <p className="mt-2 text-sm font-medium text-[var(--profile-ink)]">
                        {detail.value}
                      </p>
                    )}
                  </div>
                );
              })}
              {socialLinks.map((link) => (
                <div
                  key={link.label}
                  className="profile-contact-cell py-1 sm:px-6"
                >
                  <p className="font-profile-mono text-[10px] uppercase tracking-[0.2em] text-[rgba(23,21,15,.4)]">
                    Social
                  </p>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-underline mt-2 inline-flex items-center gap-2 text-sm font-medium text-[var(--profile-ink)]"
                  >
                    {getSocialIcon(link.label)}
                    {link.label}
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              ))}
              <div className="profile-contact-cell py-1 sm:px-6">
                <p className="font-profile-mono text-[10px] uppercase tracking-[0.2em] text-[rgba(23,21,15,.4)]">
                  Credentials
                </p>
                <a
                  href={pageLinks[0].href}
                  className="link-underline mt-2 inline-block text-sm font-medium text-[var(--profile-ink)]"
                >
                  Certification index
                </a>
              </div>
            </div>
          </section>

          <footer className="foot">
            <span>{profileCard.location}</span>
            <span>
              {emailDetail?.href ? (
                <a href={emailDetail.href}>email</a>
              ) : null}
              {socialLinks.map((link) => (
                <Fragment key={link.label}>
                  {" "}
                  ·{" "}
                  <a href={link.href} target="_blank" rel="noreferrer noopener">
                    {link.label.toLowerCase()}
                  </a>
                </Fragment>
              ))}
              {" "}
              ·{" "}
              <a href={pageLinks[0].href}>credentials</a>
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}
