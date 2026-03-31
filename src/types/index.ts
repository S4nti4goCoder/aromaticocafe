export type Role = "super_admin" | "gerente" | "cajero" | "barista";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  is_active: boolean;
  must_change_password: boolean;
  has_system_access: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  discount_percentage: number | null;
  discount_price: number | null;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface CategoryFormData {
  name: string;
  description: string;
  is_active: boolean;
  image_url: string | null;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  discount_percentage: string;
  discount_price: string;
  category_id: string;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
}

export type WorkerStatus = "activo" | "inactivo" | "vacaciones";

export interface Worker {
  id: string
  user_id: string | null
  full_name: string
  email: string
  phone: string | null
  role: Role
  status: WorkerStatus
  avatar_url: string | null
  address: string | null
  birth_date: string | null
  hire_date: string
  base_salary: number
  transport_allowance: number
  commission_percentage: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WorkerFormData {
  full_name: string
  email: string
  phone: string
  role: Role
  status: WorkerStatus
  address: string
  birth_date: string
  hire_date: string
  base_salary: string
  transport_allowance: string
  commission_percentage: string
  notes: string
  avatar_url: string | null
}

export interface Shift {
  id: string;
  worker_id: string;
  date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  worker?: Worker;
}

export interface ShiftFormData {
  worker_id: string;
  date: string;
  start_time: string;
  end_time: string;
  notes: string;
}

export interface Attendance {
  id: string;
  worker_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: "presente" | "ausente" | "tardanza" | "permiso";
  notes: string | null;
  created_at: string;
  worker?: Worker;
}

export type PermissionModule =
  | "categories"
  | "products"
  | "workers"
  | "accounting"
  | "settings";

export interface WorkerPermission {
  id: string;
  worker_id: string;
  module: PermissionModule;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface PermissionsMap {
  [module: string]: {
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  };
}
