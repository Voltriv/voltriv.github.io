import { useMemo } from "react";
import {
  ArrowUpRight,
  ExternalLink,
  Linkedin,
  Mail,
  Moon,
  PlayCircle,
  Sparkles,
  SunMedium,
  Twitter,
} from "lucide-react";
import { profileData, type SocialLink } from "../data/profile";
import { useSectionObserver } from "../hooks/useSectionObserver";
import { Button } from "../components/ui/button";
import { cn } from "../components/ui/utils";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type ProfileViewProps = {
  onViewBirthday: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
};

const {
  navLinks,
  expertise,
  experiences,
  projects,
  focusAreas,
  socialLinks,
  profilePhoto,
  profilePhotoAlt,
  profilePhotoCaption,
} = profileData;

const getSocialIcon = (icon: SocialLink["icon"]) => {
  if (icon === "linkedin") return <Linkedin className="size-4" />;
  if (icon === "twitter") return <Twitter className="size-4" />;
  return <Mail className="size-4" />;
};

const cardSurface =
  "rounded-3xl border border-slate-200/70 bg-white/95 shadow-lg shadow-slate-200/40 transition-colors dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none";

const pillSurface =
  "rounded-2xl border border-slate-200/60 bg-white/85 transition-colors dark:border-white/10 dark:bg-white/[0.04]";

export function ProfileView({
  onViewBirthday,
  darkMode,
  onToggleDarkMode,
}: ProfileViewProps) {
  const sectionIds = useMemo(
    () => navLinks.map((link) => link.href.replace("#", "")),
    [],
  );
  const activeSection = useSectionObserver(sectionIds);

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
              <Button
                size="sm"
                variant="outline"
                className="border-slate-900/10 bg-white text-slate-900 hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/20"
                onClick={onViewBirthday}
              >
                Annielyn Birthday Present
                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="relative mx-auto max-w-6xl px-6 pb-32 pt-16">
          <section id="overview" className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-10">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-white/50">
                  Product & Design
                </p>
                <h1 className="text-4xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-5xl">
                  Building high-trust experiences for civic tech, education, and the people who lead
                  them.
                </h1>
                <p className="text-lg text-slate-600 dark:text-white/70">
                  Multidisciplinary designer blending systems thinking, editorial craft, and
                  community strategy. Currently shipping AI copilots at Orbit Labs and advising youth
                  innovation networks across APAC.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-white/90" size="lg">
                  Book a collaboration call
                  <PlayCircle className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-200 bg-white/80 text-slate-900 hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/15"
                >
                  Download profile deck
                  <ArrowUpRight className="size-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-6">
              <div className={cn(cardSurface, "overflow-hidden p-0")}>
                <ImageWithFallback
                  src={profilePhoto}
                  alt={profilePhotoAlt}
                  className="h-72 w-full object-cover"
                />
                <div className="space-y-2 px-6 py-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">Captured</p>
                  <p className="text-sm text-slate-600 dark:text-white/70">{profilePhotoCaption}</p>
                </div>
              </div>
              <div className={cn(cardSurface, "p-6")}>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">
                  On rotation
                </p>
                <div className="mt-4 space-y-5">
                  {expertise.map((area) => (
                    <div key={area.title} className={cn(pillSurface, "p-4")}>
                      <p className="text-lg font-medium text-slate-900 dark:text-white">{area.title}</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-white/70">{area.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-white/70">
                        {area.highlights.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-slate-200 px-3 py-1 dark:border-white/10"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="experience" className="mt-24 space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-white/50">
                  Experience
                </p>
                <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
                  Designing for impact & scale
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
                    "p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:bg-gradient-to-br dark:from-white/[0.04] dark:to-transparent",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-white/50">
                    <span>{experience.period}</span>
                    <span className="inline-block h-px w-10 bg-slate-300 dark:bg-white/30" />
                    <span>{experience.role}</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                    {experience.company}
                  </h3>
                  <p className="mt-3 text-base text-slate-600 dark:text-white/70">{experience.summary}</p>
                  <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-white/80">
                    {experience.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <Sparkles className="mt-1 size-4 text-amber-500" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section id="projects" className="mt-24 space-y-10">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-white/50">
                Selected work
              </p>
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
                Flagship builds & narratives
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
                  education, and AI copilots that protect human nuance.
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
                Stay in touch
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">
                Advising, collaborations, speaking
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-white/70">
                Let's prototype future-ready public services, education systems, or venture playbooks.
                I give my best to teams who care about access, rigor, and cultural resonance.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-white/90" size="lg">
                  Write me an email
                  <Mail className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-200 bg-white/80 text-slate-900 hover:bg-slate-100 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
                >
                  Schedule coffee chat
                  <ArrowUpRight className="size-4" />
                </Button>
              </div>
              <div className="mt-10 grid gap-6 text-sm text-slate-600 dark:text-white/70 sm:grid-cols-3">
                <div className="space-y-2">
                  <p className="uppercase tracking-[0.3em] text-slate-400 dark:text-white/40">Email</p>
                  <a
                    href="mailto:hello@elijahvinluan.com"
                    className="text-slate-900 transition hover:underline dark:text-white"
                  >
                    hello@elijahvinluan.com
                  </a>
                </div>
                <div className="space-y-2">
                  <p className="uppercase tracking-[0.3em] text-slate-400 dark:text-white/40">Phone</p>
                  <a href="tel:+639175553210" className="text-slate-900 hover:underline dark:text-white">
                    +63 917 555 3210
                  </a>
                </div>
                <div className="space-y-2">
                  <p className="uppercase tracking-[0.3em] text-slate-400 dark:text-white/40">Base</p>
                  <span className="text-slate-900 dark:text-white">Manila / Singapore / Remote</span>
                </div>
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

