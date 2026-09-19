/**
 * Supabase database type definitions.
 *
 * Once the schema is finalised, replace this stub with the generated output of:
 *   npx supabase gen types typescript --project-id <your-project-id>
 *
 * Or run `supabase gen types` locally if using the Supabase CLI.
 */

export type Database = {
  public: {
    Tables: {
      // TODO: fill in after schema design
      // installments: { Row: {...}; Insert: {...}; Update: {...} }
      // pending_approvals: { Row: {...}; Insert: {...}; Update: {...} }
      // bank_accounts: { Row: {...}; Insert: {...}; Update: {...} }
      transactions: {
        Row: {
          id: string;
          client_id: string;
          partner_id: string | null;
          terminal_id: string | null;
          stone_transaction_id: string;
          stonecode: string;
          sale_date: string;
          card_brand: string | null;
          product: string | null;
          installments: number;
          gross_amount: number;
          net_amount: number;
          mdr_discount: number;
          anticipation_discount: number;
          unified_discount: number;
          card_last4: string | null;
          card_masked: string | null;
          capture_method: string | null;
          serial_number: string | null;
          stone_status: string | null;
          stone_status_date: string | null;
          approval_status: "auto_approved" | "pending" | "approved" | "rejected";
          approved_by: string | null;
          approved_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          partner_id?: string | null;
          terminal_id?: string | null;
          stone_transaction_id: string;
          stonecode: string;
          sale_date: string;
          card_brand?: string | null;
          product?: string | null;
          installments?: number;
          gross_amount: number;
          net_amount: number;
          mdr_discount?: number;
          anticipation_discount?: number;
          unified_discount?: number;
          card_last4?: string | null;
          card_masked?: string | null;
          capture_method?: string | null;
          serial_number?: string | null;
          stone_status?: string | null;
          stone_status_date?: string | null;
          approval_status?: "auto_approved" | "pending" | "approved" | "rejected";
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          partner_id?: string | null;
          terminal_id?: string | null;
          stone_transaction_id?: string;
          stonecode?: string;
          sale_date?: string;
          card_brand?: string | null;
          product?: string | null;
          installments?: number;
          gross_amount?: number;
          net_amount?: number;
          mdr_discount?: number;
          anticipation_discount?: number;
          unified_discount?: number;
          card_last4?: string | null;
          card_masked?: string | null;
          capture_method?: string | null;
          serial_number?: string | null;
          stone_status?: string | null;
          stone_status_date?: string | null;
          approval_status?: "auto_approved" | "pending" | "approved" | "rejected";
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          name: string;
          cnpj: string | null;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cnpj?: string | null;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cnpj?: string | null;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      partners: {
        Row: {
          id: string;
          client_id: string;
          auth_user_id: string | null;
          name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          auth_user_id?: string | null;
          name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          auth_user_id?: string | null;
          name?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      pending_items: {
        Row: {
          id: string;
          client_id: string;
          created_by: string | null;
          kind: "personal" | "third_party";
          description: string;
          due_date: string | null;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          created_by?: string | null;
          kind: "personal" | "third_party";
          description: string;
          due_date?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          created_by?: string | null;
          kind?: "personal" | "third_party";
          description?: string;
          due_date?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
