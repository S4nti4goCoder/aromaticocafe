import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Coffee,
  ChefHat,
  Calculator,
  UserCog,
  HelpCircle,
  Pencil,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonRows } from "@/components/shared/SkeletonRows";
import {
  useAllHiringPositions,
  useToggleHiring,
} from "@/hooks/useHiringPositions";
import { PositionEditModal } from "./PositionEditModal";
import type { HiringPosition, JobPosition } from "@/types";

const POSITION_LABELS: Record<JobPosition, string> = {
  barista: "Barista",
  mesero: "Mesero / Mesera",
  cocina: "Cocina",
  caja: "Cajero / Cajera",
  gerencia: "Gerencia / Administración",
  otro: "Otro",
};

const POSITION_DESCRIPTIONS: Record<JobPosition, string> = {
  barista: "Preparación de café, atención de barra y conocimiento del menú.",
  mesero: "Atención en mesa, recomendación del menú y servicio al cliente.",
  cocina: "Preparación de alimentos, repostería y manejo de cocina.",
  caja: "Manejo de caja, facturación y atención al cliente.",
  gerencia: "Gestión del equipo, operaciones y administración del local.",
  otro: "Cualquier otro rol que no esté en las categorías anteriores.",
};

const POSITION_ICONS: Record<JobPosition, React.ElementType> = {
  barista: Coffee,
  mesero: Briefcase,
  cocina: ChefHat,
  caja: Calculator,
  gerencia: UserCog,
  otro: HelpCircle,
};

export function PositionsPage() {
  const [editing, setEditing] = useState<HiringPosition | null>(null);
  const { data: positions = [], isLoading } = useAllHiringPositions();
  const toggleHiring = useToggleHiring();

  const activeCount = positions.filter((p) => p.is_hiring).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Vacantes activas</h2>
          <p className="text-muted-foreground text-sm">
            Define qué cargos están abiertos a postulaciones. Solo los activos
            aparecen en la página pública.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={activeCount > 0 ? "default" : "outline"}>
            {activeCount} {activeCount === 1 ? "vacante activa" : "vacantes activas"}
          </Badge>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-lg border bg-muted/30 p-4 text-sm">
        <p className="text-muted-foreground">
          <strong className="text-foreground">¿Cómo funciona?</strong> Activa
          el switch de las posiciones que quieras publicar como vacantes.
          Edita el título, descripción y requisitos para que sean específicos
          al cargo. Las vacantes aparecerán en{" "}
          <a
            href="/trabaja-con-nosotros"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            la página pública
          </a>{" "}
          como cards visibles para los postulantes.
        </p>
      </div>

      {/* Grid de cargos */}
      {isLoading ? (
        <SkeletonRows count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {positions.map((p, index) => {
            const Icon = POSITION_ICONS[p.position as JobPosition];
            const label =
              p.title_custom?.trim() ||
              POSITION_LABELS[p.position as JobPosition];
            const fallbackDescription =
              POSITION_DESCRIPTIONS[p.position as JobPosition];

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`relative rounded-xl border bg-card overflow-hidden transition-all ${
                  p.is_hiring ? "shadow-sm" : "opacity-75"
                }`}
              >
                {/* Featured glow */}
                {p.is_hiring && p.is_featured && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(245,158,11,0.06), transparent 50%)",
                    }}
                  />
                )}

                <div className="p-5 relative">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        p.is_hiring
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="font-bold text-base leading-tight">
                          {label}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {p.is_featured && (
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          )}
                          {p.is_hiring ? (
                            <Badge className="bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400 hover:bg-green-500/20">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Activa
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Inactiva
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cargo: {POSITION_LABELS[p.position as JobPosition]}
                      </p>
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {p.description?.trim() || fallbackDescription}
                  </p>

                  {/* Requisitos (preview) */}
                  {p.requirements?.trim() && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-3 italic">
                      Requisitos definidos →
                    </p>
                  )}

                  {/* Acciones */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      variant={p.is_hiring ? "outline" : "default"}
                      onClick={() =>
                        toggleHiring.mutate({
                          id: p.id,
                          is_hiring: !p.is_hiring,
                        })
                      }
                      disabled={toggleHiring.isPending}
                      className="cursor-pointer"
                    >
                      {p.is_hiring ? "Desactivar" : "Activar vacante"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(p)}
                      className="cursor-pointer ml-auto"
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Editar
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal de edición */}
      <PositionEditModal
        open={!!editing}
        onClose={() => setEditing(null)}
        position={editing}
      />
    </div>
  );
}
