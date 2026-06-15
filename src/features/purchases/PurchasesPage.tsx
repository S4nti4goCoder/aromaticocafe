import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Truck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonRows } from "@/components/shared/SkeletonRows";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/Pagination";
import { formatCurrency } from "@/lib/currency";
import { useSuppliers, useDeleteSupplier } from "@/hooks/useSuppliers";
import { usePurchases, PURCHASES_PAGE_SIZE } from "@/hooks/usePurchases";
import { SupplierFormModal } from "@/features/purchases/SupplierFormModal";
import { PurchaseFormModal } from "@/features/purchases/PurchaseFormModal";
import { PurchaseDetailModal } from "@/features/purchases/PurchaseDetailModal";
import { Badge } from "@/components/ui/badge";
import type { Supplier, Purchase } from "@/types";

const formatDate = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function PurchasesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PURCHASES_PAGE_SIZE);
  const { data: purchasesData, isLoading: loadingPurchases } = usePurchases(
    page,
    pageSize,
  );
  const purchases = purchasesData?.purchases ?? [];
  const totalPurchases = purchasesData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalPurchases / pageSize));
  const { data: suppliers = [], isLoading: loadingSuppliers } = useSuppliers();
  const deleteSupplier = useDeleteSupplier();

  // Proveedores: se paginan en el cliente porque useSuppliers trae todos
  // (los menús desplegables de compras los necesitan completos), y aquí
  // solo mostramos una página.
  const [supplierPage, setSupplierPage] = useState(1);
  const supplierPageSize = 8;
  const totalSupplierPages = Math.max(
    1,
    Math.ceil(suppliers.length / supplierPageSize),
  );
  const pagedSuppliers = suppliers.slice(
    (supplierPage - 1) * supplierPageSize,
    supplierPage * supplierPageSize,
  );

  const [purchaseModal, setPurchaseModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [supplierModal, setSupplierModal] = useState<{ open: boolean; supplier?: Supplier | null }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<Supplier | null>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
        <p className="text-muted-foreground">Proveedores y compras de insumos</p>
      </div>

      <Tabs defaultValue="purchases">
        <TabsList>
          <TabsTrigger value="purchases">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Compras
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            <Truck className="mr-2 h-4 w-4" />
            Proveedores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setPurchaseModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva compra
            </Button>
          </div>
          {loadingPurchases ? (
            <SkeletonRows count={5} height="h-14" />
          ) : purchases.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="Aún no hay compras" description="Registra una compra para sumar stock y actualizar costos." />
          ) : (
            <ResponsiveTableWrapper>
              <table className="w-full text-sm min-w-160">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Fecha</th>
                    <th className="text-left px-4 py-3 font-medium">Proveedor</th>
                    <th className="text-left px-4 py-3 font-medium">Factura</th>
                    <th className="text-right px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-t hover:bg-accent/30 ${p.is_voided ? "opacity-60" : ""}`}
                    >
                      <td className="px-4 py-3">{formatDate(p.purchase_date)}</td>
                      <td className="px-4 py-3">{p.supplier?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          {p.invoice_number ?? "—"}
                          {p.is_voided && (
                            <Badge className="bg-red-600 text-white">Anulada</Badge>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(p.total))}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPurchase(p)}
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTableWrapper>
          )}
          {!loadingPurchases && totalPurchases > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalPurchases}
              itemsPerPage={pageSize}
              onPageChange={setPage}
              onItemsPerPageChange={setPageSize}
              itemsPerPageOptions={[8, 16, 32, 50]}
            />
          )}
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setSupplierModal({ open: true })}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo proveedor
            </Button>
          </div>
          {loadingSuppliers ? (
            <SkeletonRows count={5} height="h-14" />
          ) : suppliers.length === 0 ? (
            <EmptyState icon={Truck} title="Aún no hay proveedores" description="Agrega proveedores para registrar compras." />
          ) : (
            <ResponsiveTableWrapper>
              <table className="w-full text-sm min-w-160">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium">Contacto</th>
                    <th className="text-left px-4 py-3 font-medium">Teléfono</th>
                    <th className="text-right px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedSuppliers.map((s) => (
                    <tr key={s.id} className="border-t hover:bg-accent/30">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.contact_name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.phone ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSupplierModal({ open: true, supplier: s })}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setConfirmDelete(s)}>
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
          {!loadingSuppliers && suppliers.length > 0 && (
            <Pagination
              currentPage={supplierPage}
              totalPages={totalSupplierPages}
              totalItems={suppliers.length}
              itemsPerPage={supplierPageSize}
              onPageChange={setSupplierPage}
            />
          )}
        </TabsContent>
      </Tabs>

      <PurchaseFormModal open={purchaseModal} onClose={() => setPurchaseModal(false)} />
      <PurchaseDetailModal
        purchase={selectedPurchase}
        onOpenChange={(o) => {
          if (!o) setSelectedPurchase(null);
        }}
      />
      <SupplierFormModal
        open={supplierModal.open}
        onClose={() => setSupplierModal({ open: false })}
        supplier={supplierModal.supplier}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Eliminar proveedor"
        description={`¿Eliminar a ${confirmDelete?.name}? Las compras anteriores se conservan.`}
        destructive
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (confirmDelete) deleteSupplier.mutate(confirmDelete.id);
          setConfirmDelete(null);
        }}
      />
    </motion.div>
  );
}
