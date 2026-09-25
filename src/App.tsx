import { useLayoutEffect, useState } from "react";
import { BootIntro } from "@/features/boot/BootIntro";
import { ProfileView } from "@/features/profile/ProfileView";

const THEME_STORAGE_KEY = "theme";

type ThemeState = {
  darkMode: boolean;
  explicit: boolean;
};

/**
 * The landing page is designed dark first — the sectioned, high-contrast
 * layout is built around a near-black ground — so dark is the default rather
 * than whatever the OS happens to prefer. A stored choice always wins, and
 * the toggle still offers light.
 */
const getInitialTheme = (): ThemeState => {
  if (typeof window === "undefined") {
    return { darkMode: true, explicit: false };
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark") return { darkMode: true, explicit: true };
    if (stored === "light") return { darkMode: false, explicit: true };
  } catch {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }

  return { darkMode: true, explicit: false };
};

const App = () => {
  const [theme, setTheme] = useState(getInitialTheme);
  const { darkMode } = theme;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    root.style.colorScheme = darkMode ? "dark" : "light";

    const themeColor = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (themeColor) {
      themeColor.content = darkMode ? "#000000" : "#ffffff";
    }
  }, [darkMode]);

  // No system-preference listener: the page intentionally opens dark for
  // everyone, so following the OS would pull first-time visitors into the
  // light theme the design is not built around.

  const toggleDarkMode = () => {
    const nextDarkMode = !darkMode;
    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        nextDarkMode ? "dark" : "light",
      );
    } catch {
      // The visual theme still works when persistence is unavailable.
    }
    setTheme({ darkMode: nextDarkMode, explicit: true });
  };

  return (
    <>
      {/*
        oncePerSession={false} replays the intro on every load.
        ⚠️ FLIP THIS BACK TO TRUE (or drop the prop) BEFORE DEPLOYING —
        otherwise every visitor sits through the ~6s sequence on every
        single page view. It is false purely so the intro can be worked on.
      */}
      <BootIntro oncePerSession={false} />
      <ProfileView
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    </>
  );
};

export default App;
