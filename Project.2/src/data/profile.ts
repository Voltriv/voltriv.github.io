import { mediaAsset } from "@/lib/constants";

export type NavLink = {
  href: string;
  label: string;
};

export type Stat = {
  label: string;
  value: string;
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
  stats: Stat[];
  expertise: Expertise[];
  experiences: Experience[];
  projects: Project[];
  focusAreas: FocusArea[];
  contact: ContactInfo;
  socialLinks: SocialLink[];
  profilePhoto: string;
  profilePhotoAlt: string;
  profilePhotoCaption: string;
};

export const profileData: ProfileData = {
  navLinks: [
    { href: "#overview", label: "Overview" },
    { href: "#experience", label: "Experience" },
    { href: "#projects", label: "Selected Work" },
    { href: "#contact", label: "Contact" },
  ],
  stats: [
    { label: "Products & platforms shipped", value: "42" },
    { label: "Communities activated", value: "1.8M+" },
    { label: "Creative teams coached", value: "80+" },
  ],
  expertise: [
    {
      title: "Systems Design Leadership",
      description:
        "Building design languages, scaling documentation, and enabling multi-disciplinary squads to ship faster.",
      highlights: ["Design systems", "Craft reviews", "Ops automation"],
    },
    {
      title: "Product Strategy & Narrative",
      description:
        "Facilitating vision sprints, aligning founders and policy partners, and translating insights into shippable bets.",
      highlights: ["North-star metrics", "Narrative roadmaps", "Stakeholder facilitation"],
    },
    {
      title: "Responsible AI & GovTech",
      description:
        "Rapid prototyping for copilots that augment public servants, educators, and civic responders across APAC.",
      highlights: ["AI copilots", "Civic UX", "Policy intelligence"],
    },
  ],
  experiences: [
    {
      company: "Orbit Labs",
      role: "Founding Product Designer",
      period: "2023 - Present",
      summary:
        "Leading 0->1 design for policy intelligence copilots serving Southeast Asian governments and civic orgs.",
      bullets: [
        "Redesigned the mission-control cockpit, trimming research overhead by 63%.",
        "Built an adaptive design system consumed by product, solutions, and data teams across 5 markets.",
        "Partnered with founders on narrative demos that unlocked $4.1M in strategic funding.",
      ],
    },
    {
      company: "StellarPH Network",
      role: "Chief Product & Experience Officer",
      period: "2021 - 2023",
      summary:
        "Architected the Philippines' largest youth innovation network - spanning editorial platforms, summits, and accelerator programs.",
      bullets: [
        "Launched StellarPH PH100 honoring the brightest Filipino builders under 30.",
        "Directed hybrid community festivals with 12k+ attendees and 70+ partner orgs.",
        "Mentored 40+ venture teams through civic-tech and social enterprise sprints; 9 secured seed funding.",
      ],
    },
    {
      company: "Vinluan Studio / Advisory",
      role: "Product Designer & Creative Director",
      period: "2018 - Present",
      summary:
        "Partnering with civic orgs, startups, and universities on experience-led launches and capability building.",
      bullets: [
        "Built brand + product foundations for 15 venture-backed teams across APAC.",
        "Published community-centered design playbooks used by 5 universities and 3 NGOs.",
        "Guest lectured at DevCon, GDG, UNDP innovation labs, and university design programs.",
      ],
    },
  ],
  projects: [
    // Intentionally left empty so the UI shows a placeholder card.
  ],
  focusAreas: [
    {
      title: "GovTech & Civic Futures",
      description: "Designing high-trust products for transparency, policy intelligence, and rapid response.",
    },
    {
      title: "Learning Communities",
      description: "Prototyping mixed-format programs that blend immersive education, mentorship, and ecosystems.",
    },
    {
      title: "AI x Experience",
      description: "Exploring copilots that amplify creative work while honoring human nuance and accountability.",
    },
  ],
  contact: {
    eyebrow: "Stay in touch",
    title: "Advising, collaborations, speaking",
    description:
      "Let's prototype future-ready public services, education systems, or venture playbooks. I give my best to teams who care about access, rigor, and cultural resonance.",
    ctas: [
      {
        label: "Write me an email",
        href: "mailto:elca.vinluan.up@phinmaed.com",
        icon: "mail",
        variant: "primary",
      },
      {
        label: "Schedule coffee chat",
        href: "https://cal.com/elijahvinluan/coffee-chat",
        icon: "calendar",
        variant: "outline",
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
    {
      label: "Twitter",
      icon: "twitter",
      href: "https://twitter.com/elijahvinluan",
    },
    {
      label: "Email",
      icon: "email",
      href: "elca.vinluan.up@phinmaed.com",
    },
  ],
  profilePhoto: mediaAsset("pic1.jpg"),
  profilePhotoAlt: "Elijah and Annielyn sharing a quiet smile together",
  profilePhotoCaption:
    "One of our favorite captured moments - soft light, easy laughter, and no agenda except being together.",
};
