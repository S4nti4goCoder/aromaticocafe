import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  normalizeName,
  parseBoolCell,
  parseIntegerCell,
  parseNumberCell,
} from "@/lib/importExcel";
import type { ImportConfig, RowResult } from "@/features/import/types";

interface ProductInsert {
  name: string;
  description: string | null;
  price: number;
  discount_percentage: number | null;
  image_url: string | null;
  category_id: string | null;
  is_active: boolean;
  min_stock: number;
  cost: number | null;
  stock_inicial: number | null;
}

interface InsertedRow {
  id: string;
  cost: number | null;
  stock_inicial: number | null;
}

export function buildProductsImportConfig(args: {
  existingProductNames: string[];
  categoryByName: Map<string, string>;
  onDone: () => void;
}): ImportConfig<ProductInsert> {
  const existing = new Set(args.existingProductNames.map(normalizeName));
  const seenInFile = new Set<string>();

  return {
    entityLabel: "Productos",
    templateBaseName: "productos",
    columns: [
      { key: "nombre", required: true, example: "Tinto" },
      { key: "descripcion", aliases: ["descripción"], example: "Café negro" },
      { key: "precio", required: true, example: 2500 },
      { key: "costo", aliases: ["cost"], example: 700 },
      { key: "categoria", aliases: ["categoría", "category"], example: "Cafés Calientes" },
      { key: "descuento_pct", aliases: ["descuento", "discount_percentage"], example: 0 },
      { key: "imagen_url", aliases: ["imagen"], example: "" },
      { key: "activo", aliases: ["activa"], example: "sí" },
      { key: "stock_minimo", aliases: ["min_stock", "stock mínimo"], example: 10 },
      { key: "stock_inicial", aliases: ["stock", "stock inicial"], example: 50 },
    ],
    templateExample: [
      {
        nombre: "Tinto",
        descripcion: "Café negro tradicional",
        precio: 2500,
        costo: 700,
        categoria: "Cafés Calientes",
        descuento_pct: 0,
        activo: "sí",
        stock_minimo: 10,
        stock_inicial: 50,
      },
      {
        nombre: "Americano",
        precio: 3500,
        costo: 1000,
        categoria: "Cafés Calientes",
        activo: "sí",
        stock_minimo: 10,
        stock_inicial: 40,
      },
    ],
    validateRow: (raw, rowIndex): RowResult<ProductInsert> => {
      const name = String(raw["nombre"] ?? "").trim();
      if (!name) return { status: "error", message: "Falta el nombre.", rowIndex };

      const norm = normalizeName(name);
      if (existing.has(norm) || seenInFile.has(norm)) {
        return { status: "duplicate", rowIndex };
      }

      const price = parseNumberCell(raw["precio"]);
      if (price == null || price < 0) {
        return { status: "error", message: "Precio inválido (debe ser un número ≥ 0).", rowIndex };
      }

      const cost = parseNumberCell(raw["costo"]);
      if (cost != null && cost < 0) {
        return { status: "error", message: "Costo no puede ser negativo.", rowIndex };
      }

      const discount = parseNumberCell(raw["descuento_pct"]);
      if (discount != null && (discount < 0 || discount > 100)) {
        return { status: "error", message: "Descuento debe estar entre 0 y 100.", rowIndex };
      }

      const stockInicial = parseIntegerCell(raw["stock_inicial"]);
      if (stockInicial != null && stockInicial < 0) {
        return { status: "error", message: "stock_inicial no puede ser negativo.", rowIndex };
      }

      const minStock = parseIntegerCell(raw["stock_minimo"]);
      if (minStock != null && minStock < 0) {
        return { status: "error", message: "stock_minimo no puede ser negativo.", rowIndex };
      }

      let categoryId: string | null = null;
      const categoryRaw = String(raw["categoria"] ?? "").trim();
      if (categoryRaw) {
        const found = args.categoryByName.get(normalizeName(categoryRaw));
        if (!found) {
          return {
            status: "error",
            message: `Categoría "${categoryRaw}" no existe.`,
            rowIndex,
          };
        }
        categoryId = found;
      }

      seenInFile.add(norm);
      return {
        status: "valid",
        rowIndex,
        value: {
          name,
          description: String(raw["descripcion"] ?? "").trim() || null,
          price,
          discount_percentage: discount,
          image_url: String(raw["imagen_url"] ?? "").trim() || null,
          category_id: categoryId,
          is_active: parseBoolCell(raw["activo"], true),
          min_stock: minStock ?? 5,
          cost,
          stock_inicial: stockInicial,
        },
      };
    },
    importChunk: async (rows) => {
      const productRows = rows.map((r) => ({
        name: r.name,
        description: r.description,
        price: r.price,
        discount_percentage: r.discount_percentage,
        image_url: r.image_url,
        category_id: r.category_id,
        is_active: r.is_active,
        min_stock: r.min_stock,
      }));
      const { data: inserted, error } = await supabase
        .from("products")
        .insert(productRows)
        .select("id");
      if (error) throw error;
      if (!inserted || inserted.length !== rows.length) {
        throw new Error("Respuesta inesperada del servidor.");
      }
      const enriched: InsertedRow[] = inserted.map((p, i) => ({
        id: p.id,
        cost: rows[i].cost,
        stock_inicial: rows[i].stock_inicial,
      }));

      const costRows = enriched
        .filter((r): r is InsertedRow & { cost: number } => r.cost != null)
        .map((r) => ({
          product_id: r.id,
          cost: r.cost,
          updated_at: new Date().toISOString(),
        }));
      if (costRows.length > 0) {
        const { error: ce } = await supabase
          .from("product_costs")
          .upsert(costRows, { onConflict: "product_id" });
        if (ce) throw ce;
      }

      const movementRows = enriched
        .filter(
          (r): r is InsertedRow & { stock_inicial: number } =>
            r.stock_inicial != null && r.stock_inicial > 0,
        )
        .map((r) => ({
          product_id: r.id,
          type: "entrada" as const,
          quantity: r.stock_inicial,
          previous_stock: 0,
          new_stock: r.stock_inicial,
          reason: "Inventario inicial",
        }));
      if (movementRows.length > 0) {
        const { error: me } = await supabase
          .from("inventory_movements")
          .insert(movementRows);
        if (me) throw me;
      }
    },
    onDone: args.onDone,
  };
}

export function useProductsImportDone() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product_costs"] });
    queryClient.invalidateQueries({ queryKey: ["product_stock"] });
    queryClient.invalidateQueries({ queryKey: ["inventory_movements"] });
  };
}
