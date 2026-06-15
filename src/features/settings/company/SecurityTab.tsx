import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { localDateString } from "@/lib/localDate";

const EXPORT_TABLES = [
  { label: "Productos", table: "products" },
  { label: "Categorías", table: "categories" },
  { label: "Ventas", table: "sales" },
  { label: "Transacciones", table: "transactions" },
  { label: "Trabajadores", table: "workers" },
  { label: "Promociones", table: "promotions" },
];

// "Seguridad" tab: copias de seguridad (export de tablas a JSON).
// El cambio de contraseña vive en Mi Perfil (es personal del usuario); aquí
// quedan solo las acciones de datos del negocio.
export function SecurityTab() {

  const handleExportData = async (table: string) => {
    try {
      const { data, error } = await supabase
        .from(table as "products")
        .select("*");
      if (error) throw error;
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${table}_${localDateString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${table} exportado correctamente`);
    } catch {
      toast.error(`Error al exportar ${table}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Data export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Copia de Seguridad
          </CardTitle>
          <CardDescription>
            Exporta los datos del sistema en formato JSON
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EXPORT_TABLES.map((item) => (
              <Button
                key={item.table}
                variant="outline"
                onClick={() => handleExportData(item.table)}
                className="flex items-center gap-2 h-auto py-3"
              >
                <Download className="h-4 w-4 shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">Exportar JSON</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
