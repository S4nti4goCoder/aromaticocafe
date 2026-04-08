import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategories,
  useCategoryProductCounts,
  useDeleteCategory,
  useToggleCategoryActive,
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

  const { data: categories = [], isLoading } = useCategories();
  const { data: productCounts = {} } = useCategoryProductCounts();
  const deleteCategory = useDeleteCategory();
  const toggleActive = useToggleCategoryActive();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categorías</h2>
          <p className="text-muted-foreground text-sm">
            Organiza los productos en categorías
          </p>
        </div>
        <PermissionGuard module="inventory" action="can_create">
          <Button onClick={() => setModal({ open: true, category: null })}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva categoría
          </Button>
        </PermissionGuard>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar categorías..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
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
                    className="border-t hover:bg-muted/30 transition-colors"
                  >
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
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            category.is_active ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              category.is_active
                                ? "translate-x-5"
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
                            onClick={() => setModal({ open: true, category })}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard module="inventory" action="can_delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}

      <CategoryFormModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        category={modal.category}
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
