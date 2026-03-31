export type Role = "super_admin" | "gerente" | "cajero" | "barista";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
