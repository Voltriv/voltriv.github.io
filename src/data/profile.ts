import { mediaAsset } from "@/lib/constants";

export type NavLink = {
  href: string;
  label: string;
};

export type Expertise = {
  title: string;
  description: string;
  highlights: string[];
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
  metric: string;
  link: string;
  tags: string[];
};

export type FocusArea = {
  title: string;
  description: string;
};

export type ProfileCard = {
  name: string;
  location: string;
  roles: string[];
  avatar: string;
  verified?: boolean;
  actions: ContactCTA[];
};

export type TechStackItem = {
  name: string;
  logo: string;
};

export type TechStackCategory = {
  title: string;
  description: string;
  items: TechStackItem[];
};

export type ContactCTA = {
  label: string;
  href: string;
  icon: "mail" | "calendar" | "external";
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

export type SocialLink = {
  label: string;
  icon: "linkedin" | "twitter" | "email";
  href: string;
};

export type ProfileData = {
  navLinks: NavLink[];
  experiences: Experience[];
  projects: Project[];
  focusAreas: FocusArea[];
  techStack: TechStackCategory[];
  profileCard: ProfileCard;
  contact: ContactInfo;
  socialLinks: SocialLink[];
};

export const profileData: ProfileData = {
  navLinks: [
    { href: "#overview", label: "Overview" },
    { href: "#stack", label: "Stack" },
    { href: "#experience", label: "Experience" },
    { href: "#projects", label: "Selected Work" },
    { href: "#contact", label: "Contact" },
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
        { name: "Github Actions", logo: "https://cdn.simpleicons.org/githubactions/2088FF" },
      ],
    },
    {
      title: "Cybersecurity (Kali Linux)",
      description: "Tools I lean on for red-team practice, capture-the-flag, and keeping systems hardened.",
      items: [
        { name: "Nmap", logo: "https://cdn.simpleicons.org/nmap/4681AA" },
        { name: "Masscan", logo: "https://cdn.simpleicons.org/masscan/2F74C0" },
        { name: "Maltego", logo: "https://cdn.simpleicons.org/maltego/FF5F00" },
      ],
    },
  ],
  focusAreas: [
    {
      title: "Exploring",
      description: "Passionate about discovering new technologies, methodologies, and ideas that can enhance my skills and broaden my perspective.",
    },
  ],
  profileCard: {
    name: "Elijah Meir C. Vinluan",
    location: "Dagupan City, Philippines",
    roles: ["Project Manager", "UI/UX", "CyberSecurity Student"],
    verified: true,
    avatar: mediaAsset("avatar.svg"),
    actions: [
      {
        label: "Send Email",
        href: "mailto:elca.vinluan.up@phinmaed.com",
        icon: "mail",
        variant: "outline",
      },
    ],
  },
  contact: {
    eyebrow: "Stay in touch",
    title: "A collaborations, or freelance?",
    description:
      "Let's prototype future-ready public services, education systems, or venture playbooks. I give my best to teams who care about access, security, and lasting impact.",
    ctas: [
      {
        label: "Write me an email",
        href: "mailto:elca.vinluan.up@phinmaed.com",
        icon: "mail",
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
      icon: "linkedin",
      href: "https://www.linkedin.com/in/elijahvinluan",
    },
  ],
};
