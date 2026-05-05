"use client";

import { useUIStore } from "@/store/useUIStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  total: number;
}

export function TablePagination({ total }: TablePaginationProps) {
  const { filters, setFilter } = useUIStore();
  const { page, pageSize } = filters;
  const totalPages = Math.ceil(total / pageSize);
  const from = Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between py-3 px-1">
      <p className="text-sm text-muted-foreground">
        Mostrando {total === 0 ? 0 : from}–{to} de {total} reportes
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFilter("page", page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm px-3">
          {page} / {totalPages || 1}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFilter("page", page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
