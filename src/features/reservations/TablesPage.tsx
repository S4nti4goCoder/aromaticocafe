import { useState } from "react";
import { Armchair, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TablesTab } from "@/features/reservations/TablesTab";
import { ZonesTab } from "@/features/reservations/ZonesTab";

export function TablesPage() {
  const [tab, setTab] = useState("tables");
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mesas</h2>
        <p className="text-muted-foreground text-sm">
          Configura las mesas y sus zonas para asignarlas a las reservas
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="tables" className="flex items-center gap-1.5">
            <Armchair className="h-4 w-4" />
            Mesas
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            Zonas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tables">
          <TablesTab />
        </TabsContent>
        <TabsContent value="zones">
          <ZonesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
