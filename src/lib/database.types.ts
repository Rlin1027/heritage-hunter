export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      unclaimed_lands: {
        Row: {
          id: string;
          source_city: string;
          district: string;
          section: string | null;
          land_number: string;
          owner_name: string | null;
          area_m2: number | null;
          area_ping: number | null;
          status: string;
          coordinates: Json | null;
          raw_data: Json | null;
          source_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_city: string;
          district: string;
          section?: string | null;
          land_number: string;
          owner_name?: string | null;
          area_m2?: number | null;
          area_ping?: number | null;
          status?: string;
          coordinates?: Json | null;
          raw_data?: Json | null;
          source_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_city?: string;
          district?: string;
          section?: string | null;
          land_number?: string;
          owner_name?: string | null;
          area_m2?: number | null;
          area_ping?: number | null;
          status?: string;
          coordinates?: Json | null;
          raw_data?: Json | null;
          source_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      data_sources: {
        Row: {
          id: string;
          city: string;
          dataset_id: string | null;
          api_url: string | null;
          last_synced_at: string | null;
          record_count: number;
          status: string;
        };
        Insert: {
          id?: string;
          city: string;
          dataset_id?: string | null;
          api_url?: string | null;
          last_synced_at?: string | null;
          record_count?: number;
          status?: string;
        };
        Update: {
          id?: string;
          city?: string;
          dataset_id?: string | null;
          api_url?: string | null;
          last_synced_at?: string | null;
          record_count?: number;
          status?: string;
        };
        Relationships: [];
      };
      sync_logs: {
        Row: {
          id: string;
          source_city: string;
          started_at: string;
          completed_at: string | null;
          records_added: number;
          records_updated: number;
          status: string;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          source_city: string;
          started_at?: string;
          completed_at?: string | null;
          records_added?: number;
          records_updated?: number;
          status?: string;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          source_city?: string;
          started_at?: string;
          completed_at?: string | null;
          records_added?: number;
          records_updated?: number;
          status?: string;
          error_message?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for table operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
