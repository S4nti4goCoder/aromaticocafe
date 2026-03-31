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
