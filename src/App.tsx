import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ProfileView } from "@/features/profile/ProfileView";
import { Toaster } from "@/components/ui/sonner";

const THEME_STORAGE_KEY = "theme";
const SENSITIVE_SHORTCUTS = new Set(["c", "p", "s", "u", "x"]);

const isScreenshotShortcut = (event: KeyboardEvent) => {
  if (event.key === "PrintScreen" || event.code === "PrintScreen") return true;

  const code = event.code.toLowerCase();
  const key = event.key.toLowerCase();

  if (
    event.metaKey &&
    event.shiftKey &&
    (code === "digit3" || code === "digit4" || code === "digit5")
  ) {
    return true;
  }

  if ((event.ctrlKey || event.metaKey) && event.shiftKey && key === "s") {
    return true;
  }

  return false;
};

const getInitialDarkMode = () => {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return false;
};

const App = () => {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const [privacyShieldActive, setPrivacyShieldActive] = useState(false);
  const shieldTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const armShield = (durationMs: number) => {
      setPrivacyShieldActive(true);
      if (shieldTimerRef.current !== null) {
        window.clearTimeout(shieldTimerRef.current);
      }

      shieldTimerRef.current = window.setTimeout(() => {
        if (!document.hidden && document.hasFocus()) {
          setPrivacyShieldActive(false);
        }
      }, durationMs);
    };

    const releaseShield = () => {
      if (document.hidden || !document.hasFocus()) return;
      setPrivacyShieldActive(false);
    };

    const preventDefault = (event: Event) => {
      event.preventDefault();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        armShield(1800);
        return;
      }
      releaseShield();
    };

    const handleWindowBlur = () => armShield(2000);
    const handleWindowFocus = () => releaseShield();

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (isScreenshotShortcut(event)) {
        event.preventDefault();
        armShield(2400);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && SENSITIVE_SHORTCUTS.has(key)) {
        event.preventDefault();
        armShield(1200);
      }
    };

    document.body.classList.add("privacy-guard-enabled");
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("copy", preventDefault, true);
    document.addEventListener("cut", preventDefault, true);
    document.addEventListener("contextmenu", preventDefault, true);
    document.addEventListener("dragstart", preventDefault, true);
    document.addEventListener("selectstart", preventDefault, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      if (shieldTimerRef.current !== null) {
        window.clearTimeout(shieldTimerRef.current);
      }
      document.body.classList.remove("privacy-guard-enabled");
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("copy", preventDefault, true);
      document.removeEventListener("cut", preventDefault, true);
      document.removeEventListener("contextmenu", preventDefault, true);
      document.removeEventListener("dragstart", preventDefault, true);
      document.removeEventListener("selectstart", preventDefault, true);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <>
      <ProfileView
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />
      <Toaster />
      <div
        className={`privacy-shield ${privacyShieldActive ? "is-active" : ""}`}
        aria-hidden={!privacyShieldActive}
      >
        <p>Protected View</p>
      </div>
    </>
  );
};

export default App;
