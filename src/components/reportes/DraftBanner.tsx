"use client";

import { useReporteFormStore } from "@/store/useReporteFormStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils/formatDate";

interface DraftBannerProps {
  onRestore: () => void;
}

export function DraftBanner({ onRestore }: DraftBannerProps) {
  const { draft, hasDraft, clearDraft } = useReporteFormStore();

  if (!hasDraft || !draft) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
      <Save className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className="text-amber-700 dark:text-amber-400 text-sm">
          Tienes un borrador guardado{" "}
          {draft.lastSaved && (
            <span className="font-medium">
              ({formatDateTime(draft.lastSaved)})
            </span>
          )}
        </span>
        <div className="flex gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRestore}
            className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400"
          >
            Restaurar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={clearDraft}
            className="h-7 text-xs text-amber-600 hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
