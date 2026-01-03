import { useMemo } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  ExternalLink,
  Linkedin,
  Mail,
  MapPin,
  Moon,
  PlayCircle,
  Sparkles,
  SunMedium,
  Twitter,
} from "lucide-react";
import { profileData, type ContactCTA, type SocialLink } from "@/data/profile";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

type ProfileViewProps = {
  darkMode: boolean;
  onToggleDarkMode: () => void;
};

const {
  navLinks,
  experiences,
  projects,
  focusAreas,
  techStack,
  profileCard,
  contact,
  socialLinks,
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

const cardSurface =
  "rounded-3xl border border-slate-200/70 bg-white/95 shadow-lg shadow-slate-200/40 transition-colors dark:border-white/10 dark:bg-slate-900/60 dark:shadow-[0_25px_60px_rgba(2,6,23,0.6)] dark:backdrop-blur-xl";

const pillSurface =
  "rounded-2xl border border-slate-200/60 bg-white/85 transition-colors dark:border-white/5 dark:bg-slate-900/40 dark:backdrop-blur";

export function ProfileView({
  darkMode,
  onToggleDarkMode,
}: ProfileViewProps) {
  const sectionIds = useMemo(
    () => navLinks.map((link) => link.href.replace("#", "")),
    [],
  );
  const activeSection = useSectionObserver(sectionIds);
  const totalStackItems = techStack.reduce(
    (sum: number, group) => sum + group.items.length,
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#05060a] dark:text-white">
      <div className="relative isolate">
        <div className="absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-white via-slate-100 to-transparent opacity-95 dark:from-[#10141f] dark:via-[#090b12] dark:to-transparent dark:opacity-90" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(120,119,198,0.18),_transparent_55%)]" />

        <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/85 px-6 backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:bg-[#05060a]/70">
          <div className="mx-auto flex max-w-6xl items-center justify-between py-4">
            <div className="flex items-center gap-2 text-sm font-medium tracking-wide">
              <Sparkles className="size-4 text-amber-500" />
              <span>ELIJAH VINLUAN</span>
            </div>
            <nav
              className="hidden items-center gap-6 text-xs uppercase tracking-[0.2em] md:flex"
              aria-label="Primary"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={
                    activeSection === link.href.replace("#", "") ? "page" : undefined
                  }
                  className={cn(
                    "relative transition-colors hover:text-slate-900 dark:hover:text-white",
                    "text-slate-500 dark:text-white/70",
                    activeSection === link.href.replace("#", "") &&
                      "text-slate-900 dark:text-white after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-slate-900 dark:after:bg-white",
                  )}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onToggleDarkMode}
                aria-label="Toggle theme"
                className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                {darkMode ? <SunMedium className="size-4" /> : <Moon className="size-4" />}
              </button>
            </div>
          </div>
        </header>

        <main className="relative mx-auto max-w-6xl px-6 pb-32 pt-16">
          <section id="overview" className="space-y-10">
            <article
              className={cn(
                cardSurface,
                "flex flex-col gap-6 border-slate-200/70 p-6 sm:flex-row sm:items-center sm:gap-8",
              )}
            >
              <ImageWithFallback
                src={profileCard.avatar}
                alt={`${profileCard.name} portrait`}
                className="block h-28 w-28 rounded-3xl object-cover shadow-lg shadow-slate-200/70 mx-auto sm:mx-0 dark:shadow-slate-900/50"
              />
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-2xl font-semibold text-slate-900 dark:text-white sm:justify-start">
                    <span>{profileCard.name}</span>
                    {profileCard.verified ? (
                      <BadgeCheck className="size-5 text-emerald-500" aria-hidden="true" />
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500 dark:text-white/70 sm:justify-start">
                    <MapPin className="size-4" aria-hidden="true" />
                    <span>{profileCard.location}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-white/70">
                  {profileCard.roles.join(" / ")}
                </p>
                <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                  {profileCard.actions.map((cta) => {
                    const isPrimary = cta.variant === "primary";
                    const shouldOpenNewTab = isExternalHref(cta.href);
                    return (
                      <Button
                        key={cta.label}
                        asChild
                        size="sm"
                        variant={isPrimary ? "default" : "outline"}
                        className={cn(
                          isPrimary
                            ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-white/90"
                            : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/15",
                        )}
                      >
                        <a
                          href={cta.href}
                          target={shouldOpenNewTab ? "_blank" : undefined}
                          rel={shouldOpenNewTab ? "noreferrer" : undefined}
                          className="inline-flex items-center gap-2"
                        >
                          {getCtaIcon(cta.icon)}
                          {cta.label}
                        </a>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </article>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-white/50">
                About Me
              </p>
              <p className="text-lg text-slate-600 dark:text-white/70">
                I&apos;m a junior pursuing a Bachelor of Science in Information Technology with a solid
                foundation in networking and UI/UX. I bring a diverse skill set and a strong track record
                of excellence to every role, and my reputation for reliability, professionalism, and
                high-quality work speaks for itself. I also serve in the College Information Technology
                Student Council, and I&apos;m learning cybersecurity tools like Nmap, Masscan, and Maltego to
                round out my toolkit.
              </p>
            </div>
          </section>

          <section id="stack" className="mt-24 space-y-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-white/50">
                  Tech Stack
                </p>
                <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
                  Tools that keep me shipping
                </h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-white/70">
                  A blend of front-end craft, dependable services, and automation that keeps
                  high-trust civic products resilient.
                </p>
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500 dark:text-white/50">
                {totalStackItems} tools in rotation
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {techStack.map((group) => (
                <article key={group.title} className={cn(cardSurface, "flex h-full flex-col p-6")}>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/50">
                      {group.title}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-white/70">{group.description}</p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {group.items.map((item) => (
                      <span
                        key={item.name}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-800 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                      >
                        <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10">
                          <img
                            src={item.logo}
                            alt={`${item.name} logo`}
                            loading="lazy"
                            className="h-4 w-4"
                          />
                        </span>
                        {item.name}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="experience" className="mt-24 space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-white/50">
                  Experience
                </p>
                <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
                  Projects
                </h2>
              </div>
              <Button
                variant="outline"
                className="border-slate-200 bg-white/80 text-slate-900 hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/15"
              >
                Full CV
                <ArrowUpRight className="size-4" />
              </Button>
            </div>
            <div className="space-y-8">
              {experiences.map((experience) => (
                <article
                  key={experience.company}
                  className={cn(
                    cardSurface,
                    "group relative overflow-hidden p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(15,23,42,0.12)] dark:border-white/5 dark:bg-gradient-to-br dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-900/40 dark:shadow-[0_35px_80px_rgba(2,6,23,0.55)] dark:hover:shadow-[0_45px_110px_rgba(2,6,23,0.7)]",
                  )}
                >
                  <span
                    className="pointer-events-none absolute inset-0 z-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-gradient-to-br from-white/0 via-white/40 to-white/0 dark:from-white/[0.08] dark:via-white/[0.03] dark:to-transparent"
                    aria-hidden="true"
                  />
                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-white/50">
                      <span>{experience.period}</span>
                      <span className="inline-block h-px w-10 bg-slate-300 dark:bg-white/30" />
                      <span>{experience.role}</span>
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                      {experience.company}
                    </h3>
                    <p className="mt-3 text-base text-slate-600 dark:text-white/75">{experience.summary}</p>
                    <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-white/80">
                      {experience.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3">
                          <Sparkles className="mt-1 size-4 text-amber-500" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="projects" className="mt-24 space-y-10">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-white/50">
                NONE
              </p>
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
               NONE
              </h2>
            </div>
            {projects.length ? (
              <div className="grid gap-6 md:grid-cols-2">
                {projects.map((project) => (
                  <article key={project.title} className={cn(cardSurface, "flex h-full flex-col p-6")}>
                    <div className="flex flex-1 flex-col gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/50">
                          {project.metric}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                          {project.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-white/70">{project.description}</p>
                      <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-200 px-3 py-1 dark:border-white/15"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        className="mt-4 justify-start gap-2 text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
                        asChild
                      >
                        <a href={project.link} target="_blank" rel="noreferrer">
                          View case study
                          <ExternalLink className="size-4" />
                        </a>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={cn(cardSurface, "flex flex-col items-center gap-4 p-10 text-center")}>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-white/50">Case studies</p>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Coming soon</h3>
                <p className="max-w-xl text-sm text-slate-600 dark:text-white/70">
                  I&apos;m gathering fresh artifacts, prototype reels, and love-letter retros. Check back after the big
                  surprise drops to see the full breakdowns.
                </p>
                <Button variant="outline" className="border-dashed border-slate-300 dark:border-white/20" disabled>
                  Placeholder slot
                </Button>
              </div>
            )}
          </section>

          <section className="mt-24 rounded-[32px] border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-white p-10 transition-colors dark:border-white/10 dark:from-[#141827] dark:via-[#0b0e18] dark:to-[#06060c]">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-white/50">
                  Focus areas
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                  Where I'm placing bets
                </h2>
                <p className="mt-4 text-base text-slate-600 dark:text-white/70">
                  Partnering with leaders who obsess over public-good technology, immersive
                  education.
                </p>
              </div>
              <div className="space-y-4">
                {focusAreas.map((area) => (
                  <div key={area.title} className={cn(pillSurface, "p-5")}>
                    <p className="text-lg font-medium text-slate-900 dark:text-white">{area.title}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-white/70">{area.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="contact" className="mt-24 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className={cn(cardSurface, "p-10")}>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-white/50">
                {contact.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">
                {contact.title}
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-white/70">
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
                        isPrimary
                          ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-white/90"
                          : "border-slate-200 bg-white/80 text-slate-900 hover:bg-slate-100 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10",
                      )}
                      size="lg"
                      variant={isPrimary ? "default" : "outline"}
                      asChild
                    >
                      <a
                        href={cta.href}
                        target={shouldOpenNewTab ? "_blank" : undefined}
                        rel={shouldOpenNewTab ? "noreferrer" : undefined}
                      >
                        {cta.label}
                        {getCtaIcon(cta.icon)}
                      </a>
                    </Button>
                  );
                })}
              </div>
              <div className="mt-10 grid gap-6 text-sm text-slate-600 dark:text-white/70 sm:grid-cols-3">
                {contact.details.map((detail) => {
                  const detailIsExternal = detail.href ? isExternalHref(detail.href) : false;

                  return (
                    <div key={detail.label} className="space-y-2">
                      <p className="uppercase tracking-[0.3em] text-slate-400 dark:text-white/40">{detail.label}</p>
                      {detail.href ? (
                        <a
                          href={detail.href}
                          className="break-words text-slate-900 transition hover:underline dark:text-white"
                          target={detailIsExternal ? "_blank" : undefined}
                          rel={detailIsExternal ? "noreferrer" : undefined}
                        >
                          {detail.value}
                        </a>
                      ) : (
                        <span className="break-words text-slate-900 dark:text-white">{detail.value}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-6">
              <div className={cn(cardSurface, "p-8")}>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/50">
                  Social
                </p>
                <div className="mt-6 space-y-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        pillSurface,
                        "flex items-center justify-between px-4 py-3 text-sm text-slate-600 transition hover:-translate-y-0.5 hover:bg-white dark:text-white/80 dark:hover:bg-white/10",
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
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
