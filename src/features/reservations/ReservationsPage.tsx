import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  UserX,
  MessageCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/shared/Pagination";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import { SkeletonRows } from "@/components/shared/SkeletonRows";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  useReservations,
  useReservationKpis,
  RESERVATIONS_PAGE_SIZE,
  type ReservationsFilters,
} from "@/hooks/useReservations";
import { ReservationDetailModal } from "@/features/reservations/ReservationDetailModal";
import { localDateString } from "@/lib/localDate";
import type { ReservationStatus } from "@/types";

const STATUS_BADGE: Record<
  ReservationStatus,
  { label: string; className: string }
> = {
  pendiente: { label: "Pendiente", className: "bg-amber-500 text-white" },
  confirmada: { label: "Confirmada", className: "bg-green-600 text-white" },
  cancelada: { label: "Cancelada", className: "bg-red-600 text-white" },
  completada: { label: "Completada", className: "bg-blue-600 text-white" },
  no_show: { label: "No se presentó", className: "bg-gray-600 text-white" },
};

function defaultRange() {
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 7);
  return {
    fromDate: localDateString(from),
    toDate: localDateString(to),
  };
}

function waLink(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/${clean}`;
}

export function ReservationsPage() {
  const [params] = useSearchParams();
  const initialStatus = (params.get("status") ?? "all") as
    | "all"
    | ReservationStatus;

  const [filters, setFilters] = useState<ReservationsFilters>(() => ({
    ...defaultRange(),
    status: initialStatus,
  }));
  const [page, setPage] = useState(1);
  // Se guarda el id (no el objeto): así el modal siempre lee la fila
  // fresca de la lista y refleja cambios de estado sin quedarse viejo.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useReservations(filters, page);
  const rows = data?.rows ?? [];
  const selected = selectedId
    ? (rows.find((r) => r.id === selectedId) ?? null)
    : null;
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / RESERVATIONS_PAGE_SIZE));

  // Conteos en servidor, independientes de los filtros de la tabla.
  const { data: kpis } = useReservationKpis();

  const update = (patch: Partial<ReservationsFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reservas</h2>
        <p className="text-muted-foreground text-sm">
          Reservas del landing — gestión y seguimiento
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-card p-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Desde</p>
          <Input
            type="date"
            value={filters.fromDate}
            onChange={(e) => update({ fromDate: e.target.value })}
            className="h-9 w-40"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Hasta</p>
          <Input
            type="date"
            value={filters.toDate}
            onChange={(e) => update({ toDate: e.target.value })}
            className="h-9 w-40"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Estado</p>
          <select
            value={filters.status ?? "all"}
            onChange={(e) =>
              update({
                status: e.target.value as ReservationsFilters["status"],
              })
            }
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="all">Todas</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
            <option value="completada">Completada</option>
            <option value="no_show">No se presentó</option>
          </select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Buscar (nombre o teléfono)
          </p>
          <Input
            value={filters.search ?? ""}
            onChange={(e) => update({ search: e.target.value || undefined })}
            className="h-9 w-56"
            placeholder="Juan o 3001234567"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilters({ ...defaultRange(), status: "all" });
            setPage(1);
          }}
        >
          Limpiar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPI
          label="Pendientes"
          value={String(kpis?.pendientes ?? "—")}
          icon={Clock}
          color="text-amber-600 dark:text-amber-400"
        />
        <KPI
          label="Confirmadas hoy"
          value={String(kpis?.confirmadasHoy ?? "—")}
          icon={CheckCircle2}
          color="text-green-600 dark:text-green-400"
        />
        <KPI
          label="Próximas 7 días"
          value={String(kpis?.proximas7Dias ?? "—")}
          icon={CalendarClock}
        />
        <KPI
          label="No-shows del mes"
          value={String(kpis?.noShowsMes ?? "—")}
          icon={UserX}
          color="text-red-600 dark:text-red-400"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonRows count={6} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Sin reservas"
          description="No hay reservas en este rango con los filtros aplicados."
        />
      ) : (
        <ResponsiveTableWrapper>
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Fecha</th>
                <th className="px-3 py-2 text-left font-medium">Hora</th>
                <th className="px-3 py-2 text-left font-medium">Cliente</th>
                <th className="px-3 py-2 text-left font-medium">Teléfono</th>
                <th className="px-3 py-2 text-center font-medium">Personas</th>
                <th className="px-3 py-2 text-center font-medium">Estado</th>
                <th className="px-3 py-2 text-left font-medium">Creada</th>
                <th className="px-3 py-2 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const badge = STATUS_BADGE[r.status];
                return (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t hover:bg-muted/20"
                  >
                    <td className="px-3 py-2">{r.reservation_date}</td>
                    <td className="px-3 py-2">
                      {r.reservation_time.slice(0, 5)}
                    </td>
                    <td className="px-3 py-2">{r.customer_name}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {r.customer_phone}
                    </td>
                    <td className="px-3 py-2 text-center">{r.party_size}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">
                      {new Date(r.created_at).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-1">
                        <Button asChild size="sm" variant="ghost">
                          <a
                            href={waLink(r.customer_phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedId(r.id)}
                        >
                          Ver
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </ResponsiveTableWrapper>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        itemsPerPage={RESERVATIONS_PAGE_SIZE}
        onPageChange={setPage}
      />

      <ReservationDetailModal
        reservation={selected}
        onOpenChange={(o) => {
          if (!o) setSelectedId(null);
        }}
      />
    </div>
  );
}

function KPI({
  label,
  value,
  icon: Icon,
  color = "text-foreground",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
