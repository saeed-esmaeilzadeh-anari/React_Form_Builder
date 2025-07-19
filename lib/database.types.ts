export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          company: string | null
          website: string | null
          bio: string | null
          plan: "free" | "pro" | "enterprise"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          company?: string | null
          website?: string | null
          bio?: string | null
          plan?: "free" | "pro" | "enterprise"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          company?: string | null
          website?: string | null
          bio?: string | null
          plan?: "free" | "pro" | "enterprise"
          created_at?: string
          updated_at?: string
        }
      }
      forms: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          fields: Json
          settings: Json
          theme: "modern" | "classic" | "minimal" | "dark" | "colorful"
          is_published: boolean
          published_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          fields?: Json
          settings?: Json
          theme?: "modern" | "classic" | "minimal" | "dark" | "colorful"
          is_published?: boolean
          published_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          fields?: Json
          settings?: Json
          theme?: "modern" | "classic" | "minimal" | "dark" | "colorful"
          is_published?: boolean
          published_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      form_submissions: {
        Row: {
          id: string
          form_id: string
          data: Json
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          submitted_at: string
        }
        Insert: {
          id?: string
          form_id: string
          data: Json
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          submitted_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          data?: Json
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          submitted_at?: string
        }
      }
      form_analytics: {
        Row: {
          id: string
          form_id: string
          views: number
          submissions: number
          conversion_rate: number
          geographic_data: Json
          device_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          form_id: string
          views?: number
          submissions?: number
          conversion_rate?: number
          geographic_data?: Json
          device_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          views?: number
          submissions?: number
          conversion_rate?: number
          geographic_data?: Json
          device_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      form_events: {
        Row: {
          id: string
          form_id: string
          event_type: "view" | "submission" | "error"
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          form_id: string
          event_type: "view" | "submission" | "error"
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          event_type?: "view" | "submission" | "error"
          metadata?: Json
          created_at?: string
        }
      }
      form_collaborators: {
        Row: {
          id: string
          form_id: string
          user_id: string
          role: "viewer" | "editor" | "admin"
          invited_by: string | null
          invited_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          form_id: string
          user_id: string
          role?: "viewer" | "editor" | "admin"
          invited_by?: string | null
          invited_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          form_id?: string
          user_id?: string
          role?: "viewer" | "editor" | "admin"
          invited_by?: string | null
          invited_at?: string
          accepted_at?: string | null
        }
      }
      form_templates: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          fields: Json
          preview_url: string | null
          is_premium: boolean
          downloads: number
          rating: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          fields?: Json
          preview_url?: string | null
          is_premium?: boolean
          downloads?: number
          rating?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          fields?: Json
          preview_url?: string | null
          is_premium?: boolean
          downloads?: number
          rating?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_form_views: {
        Args: {
          form_id: string
        }
        Returns: undefined
      }
      increment_form_submissions: {
        Args: {
          form_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
