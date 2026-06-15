import { Check, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { isValidUrl } from "./utils";

// Text input that flags whether its value is a valid URL.
export function UrlInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const valid = isValidUrl(value);

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={!valid ? "border-destructive pr-9" : "pr-9"}
      />
      {value && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {valid ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
        </div>
      )}
    </div>
  );
}
