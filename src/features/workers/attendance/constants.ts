// Visual config per attendance status (label + dot/badge colors).
export const statusConfig: Record<
  string,
  { label: string; dot: string; bg: string }
> = {
  presente: {
    label: "Presente",
    dot: "bg-green-500",
    bg: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  ausente: {
    label: "Ausente",
    dot: "bg-red-500",
    bg: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  tardanza: {
    label: "Tardanza",
    dot: "bg-amber-500",
    bg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  permiso: {
    label: "Permiso",
    dot: "bg-blue-500",
    bg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
};

// Quick-pick reasons offered when registering absences/permits.
export const ABSENCE_REASONS = [
  "Enfermedad",
  "Cita médica",
  "Calamidad doméstica",
  "Trámite personal",
  "Permiso autorizado",
  "Sin justificación",
];

// Quick-pick reasons offered when registering a tardanza.
export const TARDANZA_REASONS = [
  "Transporte público",
  "Problema de salud",
  "Tráfico",
  "Motivo personal",
  "Sin justificación",
];
