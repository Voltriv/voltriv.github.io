import { useLayoutEffect, useState } from "react";
import { ProfileView } from "@/features/profile/ProfileView";
import { Toaster } from "@/components/ui/sonner";

const THEME_STORAGE_KEY = "theme";

const getInitialDarkMode = () => {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return false;
};

const App = () => {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

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
    </>
  );
};

export default App;
