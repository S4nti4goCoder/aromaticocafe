import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  normalizeName,
  parseBoolCell,
  parseDateCell,
  parseNumberCell,
} from "@/lib/importExcel";
import type { ImportConfig, RowResult } from "@/features/import/types";

const PROMO_TYPES = ["descuento_porcentaje", "descuento_precio", "2x1", "precio_fijo"] as const;
const APPLIES_TO = ["producto", "categoria", "todos"] as const;

type PromoType = (typeof PROMO_TYPES)[number];
type AppliesTo = (typeof APPLIES_TO)[number];

interface PromotionInsert {
  name: string;
  description: string | null;
  type: PromoType;
  value: number;
  applies_to: AppliesTo;
  product_id: string | null;
  category_id: string | null;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
}

export function buildPromotionsImportConfig(args: {
  existingNames: string[];
  productByName: Map<string, string>;
  categoryByName: Map<string, string>;
  onDone: () => void;
}): ImportConfig<PromotionInsert> {
  const existing = new Set(args.existingNames.map(normalizeName));
  const seenInFile = new Set<string>();

  return {
    entityLabel: "Promociones",
    templateBaseName: "promociones",
    columns: [
      { key: "nombre", required: true, example: "2x1 en Tinto" },
      { key: "descripcion", aliases: ["descripción"], example: "Lleva 2 tintos por el precio de 1" },
      { key: "tipo", required: true, example: "2x1" },
      { key: "valor", required: true, example: 0 },
      { key: "aplica_a", aliases: ["aplica a", "applies_to"], required: true, example: "producto" },
      { key: "producto", example: "Tinto" },
      { key: "categoria", aliases: ["categoría"], example: "" },
      { key: "activo", aliases: ["activa"], example: "sí" },
      { key: "inicia", aliases: ["starts_at", "fecha_inicio"], example: "2026-05-01" },
      { key: "termina", aliases: ["ends_at", "fecha_fin"], example: "2026-06-01" },
    ],
    templateExample: [
      {
        nombre: "2x1 en Tinto",
        descripcion: "Lleva 2 por el precio de 1",
        tipo: "2x1",
        valor: 0,
        aplica_a: "producto",
        producto: "Tinto",
        activo: "sí",
        inicia: "2026-05-01",
      },
      {
        nombre: "20% en Postres",
        tipo: "descuento_porcentaje",
        valor: 20,
        aplica_a: "categoria",
        categoria: "Postres y Tortas",
        activo: "sí",
        inicia: "2026-05-01",
        termina: "2026-06-01",
      },
    ],
    validateRow: (raw, rowIndex): RowResult<PromotionInsert> => {
      const name = String(raw["nombre"] ?? "").trim();
      if (!name) return { status: "error", message: "Falta el nombre.", rowIndex };

      const norm = normalizeName(name);
      if (existing.has(norm) || seenInFile.has(norm)) {
        return { status: "duplicate", rowIndex };
      }

      const typeRaw = String(raw["tipo"] ?? "").trim();
      if (!(PROMO_TYPES as readonly string[]).includes(typeRaw)) {
        return {
          status: "error",
          message: `tipo debe ser uno de: ${PROMO_TYPES.join(", ")}.`,
          rowIndex,
        };
      }
      const type = typeRaw as PromoType;

      const value = parseNumberCell(raw["valor"]);
      if (value == null || value < 0) {
        return { status: "error", message: "valor inválido (número ≥ 0).", rowIndex };
      }

      const appliesRaw = String(raw["aplica_a"] ?? "").trim();
      if (!(APPLIES_TO as readonly string[]).includes(appliesRaw)) {
        return {
          status: "error",
          message: `aplica_a debe ser uno de: ${APPLIES_TO.join(", ")}.`,
          rowIndex,
        };
      }
      const appliesTo = appliesRaw as AppliesTo;

      let productId: string | null = null;
      let categoryId: string | null = null;
      if (appliesTo === "producto") {
        const productRaw = String(raw["producto"] ?? "").trim();
        if (!productRaw) {
          return {
            status: "error",
            message: "Falta producto (aplica_a = producto).",
            rowIndex,
          };
        }
        const found = args.productByName.get(normalizeName(productRaw));
        if (!found) {
          return {
            status: "error",
            message: `Producto "${productRaw}" no existe.`,
            rowIndex,
          };
        }
        productId = found;
      } else if (appliesTo === "categoria") {
        const categoryRaw = String(raw["categoria"] ?? "").trim();
        if (!categoryRaw) {
          return {
            status: "error",
            message: "Falta categoria (aplica_a = categoria).",
            rowIndex,
          };
        }
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

      const startsAt = parseDateCell(raw["inicia"]) ?? new Date().toISOString().split("T")[0];
      const endsAt = parseDateCell(raw["termina"]);

      seenInFile.add(norm);
      return {
        status: "valid",
        rowIndex,
        value: {
          name,
          description: String(raw["descripcion"] ?? "").trim() || null,
          type,
          value,
          applies_to: appliesTo,
          product_id: productId,
          category_id: categoryId,
          is_active: parseBoolCell(raw["activo"], true),
          starts_at: startsAt,
          ends_at: endsAt,
        },
      };
    },
    importChunk: async (rows) => {
      const { error } = await supabase.from("promotions").insert(rows);
      if (error) throw error;
    },
    onDone: args.onDone,
  };
}

export function usePromotionsImportDone() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["promotions"] });
    queryClient.invalidateQueries({ queryKey: ["active_promotions"] });
  };
}
