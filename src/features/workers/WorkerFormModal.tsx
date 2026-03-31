import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { PermissionsTab } from "@/features/workers/PermissionsTab";
import { AccessTab } from "@/features/workers/AccessTab";
import type { Worker, WorkerFormData } from "@/types";
import { useCreateWorker, useUpdateWorker } from "@/hooks/useWorkers";

interface WorkerFormModalProps {
  open: boolean;
  onClose: () => void;
  worker?: Worker | null;
}

const defaultValues: WorkerFormData = {
  full_name: "",
  email: "",
  phone: "",
  role: "barista",
  status: "activo",
  address: "",
  birth_date: "",
  hire_date: new Date().toISOString().split("T")[0],
  base_salary: "",
  transport_allowance: "",
  commission_percentage: "",
  notes: "",
  avatar_url: null,
};

const roleLabels = {
  super_admin: "Super Admin",
  gerente: "Gerente",
  cajero: "Cajero",
  barista: "Barista",
};

const statusLabels = {
  activo: "Activo",
  inactivo: "Inactivo",
  vacaciones: "Vacaciones",
};

export function WorkerFormModal({
  open,
  onClose,
  worker,
}: WorkerFormModalProps) {
  const isEditing = !!worker;
  const createWorker = useCreateWorker();
  const updateWorker = useUpdateWorker();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [createdWorker, setCreatedWorker] = useState<Worker | null>(null);

  const activeWorker = worker ?? createdWorker;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<WorkerFormData>({
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      if (worker) {
        reset({
          full_name: worker.full_name,
          email: worker.email,
          phone: worker.phone ?? "",
          role: worker.role,
          status: worker.status,
          address: worker.address ?? "",
          birth_date: worker.birth_date ?? "",
          hire_date: worker.hire_date,
          base_salary: worker.base_salary.toString(),
          transport_allowance: worker.transport_allowance.toString(),
          commission_percentage: worker.commission_percentage.toString(),
          notes: worker.notes ?? "",
          avatar_url: worker.avatar_url,
        });
        setAvatarUrl(worker.avatar_url);
      } else {
        reset(defaultValues);
        setAvatarUrl(null);
        setCreatedWorker(null);
        setActiveTab("info");
      }
    }
  }, [worker, open, reset]);

  const isPending = createWorker.isPending || updateWorker.isPending;
  const isCreated = !!createdWorker;
  const canAccessTabs = isEditing || isCreated;

  const onSubmit = async (data: WorkerFormData) => {
    const payload = { ...data, avatar_url: avatarUrl };

    if (isEditing && worker) {
      await updateWorker.mutateAsync({ id: worker.id, ...payload });
      onClose();
    } else {
      const newWorker = await createWorker.mutateAsync(payload);
      setCreatedWorker(newWorker);
      setActiveTab("permissions");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Editar trabajador"
              : isCreated
                ? "¡Trabajador creado!"
                : "Nuevo trabajador"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del trabajador."
              : isCreated
                ? "Ahora puedes configurar sus permisos y acceso al sistema."
                : "Completa los datos para registrar un nuevo trabajador."}
          </DialogDescription>
        </DialogHeader>

        {isCreated && !isEditing && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              Trabajador <strong>{createdWorker.full_name}</strong> creado
              correctamente.
            </span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">
              Información
            </TabsTrigger>
            <TabsTrigger value="job" className="flex-1">
              Cargo
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="flex-1"
              disabled={!canAccessTabs}
            >
              Permisos
            </TabsTrigger>
            <TabsTrigger
              value="access"
              className="flex-1"
              disabled={!canAccessTabs}
            >
              Acceso
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* TAB INFO */}
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Foto</Label>
                <ImageUpload
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  folder="workers"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="full_name">Nombre completo *</Label>
                  <Input
                    id="full_name"
                    placeholder="Ej: Juan Pérez"
                    disabled={isCreated}
                    {...register("full_name", {
                      required: "El nombre es requerido",
                    })}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-destructive">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    placeholder="+57 300 000 0000"
                    disabled={isCreated}
                    {...register("phone")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Fecha de nacimiento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    disabled={isCreated}
                    {...register("birth_date")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  placeholder="Calle 123 # 45-67"
                  disabled={isCreated}
                  {...register("address")}
                />
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isPending}
                >
                  {isCreated ? "Cerrar" : "Cancelar"}
                </Button>
                {!isCreated && (
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => setActiveTab("job")}
                  >
                    Siguiente →
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* TAB CARGO */}
            <TabsContent value="job" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Rol *</Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isCreated}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isCreated}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {Object.entries(statusLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date">Fecha de contratación *</Label>
                <Input
                  id="hire_date"
                  type="date"
                  disabled={isCreated}
                  {...register("hire_date", {
                    required: "La fecha es requerida",
                  })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="base_salary">Salario base</Label>
                  <Input
                    id="base_salary"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    disabled={isCreated}
                    {...register("base_salary")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transport_allowance">
                    Auxilio transporte
                  </Label>
                  <Input
                    id="transport_allowance"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    disabled={isCreated}
                    {...register("transport_allowance")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission_percentage">Comisión %</Label>
                  <Input
                    id="commission_percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0"
                    disabled={isCreated}
                    {...register("commission_percentage")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas internas</Label>
                <Textarea
                  id="notes"
                  placeholder="Observaciones..."
                  rows={3}
                  disabled={isCreated}
                  {...register("notes")}
                />
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => (isCreated ? onClose : setActiveTab("info"))}
                  disabled={isPending}
                >
                  {isCreated ? "Cerrar" : "← Atrás"}
                </Button>
                {!isCreated && (
                  <Button type="submit" className="flex-1" disabled={isPending}>
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditing ? "Guardar cambios" : "Crear y configurar →"}
                  </Button>
                )}
              </div>
            </TabsContent>
          </form>

          {/* TAB PERMISOS */}
          <TabsContent value="permissions" className="mt-4">
            {activeWorker && (
              <>
                <PermissionsTab
                  workerId={activeWorker.id}
                  workerRole={activeWorker.role}
                />
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                  >
                    {isEditing ? "Cerrar" : "Finalizar"}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => setActiveTab("access")}
                  >
                    Configurar acceso →
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* TAB ACCESO */}
          <TabsContent value="access" className="mt-4">
            {activeWorker && (
              <>
                <AccessTab worker={activeWorker} />
                <div className="mt-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onClose}
                  >
                    {isEditing ? "Cerrar" : "Finalizar"}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
