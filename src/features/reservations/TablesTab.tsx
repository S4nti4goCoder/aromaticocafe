import { useState } from "react";
import { Plus, Pencil, Trash2, Armchair, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonRows } from "@/components/shared/SkeletonRows";
import { EmptyState } from "@/components/shared/EmptyState";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useTables,
  useDeleteTable,
  useToggleTableActive,
  useTableReservationCount,
} from "@/hooks/useTables";
import { useZones } from "@/hooks/useZones";
import { TableFormModal } from "@/features/reservations/TableFormModal";
import type { RestaurantTable } from "@/types";

export function TablesTab() {
  const { data: tables = [], isLoading } = useTables();
  const { data: zones = [] } = useZones();
  const deleteTable = useDeleteTable();
  const toggleActive = useToggleTableActive();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RestaurantTable | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<RestaurantTable | null>(
    null,
  );
  const { data: reservationCount = 0 } = useTableReservationCount(
    confirmDelete?.id ?? null,
  );

  const zoneName = (id: string | null) =>
    zones.find((z) => z.id === id)?.name ?? "Sin zona";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Nueva mesa
        </Button>
      </div>

      {isLoading ? (
        <SkeletonRows count={4} />
      ) : tables.length === 0 ? (
        <EmptyState
          icon={Armchair}
          title="Sin mesas"
          description="Crea mesas para asignarlas a las reservas."
        />
      ) : (
        <ResponsiveTableWrapper>
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Nombre</th>
                <th className="px-3 py-2 text-center font-medium">Capacidad</th>
                <th className="px-3 py-2 text-left font-medium">Zona</th>
                <th className="px-3 py-2 text-center font-medium">Estado</th>
                <th className="px-3 py-2 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{t.name}</td>
                  <td className="px-3 py-2 text-center">{t.capacity}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {zoneName(t.zone_id)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {t.is_active ? (
                      <Badge className="bg-green-600 text-white">Activa</Badge>
                    ) : (
                      <Badge className="bg-gray-500 text-white">Inactiva</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title={t.is_active ? "Desactivar" : "Activar"}
                        onClick={() =>
                          toggleActive.mutate({
                            id: t.id,
                            is_active: !t.is_active,
                          })
                        }
                      >
                        {t.is_active ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditing(t);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => setConfirmDelete(t)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResponsiveTableWrapper>
      )}

      <TableFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        table={editing}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Eliminar mesa"
        description={
          reservationCount > 0
            ? `Esta mesa tiene ${reservationCount} reserva(s) asociada(s). No se puede eliminar — usa "Desactivar" para ocultarla.`
            : `¿Eliminar la mesa "${confirmDelete?.name}"?`
        }
        confirmLabel={reservationCount > 0 ? "Entendido" : "Eliminar"}
        destructive={reservationCount === 0}
        loading={deleteTable.isPending}
        onConfirm={() => {
          if (!confirmDelete) return;
          if (reservationCount > 0) {
            setConfirmDelete(null);
            return;
          }
          deleteTable.mutate(confirmDelete.id, {
            onSuccess: () => setConfirmDelete(null),
          });
        }}
      />
    </div>
  );
}
