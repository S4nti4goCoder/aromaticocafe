import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkeletonRows } from "@/components/shared/SkeletonRows";
import { EmptyState } from "@/components/shared/EmptyState";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useZones, useDeleteZone } from "@/hooks/useZones";
import { useTables } from "@/hooks/useTables";
import { ZoneFormModal } from "@/features/reservations/ZoneFormModal";
import type { Zone } from "@/types";

export function ZonesTab() {
  const { data: zones = [], isLoading } = useZones();
  const { data: tables = [] } = useTables();
  const deleteZone = useDeleteZone();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Zone | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Zone | null>(null);

  const tablesInZone = (zoneId: string) =>
    tables.filter((t) => t.zone_id === zoneId).length;

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (z: Zone) => {
    setEditing(z);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openNew}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Nueva zona
        </Button>
      </div>

      {isLoading ? (
        <SkeletonRows count={4} />
      ) : zones.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Sin zonas"
          description="Crea zonas como Interior, Terraza o Ventana para organizar las mesas."
        />
      ) : (
        <ResponsiveTableWrapper>
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Nombre</th>
                <th className="px-3 py-2 text-left font-medium">Notas</th>
                <th className="px-3 py-2 text-center font-medium">Mesas</th>
                <th className="px-3 py-2 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{z.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {z.notes ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {tablesInZone(z.id)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => openEdit(z)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => setConfirmDelete(z)}
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

      <ZoneFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        zone={editing}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Eliminar zona"
        description={
          confirmDelete && tablesInZone(confirmDelete.id) > 0
            ? `Esta zona tiene ${tablesInZone(confirmDelete.id)} mesa(s). Al eliminarla esas mesas quedarán sin zona. ¿Continuar?`
            : `¿Eliminar la zona "${confirmDelete?.name}"?`
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteZone.isPending}
        onConfirm={() => {
          if (confirmDelete) {
            deleteZone.mutate(confirmDelete.id, {
              onSuccess: () => setConfirmDelete(null),
            });
          }
        }}
      />
    </div>
  );
}
