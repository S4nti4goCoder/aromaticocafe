import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Lock,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  gerente: "Gerente",
  cajero: "Cajero",
  barista: "Barista",
};

const roleColors: Record<string, string> = {
  super_admin: "bg-purple-500/15 text-purple-500 border-purple-500/20",
  gerente: "bg-blue-500/15 text-blue-500 border-blue-500/20",
  cajero: "bg-green-500/15 text-green-500 border-green-500/20",
  barista: "bg-amber-500/15 text-amber-500 border-amber-500/20",
};

interface ProfileFormData {
  full_name: string;
  phone: string;
  address: string;
  avatar_url: string;
}

export function ProfilePage() {
  const { user } = useAuthStore();
  const { data: profile, isLoading } = useProfile();
  const queryClient = useQueryClient();

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const { register, handleSubmit, reset } = useForm<ProfileFormData>();

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        avatar_url: profile.avatar_url ?? "",
      });
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          avatar_url: avatarUrl || null,
        })
        .eq("id", user.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil actualizado correctamente");
    } catch {
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (error) throw error;
      toast.success("Contraseña actualizada correctamente");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch {
      toast.error("Error al cambiar la contraseña");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const initials = profile?.full_name
    ? profile.full_name.slice(0, 2).toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() ?? "AC");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl"
    >
      {/* Header del perfil */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt={profile?.full_name ?? ""} />
                <AvatarFallback className="text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {profile?.full_name || "Sin nombre"}
              </h2>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              {profile?.role && (
                <Badge
                  variant="outline"
                  className={`mt-2 ${roleColors[profile.role] ?? ""}`}
                >
                  {roleLabels[profile.role] ?? profile.role}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Información personal
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* INFORMACIÓN PERSONAL */}
        <TabsContent value="info">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Actualiza tu información de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Foto de perfil (URL)</Label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="https://ejemplo.com/foto.jpg"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="flex-1"
                    />
                    {avatarUrl && (
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    <User className="h-3.5 w-3.5 inline mr-1" />
                    Nombre completo
                  </Label>
                  <Input
                    id="full_name"
                    placeholder="Tu nombre completo"
                    {...register("full_name", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    <Mail className="h-3.5 w-3.5 inline mr-1" />
                    Correo electrónico
                  </Label>
                  <Input
                    value={user?.email ?? ""}
                    disabled
                    className="opacity-60"
                  />
                  <p className="text-xs text-muted-foreground">
                    El correo no se puede cambiar desde aquí
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>
                    <User className="h-3.5 w-3.5 inline mr-1" />
                    Rol en el sistema
                  </Label>
                  <Input
                    value={
                      roleLabels[profile?.role ?? ""] ?? profile?.role ?? ""
                    }
                    disabled
                    className="opacity-60"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar cambios
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* SEGURIDAD */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cambiar Contraseña
              </CardTitle>
              <CardDescription>
                Actualiza la contraseña de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite la nueva contraseña"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Indicador de fortaleza */}
              {passwordForm.newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordForm.newPassword.length >= level * 2
                            ? level <= 1
                              ? "bg-red-500"
                              : level <= 2
                                ? "bg-amber-500"
                                : level <= 3
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {passwordForm.newPassword.length < 4
                      ? "Muy débil"
                      : passwordForm.newPassword.length < 6
                        ? "Débil"
                        : passwordForm.newPassword.length < 8
                          ? "Moderada"
                          : "Fuerte"}
                  </p>
                </div>
              )}

              {/* Validación en tiempo real */}
              {passwordForm.confirmPassword && (
                <p
                  className={`text-xs ${
                    passwordForm.newPassword === passwordForm.confirmPassword
                      ? "text-green-500"
                      : "text-destructive"
                  }`}
                >
                  {passwordForm.newPassword === passwordForm.confirmPassword
                    ? "✓ Las contraseñas coinciden"
                    : "✗ Las contraseñas no coinciden"}
                </p>
              )}

              <Button
                onClick={handleChangePassword}
                disabled={
                  isChangingPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
                className="w-full"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cambiando...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Cambiar contraseña
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
