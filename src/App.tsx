import { useEffect, useLayoutEffect, useState } from "react";
import { BootIntro } from "@/features/boot/BootIntro";
import { ProfileView } from "@/features/profile/ProfileView";

const THEME_STORAGE_KEY = "theme";
const DARK_THEME_QUERY = "(prefers-color-scheme: dark)";

type ThemeState = {
  darkMode: boolean;
  explicit: boolean;
};

const getInitialTheme = (): ThemeState => {
  if (typeof window === "undefined") {
    return { darkMode: false, explicit: false };
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark") return { darkMode: true, explicit: true };
    if (stored === "light") return { darkMode: false, explicit: true };
  } catch {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }

  return {
    darkMode: window.matchMedia(DARK_THEME_QUERY).matches,
    explicit: false,
  };
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
      themeColor.content = darkMode ? "#090a0a" : "#f5f1ea";
    }
  }, [darkMode]);

  useEffect(() => {
    if (theme.explicit) return undefined;

    const systemTheme = window.matchMedia(DARK_THEME_QUERY);
    const followSystemTheme = (event: MediaQueryListEvent) => {
      setTheme((current) =>
        current.explicit
          ? current
          : { darkMode: event.matches, explicit: false },
      );
    };

    systemTheme.addEventListener("change", followSystemTheme);
    return () => systemTheme.removeEventListener("change", followSystemTheme);
  }, [theme.explicit]);

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
      <BootIntro />
      <ProfileView
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    </>
  );
};

export default App;
