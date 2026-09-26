const defaultTheme = require("tailwindcss/defaultTheme");

const colorWithOpacity = (variable) => {
  return ({ opacityValue }) =>
    opacityValue !== undefined
      ? `oklch(var(${variable}) / ${opacityValue})`
      : `oklch(var(${variable}))`;
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./certifications/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      // Only the tokens the built CSS actually references. The card, popover,
      // muted, chart-* and sidebar-* entries were dropped: nothing in the
      // markup used those classes, so Tailwind never emitted them and their
      // custom properties were dead weight in both themes. Verified by
      // grepping the compiled stylesheet for `var(--token)` before removal —
      // an unused colour fails silently, so "looks unused" was not enough.
      colors: {
        border: colorWithOpacity("--border"),
        input: colorWithOpacity("--input"),
        ring: colorWithOpacity("--ring"),
        background: colorWithOpacity("--background"),
        foreground: colorWithOpacity("--foreground"),
        primary: colorWithOpacity("--primary"),
        "primary-foreground": colorWithOpacity("--primary-foreground"),
        secondary: colorWithOpacity("--secondary"),
        "secondary-foreground": colorWithOpacity("--secondary-foreground"),
        accent: colorWithOpacity("--accent"),
        "accent-foreground": colorWithOpacity("--accent-foreground"),
        destructive: colorWithOpacity("--destructive"),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
      },
      fontFamily: {
        sans: ["'Space Grotesk'", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
