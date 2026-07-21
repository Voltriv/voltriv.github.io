import { mediaAsset } from "@/lib/constants";

export type NavLink = {
  href: string;
  label: string;
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  summary: string;
  bullets: string[];
};

export type Project = {
  title: string;
  description: string;
  link: string;
};

export type FocusArea = {
  title: string;
  description: string;
};

export type ServiceItem = {
  title: string;
  summary: string;
  includes: string[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type Collaboration = {
  name: string;
  location: string;
};

export type SecurityMeasure = {
  title: string;
  description: string;
  items: string[];
};

export type ProfileCard = {
  name: string;
  location: string;
  avatar: string;
  actions: ContactCTA[];
};

export type TechStackItem = {
  name: string;
  logo?: string;
};

export type TechStackCategory = {
  title: string;
  description: string;
  items: TechStackItem[];
};

export type ContactCTA = {
  label: string;
  href: string;
  variant: "primary" | "outline";
};

export type ContactDetail = {
  label: string;
  value: string;
  href?: string;
};

export type ContactInfo = {
  eyebrow: string;
  title: string;
  description: string;
  ctas: ContactCTA[];
  details: ContactDetail[];
};

export type HeroProfile = {
  marker: string;
  role: string;
  headline: [string, string];
  intro: string;
  availability: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type ProfileData = {
  hero: HeroProfile;
  navLinks: NavLink[];
  pageLinks: NavLink[];
  services: ServiceItem[];
  experiences: Experience[];
  projects: Project[];
  focusAreas: FocusArea[];
  securityMeasures: SecurityMeasure[];
  techStack: TechStackCategory[];
  profileCard: ProfileCard;
  contact: ContactInfo;
  socialLinks: SocialLink[];
  faqs: FaqItem[];
  collaborations: Collaboration[];
};

export const profileData: ProfileData = {
  hero: {
    marker: "// profile.index",
    role: "UI/UX designer · front-end developer · security-minded builder",
    headline: ["I design, build", "& secure digital products."],
    intro:
      "I turn complex ideas into clear, accessible interfaces—then help teams ship them with thoughtful front-end engineering and practical security checks.",
    availability: "Available for new projects",
  },
  navLinks: [
    { href: "#overview", label: "Profile" },
    { href: "#services", label: "Process" },
    { href: "#capabilities", label: "Stack" },
    { href: "#security", label: "Security" },
    { href: "#proof", label: "Work" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
  ],
  pageLinks: [{ href: "/certifications/", label: "Credentials" }],

  services: [
    {
      title: "Discover",
      summary:
        "We align on goals, audiences, and the shape of the experience. This phase sets the strategy, structure, and voice before pixels move.",
      includes: [
        "Goal mapping",
        "Experience audit",
        "Content structure",
        "Visual direction",
      ],
    },
    {
      title: "Design",
      summary:
        "High-fidelity UI that reflects your brand and guides users through each moment. Built with interaction in mind, ready for build.",
      includes: [
        "Interface design",
        "Component system",
        "Prototype flows",
        "Motion concepts",
      ],
    },
    {
      title: "Deliver",
      summary:
        "Clean, responsive builds with performance and accessibility in focus. I ship with confidence and help with launch support.",
      includes: [
        "Responsive build",
        "Motion polish",
        "Performance pass",
        "Launch support",
      ],
    },
  ],

  experiences: [
    {
      company: "LibReport",
      role: "Project Manager / Database Administrator",
      period: "August 2025 - November 2025",
      summary:
        "Directed the delivery of an academic reporting suite for campus libraries—balancing PM, DBA, and stakeholder duties.",
      bullets: [
        "Facilitated sprint rituals across engineering, QA, and client librarians to keep timelines healthy.",
        "Maintained datasets and migrations that powered real-time usage dashboards.",
        "Built alignment decks and mini demos so admins could adopt the tool with confidence.",
      ],
    },
    {
      company: "LibTrack",
      role: "UI/UX Designer & Quality Assurance Lead",
      period: "January 2025 - March 2025",
      summary: "Owned both product design and QA for a circulation-tracker used by collegiate libraries.",
      bullets: [
        "Designed high-contrast UI patterns that worked well on kiosk terminals.",
        "Authored end-to-end test scripts and defect workflows that cut release bugs.",
        "Partnered with librarians to introduce features in weekly training clinics.",
      ],
    },
    {
      company: "FloodWatch",
      role: "UI/UX Designer",
      period: "August 2024 - November 2024",
      summary: "Joined a civic-tech team to craft a flood monitoring experience for Northern Luzon communities.",
      bullets: [
        "Interviewed responders and barangay staff to map out real alert journeys.",
        "Sketched responsive dashboards that elevated hazard data for mobile users.",
        "Worked with eng to test SMS + push notification flows for early warnings.",
      ],
    },
  ],
  projects: [
    // Intentionally left empty so the UI shows a placeholder card.
  ],
  techStack: [
    {
      title: "Frontend",
      description: "Interfaces and systems for delightful product experiences.",
      items: [
        { name: "JavaScript", logo: "https://cdn.simpleicons.org/javascript/F7DF1E" },
        { name: "TypeScript", logo: "https://cdn.simpleicons.org/typescript/3178C6" },
        { name: "React", logo: "https://cdn.simpleicons.org/react/149ECA" },
        { name: "Next.js", logo: "https://cdn.simpleicons.org/nextdotjs/000000" },
        { name: "Tailwind CSS", logo: "https://cdn.simpleicons.org/tailwindcss/06B6D4" },
      ],
    },
    {
      title: "Backend",
      description: "APIs and services powering civic-grade platforms.",
      items: [
        { name: "Node.js", logo: "https://cdn.simpleicons.org/nodedotjs/339933" },
        { name: "Python", logo: "https://cdn.simpleicons.org/python/3776AB" },
        { name: "PHP", logo: "https://cdn.simpleicons.org/php/777BB4" },
        { name: "MongoDB", logo: "https://cdn.simpleicons.org/mongodb/47A248" },
      ],
    },
    {
      title: "DevOps & Cloud",
      description: "Pipelines and infrastructure that keep deployments safe and observable.",
      items: [
        { name: "GitHub Actions", logo: "https://cdn.simpleicons.org/githubactions/2088FF" },
      ],
    },
    {
      title: "Cybersecurity (Kali Linux)",
      description: "Tools I lean on for red-team practice, capture-the-flag, and keeping systems hardened.",
      items: [
        { name: "Nmap" },
        { name: "Masscan" },
        { name: "Maltego" },
      ],
    },
  ],
  focusAreas: [
    {
      title: "Interface systems",
      description:
        "Clear flows, reusable components, and accessible visual patterns that help people move with confidence.",
    },
    {
      title: "Front-end delivery",
      description:
        "Responsive React builds with practical performance, testing, and maintainability checks.",
    },
    {
      title: "Security awareness",
      description:
        "Threat-minded product decisions, careful data handling, and safer launch habits from the start.",
    },
  ],
  securityMeasures: [
    {
      title: "Threat modeling",
      description:
        "Map data flows early, identify risk areas, and lock decisions before build.",
      items: ["Data flow mapping", "Risk checklist", "Misuse scenarios"],
    },
    {
      title: "Secure build",
      description:
        "Harden UI patterns, reduce attack surface, and keep dependencies tidy.",
      items: ["Input handling", "Safe dependencies", "Least privilege"],
    },
    {
      title: "Privacy readiness",
      description:
        "Keep data use transparent, minimal, and aligned to user expectations.",
      items: ["Data minimization", "Consent signals", "Storage review"],
    },
    {
      title: "Launch guardrails",
      description:
        "Ship with checks in place and clear handoff for future maintenance.",
      items: ["Header checklist", "Monitoring plan", "Security handoff"],
    },
  ],
  profileCard: {
    name: "Elijah Meir C. Vinluan",
    location: "Dagupan City, Philippines",
    avatar: mediaAsset("PIC.jpg"),
    actions: [
      {
        label: "Send Email",
        href: "mailto:elca.vinluan.up@phinmaed.com",
        variant: "primary",
      },
    ],
  },
  contact: {
    eyebrow: "Stay in touch",
    title: "Have a useful problem? Let's build it.",
    description:
      "I collaborate on public-service, education, and product ideas with teams who care about access, security, and lasting impact.",
    ctas: [
      {
        label: "Write me an email",
        href: "mailto:elca.vinluan.up@phinmaed.com",
        variant: "primary",
      },
    ],
    details: [
      {
        label: "Email",
        value: "elca.vinluan.up@phinmaed.com",
        href: "mailto:elca.vinluan.up@phinmaed.com",
      },
      {
        label: "Phone",
        value: "+63 910 558 4949",
        href: "tel:+639105584949",
      },
      {
        label: "Base",
        value: "Dagupan City / Philippines / Remote",
      },
    ],
  },
  socialLinks: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/elijahvinluan",
    },
  ],
  faqs: [
    {
      question: "Do you offer both design and development?",
      answer:
        "Yes. I can take a project from discovery through delivery, or jump in for design-only or build-only engagements.",
    },
    {
      question: "What does a typical timeline look like?",
      answer:
        "Most sprints run 4 to 8 weeks depending on scope. I share a detailed timeline once we agree on the requirements.",
    },
    {
      question: "Can you work with existing designs?",
      answer:
        "I can build from polished designs or refine a direction if the system is consistent. I will flag any gaps early.",
    },
    {
      question: "Do you add motion and interactions?",
      answer:
        "Yes. I layer in interactions and scroll reveals that support the story without slowing the experience.",
    },
    {
      question: "What do you need to get started?",
      answer:
        "A quick briefing on your goals, audience, timeline, and any existing assets. From there we map the work.",
    },
  ],
  collaborations: [
    { name: "LibReport", location: "Dagupan City" },
    { name: "LibTrack", location: "Campus Libraries" },
    { name: "FloodWatch", location: "Northern Luzon" },
    { name: "CIT Student Council", location: "Dagupan" },
    { name: "UI/UX Study Group", location: "Remote" },
    { name: "Security Lab", location: "Philippines" },
  ],
};
