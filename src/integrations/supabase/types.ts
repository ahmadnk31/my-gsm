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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      accessories: {
        Row: {
          brand_id: string | null
          category_id: string | null
          compatibility: Json
          created_at: string
          description: string | null
          dimensions: Json
          features: Json
          id: string
          image_url: string | null
          images: Json
          is_active: boolean
          is_featured: boolean
          min_stock_level: number
          name: string
          original_price: number | null
          price: number
          rating: number
          review_count: number
          sku: string | null
          slug: string
          specifications: Json
          stock_quantity: number
          tags: Json
          updated_at: string
          warranty_months: number | null
          weight_grams: number | null
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          compatibility?: Json
          created_at?: string
          description?: string | null
          dimensions?: Json
          features?: Json
          id?: string
          image_url?: string | null
          images?: Json
          is_active?: boolean
          is_featured?: boolean
          min_stock_level?: number
          name: string
          original_price?: number | null
          price: number
          rating?: number
          review_count?: number
          sku?: string | null
          slug?: string
          specifications?: Json
          stock_quantity?: number
          tags?: Json
          updated_at?: string
          warranty_months?: number | null
          weight_grams?: number | null
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          compatibility?: Json
          created_at?: string
          description?: string | null
          dimensions?: Json
          features?: Json
          id?: string
          image_url?: string | null
          images?: Json
          is_active?: boolean
          is_featured?: boolean
          min_stock_level?: number
          name?: string
          original_price?: number | null
          price?: number
          rating?: number
          review_count?: number
          sku?: string | null
          slug?: string
          specifications?: Json
          stock_quantity?: number
          tags?: Json
          updated_at?: string
          warranty_months?: number | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "accessories_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "accessory_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accessories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "accessory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      accessory_brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      accessory_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      accessory_reviews: {
        Row: {
          accessory_id: string
          content: string | null
          created_at: string
          helpful_count: number
          id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
          verified_purchase: boolean
        }
        Insert: {
          accessory_id: string
          content?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
          verified_purchase?: boolean
        }
        Update: {
          accessory_id?: string
          content?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
          verified_purchase?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "accessory_reviews_accessory_id_fkey"
            columns: ["accessory_id"]
            isOneToOne: false
            referencedRelation: "accessories"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          actual_cost: number | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          device_model: string
          device_type: string
          estimated_cost: number | null
          id: string
          issue_description: string
          notes: string | null
          part_id: string | null
          preferred_date: string
          preferred_time: string
          quote_request_id: string | null
          quoted_price: number | null
          selected_quality_type: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_cost?: number | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          device_model: string
          device_type: string
          estimated_cost?: number | null
          id?: string
          issue_description: string
          notes?: string | null
          part_id?: string | null
          preferred_date: string
          preferred_time: string
          quote_request_id?: string | null
          quoted_price?: number | null
          selected_quality_type?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_cost?: number | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          device_model?: string
          device_type?: string
          estimated_cost?: number | null
          id?: string
          issue_description?: string
          notes?: string | null
          part_id?: string | null
          preferred_date?: string
          preferred_time?: string
          quote_request_id?: string | null
          quoted_price?: number | null
          selected_quality_type?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "device_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      device_brands: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_brands_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "device_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      device_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon_name: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_models: {
        Row: {
          brand_id: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          release_year: number | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          release_year?: number | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          release_year?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "device_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      device_parts: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          display_order: number | null
          estimated_duration: string | null
          id: string
          image_url: string | null
          is_active: boolean
          model_id: string
          name: string
          updated_at: string
          warranty_period: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          display_order?: number | null
          estimated_duration?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          model_id: string
          name: string
          updated_at?: string
          warranty_period?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          display_order?: number | null
          estimated_duration?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          model_id?: string
          name?: string
          updated_at?: string
          warranty_period?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_parts_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "device_models"
            referencedColumns: ["id"]
          },
        ]
      }
      part_pricing: {
        Row: {
          availability_status: string | null
          created_at: string
          id: string
          is_active: boolean
          labor_cost: number | null
          part_id: string
          price: number
          quality_description: string | null
          quality_type: string
          supplier: string | null
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          availability_status?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          labor_cost?: number | null
          part_id: string
          price: number
          quality_description?: string | null
          quality_type: string
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          availability_status?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          labor_cost?: number | null
          part_id?: string
          price?: number
          quality_description?: string | null
          quality_type?: string
          supplier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "part_pricing_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "device_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_items: {
        Row: {
          created_at: string
          description: string | null
          device_model: string
          device_type: string
          estimated_duration: string | null
          estimated_price: number | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          part_versions: Json | null
          parts_required: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          device_model: string
          device_type: string
          estimated_duration?: string | null
          estimated_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          part_versions?: Json | null
          parts_required?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          device_model?: string
          device_type?: string
          estimated_duration?: string | null
          estimated_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          part_versions?: Json | null
          parts_required?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          custom_device_info: string | null
          device_brand_id: string | null
          device_category_id: string | null
          device_model_id: string | null
          device_part_id: string | null
          expires_at: string | null
          id: string
          issue_description: string
          quote_notes: string | null
          quoted_price: number | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          custom_device_info?: string | null
          device_brand_id?: string | null
          device_category_id?: string | null
          device_model_id?: string | null
          device_part_id?: string | null
          expires_at?: string | null
          id?: string
          issue_description: string
          quote_notes?: string | null
          quoted_price?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          custom_device_info?: string | null
          device_brand_id?: string | null
          device_category_id?: string | null
          device_model_id?: string | null
          device_part_id?: string | null
          expires_at?: string | null
          id?: string
          issue_description?: string
          quote_notes?: string | null
          quoted_price?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_device_brand_id_fkey"
            columns: ["device_brand_id"]
            isOneToOne: false
            referencedRelation: "device_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_device_category_id_fkey"
            columns: ["device_category_id"]
            isOneToOne: false
            referencedRelation: "device_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_device_model_id_fkey"
            columns: ["device_model_id"]
            isOneToOne: false
            referencedRelation: "device_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_device_part_id_fkey"
            columns: ["device_part_id"]
            isOneToOne: false
            referencedRelation: "device_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          accessory_id: string
          created_at: string
          id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accessory_id: string
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accessory_id?: string
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_accessory_id_fkey"
            columns: ["accessory_id"]
            isOneToOne: false
            referencedRelation: "accessories"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          accessory_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          accessory_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          accessory_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_accessory_id_fkey"
            columns: ["accessory_id"]
            isOneToOne: false
            referencedRelation: "accessories"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          status: string
          payment_status: string
          payment_method: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal: number
          tax_amount: number
          shipping_amount: number
          total_amount: number
          currency: string
          shipping_address: Json | null
          billing_address: Json | null
          notes: string | null
          tracking_number: string | null
          shipped_at: string | null
          delivered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number?: string
          status?: string
          payment_status?: string
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal: number
          tax_amount?: number
          shipping_amount?: number
          total_amount: number
          currency?: string
          shipping_address?: Json | null
          billing_address?: Json | null
          notes?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          status?: string
          payment_status?: string
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          total_amount?: number
          currency?: string
          shipping_address?: Json | null
          billing_address?: Json | null
          notes?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          accessory_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          accessory_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          accessory_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_accessory_id_fkey"
            columns: ["accessory_id"]
            isOneToOne: false
            referencedRelation: "accessories"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          background_color: string
          button_link: string | null
          button_text: string | null
          created_at: string
          description: string
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          priority: number
          start_date: string | null
          subtitle: string | null
          text_color: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          background_color?: string
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          description: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          priority?: number
          start_date?: string | null
          subtitle?: string | null
          text_color?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          background_color?: string
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          priority?: number
          start_date?: string | null
          subtitle?: string | null
          text_color?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      create_order_from_cart: {
        Args: {
          p_user_id: string
          p_shipping_address: Json
          p_billing_address?: Json | null
          p_notes?: string | null
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "customer"
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
      app_role: ["admin", "customer"],
    },
  },
} as const

// Trade-in System Types
export interface TradeInModel {
  id: string;
  brand: string;
  model: string;
  storage_options: string[];
  release_date: string;
  original_price: number;
  base_trade_in_value: number;
  market_demand: number;
  supply_level: number;
  seasonal_factor: number;
  competitor_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TradeInRequest {
  id: string;
  user_id: string;
  model_id: string;
  storage_capacity: string;
  device_condition: string;
  estimated_value: number;
  final_value?: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  
  // Customer information
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  device_description?: string;
  
  // Additional details
  device_photos?: string[];
  serial_number?: string;
  imei?: string;
  
  // Processing details
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
  
  created_at: string;
  updated_at: string;
}

export interface TradeInPricingHistory {
  id: string;
  model_id: string;
  base_price: number;
  market_demand: number;
  supply_level: number;
  seasonal_factor: number;
  competitor_price: number;
  calculated_value: number;
  market_conditions: Record<string, any>;
  recorded_at: string;
}

export interface MarketCondition {
  id: string;
  condition_type: 'seasonal' | 'demand' | 'supply' | 'competitor';
  condition_value: number;
  affected_models: string[];
  start_date: string;
  end_date?: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TradeInRequestWithModel extends TradeInRequest {
  trade_in_model: TradeInModel;
  user?: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

export interface TradeInCalculationResult {
  basePrice: number;
  supplyDemandMultiplier: number;
  marketPositionMultiplier: number;
  seasonalMultiplier: number;
  storageValue: number;
  conditionMultiplier: number;
  supplyDemandRatio: number;
  marketPosition: number;
  finalValue: number;
  competitorPrice: number;
  marketDemand: number;
  supplyLevel: number;
  monthsSinceRelease: number;
}

