import { useState } from "react";
import { BirthdayBanner } from "./components/BirthdayBanner";
import { BirthdayPlaylistPlayer } from "./components/BirthdayPlaylistPlayer";
import { HeartFireworks } from "./components/HeartFireworks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BirthdayViewProps = {
  onBackToProfile: () => void;
  onOpenStory: () => void;
};

export default function BirthdayView({
  onBackToProfile,
  onOpenStory,
}: BirthdayViewProps) {
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [fireworksActive, setFireworksActive] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/pics%20and%20vid/sample1.jpg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-rose-50/60 to-rose-100/70 backdrop-blur-[1px]" aria-hidden="true" />

      <div className="fixed right-4 top-4 z-50">
        <Button
          variant="outline"
          className="bg-white/80 text-foreground hover:bg-white dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-800"
          onClick={onBackToProfile}
        >
          Back to profile
        </Button>
      </div>

      {fireworksActive ? (
        <div className="pointer-events-none fixed inset-0 z-40">
          <HeartFireworks active count={220} className="mix-blend-screen opacity-95" />
        </div>
      ) : null}

      <div className="relative">
        <BirthdayBanner
          onOpenStory={onOpenStory}
          onOpenPlaylist={() => setShowPlaylist(true)}
          onFireworksChange={setFireworksActive}
        />
      </div>

      <Dialog open={showPlaylist} onOpenChange={setShowPlaylist}>
        <DialogContent className="max-w-2xl w-[90vw] bg-background">
          <DialogHeader className="pb-2">
            <DialogTitle>Birthday Playlist</DialogTitle>
            <DialogDescription>
              Little songs for every version of your smile.
            </DialogDescription>
          </DialogHeader>
          <BirthdayPlaylistPlayer />
        </DialogContent>
      </Dialog>

      <footer className="px-4 py-8 text-center text-xs text-muted-foreground">
        Crafted with love for Annielyn&apos;s birthday.
      </footer>
    </div>
  );
}


