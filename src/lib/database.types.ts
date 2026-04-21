export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  screentime: {
    Tables: {
      user_profiles: {
        Row: {
          user_id: string;
          email: string;
          full_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email: string;
          full_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string;
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organization_memberships: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: Database["screentime"]["Enums"]["organization_role"];
          status: Database["screentime"]["Enums"]["membership_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: Database["screentime"]["Enums"]["organization_role"];
          status?: Database["screentime"]["Enums"]["membership_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: Database["screentime"]["Enums"]["organization_role"];
          status?: Database["screentime"]["Enums"]["membership_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tracked_sessions: {
        Row: {
          id: string;
          organization_id: string;
          created_by: string;
          name: string;
          slug: string;
          description: string | null;
          age_group: string;
          max_participants: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          created_by: string;
          name: string;
          slug: string;
          description?: string | null;
          age_group?: string;
          max_participants?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          created_by?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          age_group?: string;
          max_participants?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      screen_time_entries: {
        Row: {
          id: string;
          tracked_session_id: string | null;
          session_id: string;
          screen_time_minutes: number;
          detected_os: Database["screentime"]["Enums"]["os_family"];
          ip_address: string | null;
          user_agent: string | null;
          submitted_at: string;
          entry_date: string;
        };
        Insert: {
          id?: string;
          tracked_session_id?: string | null;
          session_id: string;
          screen_time_minutes: number;
          detected_os?: Database["screentime"]["Enums"]["os_family"];
          ip_address?: string | null;
          user_agent?: string | null;
          submitted_at?: string;
          entry_date?: string;
        };
        Update: {
          id?: string;
          tracked_session_id?: string | null;
          session_id?: string;
          screen_time_minutes?: number;
          detected_os?: Database["screentime"]["Enums"]["os_family"];
          ip_address?: string | null;
          user_agent?: string | null;
          submitted_at?: string;
          entry_date?: string;
        };
        Relationships: [];
      };
      admin_profiles: {
        Row: {
          user_id: string;
          email: string;
          role: Database["screentime"]["Enums"]["admin_role"];
          status: Database["screentime"]["Enums"]["admin_status"];
          invited_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email: string;
          role?: Database["screentime"]["Enums"]["admin_role"];
          status?: Database["screentime"]["Enums"]["admin_status"];
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string;
          role?: Database["screentime"]["Enums"]["admin_role"];
          status?: Database["screentime"]["Enums"]["admin_status"];
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_audit_log: {
        Row: {
          id: number;
          actor_user_id: string | null;
          action: string;
          target_email: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          actor_user_id?: string | null;
          action: string;
          target_email?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: number;
          actor_user_id?: string | null;
          action?: string;
          target_email?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      latest_session_entries: {
        Row: {
          id: string;
          tracked_session_id: string | null;
          session_id: string;
          screen_time_minutes: number;
          detected_os: Database["screentime"]["Enums"]["os_family"];
          ip_address: string | null;
          user_agent: string | null;
          submitted_at: string;
          entry_date: string;
        };
        Insert: {
          id?: string;
          tracked_session_id?: string | null;
          session_id?: string;
          screen_time_minutes?: number;
          detected_os?: Database["screentime"]["Enums"]["os_family"];
          ip_address?: string | null;
          user_agent?: string | null;
          submitted_at?: string;
          entry_date?: string;
        };
        Update: {
          id?: string;
          tracked_session_id?: string | null;
          session_id?: string;
          screen_time_minutes?: number;
          detected_os?: Database["screentime"]["Enums"]["os_family"];
          ip_address?: string | null;
          user_agent?: string | null;
          submitted_at?: string;
          entry_date?: string;
        };
        Relationships: [];
      };
      os_statistics: {
        Row: {
          detected_os: Database["screentime"]["Enums"]["os_family"];
          participants: number;
          average_minutes: number;
          minimum_minutes: number;
          maximum_minutes: number;
        };
        Insert: {
          detected_os?: Database["screentime"]["Enums"]["os_family"];
          participants?: number;
          average_minutes?: number;
          minimum_minutes?: number;
          maximum_minutes?: number;
        };
        Update: {
          detected_os?: Database["screentime"]["Enums"]["os_family"];
          participants?: number;
          average_minutes?: number;
          minimum_minutes?: number;
          maximum_minutes?: number;
        };
        Relationships: [];
      };
      ip_statistics: {
        Row: {
          ip_address: string;
          submissions: number;
          last_seen: string;
          average_minutes: number;
        };
        Insert: {
          ip_address?: string;
          submissions?: number;
          last_seen?: string;
          average_minutes?: number;
        };
        Update: {
          ip_address?: string;
          submissions?: number;
          last_seen?: string;
          average_minutes?: number;
        };
        Relationships: [];
      };
      session_statistics: {
        Row: {
          id: string;
          organization_id: string;
          created_by: string;
          name: string;
          slug: string;
          description: string | null;
          age_group: string;
          max_participants: number;
          created_at: string;
          updated_at: string;
          submissions: number;
          average_minutes: number | null;
          last_submission_at: string | null;
          participants: number;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          created_by?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          age_group?: string;
          max_participants?: number;
          created_at?: string;
          updated_at?: string;
          submissions?: number;
          average_minutes?: number | null;
          last_submission_at?: string | null;
          participants?: number;
        };
        Update: {
          id?: string;
          organization_id?: string;
          created_by?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          age_group?: string;
          max_participants?: number;
          created_at?: string;
          updated_at?: string;
          submissions?: number;
          average_minutes?: number | null;
          last_submission_at?: string | null;
          participants?: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      bootstrap_admin: {
        Args: {
          target_email: string;
          target_role?: Database["screentime"]["Enums"]["admin_role"];
        };
        Returns: string;
      };
      is_admin: {
        Args: {
          check_user_id: string;
        };
        Returns: boolean;
      };
      set_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      os_family: "ios" | "android" | "windows" | "macos" | "linux" | "unknown";
      admin_role: "owner" | "admin";
      admin_status: "invited" | "active" | "disabled";
      organization_role: "owner" | "member";
      membership_status: "invited" | "active";
    };
    CompositeTypes: Record<string, never>;
  };
}
