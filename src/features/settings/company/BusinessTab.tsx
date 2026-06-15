import type { UseFormRegister } from "react-hook-form";
import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { CompanyFormData } from "@/features/settings/company/types";

// "Negocio" tab: fiscal/contact data fields.
export function BusinessTab({
  register,
}: {
  register: UseFormRegister<CompanyFormData>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Información del Negocio
        </CardTitle>
        <CardDescription>
          Datos fiscales y de contacto del negocio
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label>Nombre comercial</Label>
          <Input placeholder="Aromático Café" {...register("cafe_name")} />
          <p className="text-xs text-muted-foreground">
            Marca corta que se muestra en el panel admin, login y landing.
          </p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Razón social</Label>
          <Input
            placeholder="Aromático Café S.A.S"
            {...register("business_name")}
          />
          <p className="text-xs text-muted-foreground">
            Nombre legal/fiscal que aparece en facturas y recibos.
          </p>
        </div>
        <div className="space-y-2">
          <Label>NIT</Label>
          <Input placeholder="900.123.456-7" {...register("business_nit")} />
        </div>
        <div className="space-y-2">
          <Label>Ciudad</Label>
          <Input placeholder="Bogotá" {...register("business_city")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Dirección fiscal</Label>
          <Input
            placeholder="Calle 123 #45-67, Bogotá"
            {...register("business_address")}
          />
        </div>
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input placeholder="+57 1 234 5678" {...register("business_phone")} />
        </div>
        <div className="space-y-2">
          <Label>Correo electrónico</Label>
          <Input
            placeholder="admin@aromaticocafe.com"
            {...register("business_email")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
