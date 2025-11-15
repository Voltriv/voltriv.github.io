import { useState } from "react";
import { BirthdayBanner } from "../components/shared/BirthdayBanner";
import { BirthdayPlaylistPlayer } from "../components/shared/BirthdayPlaylistPlayer";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

type BirthdayViewProps = {
  onBackToProfile: () => void;
  onOpenStory: () => void;
};

export default function BirthdayView({
  onBackToProfile,
  onOpenStory,
}: BirthdayViewProps) {
  const [showPlaylist, setShowPlaylist] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-100 text-foreground">
      <div className="fixed right-4 top-4 z-50">
        <Button
          variant="outline"
          className="bg-white/80 text-foreground hover:bg-white dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-800"
          onClick={onBackToProfile}
        >
          Back to profile
        </Button>
      </div>

      <BirthdayBanner
        onOpenStory={onOpenStory}
        onOpenPlaylist={() => setShowPlaylist(true)}
      />

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


