import type { LucideIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface FormSectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function FormSectionHeader({
  icon: Icon,
  title,
  description,
}: FormSectionHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-primary/10 p-1.5">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <Separator />
    </div>
  );
}
