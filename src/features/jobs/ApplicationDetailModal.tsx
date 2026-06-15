import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Briefcase,
  MessageSquare,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  PhoneCall,
  UserCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  useUpdateJobApplicationStatus,
  useUpdateJobApplicationNotes,
} from "@/hooks/useJobApplications";
import type { JobApplication, JobApplicationStatus } from "@/types";

interface ApplicationDetailModalProps {
  open: boolean;
  onClose: () => void;
  application: JobApplication | null;
}

const POSITION_LABELS: Record<string, string> = {
  barista: "Barista",
  mesero: "Mesero / Mesera",
  cocina: "Cocina",
  caja: "Cajero / Cajera",
  gerencia: "Gerencia / Administración",
  otro: "Otro",
};

const STATUS_LABELS: Record<JobApplicationStatus, string> = {
  new: "Nueva",
  reviewed: "Revisada",
  contacted: "Contactada",
  hired: "Contratada",
  rejected: "Rechazada",
};

const STATUS_VARIANTS: Record<
  JobApplicationStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  new: "default",
  reviewed: "secondary",
  contacted: "secondary",
  hired: "default",
  rejected: "destructive",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ApplicationDetailModal({
  open,
  onClose,
  application,
}: ApplicationDetailModalProps) {
  const updateStatus = useUpdateJobApplicationStatus();
  const updateNotes = useUpdateJobApplicationNotes();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (application) setNotes(application.notes ?? "");
  }, [application]);

  if (!application) return null;

  const handleStatusChange = (status: JobApplicationStatus) => {
    updateStatus.mutate({ id: application.id, status });
  };

  const handleSaveNotes = () => {
    const trimmed = notes.trim();
    updateNotes.mutate({
      id: application.id,
      notes: trimmed.length > 0 ? trimmed : null,
    });
  };

  const notesDirty = (application.notes ?? "") !== notes;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-xl">
            {application.full_name}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant={STATUS_VARIANTS[application.status]}>
              {STATUS_LABELS[application.status]}
            </Badge>
            <DialogDescription className="m-0">
              Postulación recibida el {formatDate(application.created_at)}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Datos del postulante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
              <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Correo
                </p>
                <a
                  href={`mailto:${application.email}`}
                  className="text-sm break-all hover:underline"
                >
                  {application.email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
              <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Teléfono
                </p>
                <a
                  href={`tel:${application.phone}`}
                  className="text-sm hover:underline"
                >
                  {application.phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
              <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Cargo de interés
                </p>
                <p className="text-sm font-medium">
                  {POSITION_LABELS[application.position] ?? application.position}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Última actualización
                </p>
                <p className="text-sm">{formatDate(application.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Mensaje del postulante */}
          {application.message && (
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-3.5 w-3.5" />
                Mensaje del postulante
              </Label>
              <div className="p-4 rounded-lg border bg-muted/30 text-sm leading-relaxed whitespace-pre-wrap">
                {application.message}
              </div>
            </div>
          )}

          {/* Notas internas */}
          <div>
            <Label htmlFor="notes" className="mb-2">
              Notas internas (solo visibles para el equipo)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agrega observaciones, fecha de entrevista, decisión..."
              rows={4}
            />
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={!notesDirty || updateNotes.isPending}
              >
                {updateNotes.isPending ? "Guardando..." : "Guardar notas"}
              </Button>
            </div>
          </div>

          {/* Cambio de estado */}
          <div>
            <Label className="mb-3 block">Cambiar estado</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={application.status === "reviewed" ? "default" : "outline"}
                onClick={() => handleStatusChange("reviewed")}
                disabled={updateStatus.isPending}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Revisada
              </Button>
              <Button
                size="sm"
                variant={
                  application.status === "contacted" ? "default" : "outline"
                }
                onClick={() => handleStatusChange("contacted")}
                disabled={updateStatus.isPending}
              >
                <PhoneCall className="mr-1.5 h-3.5 w-3.5" />
                Contactada
              </Button>
              <Button
                size="sm"
                variant={application.status === "hired" ? "default" : "outline"}
                onClick={() => handleStatusChange("hired")}
                disabled={updateStatus.isPending}
                className={
                  application.status === "hired"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                Contratada
              </Button>
              <Button
                size="sm"
                variant={
                  application.status === "rejected" ? "destructive" : "outline"
                }
                onClick={() => handleStatusChange("rejected")}
                disabled={updateStatus.isPending}
              >
                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                Rechazada
              </Button>
              <Button
                size="sm"
                variant={application.status === "new" ? "default" : "ghost"}
                onClick={() => handleStatusChange("new")}
                disabled={updateStatus.isPending}
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Marcar como nueva
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
