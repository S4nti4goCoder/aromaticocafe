import { ArrowUpRight, ArrowDownRight } from "lucide-react";

// Small "+X% vs mes anterior" indicator. `invertColor` flips the good/bad
// coloring for metrics where a decrease is positive (e.g. expenses).
export function PctBadge({
  value,
  invertColor = false,
}: {
  value: number | null;
  invertColor?: boolean;
}) {
  if (value === null) return null;
  const isPositive = value >= 0;
  const colorClass = invertColor
    ? isPositive
      ? "text-red-600"
      : "text-green-600"
    : isPositive
      ? "text-green-600"
      : "text-red-600";

  return (
    <div className={`flex items-center gap-1 text-xs ${colorClass}`}>
      {isPositive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      <span>{Math.abs(value).toFixed(1)}% vs mes anterior</span>
    </div>
  );
}
