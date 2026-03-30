import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-primary",
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.positive !== false
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive"
                )}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div
            className={cn(
              "rounded-full p-2.5 bg-primary/10",
              iconColor.replace("text-", "text-")
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
