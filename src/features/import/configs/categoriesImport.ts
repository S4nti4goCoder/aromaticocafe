import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { normalizeName, parseBoolCell, parseIntegerCell } from "@/lib/importExcel";
import type { ImportConfig, RowResult } from "@/features/import/types";

interface CategoryInsert {
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export function buildCategoriesImportConfig(args: {
  existingNames: string[];
  onDone: () => void;
}): ImportConfig<CategoryInsert> {
  const existing = new Set(args.existingNames.map(normalizeName));
  const seenInFile = new Set<string>();

  return {
    entityLabel: "Categorías",
    templateBaseName: "categorias",
    columns: [
      { key: "nombre", required: true, example: "Cafés Calientes" },
      { key: "descripcion", aliases: ["descripción"], example: "Espresso y bebidas calientes" },
      { key: "imagen_url", aliases: ["imagen", "imagen url"], example: "" },
      { key: "activo", aliases: ["activa"], example: "sí" },
      { key: "orden", aliases: ["sort_order"], example: 1 },
    ],
    templateExample: [
      { nombre: "Cafés Calientes", descripcion: "Espresso y bebidas calientes", activo: "sí", orden: 1 },
      { nombre: "Cafés Fríos", descripcion: "Cold brew y frappés", activo: "sí", orden: 2 },
    ],
    validateRow: (raw, rowIndex): RowResult<CategoryInsert> => {
      const name = String(raw["nombre"] ?? "").trim();
      if (!name) return { status: "error", message: "Falta el nombre.", rowIndex };
      const norm = normalizeName(name);
      if (existing.has(norm) || seenInFile.has(norm)) {
        return { status: "duplicate", rowIndex };
      }
      seenInFile.add(norm);
      return {
        status: "valid",
        rowIndex,
        value: {
          name,
          description: String(raw["descripcion"] ?? "").trim() || null,
          image_url: String(raw["imagen_url"] ?? "").trim() || null,
          is_active: parseBoolCell(raw["activo"], true),
          sort_order: parseIntegerCell(raw["orden"]) ?? 0,
        },
      };
    },
    importChunk: async (rows) => {
      const { error } = await supabase.from("categories").insert(rows);
      if (error) throw error;
    },
    onDone: args.onDone,
  };
}

/** Wires invalidation through React Query for the consumer page. */
export function useCategoriesImportDone() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };
}
