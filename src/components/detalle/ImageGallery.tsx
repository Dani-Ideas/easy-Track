"use client";

import { useState } from "react";
import { ZoomIn } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageGalleryProps {
  urls: string[];
}

export function ImageGallery({ urls }: ImageGalleryProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!urls || urls.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No hay imágenes adjuntas.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {urls.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(url)}
            className="relative group aspect-video rounded-lg overflow-hidden bg-muted border hover:border-primary/50 transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Imagen ${i + 1}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl p-2">
          {selected && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected}
              alt="Vista ampliada"
              className="w-full h-auto rounded-md max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
