import { FormEvent, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Pin, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

type LoveNote = {
  id: string;
  title: string;
  content: string;
  author: string;
  date?: Date;
  isPinned: boolean;
  mood: string;
  imageUrl?: string;
};

const STORAGE_KEY = 'love-notes';

const reviveNotes = (payload: unknown): LoveNote[] => {
  if (!Array.isArray(payload)) return [];
  return payload
    .map((entry) => ({
      ...entry,
      date: entry?.date ? new Date(entry.date) : undefined,
    }))
    .filter((entry) => entry.id && entry.title);
};

const loadStoredNotes = (): LoveNote[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return reviveNotes(JSON.parse(raw));
  } catch {
    return [];
  }
};

const persistNotes = (notes: LoveNote[]) => {
  if (typeof window === 'undefined') return;
  const serialisable = notes.map((note) => ({
    ...note,
    date: note.date?.toISOString(),
  }));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serialisable));
};

const fallbackNotes: LoveNote[] = [
  {
    id: '1',
    title: 'Just Because',
    content: 'I was just thinking about how lucky I am to have you in my life. Your smile makes even the cloudiest days feel sunny. Thank you for being my person.',
    author: 'Alex',
    date: new Date('2024-01-15'),
    isPinned: true,
    mood: '??',
  },
  {
    id: '2',
    title: 'After Our Hike',
    content: 'Today was absolutely perfect! Watching you conquer that trail with such determination was amazing. I love how adventurous you are and how you push me to try new things.',
    author: 'Sam',
    date: new Date('2024-01-10'),
    isPinned: false,
    mood: '??',
  },
  {
    id: '3',
    title: 'Morning Coffee Thoughts',
    content: "Waking up next to you never gets old. These quiet morning moments with our coffee are some of my favorite parts of the day. Here's to many more lazy Sunday mornings together.",
    author: 'Alex',
    date: new Date('2024-01-08'),
    isPinned: true,
    mood: '?',
  },
];

export function LoveNotesSection() {
  const [notes, setNotes] = useState<LoveNote[]>(fallbackNotes);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<LoveNote | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    author: '',
    mood: '??',
  });

  const [isSavingNewNote, setIsSavingNewNote] = useState(false);

  const moodOptions = ['??', '??', '??', '??', '??', '?', '???', '??', '??', '??'];

  useEffect(() => {
    const stored = loadStoredNotes();
    if (stored.length) {
      setNotes(stored);
    } else {
      persistNotes(fallbackNotes);
    }
  }, []);

  const updateNotes = (updater: (current: LoveNote[]) => LoveNote[]) => {
    setNotes((current) => {
      const next = updater(current);
      persistNotes(next);
      return next;
    });
  };

  const handleAddNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newNote.title || !newNote.content || !newNote.author) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSavingNewNote(true);
      const created: LoveNote = {
        id: Date.now().toString(),
        title: newNote.title,
        content: newNote.content,
        author: newNote.author,
        date: new Date(),
        isPinned: false,
        mood: newNote.mood,
      };
      updateNotes((current) => [created, ...current]);
      setNewNote({ title: '', content: '', author: '', mood: '??' });
      setIsAddingNote(false);
      toast.success('Love note added!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add love note');
    } finally {
      setIsSavingNewNote(false);
    }
  };

  const handleEditNote = () => {
    if (!editingNote) return;

    try {
      updateNotes((current) => current.map((note) => (note.id === editingNote.id ? editingNote : note)));
      setEditingNote(null);
      toast.success('Love note updated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update note');
    }
  };

  const togglePin = (note: LoveNote) => {
    try {
      updateNotes((current) =>
        current.map((item) => (item.id === note.id ? { ...item, isPinned: !item.isPinned } : item)),
      );
      toast.success('Note pin status updated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update pin');
    }
  };

  const deleteNoteLocal = (note: LoveNote) => {
    try {
      updateNotes((current) => current.filter((item) => item.id !== note.id));
      toast.success('Love note deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete note');
    }
  };

  const formatDate = (date?: Date) => {
    const value = date || new Date();
    return value.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const pinnedNotes = notes.filter((note) => note.isPinned);
  const regularNotes = notes.filter((note) => !note.isPinned);

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
            Notes you add here stay on this device, so feel free to make it yours.
          </p>

          <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Love Note</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Write a Love Note</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleAddNote}>
                <div>
                  <label className="block text-sm mb-2">Title</label>
                  <Input
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Give your note a title..."
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Your Message</label>
                  <Textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Write your heartfelt message..."
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">From</label>
                    <Input
                      value={newNote.author}
                      onChange={(e) => setNewNote({ ...newNote, author: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Mood</label>
                    <div className="grid grid-cols-5 gap-2">
                      {moodOptions.map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => setNewNote({ ...newNote, mood })}
                          className={`p-2 rounded-lg border ${
                            newNote.mood === mood ? 'border-primary bg-primary/10' : 'border-muted'
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <Button className="w-full" type="submit" disabled={isSavingNewNote}>
                  {isSavingNewNote ? 'Saving...' : 'Save Love Note'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {pinnedNotes.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl mb-6 flex items-center gap-2">
              <Pin className="w-4 h-4 text-primary" />
              Pinned Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pinnedNotes.map((note) => (
                <Card key={note.id} className="border-primary/30 bg-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-semibold">{note.title}</h4>
                        <p className="text-sm text-muted-foreground">{formatDate(note.date)}</p>
                      </div>
                      <Badge className="text-base">{note.mood}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{note.content}</p>
                    {note.imageUrl && (
                      <div className="mb-4 overflow-hidden rounded-2xl border border-border/40 bg-muted/30">
                        <ImageWithFallback
                          src={note.imageUrl}
                          alt={`${note.title} photo`}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground"> {note.author}</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePin(note)}
                        >
                          <Pin className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingNote(note)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNoteLocal(note)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xl mb-6">All Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNotes.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">{note.title}</h4>
                      <p className="text-sm text-muted-foreground">{formatDate(note.date)}</p>
                    </div>
                    <Badge>{note.mood}</Badge>
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
                    <span className="text-sm text-muted-foreground"> {note.author}</span>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => togglePin(note)}>
                        <Pin className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingNote(note)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNoteLocal(note)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Love Note</DialogTitle>
          </DialogHeader>
          {editingNote && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Title</label>
                <Input
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Your Message</label>
                <Textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">From</label>
                  <Input
                    value={editingNote.author}
                    onChange={(e) => setEditingNote({ ...editingNote, author: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Mood</label>
                  <div className="grid grid-cols-5 gap-2">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => setEditingNote({ ...editingNote, mood })}
                        className={`p-2 rounded-lg border ${
                          editingNote.mood === mood ? 'border-primary bg-primary/10' : 'border-muted'
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Button className="w-full" onClick={handleEditNote}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}



