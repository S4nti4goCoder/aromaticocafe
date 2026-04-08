import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tag,
  Copy,
  LayoutGrid,
  List,
  Download,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategories,
  useCategoryProductCounts,
  useDeleteCategory,
  useToggleCategoryActive,
  useDuplicateCategory,
  useBulkUpdateCategoriesActive,
  useBulkDeleteCategories,
} from "@/hooks/useCategories";
import { CategoryFormModal } from "@/features/inventory/CategoryFormModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import type { Category } from "@/types";

export function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{
    open: boolean;
    category?: Category | null;
  }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [view, setView] = useState<"table" | "grid">("table");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: categories = [], isLoading } = useCategories();
  const { data: productCounts = {} } = useCategoryProductCounts();
  const deleteCategory = useDeleteCategory();
  const toggleActive = useToggleCategoryActive();
  const duplicateCategory = useDuplicateCategory();
  const bulkUpdateActive = useBulkUpdateCategoriesActive();
  const bulkDelete = useBulkDeleteCategories();

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

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

  // Reset página al buscar
  useEffect(() => {
    reset();
  }, [search, reset]);

  useEffect(() => {
    handleItemsPerPageChange(view === "grid" ? 10 : 6);
  }, [view, handleItemsPerPageChange]);

  useEffect(() => {
    setSelected((prev) => {
      const filteredIds = new Set(filtered.map((c) => c.id));
      const next = new Set<string>();
      for (const id of prev) if (filteredIds.has(id)) next.add(id);
      return next.size === prev.size ? prev : next;
    });
  }, [filtered]);

  const pageIds = useMemo(
    () => paginatedItems.map((c) => c.id),
    [paginatedItems],
  );
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  const togglePageSelection = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        for (const id of pageIds) next.delete(id);
      } else {
        for (const id of pageIds) next.add(id);
      }
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

  const exportCsv = () => {
    const rows = filtered.map((c) => ({
      nombre: c.name,
      descripcion: c.description ?? "",
      productos: productCounts[c.id] ?? 0,
      activo: c.is_active ? "sí" : "no",
    }));
    const headers = ["nombre", "descripcion", "productos", "activo"];
    const escape = (val: unknown) => {
      const s = String(val ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => escape(r[h as keyof typeof r])).join(","),
      ),
    ].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `categorias-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categorías</h2>
          <p className="text-muted-foreground text-sm">
            Organiza los productos en categorías
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="cursor-pointer"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <PermissionGuard module="inventory" action="can_create">
            <Button onClick={() => setModal({ open: true, category: null })}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva categoría
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorías..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ml-auto inline-flex rounded-md border bg-card p-0.5">
          <button
            type="button"
            onClick={() => setView("table")}
            className={`inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors cursor-pointer ${
              view === "table"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            Tabla
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors cursor-pointer ${
              view === "grid"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Tarjetas
          </button>
        </div>
      </div>

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
            <PermissionGuard module="inventory" action="can_edit">
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer"
                onClick={() =>
                  bulkUpdateActive.mutate(
                    { ids: [...selected], is_active: true },
                    { onSuccess: clearSelection },
                  )
                }
              >
                Activar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer"
                onClick={() =>
                  bulkUpdateActive.mutate(
                    { ids: [...selected], is_active: false },
                    { onSuccess: clearSelection },
                  )
                }
              >
                Desactivar
              </Button>
            </PermissionGuard>
            <PermissionGuard module="inventory" action="can_delete">
              <Button
                size="sm"
                variant="destructive"
                className="cursor-pointer"
                onClick={() => setConfirmBulkDelete(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Eliminar
              </Button>
            </PermissionGuard>
            <Button
              size="sm"
              variant="ghost"
              className="cursor-pointer"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No hay categorías</p>
        </div>
      ) : (
        <>
          {view === "table" ? (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
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
                  <th className="text-left px-4 py-3 font-medium">Imagen</th>
                  <th className="text-left px-4 py-3 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium">
                    Descripción
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Productos</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((category, index) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`border-t hover:bg-muted/30 transition-colors ${
                      selected.has(category.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selected.has(category.id)}
                        onCheckedChange={() => toggleOne(category.id)}
                        aria-label={`Seleccionar ${category.name}`}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          <Tag className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {category.description ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {productCounts[category.id] ?? 0}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <PermissionGuard module="inventory" action="can_edit">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={category.is_active}
                          onClick={() =>
                            toggleActive.mutate({
                              id: category.id,
                              is_active: !category.is_active,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                            category.is_active
                              ? "border-green-500/30 bg-green-500/90 focus-visible:ring-green-500"
                              : "border-border bg-muted focus-visible:ring-muted-foreground"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                              category.is_active
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </PermissionGuard>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <PermissionGuard module="inventory" action="can_edit">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={() => setModal({ open: true, category })}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard module="inventory" action="can_create">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={() => duplicateCategory.mutate(category)}
                            title="Duplicar"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard module="inventory" action="can_delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer text-destructive hover:text-destructive"
                            onClick={() => setConfirmDelete(category)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {paginatedItems.map((category, index) => {
              const isSelected = selected.has(category.id);
              const count = productCounts[category.id] ?? 0;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="absolute left-2 top-2 z-10">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleOne(category.id)}
                      aria-label={`Seleccionar ${category.name}`}
                      className="cursor-pointer bg-background/80 backdrop-blur"
                    />
                  </div>
                  <div className="absolute right-2 top-2 z-10">
                    <Badge
                      variant="outline"
                      className="bg-background/80 backdrop-blur"
                    >
                      {count} {count === 1 ? "producto" : "productos"}
                    </Badge>
                  </div>
                  <div className="aspect-square w-full bg-muted">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Tag className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="min-h-10">
                      <p className="line-clamp-1 text-sm font-medium leading-tight">
                        {category.name}
                      </p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {category.description ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      {!category.is_active && (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          Inactiva
                        </Badge>
                      )}
                      <div className="ml-auto flex items-center gap-1">
                        <PermissionGuard module="inventory" action="can_edit">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer"
                            onClick={() => setModal({ open: true, category })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard module="inventory" action="can_create">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer"
                            onClick={() => duplicateCategory.mutate(category)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard module="inventory" action="can_delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer text-destructive hover:text-destructive"
                            onClick={() => setConfirmDelete(category)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={
              view === "grid" ? [10, 20, 30, 50] : [6, 12, 24, 50]
            }
          />
        </>
      )}

      <CategoryFormModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        category={modal.category}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        onOpenChange={setConfirmBulkDelete}
        title="Eliminar categorías seleccionadas"
        description={`¿Seguro que quieres eliminar ${selected.size} categoría${selected.size === 1 ? "" : "s"}? Esta acción no se puede deshacer.`}
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

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Eliminar categoría"
        description={
          confirmDelete
            ? `¿Seguro que quieres eliminar "${confirmDelete.name}"? ${
                (productCounts[confirmDelete.id] ?? 0) > 0
                  ? `Esta categoría tiene ${productCounts[confirmDelete.id]} producto(s) asociado(s).`
                  : "Esta acción no se puede deshacer."
              }`
            : ""
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteCategory.isPending}
        onConfirm={() => {
          if (confirmDelete) {
            deleteCategory.mutate(confirmDelete.id, {
              onSuccess: () => setConfirmDelete(null),
            });
          }
        }}
      />
    </div>
  );
}
