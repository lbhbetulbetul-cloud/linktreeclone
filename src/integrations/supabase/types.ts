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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
