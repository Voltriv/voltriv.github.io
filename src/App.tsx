import { lazy, Suspense, useEffect, useState } from 'react';
import { Toaster } from './components/ui/sonner';

const ProfileView = lazy(() =>
  import('./features/profile/ProfileView').then((module) => ({ default: module.ProfileView })),
);

function ViewFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 via-white to-rose-100 text-muted-foreground">
      <p className="text-xs uppercase tracking-[0.4em]">Loading view...</p>
    </div>
  );
}

const PAGE_TITLE = 'My Profile | Elijah Vinluan';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) {
      setDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    document.title = PAGE_TITLE;
  }, []);

  const toggleDarkMode = () => setDarkMode((prev: boolean) => !prev);

  return (
    <>
      <Suspense fallback={<ViewFallback />}>
        <ProfileView darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      </Suspense>
      <Toaster />
    </>
  );
}
