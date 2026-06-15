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
          about_kicker: string | null
          about_title: string | null
          address: string | null
          cafe_name: string
          categories_section_kicker: string | null
          categories_section_title: string | null
          contact_section_contact_subtitle: string | null
          contact_section_hours_subtitle: string | null
          contact_section_kicker: string | null
          contact_section_title: string | null
          cover_url: string | null
          custom_palettes: Json | null
          email: string | null
          facebook_url: string | null
          featured_product_ids: string[] | null
          featured_section_kicker: string | null
          featured_section_title: string | null
          gallery_urls: string[] | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          maps_embed_url: string | null
          monday_friday: string | null
          phone: string | null
          primary_color: string | null
          promotions_section_kicker: string | null
          promotions_section_title: string | null
          reservation_description: string | null
          reservation_title: string | null
          reservation_whatsapp: string | null
          saturday: string | null
          secondary_color: string | null
          show_about: boolean
          show_categories: boolean
          show_contact: boolean
          show_featured: boolean
          show_gallery: boolean
          show_menu_button: boolean
          show_promotions: boolean | null
          show_reserve_button: boolean
          show_testimonials: boolean
          show_whatsapp_float: boolean
          slogan: string | null
          store_section_autoplay: boolean
          store_section_cta_text: string | null
          store_section_kicker: string | null
          store_section_subtitle: string | null
          store_section_title: string | null
          sunday: string | null
          testimonials: Json | null
          theme_mode: string | null
          tiktok_url: string | null
          top_bar_action_target: string | null
          top_bar_action_type: string
          top_bar_enabled: boolean
          top_bar_message: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          about_description?: string | null
          about_image_url?: string | null
          about_kicker?: string | null
          about_title?: string | null
          address?: string | null
          cafe_name?: string
          categories_section_kicker?: string | null
          categories_section_title?: string | null
          contact_section_contact_subtitle?: string | null
          contact_section_hours_subtitle?: string | null
          contact_section_kicker?: string | null
          contact_section_title?: string | null
          cover_url?: string | null
          custom_palettes?: Json | null
          email?: string | null
          facebook_url?: string | null
          featured_product_ids?: string[] | null
          featured_section_kicker?: string | null
          featured_section_title?: string | null
          gallery_urls?: string[] | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          maps_embed_url?: string | null
          monday_friday?: string | null
          phone?: string | null
          primary_color?: string | null
          promotions_section_kicker?: string | null
          promotions_section_title?: string | null
          reservation_description?: string | null
          reservation_title?: string | null
          reservation_whatsapp?: string | null
          saturday?: string | null
          secondary_color?: string | null
          show_about?: boolean
          show_categories?: boolean
          show_contact?: boolean
          show_featured?: boolean
          show_gallery?: boolean
          show_menu_button?: boolean
          show_promotions?: boolean | null
          show_reserve_button?: boolean
          show_testimonials?: boolean
          show_whatsapp_float?: boolean
          slogan?: string | null
          store_section_autoplay?: boolean
          store_section_cta_text?: string | null
          store_section_kicker?: string | null
          store_section_subtitle?: string | null
          store_section_title?: string | null
          sunday?: string | null
          testimonials?: Json | null
          theme_mode?: string | null
          tiktok_url?: string | null
          top_bar_action_target?: string | null
          top_bar_action_type?: string
          top_bar_enabled?: boolean
          top_bar_message?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          about_description?: string | null
          about_image_url?: string | null
          about_kicker?: string | null
          about_title?: string | null
          address?: string | null
          cafe_name?: string
          categories_section_kicker?: string | null
          categories_section_title?: string | null
          contact_section_contact_subtitle?: string | null
          contact_section_hours_subtitle?: string | null
          contact_section_kicker?: string | null
          contact_section_title?: string | null
          cover_url?: string | null
          custom_palettes?: Json | null
          email?: string | null
          facebook_url?: string | null
          featured_product_ids?: string[] | null
          featured_section_kicker?: string | null
          featured_section_title?: string | null
          gallery_urls?: string[] | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          maps_embed_url?: string | null
          monday_friday?: string | null
          phone?: string | null
          primary_color?: string | null
          promotions_section_kicker?: string | null
          promotions_section_title?: string | null
          reservation_description?: string | null
          reservation_title?: string | null
          reservation_whatsapp?: string | null
          saturday?: string | null
          secondary_color?: string | null
          show_about?: boolean
          show_categories?: boolean
          show_contact?: boolean
          show_featured?: boolean
          show_gallery?: boolean
          show_menu_button?: boolean
          show_promotions?: boolean | null
          show_reserve_button?: boolean
          show_testimonials?: boolean
          show_whatsapp_float?: boolean
          slogan?: string | null
          store_section_autoplay?: boolean
          store_section_cta_text?: string | null
          store_section_kicker?: string | null
          store_section_subtitle?: string | null
          store_section_title?: string | null
          sunday?: string | null
          testimonials?: Json | null
          theme_mode?: string | null
          tiktok_url?: string | null
          top_bar_action_target?: string | null
          top_bar_action_type?: string
          top_bar_enabled?: boolean
          top_bar_message?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      cash_audit_log: {
        Row: {
          cash_register_id: string
          event_type: string
          id: string
          performed_at: string
          performed_by: string | null
          read_at: string | null
          reason: string | null
        }
        Insert: {
          cash_register_id: string
          event_type: string
          id?: string
          performed_at?: string
          performed_by?: string | null
          read_at?: string | null
          reason?: string | null
        }
        Update: {
          cash_register_id?: string
          event_type?: string
          id?: string
          performed_at?: string
          performed_by?: string | null
          read_at?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_audit_log_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_register"
            referencedColumns: ["id"]
          },
        ]
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
      customer_audit_log: {
        Row: {
          customer_id: string
          detail: string | null
          event_type: string
          id: string
          performed_at: string
          performed_by: string | null
        }
        Insert: {
          customer_id: string
          detail?: string | null
          event_type: string
          id?: string
          performed_at?: string
          performed_by?: string | null
        }
        Update: {
          customer_id?: string
          detail?: string | null
          event_type?: string
          id?: string
          performed_at?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_audit_log_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          id: string
          name: string | null
          name_search: string | null
          phone: string
          points: number
          stamps: number
          total_spent: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          name_search?: string | null
          phone: string
          points?: number
          stamps?: number
          total_spent?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          name_search?: string | null
          phone?: string
          points?: number
          stamps?: number
          total_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      hiring_positions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_featured: boolean
          is_hiring: boolean
          position: string
          requirements: string | null
          sort_order: number
          title_custom: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          is_hiring?: boolean
          position: string
          requirements?: string | null
          sort_order?: number
          title_custom?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          is_hiring?: boolean
          position?: string
          requirements?: string | null
          sort_order?: number
          title_custom?: string | null
          updated_at?: string
          updated_by?: string | null
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
      job_applications: {
        Row: {
          contacted_at: string | null
          contacted_by: string | null
          created_at: string
          decision_at: string | null
          decision_by: string | null
          email: string
          full_name: string
          id: string
          message: string | null
          notes: string | null
          phone: string
          position: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          contacted_at?: string | null
          contacted_by?: string | null
          created_at?: string
          decision_at?: string | null
          decision_by?: string | null
          email: string
          full_name: string
          id?: string
          message?: string | null
          notes?: string | null
          phone: string
          position: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          contacted_at?: string | null
          contacted_by?: string | null
          created_at?: string
          decision_at?: string | null
          decision_by?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          notes?: string | null
          phone?: string
          position?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_reads: {
        Row: {
          dismissed: boolean
          id: string
          notification_id: string
          read_at: string
          signature: string
          user_id: string
        }
        Insert: {
          dismissed?: boolean
          id?: string
          notification_id: string
          read_at?: string
          signature: string
          user_id: string
        }
        Update: {
          dismissed?: boolean
          id?: string
          notification_id?: string
          read_at?: string
          signature?: string
          user_id?: string
        }
        Relationships: []
      }
      product_costs: {
        Row: {
          cost: number
          product_id: string
          updated_at: string
        }
        Insert: {
          cost?: number
          product_id: string
          updated_at?: string
        }
        Update: {
          cost?: number
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_costs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "product_stock"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_costs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          deactivated_by_category: boolean
          deactivated_by_stock: boolean
          description: string | null
          discount_percentage: number | null
          discount_price: number | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          is_new: boolean
          min_stock: number
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          deactivated_by_category?: boolean
          deactivated_by_stock?: boolean
          description?: string | null
          discount_percentage?: number | null
          discount_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_new?: boolean
          min_stock?: number
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          deactivated_by_category?: boolean
          deactivated_by_stock?: boolean
          description?: string | null
          discount_percentage?: number | null
          discount_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_new?: boolean
          min_stock?: number
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
          is_featured: boolean
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
          is_featured?: boolean
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
          is_featured?: boolean
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
      purchase_items: {
        Row: {
          id: string
          previous_cost: number | null
          product_id: string | null
          product_name: string
          purchase_id: string
          quantity: number
          subtotal: number
          unit_cost: number
        }
        Insert: {
          id?: string
          previous_cost?: number | null
          product_id?: string | null
          product_name: string
          purchase_id: string
          quantity: number
          subtotal: number
          unit_cost: number
        }
        Update: {
          id?: string
          previous_cost?: number | null
          product_id?: string | null
          product_name?: string
          purchase_id?: string
          quantity?: number
          subtotal?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string
          id: string
          invoice_number: string | null
          is_voided: boolean
          notes: string | null
          payment_method: string
          purchase_date: string
          registered_by: string | null
          supplier_id: string | null
          total: number
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_number?: string | null
          is_voided?: boolean
          notes?: string | null
          payment_method?: string
          purchase_date?: string
          registered_by?: string | null
          supplier_id?: string | null
          total?: number
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invoice_number?: string | null
          is_voided?: boolean
          notes?: string | null
          payment_method?: string
          purchase_date?: string
          registered_by?: string | null
          supplier_id?: string | null
          total?: number
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          completed_by: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_name_search: string | null
          customer_phone: string
          id: string
          no_show_at: string | null
          no_show_by: string | null
          notes: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          status: string
          table_id: string | null
          updated_at: string
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_name_search?: string | null
          customer_phone: string
          id?: string
          no_show_at?: string | null
          no_show_by?: string | null
          notes?: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          status?: string
          table_id?: string | null
          updated_at?: string
        }
        Update: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_name_search?: string | null
          customer_phone?: string
          id?: string
          no_show_at?: string | null
          no_show_by?: string | null
          notes?: string | null
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          status?: string
          table_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          capacity: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          capacity: number
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_costs: {
        Row: {
          created_at: string
          sale_id: string
          total_cost: number
        }
        Insert: {
          created_at?: string
          sale_id: string
          total_cost?: number
        }
        Update: {
          created_at?: string
          sale_id?: string
          total_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_costs_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_costs_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales_with_status"
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
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales_with_status"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_refunds: {
        Row: {
          amount: number
          id: string
          quantity: number
          reason: string
          refunded_at: string
          refunded_by: string | null
          sale_id: string
          sale_item_id: string
        }
        Insert: {
          amount: number
          id?: string
          quantity: number
          reason: string
          refunded_at?: string
          refunded_by?: string | null
          sale_id: string
          sale_item_id: string
        }
        Update: {
          amount?: number
          id?: string
          quantity?: number
          reason?: string
          refunded_at?: string
          refunded_by?: string | null
          sale_id?: string
          sale_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_refunds_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_refunds_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales_with_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_refunds_sale_item_id_fkey"
            columns: ["sale_item_id"]
            isOneToOne: false
            referencedRelation: "sale_items"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          cash_register_id: string | null
          created_at: string
          customer_phone: string | null
          discount: number
          id: string
          is_voided: boolean
          loyalty_points_awarded: number | null
          loyalty_redeemed_mode: string | null
          loyalty_redeemed_value: number | null
          loyalty_stamps_awarded: number | null
          notes: string | null
          payment_method: string
          sale_number: number | null
          seller_id: string | null
          total: number
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          cash_register_id?: string | null
          created_at?: string
          customer_phone?: string | null
          discount?: number
          id?: string
          is_voided?: boolean
          loyalty_points_awarded?: number | null
          loyalty_redeemed_mode?: string | null
          loyalty_redeemed_value?: number | null
          loyalty_stamps_awarded?: number | null
          notes?: string | null
          payment_method?: string
          sale_number?: number | null
          seller_id?: string | null
          total?: number
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          cash_register_id?: string | null
          created_at?: string
          customer_phone?: string | null
          discount?: number
          id?: string
          is_voided?: boolean
          loyalty_points_awarded?: number | null
          loyalty_redeemed_mode?: string | null
          loyalty_redeemed_value?: number | null
          loyalty_stamps_awarded?: number | null
          notes?: string | null
          payment_method?: string
          sale_number?: number | null
          seller_id?: string | null
          total?: number
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
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
      suppliers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          nit: string | null
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          nit?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          nit?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          business_address: string | null
          business_city: string | null
          business_email: string | null
          business_hours: Json | null
          business_name: string | null
          business_nit: string | null
          business_phone: string | null
          cafe_name: string | null
          currency_code: string | null
          currency_decimal_separator: string | null
          currency_symbol: string | null
          currency_thousands_separator: string | null
          id: string
          logo_url: string | null
          loyalty_enabled: boolean | null
          loyalty_min_purchase: number | null
          loyalty_mode: string | null
          loyalty_points_per_thousand: number | null
          loyalty_points_redeem_min: number | null
          loyalty_points_value: number | null
          loyalty_reward: string | null
          loyalty_reward_max_value: number | null
          loyalty_reward_product_id: string | null
          loyalty_stamps_required: number | null
          reservation_slot_minutes: number
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
          business_hours?: Json | null
          business_name?: string | null
          business_nit?: string | null
          business_phone?: string | null
          cafe_name?: string | null
          currency_code?: string | null
          currency_decimal_separator?: string | null
          currency_symbol?: string | null
          currency_thousands_separator?: string | null
          id?: string
          logo_url?: string | null
          loyalty_enabled?: boolean | null
          loyalty_min_purchase?: number | null
          loyalty_mode?: string | null
          loyalty_points_per_thousand?: number | null
          loyalty_points_redeem_min?: number | null
          loyalty_points_value?: number | null
          loyalty_reward?: string | null
          loyalty_reward_max_value?: number | null
          loyalty_reward_product_id?: string | null
          loyalty_stamps_required?: number | null
          reservation_slot_minutes?: number
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
          business_hours?: Json | null
          business_name?: string | null
          business_nit?: string | null
          business_phone?: string | null
          cafe_name?: string | null
          currency_code?: string | null
          currency_decimal_separator?: string | null
          currency_symbol?: string | null
          currency_thousands_separator?: string | null
          id?: string
          logo_url?: string | null
          loyalty_enabled?: boolean | null
          loyalty_min_purchase?: number | null
          loyalty_mode?: string | null
          loyalty_points_per_thousand?: number | null
          loyalty_points_redeem_min?: number | null
          loyalty_points_value?: number | null
          loyalty_reward?: string | null
          loyalty_reward_max_value?: number | null
          loyalty_reward_product_id?: string | null
          loyalty_stamps_required?: number | null
          reservation_slot_minutes?: number
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
      zones: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      brand_settings: {
        Row: {
          cafe_name: string | null
          id: string | null
          logo_url: string | null
        }
        Insert: {
          cafe_name?: string | null
          id?: string | null
          logo_url?: string | null
        }
        Update: {
          cafe_name?: string | null
          id?: string | null
          logo_url?: string | null
        }
        Relationships: []
      }
      product_stock: {
        Row: {
          category_id: string | null
          category_name: string | null
          image_url: string | null
          is_active: boolean | null
          last_movement: string | null
          min_stock: number | null
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
      sales_with_status: {
        Row: {
          cash_register_id: string | null
          created_at: string | null
          customer_phone: string | null
          discount: number | null
          id: string | null
          is_voided: boolean | null
          loyalty_points_awarded: number | null
          loyalty_redeemed_mode: string | null
          loyalty_redeemed_value: number | null
          loyalty_stamps_awarded: number | null
          notes: string | null
          payment_method: string | null
          sale_number: number | null
          seller_id: string | null
          status: string | null
          total: number | null
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
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
    }
    Functions: {
      adjust_customer_loyalty: {
        Args: {
          p_id: string
          p_points: number
          p_reason: string
          p_stamps: number
        }
        Returns: {
          created_at: string
          id: string
          name: string | null
          name_search: string | null
          phone: string
          points: number
          stamps: number
          total_spent: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "customers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      anonymize_customer: {
        Args: { p_id: string; p_reason: string }
        Returns: undefined
      }
      assign_reservation_table: {
        Args: { p_id: string; p_table_id: string }
        Returns: undefined
      }
      available_tables: {
        Args: {
          p_date: string
          p_exclude_reservation_id?: string
          p_party_size: number
          p_time: string
        }
        Returns: {
          capacity: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          zone_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "restaurant_tables"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      cancel_reservation: {
        Args: { p_id: string; p_reason: string }
        Returns: undefined
      }
      close_cash_register: { Args: { payload: Json }; Returns: Json }
      complete_reservation: { Args: { p_id: string }; Returns: undefined }
      confirm_reservation: {
        Args: { p_id: string; p_table_id?: string }
        Returns: undefined
      }
      create_cash_register: { Args: { payload: Json }; Returns: Json }
      create_partial_refund: { Args: { payload: Json }; Returns: string }
      create_public_job_application: {
        Args: { payload: Json }
        Returns: string
      }
      create_public_reservation: { Args: { payload: Json }; Returns: string }
      create_purchase: { Args: { payload: Json }; Returns: Json }
      create_sale: { Args: { payload: Json }; Returns: Json }
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
      lookup_customer: {
        Args: { p_phone: string }
        Returns: {
          created_at: string
          id: string
          name: string | null
          name_search: string | null
          phone: string
          points: number
          stamps: number
          total_spent: number
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "customers"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      normalize_phone: { Args: { p: string }; Returns: string }
      noshow_reservation: { Args: { p_id: string }; Returns: undefined }
      reopen_cash_register: {
        Args: { p_id: string; p_reason: string }
        Returns: Json
      }
      save_customer_loyalty: {
        Args: {
          p_name: string
          p_phone: string
          p_points: number
          p_sale_total: number
          p_stamps: number
        }
        Returns: {
          created_at: string
          id: string
          name: string | null
          name_search: string | null
          phone: string
          points: number
          stamps: number
          total_spent: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "customers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      search_customers_for_pos: {
        Args: { q: string }
        Returns: {
          id: string
          name: string
          phone: string
          points: number
          stamps: number
        }[]
      }
      unassign_reservation_table: { Args: { p_id: string }; Returns: undefined }
      update_customer: {
        Args: { p_id: string; p_name: string; p_phone: string }
        Returns: {
          created_at: string
          id: string
          name: string | null
          name_search: string | null
          phone: string
          points: number
          stamps: number
          total_spent: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "customers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_product_stock: {
        Args: {
          p_product_id: string
          p_quantity: number
          p_reason?: string
          p_type: string
        }
        Returns: undefined
      }
      void_purchase: { Args: { payload: Json }; Returns: string }
      void_sale: { Args: { payload: Json }; Returns: string }
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
