import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { mediaAsset } from '@/lib/constants';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

type LoveNote = {
  id: string;
  title: string;
  content: string;
  author: string;
  date?: Date;
  
  imageUrl?: string;
};

const loveNotes: LoveNote[] = [
  {
    id: '1',
    title: 'Just Because',
    content: 'I was just thinking about how lucky I am to have you in my life. Your smile makes even the cloudiest days feel sunny. Thank you for being my person.',
    author: 'Ely',
    date: new Date('2025-11-15'),
  },
  {
    id: '2',
    title: 'After Our Hike',
    content: 'Today was absolutely perfect! Watching you conquer that trail with such determination was amazing. I love how adventurous you are and how you push me to try new things.',
    author: 'Ely',
    date: new Date('2025-11-17'),
  },
  {
    id: '3',
    title: 'Morning Thoughts',
    content: "i wanna be with you always. like every single day.",
    author: 'Ely',
    date: new Date('2025-11-18'),
  },
    {
    id: '4',
    title: 'Learning Together',
    content: "i love how we both enjoy learning new things together. whether it's a new recipe or a fun fact, every moment with you is a chance to grow and connect.",
    author: 'Ely',
    date: new Date('2025-11-19'),
  },
  {
    id: '5',
    title: "We've been together for about three years now, I think",
    content: 'can you believe how fast time flies when it is the two of us? every season with you feels brand new.',
    author: 'Ely',
    date: new Date('2025-11-20'),
  },
];

export function LoveNotesSection() {
  const notes = loveNotes;

  const formatDate = (date?: Date) => {
    const value = date || new Date();
    return value.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section id="notes" className="py-20 px-4 bg-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-3">
          <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl mb-4">Love Notes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            A collection of sweet messages, random thoughts, and love letters we've shared with each other.
          </p>
          <p className="text-sm text-muted-foreground">
            These notes stay on this device, so they're just for you.
          </p>
        </div>
        <div>
          <h3 className="text-xl mb-6">All Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">{note.title}</h4>
                      <p className="text-sm text-muted-foreground">{formatDate(note.date)}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{note.content}</p>
                  {note.imageUrl && (
                    <div className="overflow-hidden rounded-2xl border border-border/40 bg-muted/30">
                      <ImageWithFallback
                        src={note.imageUrl}
                        alt={`${note.title} photo`}
                        className="mt-2 h-40 w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">- {note.author}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
