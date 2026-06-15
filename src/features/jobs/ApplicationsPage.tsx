import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Briefcase,
  Inbox,
  Eye,
  PhoneCall,
  UserCheck,
  XCircle,
  Trash2,
  X,
  Mail,
  Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonRows } from "@/components/shared/SkeletonRows";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/Pagination";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import { usePagination } from "@/hooks/usePagination";
import {
  useJobApplications,
  useJobApplicationCounts,
  useDeleteJobApplication,
  useBulkDeleteJobApplications,
} from "@/hooks/useJobApplications";
import { ApplicationDetailModal } from "./ApplicationDetailModal";
import type { JobApplication, JobApplicationStatus } from "@/types";

const POSITION_LABELS: Record<string, string> = {
  barista: "Barista",
  mesero: "Mesero / Mesera",
  cocina: "Cocina",
  caja: "Cajero / Cajera",
  gerencia: "Gerencia",
  otro: "Otro",
};

const STATUS_LABELS: Record<JobApplicationStatus, string> = {
  new: "Nueva",
  reviewed: "Revisada",
  contacted: "Contactada",
  hired: "Contratada",
  rejected: "Rechazada",
};

const STATUS_FILTERS: Array<{
  value: JobApplicationStatus | "all";
  label: string;
  icon: React.ElementType;
}> = [
  { value: "all", label: "Todas", icon: Inbox },
  { value: "new", label: "Nuevas", icon: Inbox },
  { value: "reviewed", label: "Revisadas", icon: Eye },
  { value: "contacted", label: "Contactadas", icon: PhoneCall },
  { value: "hired", label: "Contratadas", icon: UserCheck },
  { value: "rejected", label: "Rechazadas", icon: XCircle },
];

function relativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? "Ahora" : `Hace ${diffMins} min`;
    }
    return `Hace ${diffHours}h`;
  }
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

