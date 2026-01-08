import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  ChevronDown,
  ExternalLink,
  Linkedin,
  Mail,
  MapPin,
  Moon,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Twitter,
} from "lucide-react";
import { profileData, type ContactCTA, type SocialLink } from "@/data/profile";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

type ProfileViewProps = {
  darkMode: boolean;
  onToggleDarkMode: () => void;
};

const {
  navLinks,
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

const getSocialIcon = (icon: SocialLink["icon"]) => {
  if (icon === "linkedin") return <Linkedin className="size-4" />;
  if (icon === "twitter") return <Twitter className="size-4" />;
  return <Mail className="size-4" />;
};

const getCtaIcon = (icon: ContactCTA["icon"]) => {
  if (icon === "calendar") return <CalendarClock className="size-4" />;
  if (icon === "external") return <ArrowUpRight className="size-4" />;
  return <Mail className="size-4" />;
};

const isExternalHref = (href: string) => /^https?:/i.test(href);

const sectionEyebrow =
  "font-profile-mono text-[11px] uppercase tracking-[0.4em] text-[var(--profile-muted)]";
const sectionTitle =
  "font-profile-display text-3xl leading-[1.15] text-[var(--profile-ink)] sm:text-4xl lg:text-5xl";
const sectionCopy = "text-base text-[var(--profile-muted)] sm:text-lg";
const panelSurface =
  "profile-card rounded-[28px] border border-[var(--profile-border)] bg-[var(--profile-surface)] backdrop-blur-xl shadow-[0_25px_60px_rgba(10,10,10,0.12)]";
const panelSurfaceStrong =
  "profile-card rounded-[30px] border border-[var(--profile-border)] bg-[var(--profile-surface-strong)] shadow-[0_30px_70px_rgba(10,10,10,0.16)]";
const chipSurface =
  "inline-flex items-center gap-2 rounded-full border border-[var(--profile-border)] bg-[var(--profile-surface)] px-3 py-1.5 text-xs font-profile-mono uppercase tracking-[0.2em] text-[var(--profile-muted)]";

const revealStyle = (delay: number): CSSProperties =>
  ({
    "--reveal-delay": `${delay}ms`,
  }) as CSSProperties;

const wordStyle = (index: number): CSSProperties =>
  ({
    "--word-index": index,
  }) as CSSProperties;

const splitWords = (text: string, offset: number) =>
  text.split(" ").map((word, index) => (
    <span
      key={`${offset}-${index}-${word}`}
      className="profile-word"
      style={wordStyle(offset + index)}
    >
      {word}
    </span>
  ));

const orbStyle = (
  background: string,
  duration: string,
  delay: string,
): CSSProperties =>
  ({
    background,
    "--orb-duration": duration,
    "--orb-delay": delay,
  }) as CSSProperties;

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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const totalStackItems = techStack.reduce(
    (sum: number, group) => sum + group.items.length,
    0,
  );
  const metrics = [
    { label: "Tools in rotation", value: totalStackItems.toString() },
    { label: "Experience highlights", value: experiences.length.toString() },
    { label: "Focus areas", value: focusAreas.length.toString() },
  ];
  const marqueeItems = [...collaborations, ...collaborations];
  const heroLines = [
    { text: "Services for teams", className: "" },
    { text: "who ship with care", className: "text-[var(--profile-accent)]" },
  ];

  return (
    <div className="profile-theme min-h-screen bg-[var(--profile-bg)] text-[var(--profile-ink)]">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 profile-grid opacity-70 dark:opacity-50"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-36 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl profile-orb"
          style={orbStyle(
            "radial-gradient(circle, var(--profile-highlight) 0%, transparent 70%)",
            "22s",
            "-6s",
          )}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[-120px] top-[120px] h-[320px] w-[320px] rounded-full blur-3xl profile-orb"
          style={orbStyle(
            "radial-gradient(circle, var(--profile-accent-soft) 0%, transparent 70%)",
            "18s",
            "-2s",
          )}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-[-160px] left-[-120px] h-[360px] w-[360px] rounded-full blur-3xl profile-orb"
          style={orbStyle(
            "radial-gradient(circle, var(--profile-accent-soft) 0%, transparent 70%)",
            "26s",
            "-10s",
          )}
          aria-hidden="true"
        />

        <header className="sticky top-0 z-50 border-b border-[var(--profile-border)] bg-[var(--profile-header)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full border border-[var(--profile-border)] bg-[var(--profile-surface)] text-[var(--profile-accent)] shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                <Sparkles className="size-4" />
              </div>
              <div className="leading-tight">
                <p className="font-profile-mono text-xs uppercase tracking-[0.4em] text-[var(--profile-muted)]">
                  Services
                </p>
                <p className="max-w-[220px] truncate text-sm font-semibold">
                  {profileCard.name}
                </p>
              </div>
            </div>
            <nav
              className="hidden items-center gap-6 md:flex"
              aria-label="Primary"
            >
              {navLinks.map((link) => {
                const isActive =
                  activeSection === link.href.replace("#", "");
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "profile-navlink font-profile-mono text-[11px] uppercase tracking-[0.3em] transition-colors",
                      isActive
                        ? "is-active text-[var(--profile-ink)]"
                        : "text-[var(--profile-muted)] hover:text-[var(--profile-ink)]",
                    )}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label="Toggle theme"
              className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--profile-border)] bg-[var(--profile-surface)] text-[var(--profile-ink)] shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-colors"
            >
              {darkMode ? (
                <SunMedium className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>
          </div>
        </header>

        <main className="relative mx-auto max-w-6xl px-6 pb-28 pt-24 sm:pt-28">
          <section id="overview" className="scroll-mt-28 space-y-12">
            <div className="grid items-end gap-12 lg:grid-cols-[0.6fr_0.4fr]">
              <div className="space-y-8">
                <div
                  className="profile-reveal profile-reveal--blur flex flex-wrap items-center gap-3"
                  style={revealStyle(0)}
                >
                  <span className={chipSurface}>What I do</span>
                  <span className="font-profile-mono text-xs uppercase tracking-[0.32em] text-[var(--profile-muted)]">
                    Available for 2025
                  </span>
                </div>
                <div className="space-y-5">
                  <h1
                    className="profile-heading profile-reveal profile-reveal--blur profile-reveal--scale font-profile-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl"
                    style={revealStyle(120)}
                  >
                    {heroLines.map((line, lineIndex) => (
                      <span
                        key={line.text}
                        className={cn("block", line.className)}
                      >
                        {splitWords(line.text, lineIndex * 8)}
                      </span>
                    ))}
                  </h1>
                  <p
                    className={cn(
                      sectionCopy,
                      "profile-reveal profile-reveal--blur max-w-xl text-lg",
                    )}
                    style={revealStyle(220)}
                  >
                    I help teams move from idea to launch with UI/UX design,
                    front-end builds, and security-aware delivery. Full sprints
                    or focused collaborations.
                  </p>
                </div>
                <div
                  className="profile-reveal profile-reveal--scale flex flex-wrap gap-4"
                  style={revealStyle(320)}
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
                            ? "bg-[var(--profile-accent)] text-black hover:bg-[var(--profile-accent-strong)]"
                            : "border-[var(--profile-accent)] bg-[var(--profile-surface)] text-[var(--profile-ink)] hover:bg-[var(--profile-accent-soft)]",
                        )}
                      >
                        <a
                          href={cta.href}
                          target={shouldOpenNewTab ? "_blank" : undefined}
                          rel={shouldOpenNewTab ? "noreferrer noopener" : undefined}
                          className="inline-flex items-center gap-2"
                        >
                          {getCtaIcon(cta.icon)}
                          {cta.label}
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
                    <a href="#proof" className="inline-flex items-center gap-2">
                      View proof
                      <ArrowUpRight className="size-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <div
                className="profile-reveal profile-reveal--right"
                style={revealStyle(200)}
              >
                <div className="relative mx-auto max-w-sm">
                  <div className="absolute -left-6 top-8 h-full w-full rounded-[32px] border border-[var(--profile-border)] bg-[var(--profile-surface)] opacity-70 -rotate-6" />
                  <div className="absolute -right-6 top-14 h-full w-full rounded-[32px] border border-[var(--profile-border)] bg-[var(--profile-surface-strong)] opacity-80 rotate-3" />
                  <div
                    className={cn(
                      panelSurfaceStrong,
                      "profile-float relative z-10 overflow-hidden p-3",
                    )}
                  >
                    <div className="relative overflow-hidden rounded-[26px]">
                      <ImageWithFallback
                        src={profileCard.avatar}
                        alt={`${profileCard.name} portrait`}
                        loading="eager"
                        className="profile-image h-full w-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-sm font-semibold">
                            {profileCard.name}
                          </span>
                          {profileCard.verified ? (
                            <BadgeCheck
                              className="size-4 text-[var(--profile-accent)]"
                              aria-hidden="true"
                            />
                          ) : null}
                        </div>
                        <p className="font-profile-mono text-[11px] uppercase tracking-[0.3em] text-white/70">
                          {profileCard.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={cn(
                    panelSurface,
                    "profile-reveal profile-reveal--scale space-y-2 p-6",
                    index % 2 === 0
                      ? "profile-reveal--left"
                      : "profile-reveal--right",
                  )}
                  style={revealStyle(240 + index * 120)}
                >
                  <p className={sectionEyebrow}>{metric.label}</p>
                  <p className="text-2xl font-semibold text-[var(--profile-ink)]">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section id="services" className="mt-28 scroll-mt-28 space-y-12">
            <div
              className="profile-reveal profile-reveal--blur space-y-4"
              style={revealStyle(0)}
            >
              <p className={sectionEyebrow}>Services</p>
              <h2 className={sectionTitle}>From discovery to launch</h2>
              <p className={sectionCopy}>
                Structured engagements that keep scope clear, quality high, and
                collaboration smooth.
              </p>
            </div>
            <div className="space-y-10">
              {services.map((service, index) => (
                <article
                  key={service.title}
                  className={cn(
                    panelSurface,
                    "profile-reveal profile-reveal--blur profile-reveal--scale grid gap-8 p-6 lg:grid-cols-[0.28fr_0.42fr_0.3fr] lg:items-center",
                    index % 2 === 0
                      ? "profile-reveal--left"
                      : "profile-reveal--right",
                  )}
                  style={revealStyle(120 + index * 120)}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[24px] border border-[var(--profile-border)] bg-[var(--profile-surface-strong)]">
                      <Sparkles className="size-5 text-[var(--profile-accent)]" />
                    </div>
                    <div className="font-profile-mono text-xs uppercase tracking-[0.3em] text-[var(--profile-muted)]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-[var(--profile-ink)]">
                      {service.title}
                    </h3>
                    <p className="text-sm text-[var(--profile-muted)]">
                      {service.summary}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="font-profile-mono text-xs uppercase tracking-[0.3em] text-[var(--profile-muted)]">
                      Includes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {service.includes.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-[var(--profile-border)] bg-[var(--profile-surface-strong)] px-3 py-1 text-[11px] font-profile-mono uppercase tracking-[0.24em] text-[var(--profile-ink)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-20">
            <div
              className={cn(
                panelSurface,
                "profile-reveal profile-reveal--scale overflow-hidden px-6 py-8",
              )}
              style={revealStyle(0)}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className={sectionEyebrow}>Collaborations</p>
                <p className="text-sm text-[var(--profile-muted)]">
                  Teams and communities I have supported.
                </p>
              </div>
              <div className="mt-6 overflow-hidden">
                <div className="profile-marquee flex w-max gap-4">
                  {marqueeItems.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center gap-3 rounded-full border border-[var(--profile-border)] bg-[var(--profile-surface-strong)] px-4 py-2 text-xs font-profile-mono uppercase tracking-[0.2em] text-[var(--profile-muted)]"
                      aria-hidden={index >= collaborations.length}
                    >
                      <span className="text-[var(--profile-ink)]">
                        {item.name}
                      </span>
                      <span className="opacity-70">{item.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="capabilities" className="mt-28 scroll-mt-28 space-y-12">
            <div className="grid gap-10 lg:grid-cols-[0.4fr_0.6fr]">
              <div
                className="profile-reveal profile-reveal--blur profile-reveal--left space-y-6"
                style={revealStyle(0)}
              >
                <p className={sectionEyebrow}>Capabilities</p>
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
                      style={revealStyle(120 + index * 120)}
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
                      "profile-reveal profile-reveal--scale flex h-full flex-col p-6",
                      index % 2 === 0
                        ? "profile-reveal--right"
                        : "profile-reveal--left",
                    )}
                    style={revealStyle(180 + index * 120)}
                  >
                    <div>
                      <p className={sectionEyebrow}>{group.title}</p>
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
                          <span className="flex size-7 items-center justify-center rounded-full bg-[var(--profile-bg)]">
                            <img
                              src={item.logo}
                              alt={`${item.name} logo`}
                              loading="lazy"
                              className="profile-logo h-4 w-4"
                            />
                          </span>
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="security" className="mt-28 scroll-mt-28 space-y-12">
            <div className="grid gap-10 lg:grid-cols-[0.4fr_0.6fr]">
              <div
                className="profile-reveal profile-reveal--blur profile-reveal--left space-y-4"
                style={revealStyle(0)}
              >
                <p className={sectionEyebrow}>Security</p>
                <h2 className={sectionTitle}>Security measures baked in</h2>
                <p className={sectionCopy}>
                  Practical steps that reduce risk, protect users, and keep
                  delivery accountable from discovery through launch.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {securityMeasures.map((measure, index) => (
                  <article
                    key={measure.title}
                    className={cn(
                      panelSurface,
                      "profile-reveal profile-reveal--scale space-y-4 p-6",
                      index % 2 === 0
                        ? "profile-reveal--right"
                        : "profile-reveal--left",
                    )}
                    style={revealStyle(120 + index * 120)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-[var(--profile-ink)]">
                          {measure.title}
                        </p>
                        <p className="mt-2 text-sm text-[var(--profile-muted)]">
                          {measure.description}
                        </p>
                      </div>
                      <div className="flex size-10 items-center justify-center rounded-full border border-[var(--profile-border)] bg-[var(--profile-surface-strong)] text-[var(--profile-accent)]">
                        <ShieldCheck className="size-4" />
                      </div>
                    </div>
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

          <section id="proof" className="mt-28 scroll-mt-28 space-y-12">
            <div
              className="profile-reveal profile-reveal--blur space-y-4"
              style={revealStyle(0)}
            >
              <p className={sectionEyebrow}>Proof</p>
              <h2 className={sectionTitle}>Recent delivery highlights</h2>
            </div>
            <div className="grid gap-8 lg:grid-cols-[0.6fr_0.4fr]">
              <div className="space-y-8">
                {experiences.map((experience, index) => (
                  <article
                    key={experience.company}
                    className={cn(
                      panelSurface,
                      "profile-reveal profile-reveal--scale relative overflow-hidden p-7 sm:p-8",
                      index % 2 === 0
                        ? "profile-reveal--left"
                        : "profile-reveal--right",
                    )}
                    style={revealStyle(120 + index * 120)}
                  >
                    <div className="flex flex-wrap items-center gap-3 font-profile-mono text-[11px] uppercase tracking-[0.3em] text-[var(--profile-muted)]">
                      <span>{experience.period}</span>
                      <span className="inline-block h-px w-10 bg-[var(--profile-border)]" />
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
                          <span className="mt-2 size-2 rounded-full bg-[var(--profile-accent)]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <div className="space-y-6">
                <div
                  className={cn(
                    panelSurfaceStrong,
                    "profile-reveal profile-reveal--scale space-y-4 p-6",
                    "profile-reveal--right",
                  )}
                  style={revealStyle(180)}
                >
                  <p className={sectionEyebrow}>Availability</p>
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
                    className="profile-button rounded-full bg-[var(--profile-accent)] text-black hover:bg-[var(--profile-accent-strong)]"
                  >
                    <a href="#contact" className="inline-flex items-center gap-2">
                      Start a project
                      <ArrowUpRight className="size-4" />
                    </a>
                  </Button>
                </div>
                <div
                  className={cn(
                    panelSurface,
                    "profile-reveal profile-reveal--scale flex flex-col gap-4 p-6",
                    "profile-reveal--right",
                  )}
                  style={revealStyle(300)}
                >
                  <p className={sectionEyebrow}>Case studies</p>
                  {projects.length ? (
                    <div className="space-y-4">
                      {projects.map((project) => (
                        <div key={project.title} className="space-y-2">
                          <p className="text-lg font-semibold text-[var(--profile-ink)]">
                            {project.title}
                          </p>
                          <p className="text-sm text-[var(--profile-muted)]">
                            {project.description}
                          </p>
                          <Button
                            variant="ghost"
                            className="profile-button justify-start gap-2 text-[var(--profile-ink)] hover:bg-[var(--profile-surface-strong)]"
                            asChild
                          >
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              View case study
                              <ExternalLink className="size-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-lg font-semibold text-[var(--profile-ink)]">
                        Case studies in progress
                      </p>
                      <p className="text-sm text-[var(--profile-muted)]">
                        I am gathering fresh artifacts and retrospective notes.
                        Check back soon for full breakdowns.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section id="faq" className="mt-28 scroll-mt-28 space-y-10">
            <div
              className="profile-reveal profile-reveal--blur space-y-4"
              style={revealStyle(0)}
            >
              <p className={sectionEyebrow}>FAQ</p>
              <h2 className={sectionTitle}>Questions, answered</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={faq.question}
                    className={cn(
                      panelSurface,
                      "profile-reveal profile-reveal--scale overflow-hidden",
                      index % 2 === 0
                        ? "profile-reveal--left"
                        : "profile-reveal--right",
                    )}
                    style={revealStyle(120 + index * 90)}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(isOpen ? null : index)
                      }
                      className="profile-button flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="text-base font-semibold text-[var(--profile-ink)]">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-5 text-[var(--profile-muted)] transition",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-300",
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="overflow-hidden px-6 pb-5">
                        <p className="text-sm text-[var(--profile-muted)]">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section
            id="contact"
            className="mt-28 scroll-mt-28 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div
              className={cn(
                panelSurface,
                "profile-reveal profile-reveal--scale profile-reveal--left p-10",
              )}
              style={revealStyle(120)}
            >
              <p className={sectionEyebrow}>{contact.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-semibold text-[var(--profile-ink)]">
                {contact.title}
              </h2>
              <p className="mt-3 text-base text-[var(--profile-muted)]">
                {contact.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                {contact.ctas.map((cta) => {
                  const isPrimary = cta.variant === "primary";
                  const shouldOpenNewTab = isExternalHref(cta.href);

                  return (
                    <Button
                      key={cta.label}
                      className={cn(
                        "profile-button rounded-full px-6 text-sm font-semibold",
                        isPrimary
                          ? "bg-[var(--profile-accent)] text-black hover:bg-[var(--profile-accent-strong)]"
                          : "border-[var(--profile-accent)] bg-[var(--profile-surface)] text-[var(--profile-ink)] hover:bg-[var(--profile-accent-soft)]",
                      )}
                      size="lg"
                      variant={isPrimary ? "default" : "outline"}
                      asChild
                    >
                      <a
                        href={cta.href}
                        target={shouldOpenNewTab ? "_blank" : undefined}
                        rel={shouldOpenNewTab ? "noreferrer noopener" : undefined}
                        className="inline-flex items-center gap-2"
                      >
                        {cta.label}
                        {getCtaIcon(cta.icon)}
                      </a>
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-6">
              <div
                className={cn(
                  panelSurface,
                  "profile-reveal profile-reveal--scale profile-reveal--right p-8",
                )}
                style={revealStyle(180)}
              >
                <p className={sectionEyebrow}>Contact details</p>
                <div className="mt-6 space-y-4">
                  {contact.details.map((detail) => {
                    const detailIsExternal = detail.href
                      ? isExternalHref(detail.href)
                      : false;

                    return (
                      <div
                        key={detail.label}
                        className="profile-button space-y-1"
                      >
                        <p className="font-profile-mono text-[11px] uppercase tracking-[0.3em] text-[var(--profile-muted)]">
                          {detail.label}
                        </p>
                        {detail.href ? (
                          <a
                            href={detail.href}
                            className="text-base font-semibold text-[var(--profile-ink)] transition hover:underline"
                            target={detailIsExternal ? "_blank" : undefined}
                            rel={detailIsExternal ? "noreferrer noopener" : undefined}
                          >
                            {detail.value}
                          </a>
                        ) : (
                          <p className="text-base font-semibold text-[var(--profile-ink)]">
                            {detail.value}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div
                className={cn(
                  panelSurface,
                  "profile-reveal profile-reveal--scale profile-reveal--right p-8",
                )}
                style={revealStyle(260)}
              >
                <p className={sectionEyebrow}>Social</p>
                <div className="mt-6 space-y-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={cn(
                        "profile-button flex items-center justify-between rounded-full border border-[var(--profile-border)] bg-[var(--profile-surface)] px-4 py-3 text-sm text-[var(--profile-muted)] transition",
                        "hover:text-[var(--profile-ink)]",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {getSocialIcon(link.icon)}
                        <span>{link.label}</span>
                      </div>
                      <ExternalLink className="size-4" />
                    </a>
                  ))}
                </div>
              </div>
              <div
                className={cn(
                  panelSurface,
                  "profile-reveal profile-reveal--scale profile-reveal--right p-8",
                )}
                style={revealStyle(340)}
              >
                <p className={sectionEyebrow}>Based</p>
                <div className="flex items-center gap-2 text-sm text-[var(--profile-muted)]">
                  <MapPin className="size-4" aria-hidden="true" />
                  <span>{profileCard.location}</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
