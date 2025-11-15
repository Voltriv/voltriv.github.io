import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Toaster } from './components/ui/sonner';

const ProfileView = lazy(() =>
  import('./views/ProfileView').then((module) => ({ default: module.ProfileView })),
);
const AdminView = lazy(() =>
  import('./views/AdminView').then((module) => ({ default: module.AdminView })),
);
const BirthdayView = lazy(() => import('./views/BirthdayView'));
const StoryView = lazy(() => import('./views/StoryView'));

type ViewMode = 'profile' | 'birthday' | 'story' | 'admin';

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

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  let content: ReactNode = null;

  switch (view) {
    case 'admin':
      content = <AdminView onBack={() => setView('profile')} />;
      break;
    case 'story':
      content = (
        <StoryView
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onBackToBirthday={() => setView('birthday')}
          onGoToAdmin={() => setView('admin')}
        />
      );
      break;
    case 'profile':
      content = (
        <ProfileView
          onViewBirthday={() => setView('birthday')}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      );
      break;
    default:
      content = (
        <BirthdayView
          onBackToProfile={() => setView('profile')}
          onOpenStory={() => setView('story')}
        />
      );
  }

  return (
    <>
      <Suspense fallback={<ViewFallback />}>{content}</Suspense>
      <Toaster />
    </>
  );
}

function ViewFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 via-white to-rose-100 text-muted-foreground">
      <p className="text-xs uppercase tracking-[0.4em]">Loading view...</p>
    </div>
  );
}
