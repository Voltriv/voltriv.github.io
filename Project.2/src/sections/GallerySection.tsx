import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { MediaEntry, subscribeToMediaEntries } from "@/lib/mediaService";
import { mediaAsset } from "@/lib/constants";

type AlbumId = "all" | "video" | "dates" | "favorites";

type GalleryItem = {
  id: number | string;
  src: string;
  alt: string;
  category: string;
  caption: string;
  credit: string;
  isVideo?: boolean;
};

export function GallerySection() {
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumId>("all");
  const [lightboxImage, setLightboxImage] = useState<number | null>(null);
  const [remoteItems, setRemoteItems] = useState<GalleryItem[]>([]);
  const [isRemoteLoading, setIsRemoteLoading] = useState(true);

  const albums = [
    { id: "all" as const, name: "All Photos" },
    { id: "video" as const, name: "Video" },
    { id: "dates" as const, name: "Dates" },
    { id: "favorites" as const, name: "Favorites" },
  ];

  useEffect(() => {
    const unsubscribe = subscribeToMediaEntries((items: MediaEntry[]) => {
      setRemoteItems(
        items
          .filter((entry) => entry.mediaType === "photo" || entry.mediaType === "video")
          .map((entry) => ({
            id: entry.id,
            src: entry.url ?? "",
            alt: entry.title,
            category: entry.category || "favorites",
            caption: entry.description || "",
            credit: "Uploaded via admin",
            isVideo: entry.mediaType === "video",
          }))
          .filter((entry) => entry.src),
      );
      setIsRemoteLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fallbackPhotos: GalleryItem[] = [
    {
      id: 1,
      src: mediaAsset("pic1.jpg"),
      alt: "Our Beautiful Eyes",
      category: "dates",
      caption: "Restaurant date with my love.",
      credit: "Photo by Elijah",
    },
    {
      id: 2,
      src: mediaAsset("pic2.jpg"),
      alt: "Garden Stroll",
      category: "favorites",
      caption: "A quiet afternoon walk where everything felt in bloom.",
      credit: "Photo by Elijah",
    },
    {
      id: 3,
      src: mediaAsset("pic3.jpg"),
      alt: "Birthday Sparkles",
      category: "favorites",
      caption: "You, fairy lights, and the softest laughter.",
      credit: "Photo by a kind stranger",
    },
    {
      id: 4,
      src: mediaAsset("vid1.mp4"),
      alt: "Beach Date",
      category: "video",
      caption: "Monthsary date in Tondaligan Beach.",
      credit: "",
    },
    {
      id: 5,
      src: mediaAsset("vid2.mp4"),
      alt: "Sunset Stroll",
      category: "video",
      caption: "Practicing our slow dance as the sky blushed.",
      credit: "",
    },
    {
      id: 6,
      src: mediaAsset("vid3.mp4"),
      alt: "Coffee Date",
      category: "dates",
      caption: "Sunday morning coffee run—our weekly tradition.",
      credit: "Barista video",
    },
    {
      id: 7,
      src: mediaAsset("vid4.mp4"),
      alt: "Boardwalk Laughter",
      category: "video",
      caption: "Laughs carried by the Lingayen Gulf breeze.",
      credit: "",
    },
    {
      id: 8,
      src: mediaAsset("vid5.mp4"),
      alt: "Mountain View",
      category: "favorites",
      caption: "That north-star view that took our breath away.",
      credit: "",
    },
    {
      id: 9,
      src: mediaAsset("vid6.mp4"),
      alt: "Road Trip Anthem",
      category: "video",
      caption: "Singing at the top of our lungs on the way home.",
      credit: "",
    },
    {
      id: 10,
      src: mediaAsset("vid7.mp4"),
      alt: "Rainy Day Serenade",
      category: "video",
      caption: "Dancing barefoot on the balcony as it drizzled.",
      credit: "",
    },
    {
      id: 11,
      src: mediaAsset("vid8.mp4"),
      alt: "Picnic Practice",
      category: "dates",
      caption: "Testing picnic recipes for your birthday surprise.",
      credit: "",
    },
    {
      id: 12,
      src: mediaAsset("vid9.mp4"),
      alt: "City Lights Ride",
      category: "video",
      caption: "Motorbike ride through Dagupan after dark.",
      credit: "",
    },
  ];

  const photos = useMemo(() => (remoteItems.length ? remoteItems : fallbackPhotos), [remoteItems]);

  const albumCounts = useMemo(() => {
    const counters = photos.reduce<Record<string, number>>((acc, photo) => {
      acc[photo.category] = (acc[photo.category] ?? 0) + 1;
      return acc;
    }, {});
    return {
      all: photos.length,
      video: counters.video ?? 0,
      dates: counters.dates ?? 0,
      favorites: counters.favorites ?? 0,
    };
  }, [photos]);

  const filteredPhotos = useMemo(
    () =>
      selectedAlbum === "all"
        ? photos
        : photos.filter((photo) => photo.category === selectedAlbum),
    [photos, selectedAlbum],
  );

  const nextImage = () => {
    if (lightboxImage !== null) {
      setLightboxImage((lightboxImage + 1) % filteredPhotos.length);
    }
  };

  const prevImage = () => {
    if (lightboxImage !== null) {
      setLightboxImage(lightboxImage === 0 ? filteredPhotos.length - 1 : lightboxImage - 1);
    }
  };

  return (
    <section id="gallery" className="py-20 px-4 bg-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl mb-4">Our Gallery</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A collection of our favorite moments, adventures, and everyday magic captured through the lens.
          </p>
          {isRemoteLoading && (
            <p className="text-sm text-muted-foreground">Loading uploaded memories…</p>
          )}
          {!isRemoteLoading && remoteItems.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No uploads yet, so we&apos;re showing our curated gallery. Add your own from the admin panel anytime.
            </p>
          )}
        </div>

        {/* Album Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {albums.map((album) => (
            <Button
              key={album.id}
              variant={selectedAlbum === album.id ? "default" : "outline"}
              onClick={() => setSelectedAlbum(album.id)}
              className="flex items-center space-x-2"
            >
              <span>{album.name}</span>
              <Badge variant="secondary" className="ml-2">
                {albumCounts[album.id] ?? 0}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, index) => (
            <Card 
              key={photo.id} 
              className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300"
              onClick={() => setLightboxImage(index)}
            >
              <CardContent className="p-0 relative">
                <div className="aspect-square overflow-hidden">
                  {photo.isVideo || photo.src.endsWith('.mp4') ? (
                    <video
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      controls
                      onMouseEnter={(e) => e.currentTarget.play()}  // Start playing on hover
                      onMouseLeave={(e) => e.currentTarget.pause()} // Pause on hover out
                    >
                      <source src={photo.src} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                    <p className="text-center p-4">{photo.caption}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lightbox */}
        {lightboxImage !== null && (
          <Dialog open={lightboxImage !== null} onOpenChange={() => setLightboxImage(null)}>
            <DialogContent className="max-w-4xl w-full p-0">
              <div className="relative">
                <button
                  onClick={() => setLightboxImage(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {filteredPhotos[lightboxImage].isVideo || filteredPhotos[lightboxImage].src.endsWith('.mp4') ? (
                  <video
                    className="w-full h-auto max-h-[80vh] object-contain"
                    controls
                    onMouseEnter={(e) => e.currentTarget.play()}  // Start playing on hover
                    onMouseLeave={(e) => e.currentTarget.pause()} // Pause on hover out
                  >
                    <source src={filteredPhotos[lightboxImage].src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={filteredPhotos[lightboxImage].src}
                    alt={filteredPhotos[lightboxImage].alt}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                )}

                <div className="p-6 bg-background">
                  <p className="mb-2">{filteredPhotos[lightboxImage].caption}</p>
                  <p className="text-sm text-muted-foreground">{filteredPhotos[lightboxImage].credit}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  );
}

