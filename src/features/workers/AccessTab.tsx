import { useState } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  Shield,
  ShieldOff,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import type { Worker } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

interface AccessTabProps {
  worker: Worker;
}

function generatePassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%&*";
  const all = upper + lower + numbers + symbols;

  let password = "";
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = 4; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export function AccessTab({ worker }: AccessTabProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(worker.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const hasAccess = !!worker.user_id;

  const handleGeneratePassword = () => {
    setPassword(generatePassword());
    setShowPassword(true);
  };

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleCreateAccess = async () => {
    if (!email) {
      setMessage({
        type: "error",
        text: "El correo electrónico es requerido.",
      });
      return;
    }
    if (!password) {
      setMessage({ type: "error", text: "Genera una contraseña primero." });
      return;
    }

    setIsCreating(true);
    setMessage(null);

    // Guardar sesión actual del admin
    const {
      data: { session: adminSession },
    } = await supabase.auth.getSession();

    // Crear el nuevo usuario
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error || !data.user) {
      setMessage({
        type: "error",
        text: error?.message?.includes("already")
          ? "Ya existe una cuenta con ese correo."
          : "Error al crear la cuenta.",
      });
      setIsCreating(false);
      return;
    }

    // Restaurar sesión del admin inmediatamente
    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }

    // Crear perfil y vincular worker
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email,
      full_name: worker.full_name,
      role: worker.role,
      must_change_password: true,
      has_system_access: true,
    });

    await supabase
      .from("workers")
      .update({ user_id: data.user.id, email })
      .eq("id", worker.id);

    setMessage({
      type: "success",
      text: "¡Cuenta creada! Entrega las credenciales al trabajador.",
    });

    queryClient.invalidateQueries({ queryKey: ["workers"] });
    setIsCreating(false);
  };

  return (
    <div className="space-y-5">
      {/* Estado actual */}
      <div className="flex items-center gap-3 p-3 rounded-lg border">
        {hasAccess ? (
          <>
            <Shield className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Acceso al sistema activo</p>
              <p className="text-xs text-muted-foreground">{worker.email}</p>
            </div>
            <Badge className="ml-auto" variant="default">
              Activo
            </Badge>
          </>
        ) : (
          <>
            <ShieldOff className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Sin acceso al sistema</p>
              <p className="text-xs text-muted-foreground">
                Crea una cuenta para que pueda ingresar
              </p>
            </div>
            <Badge className="ml-auto" variant="secondary">
              Inactivo
            </Badge>
          </>
        )}
      </div>

      {!hasAccess && (
        <>
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="access-email">Correo electrónico *</Label>
            <div className="flex gap-2">
              <Input
                id="access-email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyEmail}
              >
                {copiedEmail ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label>Contraseña temporal *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={password}
                  readOnly
                  type={showPassword ? "text" : "password"}
                  placeholder="Genera una contraseña..."
                  className="pr-10 bg-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyPassword}
                disabled={!password}
              >
                {copiedPassword ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGeneratePassword}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Generar contraseña segura
            </Button>
          </div>

          {/* Mensaje */}
          {message && (
            <div
              className={`text-sm p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : message.type === "info"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "bg-destructive/10 text-destructive"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Botón crear */}
          <Button
            type="button"
            className="w-full"
            onClick={handleCreateAccess}
            disabled={isCreating || !email || !password}
          >
            {isCreating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Crear acceso al sistema
              </>
            )}
          </Button>
        </>
      )}

      {hasAccess && (
        <div className="text-center py-4 text-sm text-muted-foreground space-y-1">
          <p>Este trabajador ya tiene acceso al sistema.</p>
          <p>
            Email: <strong>{worker.email}</strong>
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        El trabajador deberá cambiar su contraseña al primer ingreso.
      </p>
    </div>
  );
}
