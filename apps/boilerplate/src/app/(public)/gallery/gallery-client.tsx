"use client";

import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Expand,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";

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
    setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  };

  if (images.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center border-y border-[#ded6ca] px-5 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center border border-[#d5cabb] text-primary">
          <ImageOff className="h-7 w-7" strokeWidth={1.2} />
        </div>
        <p className="mt-7 font-heading text-3xl text-[#302a24]">
          The story is still unfolding.
        </p>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[#82786c]">
          There are no photographs here just yet. Please visit again soon.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#82786c]">
          Behind the scenes
        </p>
        <p className="font-heading text-lg italic text-primary">
          {String(images.length).padStart(2, "0")} photographs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-7">
        {images.map((image, index) => {
          const layout =
            index % 7 === 0
              ? "lg:col-span-7"
              : index % 7 === 1
                ? "lg:col-span-5"
                : index % 7 === 2
                  ? "lg:col-span-5"
                  : index % 7 === 3
                    ? "lg:col-span-7"
                    : index % 7 === 4
                      ? "lg:col-span-4"
                      : index % 7 === 5
                        ? "lg:col-span-4"
                        : "lg:col-span-4";

          const ratio =
            index % 7 === 0
              ? "aspect-[5/4] lg:aspect-[1.5/1]"
              : index % 7 === 1
                ? "aspect-[5/4] lg:aspect-[1.12/1]"
                : index % 7 === 2
                  ? "aspect-[5/4] lg:aspect-[1.08/1]"
                  : index % 7 === 3
                    ? "aspect-[5/4] lg:aspect-[1.55/1]"
                    : index % 7 === 4
                      ? "aspect-[4/5]"
                      : index % 7 === 5
                        ? "aspect-[4/5]"
                        : "aspect-[4/5]";

          return (
            <Reveal
              key={image.id}
              variant="fade-up"
              delay={(index % 4) * 80}
              className={layout}
            >
              <button
                type="button"
                onClick={() => openImage(index)}
                aria-label={`Open photograph ${index + 1}${image.title ? `: ${image.title}` : ""}`}
                className="group relative block w-full overflow-hidden bg-[#e8e1d6] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[#f7f4ed]"
              >
                <div className={`relative overflow-hidden ${ratio}`}>
                  <img
                    src={image.image_url}
                    alt={image.title ?? "Gallery photograph"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                    <div className="min-w-0 translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
                      {image.title && (
                        <p className="font-heading text-xl font-medium text-white sm:text-2xl">
                          {image.title}
                        </p>
                      )}
                      {image.description && (
                        <p className="mt-1 line-clamp-2 max-w-md text-xs leading-5 text-white/75">
                          {image.description}
                        </p>
                      )}
                    </div>

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/60 text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <Expand className="h-4 w-4" />
                    </span>
                  </div>

                  <span className="absolute left-4 top-4 bg-[#f7f4ed]/95 px-3 py-2 font-heading text-sm italic text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </button>
            </Reveal>
          );
        })}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-[#171512]/95 px-4 py-8 backdrop-blur-sm sm:px-10"
          onClick={closeImage}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image viewer"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close image viewer"
            className="absolute right-4 top-4 z-20 h-11 w-11 text-white hover:bg-white/10 hover:text-white sm:right-8 sm:top-8"
            onClick={closeImage}
          >
            <X className="h-6 w-6" />
          </Button>

          {images.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Previous image"
              className="absolute left-2 top-1/2 z-20 h-11 w-11 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white sm:left-8 sm:h-14 sm:w-14"
              onClick={(event) => {
                event.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft className="h-7 w-7 sm:h-9 sm:w-9" />
            </Button>
          )}

          <div
            className="flex max-h-full w-full max-w-6xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-0 w-full flex-1 items-center justify-center">
              <img
                key={selectedIndex}
                src={images[selectedIndex].image_url}
                alt={images[selectedIndex].title ?? "Gallery photograph"}
                className="max-h-[68vh] max-w-full object-contain animate-zoom-in-soft sm:max-h-[74vh]"
              />
            </div>

            <div className="mt-6 w-full max-w-3xl border-t border-white/20 pt-5 text-center text-white">
              {images[selectedIndex].title && (
                <h2 className="font-heading text-2xl font-medium sm:text-3xl">
                  {images[selectedIndex].title}
                </h2>
              )}
              {images[selectedIndex].description && (
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/65">
                  {images[selectedIndex].description}
                </p>
              )}
              <p className="mt-5 text-[10px] uppercase tracking-[0.22em] text-white/45">
                {String(selectedIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </p>
            </div>
          </div>

          {images.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Next image"
              className="absolute right-2 top-1/2 z-20 h-11 w-11 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white sm:right-8 sm:h-14 sm:w-14"
              onClick={(event) => {
                event.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight className="h-7 w-7 sm:h-9 sm:w-9" />
            </Button>
          )}
        </div>
      )}
    </>
  );
}
