import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import {
  BUSINESS_HOURS_DAYS,
  DEFAULT_HOURS,
  dayLabel,
} from "@/hooks/useBusinessHours";
import type { BusinessHours, DayKey } from "@/types";

export function ScheduleTab() {
  const { settings, updateSettings, isSaving } = useSystemSettings();
  const [draft, setDraft] = useState<BusinessHours>(DEFAULT_HOURS);

  useEffect(() => {
    if (settings?.business_hours) setDraft(settings.business_hours);
  }, [settings]);

  const toggleDay = (day: DayKey, open: boolean) => {
    setDraft((prev) => ({
      ...prev,
      [day]: open ? { open: "08:00", close: "21:00" } : null,
    }));
  };

  const updateTime = (day: DayKey, field: "open" | "close", value: string) => {
    setDraft((prev) => {
      const current = prev[day];
      if (!current) return prev;
      return { ...prev, [day]: { ...current, [field]: value } };
    });
  };

  const handleSave = async () => {
    await updateSettings({ business_hours: draft });
    toast.success("Horario guardado");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Horario de operación</h3>
        <p className="text-xs text-muted-foreground">
          Define los horarios por día. Los clientes solo podrán reservar dentro
          de estas franjas. Marca un día como cerrado para bloquearlo.
        </p>
      </div>

      <div className="space-y-2">
        {BUSINESS_HOURS_DAYS.map((day) => {
          const hours = draft[day];
          const isOpen = hours !== null;
          return (
            <div
              key={day}
              className="flex flex-wrap items-center gap-3 rounded-md border bg-card p-3"
            >
              <div className="w-28 text-sm font-medium capitalize">
                {dayLabel(day)}
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id={`day-${day}`}
                  checked={isOpen}
                  onCheckedChange={(v) => toggleDay(day, v)}
                />
                <Label htmlFor={`day-${day}`} className="text-xs">
                  {isOpen ? "Abierto" : "Cerrado"}
                </Label>
              </div>
              {isOpen && hours && (
                <div className="flex items-center gap-2 ml-auto">
                  <Input
                    type="time"
                    value={hours.open}
                    onChange={(e) => updateTime(day, "open", e.target.value)}
                    className="h-9 w-28"
                  />
                  <span className="text-muted-foreground text-sm">a</span>
                  <Input
                    type="time"
                    value={hours.close}
                    onChange={(e) => updateTime(day, "close", e.target.value)}
                    className="h-9 w-28"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="mr-2 h-3.5 w-3.5" />
          )}
          Guardar horario
        </Button>
      </div>
    </div>
  );
}
