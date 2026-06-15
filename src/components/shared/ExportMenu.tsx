import { Fragment } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ExportMenuItem {
  label: string;
  onClick: () => void | Promise<void>;
  /** When set, a non-clickable label (header inside the menu) precedes this item. */
  group?: string;
  disabled?: boolean;
}

interface ExportMenuProps {
  label?: string;
  items: ExportMenuItem[];
  disabled?: boolean;
}

/**
 * Generic dropdown trigger + items. Items can be grouped via the `group` field:
 * consecutive items sharing the same `group` are rendered under one label.
 */
export function ExportMenu({
  label = "Exportar",
  items,
  disabled,
}: ExportMenuProps) {
  if (items.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="cursor-pointer"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {items.map((item, idx) => {
          const prev = items[idx - 1];
          const showGroupHeader =
            item.group && (!prev || prev.group !== item.group);
          return (
            <Fragment key={`${item.group ?? ""}-${item.label}`}>
              {showGroupHeader && (
                <>
                  {idx > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="text-xs">
                    {item.group}
                  </DropdownMenuLabel>
                </>
              )}
              <DropdownMenuItem
                disabled={item.disabled}
                onClick={() => {
                  void item.onClick();
                }}
                className="cursor-pointer"
              >
                {item.label}
              </DropdownMenuItem>
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
