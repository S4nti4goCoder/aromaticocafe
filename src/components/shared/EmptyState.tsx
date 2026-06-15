import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: { wrap: "py-8", icon: "h-8 w-8 mb-2", title: "text-sm" },
  md: { wrap: "py-16", icon: "h-10 w-10 mb-3", title: "text-base" },
  lg: { wrap: "py-24", icon: "h-12 w-12 mb-4", title: "text-lg" },
} as const;

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const s = SIZE_MAP[size];
  return (
    <div
      className={cn(
        "text-center text-muted-foreground flex flex-col items-center",
        s.wrap,
        className,
      )}
    >
      <Icon className={cn("mx-auto opacity-30", s.icon)} />
      <p className={cn("font-medium text-foreground/80", s.title)}>{title}</p>
      {description && (
        <p className="text-xs mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
