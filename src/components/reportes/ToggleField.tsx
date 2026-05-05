import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { LucideIcon } from "lucide-react";

interface ToggleFieldProps {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function ToggleField({
  id,
  label,
  description,
  icon: Icon,
  checked,
  onCheckedChange,
}: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="rounded-full bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        <div>
          <Label htmlFor={id} className="cursor-pointer font-medium text-sm">
            {label}
          </Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
