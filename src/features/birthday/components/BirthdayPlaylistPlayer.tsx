import { useState } from 'react';
import ReactPlayer from 'react-player/youtube';
import { motion } from 'motion/react';
import { Music2, SkipBack, SkipForward, Pause, Play, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const tracks = [
  {
    title: 'To the Bone',
    dedication: 'Because you inspire me to love deeply, without holding back, all the way to the bone.',
    url: 'https://youtu.be/oIYWenB637c?si=_EKIIdfRGAOhmKDk',
  },
];

export function BirthdayPlaylistPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const currentTrack = tracks[currentIndex];

  const playNext = () => setCurrentIndex((prev) => (prev + 1) % tracks.length);
  const playPrev = () =>
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);

  return (
    <Card className="bg-gradient-to-br from-primary/20 via-pink-500/10 to-accent/20 border border-primary/20 shadow-lg">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/20 p-3">
            <Music2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              created for annielyn
            </p>
            <h3 className="text-xl font-semibold">Birthday Playlist</h3>
          </div>
        </div>

        <motion.div
          key={currentTrack.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/50 bg-white/80 p-5 text-slate-900 shadow-lg backdrop-blur"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-base font-semibold">{currentTrack.title}</p>
              <p className="text-sm text-slate-700">{currentTrack.dedication}</p>
            </div>
          </div>
        </motion.div>

        <ReactPlayer
          url={currentTrack.url}
          playing={isPlaying}
          controls={false}
          width={0}
          height={0}
          onEnded={playNext}
        />

        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" onClick={playPrev} aria-label="Previous song">
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full text-primary bg-white"
            onClick={() => setIsPlaying((prev) => !prev)}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button variant="ghost" onClick={playNext} aria-label="Next song">
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

