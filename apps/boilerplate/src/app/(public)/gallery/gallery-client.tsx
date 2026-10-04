"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type GalleryImage = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  sort_order: number;
};

export function GalleryClient({ images }: { images: GalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openImage = (index: number) => setSelectedIndex(index);
  const closeImage = () => setSelectedIndex(null);

  const nextImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % images.length);
  };

  const prevImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(
      (selectedIndex - 1 + images.length) % images.length
    );
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-6">
          <ImageOff className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="mt-4 font-medium">No photos yet</p>
        <p className="text-sm text-muted-foreground">
          Check back soon — we're adding new shots all the time.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => openImage(index)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img
              src={image.image_url}
              alt={image.title ?? "Gallery image"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {image.title && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-left">
                <p className="font-medium text-white">{image.title}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeImage}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
            onClick={closeImage}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Prev button */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-10"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Image */}
          <div
            className="max-w-6xl max-h-[85vh] px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex].image_url}
              alt={images[selectedIndex].title ?? "Gallery image"}
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
            {images[selectedIndex].title && (
              <div className="mt-4 text-center text-white">
                <p className="font-medium text-lg">
                  {images[selectedIndex].title}
                </p>
                {images[selectedIndex].description && (
                  <p className="text-sm text-white/70 mt-1">
                    {images[selectedIndex].description}
                  </p>
                )}
              </div>
            )}
            <p className="mt-4 text-center text-xs text-white/50">
              {selectedIndex + 1} / {images.length}
            </p>
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-10"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}
        </div>
      )}
    </>
  );
}
