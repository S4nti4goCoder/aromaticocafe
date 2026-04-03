import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Percent, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePromotions, useDeletePromotion } from "@/hooks/usePromotions";
import { PromotionFormModal } from "@/features/inventory/PromotionFormModal";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import type { Promotion } from "@/types";

const typeLabels: Record<string, string> = {
  descuento_porcentaje: "Descuento %",
  descuento_precio: "Descuento $",
  "2x1": "2x1",
  precio_fijo: "Precio fijo",
};

const appliesToLabels: Record<string, string> = {
  todos: "Todos",
  categoria: "Categoría",
  producto: "Producto",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const isPromotionActive = (promotion: Promotion) => {
  if (!promotion.is_active) return false;
  const now = new Date();
  const starts = new Date(promotion.starts_at);
  if (now < starts) return false;
  if (promotion.ends_at && now > new Date(promotion.ends_at)) return false;
  return true;
};

export function PromotionsPage() {
  const [modal, setModal] = useState<{
    open: boolean;
    promotion?: Promotion | null;
  }>({ open: false });

  const { data: promotions = [], isLoading } = usePromotions();
  const deletePromotion = useDeletePromotion();

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedItems,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(promotions);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Promociones</h2>
          <p className="text-muted-foreground text-sm">
            Gestiona las ofertas y descuentos del café
          </p>
        </div>
        <PermissionGuard module="inventory" action="can_create">
          <Button onClick={() => setModal({ open: true, promotion: null })}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva promoción
          </Button>
        </PermissionGuard>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Percent className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No hay promociones registradas</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Promoción</th>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium">Valor</th>
                  <th className="text-left px-4 py-3 font-medium">Aplica a</th>
                  <th className="text-left px-4 py-3 font-medium">Vigencia</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((promotion, index) => {
                  const active = isPromotionActive(promotion);
                  return (
                    <motion.tr
                      key={promotion.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-t hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{promotion.name}</p>
                        {promotion.description && (
                          <p className="text-xs text-muted-foreground">
                            {promotion.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {typeLabels[promotion.type]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {promotion.type === "2x1"
                          ? "—"
                          : promotion.type === "descuento_porcentaje"
                            ? `${promotion.value}%`
                            : formatCurrency(promotion.value)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div>
                          <span>{appliesToLabels[promotion.applies_to]}</span>
                          {promotion.applies_to === "producto" &&
                            promotion.product && (
                              <p className="text-xs">
                                {promotion.product.name}
                              </p>
                            )}
                          {promotion.applies_to === "categoria" &&
                            promotion.category && (
                              <p className="text-xs">
                                {promotion.category.name}
                              </p>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDate(promotion.starts_at)}
                            {promotion.ends_at
                              ? ` → ${formatDate(promotion.ends_at)}`
                              : " → Sin fin"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {active ? (
                          <Badge className="bg-green-600">Activa</Badge>
                        ) : (
                          <Badge variant="secondary">Inactiva</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <PermissionGuard module="inventory" action="can_edit">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setModal({ open: true, promotion })
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard
                            module="inventory"
                            action="can_delete"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                deletePromotion.mutate(promotion.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
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

      <PromotionFormModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        promotion={modal.promotion}
      />
    </div>
  );
}
