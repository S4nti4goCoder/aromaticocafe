import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponsiveTableWrapperProps {
  children: React.ReactNode;
  /** Hint label shown above the table on mobile only. Set to `null` to hide. */
  hint?: string | null;
  /** Extra classes for the outer wrapper. */
  className?: string;
}

/**
 * Wraps a wide table to keep the page from overflowing on small viewports.
 * On <lg the inner container scrolls horizontally, a hint shows above, and a
 * subtle fade appears on the right edge ONLY while there is more content to
 * scroll to. The fade disappears once the user reaches the right edge.
 */
export function ResponsiveTableWrapper({
  children,
  hint = "Desliza horizontalmente para ver más columnas",
  className,
}: ResponsiveTableWrapperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightFade, setShowRightFade] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const hasMoreRight =
        el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
      setShowRightFade(hasMoreRight);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      {hint && (
        <p className="lg:hidden flex items-center gap-1.5 text-xs text-muted-foreground/80">
          <ArrowLeftRight className="h-3 w-3 shrink-0" />
          {hint}
        </p>
      )}
      <div className="relative">
        <div
          ref={scrollRef}
          className="rounded-lg border overflow-x-auto"
        >
          {children}
        </div>
        <div
          aria-hidden
          className={cn(
            "lg:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-8 rounded-r-lg",
            "bg-linear-to-l from-background to-transparent",
            "transition-opacity duration-200",
            showRightFade ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </div>
  );
}
