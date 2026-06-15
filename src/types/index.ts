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
  phone?: string | null;
  address?: string | null;
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
  is_new: boolean;
  sort_order: number;
  min_stock: number;
  deactivated_by_category: boolean;
  deactivated_by_stock: boolean;
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
  cost: string;
  discount_percentage: string;
  discount_price: string;
  category_id: string;
  is_active: boolean;
  is_new: boolean;
  image_url: string | null;
  min_stock: string;
}

export interface ProductStock {
  product_id: string;
  product_name: string;
  image_url: string | null;
  category_id: string | null;
  category_name: string | null;
  is_active: boolean;
  min_stock: number;
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
  is_featured: boolean;
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
  is_featured: boolean;
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
  is_voided: boolean;
  void_reason: string | null;
  voided_at: string | null;
  voided_by: string | null;
  customer_phone: string | null;
  loyalty_stamps_awarded: number | null;
  loyalty_points_awarded: number | null;
  loyalty_redeemed_value: number | null;
  loyalty_redeemed_mode: "sellos" | "puntos" | null;
  items?: SaleItem[];
  refunds?: SaleRefund[];
}

export interface SaleRefund {
  id: string;
  sale_id: string;
  sale_item_id: string;
  quantity: number;
  amount: number;
  reason: string;
  refunded_by: string | null;
  refunded_at: string;
}

export type SaleStatus = "valida" | "devuelta_parcial" | "devuelta_total" | "anulada";

export interface CartItem {
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  notes?: string[];
}

export interface Customer {
  id: string;
  name: string | null;
  phone: string;
  stamps: number;
  points: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
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
  theme_mode: "dark" | "light";
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  whatsapp: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  contact_section_kicker: string | null;
  contact_section_title: string | null;
  contact_section_hours_subtitle: string | null;
  contact_section_contact_subtitle: string | null;
  monday_friday: string | null;
  saturday: string | null;
  sunday: string | null;
  featured_product_ids: string[];
  featured_section_kicker: string | null;
  featured_section_title: string | null;
  categories_section_kicker: string | null;
  categories_section_title: string | null;
  show_categories: boolean;
  promotions_section_kicker: string | null;
  promotions_section_title: string | null;
  store_section_kicker: string | null;
  store_section_title: string | null;
  store_section_subtitle: string | null;
  store_section_cta_text: string | null;
  store_section_autoplay: boolean;
  about_kicker: string | null;
  about_title: string | null;
  about_description: string | null;
  about_image_url: string | null;
  gallery_urls: string[];
  show_promotions: boolean;
  show_about: boolean;
  show_featured: boolean;
  show_gallery: boolean;
  show_contact: boolean;
  show_reserve_button: boolean;
  show_menu_button: boolean;
  show_whatsapp_float: boolean;
  top_bar_enabled: boolean;
  top_bar_message: string | null;
  top_bar_action_type: "none" | "section" | "modal" | "promotion";
  top_bar_action_target: string | null;
  maps_embed_url: string | null;
  reservation_title: string | null;
  reservation_description: string | null;
  reservation_whatsapp: string | null;
  custom_palettes: {
    name: string;
    primary: string;
    secondary: string;
    mode?: "dark" | "light";
  }[];
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  nit: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierFormData {
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  nit: string;
  address: string;
  notes: string;
  is_active: boolean;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_cost: number;
  subtotal: number;
  previous_cost: number | null;
}

export type PurchasePaymentMethod = "efectivo" | "transferencia" | "otro";

export interface Purchase {
  id: string;
  supplier_id: string | null;
  invoice_number: string | null;
  purchase_date: string;
  total: number;
  notes: string | null;
  payment_method: PurchasePaymentMethod;
  is_voided: boolean;
  void_reason: string | null;
  voided_at: string | null;
  voided_by: string | null;
  registered_by: string | null;
  created_at: string;
  supplier?: { id: string; name: string } | null;
}

export interface PurchaseLineInput {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
}

export type ReservationStatus =
  | "pendiente"
  | "confirmada"
  | "cancelada"
  | "completada"
  | "no_show";

export interface Reservation {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  reservation_date: string; // YYYY-MM-DD
  reservation_time: string; // HH:MM:SS
  party_size: number;
  notes: string | null;
  status: ReservationStatus;
  confirmed_at: string | null;
  confirmed_by: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancel_reason: string | null;
  completed_at: string | null;
  completed_by: string | null;
  no_show_at: string | null;
  no_show_by: string | null;
  table_id: string | null;
  table?: AssignedTable | null;
  created_at: string;
  updated_at: string;
}

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DayHours {
  open: string;  // "HH:MM"
  close: string; // "HH:MM"
}

export type BusinessHours = Record<DayKey, DayHours | null>;

export interface Zone {
  id: string;
  name: string;
  notes: string | null;
  created_at: string;
}

export interface RestaurantTable {
  id: string;
  name: string;
  capacity: number;
  zone_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Joined shape returned by useReservations when the reservation has a table. */
export interface AssignedTable {
  id: string;
  name: string;
  capacity: number;
  zone_id: string | null;
}

// ── Job applications (postulaciones laborales) ─────────────────────────
export type JobPosition =
  | "barista"
  | "mesero"
  | "cocina"
  | "caja"
  | "gerencia"
  | "otro";

export type JobApplicationStatus =
  | "new"
  | "reviewed"
  | "contacted"
  | "hired"
  | "rejected";

export interface JobApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: JobPosition;
  message: string | null;
  status: JobApplicationStatus;
  reviewed_at: string | null;
  reviewed_by: string | null;
  contacted_at: string | null;
  contacted_by: string | null;
  decision_at: string | null;
  decision_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload del formulario público — coincide con el RPC create_public_job_application. */
export interface JobApplicationFormData {
  full_name: string;
  email: string;
  phone: string;
  position: JobPosition;
  message?: string;
}

// ── Hiring positions (vacantes activas) ─────────────────────────────────
export interface HiringPosition {
  id: string;
  position: JobPosition;
  is_hiring: boolean;
  is_featured: boolean;
  title_custom: string | null;
  description: string | null;
  requirements: string | null;
  sort_order: number;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload para upsert desde el admin. */
export interface HiringPositionUpdate {
  is_hiring?: boolean;
  is_featured?: boolean;
  title_custom?: string | null;
  description?: string | null;
  requirements?: string | null;
  sort_order?: number;
}
