"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function StarRating({ value, onChange, disabled }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className={cn(
            "p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
            disabled ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
          aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}
