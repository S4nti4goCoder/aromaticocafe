import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonRowsProps {
  count?: number;
  height?: string;
  className?: string;
}

export function SkeletonRows({
  count = 5,
  height = "h-16",
  className,
}: SkeletonRowsProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={cn("w-full rounded-lg", height)} />
      ))}
    </div>
  );
}
