export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          username: string | null;
          nama: string | null;
          bio: string | null;
          lokasi: string | null;
          pekerjaan: string | null;
          avatar_path: string | null;
          social_links: Json | null;
          custom_domains: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          username?: string | null;
          nama?: string | null;
          bio?: string | null;
          lokasi?: string | null;
          pekerjaan?: string | null;
          avatar_path?: string | null;
          social_links?: Json | null;
          custom_domains?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          username?: string | null;
          nama?: string | null;
          bio?: string | null;
          lokasi?: string | null;
          pekerjaan?: string | null;
          avatar_path?: string | null;
          social_links?: Json | null;
          custom_domains?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      user_themes: {
        Row: {
          id: string;
          user_id: string;
          preset: string | null;
          font_family: string | null;
          background: string | null;
          button_shape: string | null;
          button_color: string | null;
          button_radius: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          preset?: string | null;
          font_family?: string | null;
          background?: string | null;
          button_shape?: string | null;
          button_color?: string | null;
          button_radius?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          preset?: string | null;
          font_family?: string | null;
          background?: string | null;
          button_shape?: string | null;
          button_color?: string | null;
          button_radius?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      link_groups: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          ordering: number;
          is_active: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          ordering: number;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          ordering?: number;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      links: {
        Row: {
          id: string;
          user_id: string;
          group_id: string | null;
          title: string;
          url: string;
          description: string | null;
          icon_url: string | null;
          ordering: number;
          is_active: boolean;
          click_count: number;
          scheduled_publish_at: string | null;
          scheduled_unpublish_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          group_id?: string | null;
          title: string;
          url: string;
          description?: string | null;
          icon_url?: string | null;
          ordering: number;
          is_active?: boolean;
          click_count?: number;
          scheduled_publish_at?: string | null;
          scheduled_unpublish_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          group_id?: string | null;
          title?: string;
          url?: string;
          description?: string | null;
          icon_url?: string | null;
          ordering?: number;
          is_active?: boolean;
          click_count?: number;
          scheduled_publish_at?: string | null;
          scheduled_unpublish_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      link_clicks: {
        Row: {
          id: string;
          link_id: string;
          clicked_at: string;
          ip_address: string | null;
          user_agent: string | null;
          referrer: string | null;
          device_type: string | null;
          os_name: string | null;
          browser_name: string | null;
          country: string | null;
          session_id: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
        };
        Insert: {
          id?: string;
          link_id: string;
          clicked_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          device_type?: string | null;
          os_name?: string | null;
          browser_name?: string | null;
          country?: string | null;
          session_id?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
        };
        Update: {
          id?: string;
          link_id?: string;
          clicked_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          device_type?: string | null;
          os_name?: string | null;
          browser_name?: string | null;
          country?: string | null;
          session_id?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
        };
      };
      contact_form_submissions: {
        Row: {
          id: string;
          link_id: string;
          submitted_at: string;
          form_data: Json;
          ip_address: string | null;
          user_agent: string | null;
          referrer: string | null;
        };
        Insert: {
          id?: string;
          link_id: string;
          submitted_at?: string;
          form_data: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
        };
        Update: {
          id?: string;
          link_id?: string;
          submitted_at?: string;
          form_data?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
        };
      };
      bulk_import_jobs: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          file_name: string | null;
          total_records: number;
          processed_records: number;
          successful_records: number;
          failed_records: number;
          error_message: string | null;
          created_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          file_name?: string | null;
          total_records?: number;
          processed_records?: number;
          successful_records?: number;
          failed_records?: number;
          error_message?: string | null;
          created_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          file_name?: string | null;
          total_records?: number;
          processed_records?: number;
          successful_records?: number;
          failed_records?: number;
          error_message?: string | null;
          created_at?: string | null;
          completed_at?: string | null;
        };
      };
      bulk_import_records: {
        Row: {
          id: string;
          job_id: string;
          row_data: Json;
          status: string;
          error_message: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          job_id: string;
          row_data: Json;
          status?: string;
          error_message?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          job_id?: string;
          row_data?: Json;
          status?: string;
          error_message?: string | null;
          created_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};