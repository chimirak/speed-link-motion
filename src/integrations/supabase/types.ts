export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string;
          contact_name: string;
          country: string;
          created_at: string;
          email: string | null;
          id: string;
          is_default: boolean;
          label: string | null;
          line1: string;
          line2: string | null;
          phone: string | null;
          postal_code: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          city: string;
          contact_name: string;
          country: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_default?: boolean;
          label?: string | null;
          line1: string;
          line2?: string | null;
          phone?: string | null;
          postal_code?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          city?: string;
          contact_name?: string;
          country?: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_default?: boolean;
          label?: string | null;
          line1?: string;
          line2?: string | null;
          phone?: string | null;
          postal_code?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          actor_email: string | null;
          action: string;
          actor_id: string | null;
          created_at: string;
          entity: string | null;
          entity_id: string | null;
          id: string;
          metadata: Json | null;
        };
        Insert: {
          actor_email?: string | null;
          action: string;
          actor_id?: string | null;
          created_at?: string;
          entity?: string | null;
          entity_id?: string | null;
          id?: string;
          metadata?: Json | null;
        };
        Update: {
          actor_email?: string | null;
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          entity?: string | null;
          entity_id?: string | null;
          id?: string;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      blog_categories: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          author_id: string | null;
          body: string | null;
          category_id: string | null;
          cover_image: string | null;
          created_at: string;
          excerpt: string | null;
          id: string;
          published: boolean;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          body?: string | null;
          category_id?: string | null;
          cover_image?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          published?: boolean;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          body?: string | null;
          category_id?: string | null;
          cover_image?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          published?: boolean;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "blog_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      flight_bookings: {
        Row: {
          currency: string;
          notes: string | null;
          quoted_amount: number | null;
          staff_notes: string | null;
          adults: number;
          cabin_class: string;
          children: number;
          contact_email: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          created_at: string;
          depart_date: string;
          destination: string;
          id: string;
          infants: number;
          origin: string;
          reference: string;
          return_date: string | null;
          status: string;
          trip_type: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          currency?: string;
          notes?: string | null;
          quoted_amount?: number | null;
          staff_notes?: string | null;
          adults?: number;
          cabin_class?: string;
          children?: number;
          contact_email?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          depart_date: string;
          destination: string;
          id?: string;
          infants?: number;
          origin: string;
          reference: string;
          return_date?: string | null;
          status?: string;
          trip_type?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          currency?: string;
          notes?: string | null;
          quoted_amount?: number | null;
          staff_notes?: string | null;
          adults?: number;
          cabin_class?: string;
          children?: number;
          contact_email?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          depart_date?: string;
          destination?: string;
          id?: string;
          infants?: number;
          origin?: string;
          reference?: string;
          return_date?: string | null;
          status?: string;
          trip_type?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      flight_passengers: {
        Row: {
          booking_id: string;
          created_at: string;
          date_of_birth: string | null;
          full_name: string;
          id: string;
          passenger_type: string;
          passport_number: string | null;
        };
        Insert: {
          booking_id: string;
          created_at?: string;
          date_of_birth?: string | null;
          full_name: string;
          id?: string;
          passenger_type?: string;
          passport_number?: string | null;
        };
        Update: {
          booking_id?: string;
          created_at?: string;
          date_of_birth?: string | null;
          full_name?: string;
          id?: string;
          passenger_type?: string;
          passport_number?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "flight_passengers_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "flight_bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      hero_slides: {
        Row: {
          active: boolean;
          copy: string | null;
          created_at: string;
          highlight: string | null;
          id: string;
          image_url: string | null;
          kicker: string | null;
          primary_label: string | null;
          primary_url: string | null;
          secondary_label: string | null;
          secondary_url: string | null;
          sort_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          copy?: string | null;
          created_at?: string;
          highlight?: string | null;
          id?: string;
          image_url?: string | null;
          kicker?: string | null;
          primary_label?: string | null;
          primary_url?: string | null;
          secondary_label?: string | null;
          secondary_url?: string | null;
          sort_order?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          copy?: string | null;
          created_at?: string;
          highlight?: string | null;
          id?: string;
          image_url?: string | null;
          kicker?: string | null;
          primary_label?: string | null;
          primary_url?: string | null;
          secondary_label?: string | null;
          secondary_url?: string | null;
          sort_order?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoice_items: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          invoice_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          invoice_id: string;
          quantity?: number;
          unit_price?: number;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          invoice_id?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
        ];
      };
      invoices: {
        Row: {
          notes: string | null;
          created_at: string;
          currency: string;
          due_at: string | null;
          id: string;
          invoice_number: string;
          issued_at: string | null;
          shipment_id: string | null;
          status: string;
          subtotal: number;
          tax: number;
          total: number;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          notes?: string | null;
          created_at?: string;
          currency?: string;
          due_at?: string | null;
          id?: string;
          invoice_number: string;
          issued_at?: string | null;
          shipment_id?: string | null;
          status?: string;
          subtotal?: number;
          tax?: number;
          total?: number;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          notes?: string | null;
          created_at?: string;
          currency?: string;
          due_at?: string | null;
          id?: string;
          invoice_number?: string;
          issued_at?: string | null;
          shipment_id?: string | null;
          status?: string;
          subtotal?: number;
          tax?: number;
          total?: number;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_shipment_id_fkey";
            columns: ["shipment_id"];
            isOneToOne: false;
            referencedRelation: "shipments";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          link: string | null;
          read: boolean;
          title: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          link?: string | null;
          read?: boolean;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          link?: string | null;
          read?: boolean;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          active: boolean;
          avatar_url: string | null;
          company: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      shipments: {
        Row: {
          internal_notes: string | null;
          created_at: string;
          current_location: string | null;
          declared_value: number | null;
          description: string | null;
          estimated_delivery: string | null;
          height_cm: number | null;
          id: string;
          length_cm: number | null;
          package_type: string | null;
          pickup_date: string | null;
          pickup_time: string | null;
          quantity: number;
          receiver_address: string | null;
          receiver_city: string | null;
          receiver_country: string | null;
          receiver_email: string | null;
          receiver_name: string;
          receiver_phone: string | null;
          receiver_postal_code: string | null;
          sender_address: string | null;
          sender_city: string | null;
          sender_country: string | null;
          sender_email: string | null;
          sender_name: string;
          sender_phone: string | null;
          sender_postal_code: string | null;
          service_type: string;
          special_instructions: string | null;
          status: Database["public"]["Enums"]["shipment_status"];
          tracking_number: string;
          updated_at: string;
          user_id: string | null;
          weight_kg: number | null;
          width_cm: number | null;
        };
        Insert: {
          internal_notes?: string | null;
          created_at?: string;
          current_location?: string | null;
          declared_value?: number | null;
          description?: string | null;
          estimated_delivery?: string | null;
          height_cm?: number | null;
          id?: string;
          length_cm?: number | null;
          package_type?: string | null;
          pickup_date?: string | null;
          pickup_time?: string | null;
          quantity?: number;
          receiver_address?: string | null;
          receiver_city?: string | null;
          receiver_country?: string | null;
          receiver_email?: string | null;
          receiver_name: string;
          receiver_phone?: string | null;
          receiver_postal_code?: string | null;
          sender_address?: string | null;
          sender_city?: string | null;
          sender_country?: string | null;
          sender_email?: string | null;
          sender_name: string;
          sender_phone?: string | null;
          sender_postal_code?: string | null;
          service_type?: string;
          special_instructions?: string | null;
          status?: Database["public"]["Enums"]["shipment_status"];
          tracking_number: string;
          updated_at?: string;
          user_id?: string | null;
          weight_kg?: number | null;
          width_cm?: number | null;
        };
        Update: {
          internal_notes?: string | null;
          created_at?: string;
          current_location?: string | null;
          declared_value?: number | null;
          description?: string | null;
          estimated_delivery?: string | null;
          height_cm?: number | null;
          id?: string;
          length_cm?: number | null;
          package_type?: string | null;
          pickup_date?: string | null;
          pickup_time?: string | null;
          quantity?: number;
          receiver_address?: string | null;
          receiver_city?: string | null;
          receiver_country?: string | null;
          receiver_email?: string | null;
          receiver_name?: string;
          receiver_phone?: string | null;
          receiver_postal_code?: string | null;
          sender_address?: string | null;
          sender_city?: string | null;
          sender_country?: string | null;
          sender_email?: string | null;
          sender_name?: string;
          sender_phone?: string | null;
          sender_postal_code?: string | null;
          service_type?: string;
          special_instructions?: string | null;
          status?: Database["public"]["Enums"]["shipment_status"];
          tracking_number?: string;
          updated_at?: string;
          user_id?: string | null;
          weight_kg?: number | null;
          width_cm?: number | null;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          is_public: boolean;
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          is_public?: boolean;
          key: string;
          updated_at?: string;
          value?: Json;
        };
        Update: {
          is_public?: boolean;
          key?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
      support_messages: {
        Row: {
          is_internal: boolean;
          body: string;
          created_at: string;
          id: string;
          sender_id: string | null;
          ticket_id: string;
        };
        Insert: {
          is_internal?: boolean;
          body: string;
          created_at?: string;
          id?: string;
          sender_id?: string | null;
          ticket_id: string;
        };
        Update: {
          is_internal?: boolean;
          body?: string;
          created_at?: string;
          id?: string;
          sender_id?: string | null;
          ticket_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "support_tickets";
            referencedColumns: ["id"];
          },
        ];
      };
      support_tickets: {
        Row: {
          assigned_to: string | null;
          created_at: string;
          id: string;
          priority: string;
          reference: string;
          status: string;
          subject: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          assigned_to?: string | null;
          created_at?: string;
          id?: string;
          priority?: string;
          reference: string;
          status?: string;
          subject: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          assigned_to?: string | null;
          created_at?: string;
          id?: string;
          priority?: string;
          reference?: string;
          status?: string;
          subject?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      tracking_events: {
        Row: {
          is_public: boolean;
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          latitude: number | null;
          location: string | null;
          longitude: number | null;
          occurred_at: string;
          shipment_id: string;
          status: Database["public"]["Enums"]["shipment_status"];
        };
        Insert: {
          is_public?: boolean;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          latitude?: number | null;
          location?: string | null;
          longitude?: number | null;
          occurred_at?: string;
          shipment_id: string;
          status: Database["public"]["Enums"]["shipment_status"];
        };
        Update: {
          is_public?: boolean;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          latitude?: number | null;
          location?: string | null;
          longitude?: number | null;
          occurred_at?: string;
          shipment_id?: string;
          status?: Database["public"]["Enums"]["shipment_status"];
        };
        Relationships: [
          {
            foreignKeyName: "tracking_events_shipment_id_fkey";
            columns: ["shipment_id"];
            isOneToOne: false;
            referencedRelation: "shipments";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          granted_by: string | null;
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          granted_by?: string | null;
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          granted_by?: string | null;
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      assign_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _target: string;
        };
        Returns: undefined;
      };
      has_permission: {
        Args: { _perm: string; _user_id: string };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_staff: { Args: { _user_id: string }; Returns: boolean };
      next_invoice_number: { Args: never; Returns: string };
      revoke_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _target: string;
        };
        Returns: undefined;
      };
      track_shipment: { Args: { _tracking_number: string }; Returns: Json };
      write_audit: {
        Args: {
          _action: string;
          _entity: string;
          _entity_id: string;
          _metadata?: Json;
        };
        Returns: undefined;
      };
    };
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "operations"
        | "support"
        | "content_manager"
        | "staff"
        | "customer";
      shipment_status:
        | "order_received"
        | "pickup_scheduled"
        | "picked_up"
        | "at_sorting_facility"
        | "in_transit"
        | "arrived_at_destination"
        | "out_for_delivery"
        | "delivered"
        | "delivery_attempted"
        | "on_hold"
        | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "operations",
        "support",
        "content_manager",
        "staff",
        "customer",
      ],
      shipment_status: [
        "order_received",
        "pickup_scheduled",
        "picked_up",
        "at_sorting_facility",
        "in_transit",
        "arrived_at_destination",
        "out_for_delivery",
        "delivered",
        "delivery_attempted",
        "on_hold",
        "cancelled",
      ],
    },
  },
} as const;
