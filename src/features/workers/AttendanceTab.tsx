import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DailyView } from "@/features/workers/attendance/DailyView";
import { WeeklyView } from "@/features/workers/attendance/WeeklyView";
import { MonthlyView } from "@/features/workers/attendance/MonthlyView";

export function AttendanceTab() {
  const [activeView, setActiveView] = useState("daily");

  return (
    <Tabs value={activeView} onValueChange={setActiveView}>
      <TabsList className="grid grid-cols-3 h-auto! w-full sm:flex sm:h-8! sm:w-fit">
        <TabsTrigger value="daily">Diario</TabsTrigger>
        <TabsTrigger value="weekly">Semanal</TabsTrigger>
        <TabsTrigger value="monthly">Mensual</TabsTrigger>
      </TabsList>
      <TabsContent value="daily" className="mt-4">
        <DailyView />
      </TabsContent>
      <TabsContent value="weekly" className="mt-4">
        <WeeklyView />
      </TabsContent>
      <TabsContent value="monthly" className="mt-4">
        <MonthlyView />
      </TabsContent>
    </Tabs>
  );
}
