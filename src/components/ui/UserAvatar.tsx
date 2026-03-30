import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string | null;
  className?: string;
  size?: "sm" | "md";
}

const colors = [
  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
];

function getColor(name?: string | null): string {
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserAvatar({ name, className, size = "md" }: UserAvatarProps) {
  return (
    <Avatar
      className={cn(
        size === "sm" ? "h-6 w-6" : "h-8 w-8",
        className
      )}
    >
      <AvatarFallback
        className={cn(
          "text-xs font-semibold",
          getColor(name)
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
