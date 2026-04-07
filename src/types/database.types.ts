export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          status: string
          worker_id: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          status?: string
          worker_id: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          status?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      cafe_settings: {
        Row: {
          about_description: string | null
          about_image_url: string | null
          about_title: string | null
          address: string | null
          cafe_name: string
          cover_url: string | null
          email: string | null
          facebook_url: string | null
          featured_product_ids: string[] | null
          gallery_urls: string[] | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          maps_embed_url: string | null
          monday_friday: string | null
          phone: string | null
          primary_color: string | null
          reservation_description: string | null
          reservation_title: string | null
          reservation_whatsapp: string | null
          saturday: string | null
          secondary_color: string | null
          show_promotions: boolean | null
          slogan: string | null
          sunday: string | null
          testimonials: Json | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          about_description?: string | null
          about_image_url?: string | null
          about_title?: string | null
          address?: string | null
          cafe_name?: string
          cover_url?: string | null
          email?: string | null
          facebook_url?: string | null
          featured_product_ids?: string[] | null
          gallery_urls?: string[] | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          maps_embed_url?: string | null
          monday_friday?: string | null
          phone?: string | null
          primary_color?: string | null
          reservation_description?: string | null
          reservation_title?: string | null
          reservation_whatsapp?: string | null
          saturday?: string | null
          secondary_color?: string | null
          show_promotions?: boolean | null
          slogan?: string | null
          sunday?: string | null
          testimonials?: Json | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          about_description?: string | null
          about_image_url?: string | null
          about_title?: string | null
          address?: string | null
          cafe_name?: string
          cover_url?: string | null
          email?: string | null
          facebook_url?: string | null
          featured_product_ids?: string[] | null
          gallery_urls?: string[] | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          maps_embed_url?: string | null
          monday_friday?: string | null
          phone?: string | null
          primary_color?: string | null
          reservation_description?: string | null
          reservation_title?: string | null
          reservation_whatsapp?: string | null
          saturday?: string | null
          secondary_color?: string | null
          show_promotions?: boolean | null
          slogan?: string | null
          sunday?: string | null
          testimonials?: Json | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      cash_register: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          closing_amount: number | null
          created_at: string
          date: string
          id: string
          notes: string | null
          opened_at: string
          opened_by: string | null
          opening_amount: number
          status: Database["public"]["Enums"]["cash_register_status"]
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          closing_amount?: number | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          opened_at?: string
          opened_by?: string | null
          opening_amount?: number
          status?: Database["public"]["Enums"]["cash_register_status"]
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          closing_amount?: number | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          opened_at?: string
          opened_by?: string | null
          opening_amount?: number
          status?: Database["public"]["Enums"]["cash_register_status"]
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          id: string
          new_stock: number
          previous_stock: number
          product_id: string
          quantity: number
          reason: string | null
          registered_by: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_stock?: number
          previous_stock?: number
          product_id: string
          quantity: number
          reason?: string | null
          registered_by?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          new_stock?: number
          previous_stock?: number
          product_id?: string
          quantity?: number
          reason?: string | null
          registered_by?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          discount_percentage: number | null
          discount_price: number | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          discount_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          discount_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          has_system_access: boolean
          id: string
          is_active: boolean
          must_change_password: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string
          has_system_access?: boolean
          id: string
          is_active?: boolean
          must_change_password?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          has_system_access?: boolean
          id?: string
          is_active?: boolean
          must_change_password?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          applies_to: string
          category_id: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          name: string
          product_id: string | null
          starts_at: string
          type: string
          updated_at: string
          value: number
        }
        Insert: {
          applies_to: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          product_id?: string | null
          starts_at?: string
          type: string
          updated_at?: string
          value?: number
        }
        Update: {
          applies_to?: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          product_id?: string | null
          starts_at?: string
          type?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          id: string
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
          sale_id: string
          subtotal: number
        }
        Insert: {
          id?: string
          product_id?: string | null
          product_name: string
          product_price: number
          quantity?: number
          sale_id: string
          subtotal: number
        }
        Update: {
          id?: string
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          sale_id?: string
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          cash_register_id: string | null
          created_at: string
          discount: number
          id: string
          notes: string | null
          payment_method: string
          sale_number: number | null
          seller_id: string | null
          total: number
        }
        Insert: {
          cash_register_id?: string | null
          created_at?: string
          discount?: number
          id?: string
          notes?: string | null
          payment_method?: string
          sale_number?: number | null
          seller_id?: string | null
          total?: number
        }
        Update: {
          cash_register_id?: string | null
          created_at?: string
          discount?: number
          id?: string
          notes?: string | null
          payment_method?: string
          sale_number?: number | null
          seller_id?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_register"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          created_at: string
          date: string
          end_time: string
          id: string
          notes: string | null
          start_time: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          id?: string
          notes?: string | null
          start_time: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          notes?: string | null
          start_time?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          business_address: string | null
          business_city: string | null
          business_email: string | null
          business_name: string | null
          business_nit: string | null
          business_phone: string | null
          currency_code: string | null
          currency_decimal_separator: string | null
          currency_symbol: string | null
          currency_thousands_separator: string | null
          id: string
          tax_enabled: boolean | null
          tax_included_in_price: boolean | null
          tax_name: string | null
          tax_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          business_address?: string | null
          business_city?: string | null
          business_email?: string | null
          business_name?: string | null
          business_nit?: string | null
          business_phone?: string | null
          currency_code?: string | null
          currency_decimal_separator?: string | null
          currency_symbol?: string | null
          currency_thousands_separator?: string | null
          id?: string
          tax_enabled?: boolean | null
          tax_included_in_price?: boolean | null
          tax_name?: string | null
          tax_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          business_address?: string | null
          business_city?: string | null
          business_email?: string | null
          business_name?: string | null
          business_nit?: string | null
          business_phone?: string | null
          currency_code?: string | null
          currency_decimal_separator?: string | null
          currency_symbol?: string | null
          currency_thousands_separator?: string | null
          id?: string
          tax_enabled?: boolean | null
          tax_included_in_price?: boolean | null
          tax_name?: string | null
          tax_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          cash_register_id: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          payment_method: string
          registered_by: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          cash_register_id?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string
          registered_by?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          cash_register_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string
          registered_by?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_register"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          module: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_permissions_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          address: string | null
          avatar_url: string | null
          base_salary: number
          birth_date: string | null
          commission_percentage: number
          created_at: string
          email: string
          full_name: string
          hire_date: string
          id: string
          notes: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["worker_status"]
          transport_allowance: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          base_salary?: number
          birth_date?: string | null
          commission_percentage?: number
          created_at?: string
          email: string
          full_name: string
          hire_date?: string
          id?: string
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["worker_status"]
          transport_allowance?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          base_salary?: number
          birth_date?: string | null
          commission_percentage?: number
          created_at?: string
          email?: string
          full_name?: string
          hire_date?: string
          id?: string
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["worker_status"]
          transport_allowance?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      product_stock: {
        Row: {
          category_id: string | null
          category_name: string | null
          image_url: string | null
          is_active: boolean | null
          last_movement: string | null
          product_id: string | null
          product_name: string | null
          stock: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_worker_account: {
        Args: {
          p_email: string
          p_password: string
          p_role: Database["public"]["Enums"]["app_role"]
          p_worker_id: string
        }
        Returns: string
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      delete_worker_account: { Args: { worker_id: string }; Returns: undefined }
      update_product_stock: {
        Args: {
          p_product_id: string
          p_quantity: number
          p_reason?: string
          p_type: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "gerente" | "cajero" | "barista"
      cash_register_status: "abierta" | "cerrada"
      transaction_type: "ingreso" | "egreso"
      worker_status: "activo" | "inactivo" | "vacaciones"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "gerente", "cajero", "barista"],
      cash_register_status: ["abierta", "cerrada"],
      transaction_type: ["ingreso", "egreso"],
      worker_status: ["activo", "inactivo", "vacaciones"],
    },
  },
} as const
