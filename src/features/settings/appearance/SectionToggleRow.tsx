import { AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// One row of the landing "Secciones" list: icon + label + description + toggle.
export function SectionToggleRow({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  description,
  checked,
  onChange,
  hint,
  isLast,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`group relative flex items-start gap-4 px-6 py-4 transition-colors hover:bg-accent/30 ${
        isLast ? "" : "border-b border-border/40"
      }`}
    >
      <div
        className={`mt-0.5 shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-opacity ${iconBg} ${
          checked ? "opacity-100" : "opacity-50"
        }`}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p
          className={`text-sm font-semibold leading-tight transition-colors ${
            checked ? "text-foreground" : "text-foreground/60"
          }`}
        >
          {label}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
          {description}
        </p>
        {hint && (
          <p className="text-xs text-amber-400/90 mt-2 flex items-start gap-1.5 leading-relaxed">
            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{hint}</span>
          </p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="cursor-pointer mt-1.5 shrink-0"
      />
    </div>
  );
}
