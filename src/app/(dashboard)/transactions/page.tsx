// TODO: Transaction history screen
// Planned: filterable/searchable list of all transactions for this partner,
// grouped or filterable by period (month picker), card terminal, status.
// Data: transactions table in Supabase via RLS.

export default function TransactionsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Transações</h1>
      <div
        className="rounded-xl p-8 shadow-sm flex items-center justify-center h-64"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <p style={{ color: "var(--text-soft)" }}>Em desenvolvimento</p>
      </div>
    </div>
  );
}
