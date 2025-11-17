import { Button } from "@/components/ui/button";
import { FloatingHearts } from "./components/FloatingHearts";
import { InteractiveBackground } from "./components/InteractiveBackground";
import { Navigation } from "./components/Navigation";
import { ScrollProgressBar } from "./components/ScrollProgressBar";
import { AboutSection } from "./sections/AboutSection";
import { GallerySection } from "./sections/GallerySection";
import { LoveNotesSection } from "./sections/LoveNotesSection";

type StoryViewProps = {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onBackToBirthday: () => void;
};

export default function StoryView({
  darkMode,
  onToggleDarkMode,
  onBackToBirthday,
}: StoryViewProps) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <ScrollProgressBar />
      <FloatingHearts />
      <InteractiveBackground />
      <Navigation darkMode={darkMode} toggleDarkMode={onToggleDarkMode} />

      <main className="space-y-16 pb-16 pt-24">
        <section className="space-y-3 px-4 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Our story</p>
          <h1 className="text-4xl font-semibold md:text-5xl">Elijah &amp; Annielyn</h1>
          <p className="mx-auto max-w-3xl text-muted-foreground">
            Our love story, captured in pixels and preserved in memories.
          </p>
          <Button variant="outline" className="mt-4" onClick={onBackToBirthday}>
            Back to birthday surprise
          </Button>
        </section>

        <div className="space-y-16">
          <AboutSection />
          <GallerySection />
          <LoveNotesSection />
        </div>
      </main>

      <footer className="bg-gradient-to-r from-muted/20 via-accent/10 to-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
        <p>Crafted with Heart for Annielyn.</p>
      </footer>
    </div>
  );
}