export function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    JobApplicationStatus | "all"
  >("all");
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<JobApplication | null>(
    null,
  );
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: applications = [], isLoading } = useJobApplications();
  const { data: counts } = useJobApplicationCounts();
  const deleteApp = useDeleteJobApplication();
  const bulkDelete = useBulkDeleteJobApplications();

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          app.full_name.toLowerCase().includes(q) ||
          app.email.toLowerCase().includes(q) ||
          app.phone.includes(q) ||
          (POSITION_LABELS[app.position] ?? app.position)
            .toLowerCase()
            .includes(q)
        );
      }
      return true;
    });
  }, [applications, statusFilter, search]);

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedItems,
    handlePageChange,
    handleItemsPerPageChange,
    reset,
  } = usePagination(filtered);

  useEffect(() => {
    reset();
  }, [search, statusFilter, reset]);

  // Limpia selecciones que ya no aparecen en la lista filtrada
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected((prev) => {
      const filteredIds = new Set(filtered.map((a) => a.id));
      const next = new Set<string>();
      for (const id of prev) if (filteredIds.has(id)) next.add(id);
      return next.size === prev.size ? prev : next;
    });
  }, [filtered]);

  const pageIds = useMemo(
    () => paginatedItems.map((a) => a.id),
    [paginatedItems],
  );
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  const togglePageSelection = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) for (const id of pageIds) next.delete(id);
      else for (const id of pageIds) next.add(id);
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const getStatusBadge = (status: JobApplicationStatus) => {
    const styles: Record<JobApplicationStatus, string> = {
      new: "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-300",
      reviewed:
        "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300",
      contacted:
        "bg-purple-500/10 text-purple-700 border-purple-500/30 dark:text-purple-300",
      hired:
        "bg-green-500/10 text-green-700 border-green-500/30 dark:text-green-300",
      rejected:
        "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-300",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}
      >
        {STATUS_LABELS[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Postulaciones laborales</h2>
        <p className="text-muted-foreground text-sm">
          Revisa y gestiona las personas que se postulan a trabajar contigo
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STATUS_FILTERS.filter((f) => f.value !== "all").map((filter) => {
          const count =
            counts?.[filter.value as JobApplicationStatus] ?? 0;
          const isActive = statusFilter === filter.value;
          const Icon = filter.icon;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() =>
                setStatusFilter(
                  isActive ? "all" : (filter.value as JobApplicationStatus),
                )
              }
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer text-left ${
                isActive
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "bg-card hover:bg-muted/50"
              }`}
            >
              <div
                className={`p-2 rounded-md ${
                  isActive ? "bg-primary/10" : "bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{filter.label}</p>
                <p className="text-lg font-bold leading-none mt-0.5">{count}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search + active filter chip */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, correo, teléfono o cargo..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {statusFilter !== "all" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="cursor-pointer"
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Filtro: {STATUS_LABELS[statusFilter]}
          </Button>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5"
        >
          <span className="text-sm font-medium">
            {selected.size} seleccionada{selected.size === 1 ? "" : "s"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirmBulkDelete(true)}
              className="cursor-pointer"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Eliminar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              className="cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Table / empty / loading */}
      {isLoading ? (
        <SkeletonRows count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={
            statusFilter === "all" && !search
              ? "No hay postulaciones aún"
              : "No se encontraron postulaciones"
          }
          description={
            statusFilter === "all" && !search
              ? "Cuando alguien envíe su postulación desde el formulario público, aparecerá aquí."
              : "Intenta ajustar los filtros o el término de búsqueda."
          }
        />
      ) : (
        <>
          <ResponsiveTableWrapper>
            <table className="w-full text-sm min-w-180">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <Checkbox
                      checked={
                        allPageSelected
                          ? true
                          : somePageSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={togglePageSelection}
                      aria-label="Seleccionar página"
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-medium">
                    Postulante
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Contacto</th>
                  <th className="text-left px-4 py-3 font-medium">Cargo</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 font-medium">Recibida</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((app, index) => (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`border-t hover:bg-muted/30 transition-colors cursor-pointer ${
                      selected.has(app.id) ? "bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedApp(app)}
                  >
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selected.has(app.id)}
                        onCheckedChange={() => toggleOne(app.id)}
                        aria-label={`Seleccionar ${app.full_name}`}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{app.full_name}</p>
                      {app.message && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {app.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <a
                          href={`mailto:${app.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs hover:underline text-muted-foreground"
                        >
                          <Mail className="h-3 w-3" />
                          {app.email}
                        </a>
                        <a
                          href={`tel:${app.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs hover:underline text-muted-foreground"
                        >
                          <Phone className="h-3 w-3" />
                          {app.phone}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {POSITION_LABELS[app.position] ?? app.position}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(app.status as JobApplicationStatus)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {relativeDate(app.created_at)}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          onClick={() => setSelectedApp(app)}
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer text-destructive hover:text-destructive"
                          onClick={() => setConfirmDelete(app)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTableWrapper>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={[8, 16, 32, 50]}
          />
        </>
      )}

      {/* Modals */}
      <ApplicationDetailModal
        open={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        application={selectedApp}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Eliminar postulación"
        description={
          confirmDelete
            ? `¿Seguro que quieres eliminar la postulación de "${confirmDelete.full_name}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteApp.isPending}
        onConfirm={() => {
          if (confirmDelete) {
            deleteApp.mutate(confirmDelete.id, {
              onSuccess: () => setConfirmDelete(null),
            });
          }
        }}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        onOpenChange={setConfirmBulkDelete}
        title="Eliminar postulaciones seleccionadas"
        description={`¿Seguro que quieres eliminar ${selected.size} postulación${selected.size === 1 ? "" : "es"}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        loading={bulkDelete.isPending}
        onConfirm={() => {
          bulkDelete.mutate([...selected], {
            onSuccess: () => {
              clearSelection();
              setConfirmBulkDelete(false);
            },
          });
        }}
      />
    </div>
  );
}
