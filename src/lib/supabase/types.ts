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
      // clients: { Row: {...}; Insert: {...}; Update: {...} }
      // partners: { Row: {...}; Insert: {...}; Update: {...} }
      // transactions: { Row: {...}; Insert: {...}; Update: {...} }
      // installments: { Row: {...}; Insert: {...}; Update: {...} }
      // pending_approvals: { Row: {...}; Insert: {...}; Update: {...} }
      // bank_accounts: { Row: {...}; Insert: {...}; Update: {...} }
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
