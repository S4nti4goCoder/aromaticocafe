import { useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ResponsiveTableWrapper } from "@/components/shared/ResponsiveTableWrapper";
import { downloadTemplate, parseXlsx } from "@/lib/importExcel";
import type { ImportConfig, RowResult } from "@/features/import/types";

const CHUNK_SIZE = 100;

interface Props<T> {
  open: boolean;
  onClose: () => void;
  config: ImportConfig<T>;
}

export function ImportModal<T>({ open, onClose, config }: Props<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<RowResult<T>[]>([]);
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setResults([]);
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (importing) return;
    reset();
    onClose();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const raw = await parseXlsx(file, config.columns);
      if (raw.length === 0) {
        toast.error("El archivo está vacío o no tiene columnas reconocibles.");
        reset();
        return;
      }
      const rowResults = raw.map((row, i) => config.validateRow(row, i + 2));
      setResults(rowResults);
    } catch {
      toast.error("No se pudo leer el archivo.");
      reset();
    }
  };

  const valid = results.filter(
    (r): r is Extract<RowResult<T>, { status: "valid" }> => r.status === "valid",
  );
  const errored = results.filter((r) => r.status === "error");
  const duplicates = results.filter((r) => r.status === "duplicate");

  const handleImport = async () => {
    if (valid.length === 0) return;
    setImporting(true);
    try {
      for (let i = 0; i < valid.length; i += CHUNK_SIZE) {
        const chunk = valid.slice(i, i + CHUNK_SIZE).map((r) => r.value);
        await config.importChunk(chunk);
      }
      toast.success(
        `${valid.length} ${config.entityLabel.toLowerCase()} importadas` +
          (duplicates.length ? ` · ${duplicates.length} omitidas` : "") +
          (errored.length ? ` · ${errored.length} con error` : ""),
      );
      config.onDone();
      reset();
      onClose();
    } catch {
      toast.error("Error al importar. No se completó el proceso.");
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar {config.entityLabel}</DialogTitle>
          <DialogDescription>
            Descarga la plantilla, llénala y súbela. Verás una vista previa antes de importar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() =>
                downloadTemplate(config.templateBaseName, config.columns, config.templateExample)
              }
              disabled={importing}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar plantilla
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              <Upload className="mr-2 h-4 w-4" />
              Subir archivo .xlsx
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {results.length > 0 && (
            <>
              <div className="flex flex-wrap gap-4 text-sm border rounded-md px-3 py-2 bg-muted/30">
                <span>
                  <strong className="text-green-600">{valid.length}</strong> válidas
                </span>
                <span>
                  <strong className="text-amber-600">{duplicates.length}</strong> omitidas (duplicado)
                </span>
                <span>
                  <strong className="text-destructive">{errored.length}</strong> con error
                </span>
              </div>

              <ResponsiveTableWrapper>
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-2 py-1.5">Fila</th>
                      <th className="text-left px-2 py-1.5">Estado</th>
                      <th className="text-left px-2 py-1.5">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.rowIndex} className="border-t">
                        <td className="px-2 py-1.5 text-muted-foreground">{r.rowIndex}</td>
                        <td className="px-2 py-1.5">
                          {r.status === "valid" && <span className="text-green-600">Válida</span>}
                          {r.status === "duplicate" && (
                            <span className="text-amber-600">Omitida (duplicado)</span>
                          )}
                          {r.status === "error" && <span className="text-destructive">Error</span>}
                        </td>
                        <td className="px-2 py-1.5">
                          {r.status === "error" ? r.message : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ResponsiveTableWrapper>
            </>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose} disabled={importing}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleImport}
              disabled={importing || valid.length === 0}
            >
              {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Importar {valid.length || ""} {valid.length === 1 ? "fila" : "filas"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
