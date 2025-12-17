import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Toaster } from './components/ui/sonner';

const ProfileView = lazy(() =>
  import('./features/profile/ProfileView').then((module) => ({ default: module.ProfileView })),
);
const BirthdayView = lazy(() => import('./features/birthday/BirthdayView'));

function ViewFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 via-white to-rose-100 text-muted-foreground">
      <p className="text-xs uppercase tracking-[0.4em]">Loading view...</p>
    </div>
  );
}


type ViewMode = 'profile' | 'birthday';
const VIEW_TITLES: Record<ViewMode, string> = {
  profile: 'My Profile | Elijah Vinluan',
  birthday: 'Birthday Surprise',
};

export default function App() {
  const [view, setView] = useState<ViewMode>('profile');
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
    document.title = VIEW_TITLES[view];
  }, [view]);

  const toggleDarkMode = () => setDarkMode((prev: boolean) => !prev);

  let content: ReactNode = null;

  switch (view) {
    case 'profile':
      content = (
        <ProfileView
          onViewBirthday={() => setView('birthday')}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      );
      break;
    case 'birthday':
      content = (
        <BirthdayView
          onBackToProfile={() => setView('profile')}
          onOpenStory={() => setView('profile')}
        />
      );
      break;
  }

  return (
    <>
      <Suspense fallback={<ViewFallback />}>{content}</Suspense>
      <Toaster />
    </>
  );
}
