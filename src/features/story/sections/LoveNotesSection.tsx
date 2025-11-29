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

const loveNotes: LoveNote[] = [];

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
          {notes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No love notes yet.</p>
          ) : (
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
          )}
        </div>
      </div>
    </section>
  );
}
