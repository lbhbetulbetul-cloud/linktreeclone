export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          theme: 'light' | 'dark' | 'auto'
          primary_color: string
          secondary_color: string
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          theme?: 'light' | 'dark' | 'auto'
          primary_color?: string
          secondary_color?: string
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          theme?: 'light' | 'dark' | 'auto'
          primary_color?: string
          secondary_color?: string
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string | null
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          name: string
          color?: string
          icon?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      links: {
        Row: {
          id: string
          user_id: string
          group_id: string | null
          title: string
          url: string
          deskripsi: string | null
          icon: string | null
          warna_tombol: string
          gaya_tombol: 'solid' | 'outline' | 'ghost'
          thumbnail_url: string | null
          preview_title: string | null
          preview_description: string | null
          preview_image: string | null
          share_twitter: boolean
          share_facebook: boolean
          share_linkedin: boolean
          share_whatsapp: boolean
          status: 'aktif' | 'draf'
          start_date: string | null
          end_date: string | null
          timezone: string
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          group_id?: string | null
          title: string
          url: string
          deskripsi?: string | null
          icon?: string | null
          warna_tombol?: string
          gaya_tombol?: 'solid' | 'outline' | 'ghost'
          thumbnail_url?: string | null
          preview_title?: string | null
          preview_description?: string | null
          preview_image?: string | null
          share_twitter?: boolean
          share_facebook?: boolean
          share_linkedin?: boolean
          share_whatsapp?: boolean
          status?: 'aktif' | 'draf'
          start_date?: string | null
          end_date?: string | null
          timezone?: string
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          group_id?: string | null
          title?: string
          url?: string
          deskripsi?: string | null
          icon?: string | null
          warna_tombol?: string
          gaya_tombol?: 'solid' | 'outline' | 'ghost'
          thumbnail_url?: string | null
          preview_title?: string | null
          preview_description?: string | null
          preview_image?: string | null
          share_twitter?: boolean
          share_facebook?: boolean
          share_linkedin?: boolean
          share_whatsapp?: boolean
          status?: 'aktif' | 'draf'
          start_date?: string | null
          end_date?: string | null
          timezone?: string
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {
      reorder_links: {
        Args: {
          p_user_id: string
          p_link_ids: string[]
        }
        Returns: {
          id: string
          order: number
        }[]
      }
      reorder_groups: {
        Args: {
          p_user_id: string
          p_group_ids: string[]
        }
        Returns: {
          id: string
          order: number
        }[]
      }
    }
  }
}
