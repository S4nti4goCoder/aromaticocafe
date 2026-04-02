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
  image_url: string | null;
}

export interface ProductStock {
  product_id: string;
  product_name: string;
  image_url: string | null;
  category_id: string | null;
  category_name: string | null;
  is_active: boolean;
  stock: number;
  last_movement: string | null;
}

export type WorkerStatus = "activo" | "inactivo" | "vacaciones";

export interface Worker {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: WorkerStatus;
  avatar_url: string | null;
  address: string | null;
  birth_date: string | null;
  hire_date: string;
  base_salary: number;
  transport_allowance: number;
  commission_percentage: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkerFormData {
  full_name: string;
  email: string;
  phone: string;
  role: Role;
  status: WorkerStatus;
  address: string;
  birth_date: string;
  hire_date: string;
  base_salary: string;
  transport_allowance: string;
  commission_percentage: string;
  notes: string;
  avatar_url: string | null;
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
  | "inventory"
  | "caja"
  | "workers"
  | "accounting"
  | "settings";

export type PromotionType =
  | "descuento_porcentaje"
  | "descuento_precio"
  | "2x1"
  | "precio_fijo";

export type PromotionAppliesTo = "producto" | "categoria" | "todos";

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  type: PromotionType;
  value: number;
  applies_to: PromotionAppliesTo;
  product_id: string | null;
  category_id: string | null;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
  category?: Category;
}

export interface PromotionFormData {
  name: string;
  description: string;
  type: PromotionType;
  value: string;
  applies_to: PromotionAppliesTo;
  product_id: string;
  category_id: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
}

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

export type TransactionType = "ingreso" | "egreso";
export type CashRegisterStatus = "abierta" | "cerrada";
export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia" | "otro";

export interface CashRegister {
  id: string;
  date: string;
  opened_by: string | null;
  closed_by: string | null;
  opening_amount: number;
  closing_amount: number | null;
  status: CashRegisterStatus;
  notes: string | null;
  opened_at: string;
  closed_at: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  cash_register_id: string | null;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  payment_method: PaymentMethod;
  registered_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: string;
  category: string;
  description: string;
  payment_method: PaymentMethod;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  sale_number: number | null;
  cash_register_id: string | null;
  seller_id: string | null;
  total: number;
  discount: number;
  payment_method: PaymentMethod;
  notes: string | null;
  created_at: string;
  items?: SaleItem[];
}

export interface CartItem {
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export type InventoryMovementType = "entrada" | "salida" | "ajuste";

export interface InventoryMovement {
  id: string;
  product_id: string;
  type: InventoryMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string | null;
  registered_by: string | null;
  created_at: string;
}

export interface CafeSettings {
  id: string;
  cafe_name: string;
  slogan: string | null;
  logo_url: string | null;
  cover_url: string | null;
  primary_color: string;
  secondary_color: string;
  facebook_url: string | null;
  instagram_url: string | null;
  whatsapp: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  monday_friday: string | null;
  saturday: string | null;
  sunday: string | null;
  featured_product_ids: string[];
  about_title: string | null;
  about_description: string | null;
  about_image_url: string | null;
  gallery_urls: string[];
  show_promotions: boolean;
  testimonials: {
    name: string;
    comment: string;
    rating: number;
  }[];
  maps_embed_url: string | null;
  reservation_title: string | null;
  reservation_description: string | null;
  reservation_whatsapp: string | null;
  updated_at: string;
}
