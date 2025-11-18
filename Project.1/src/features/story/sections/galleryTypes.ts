export type AlbumId = "all" | "video" | "dates" | "favorites";

export type GalleryItem = {
  id: number | string;
  src: string;
  alt: string;
  category: string;
  caption: string;
  credit: string;
  isVideo?: boolean;
};
