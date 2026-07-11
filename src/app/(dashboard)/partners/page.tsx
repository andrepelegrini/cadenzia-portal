// TODO: Partner payout view
// Shows breakdown of installments: what was received, what's queued,
// projected next payout date and amount.
// Data: installments + partners tables in Supabase via RLS.
// Note: with per-partner login, this shows ONLY the logged-in partner's data.

export default function PartnersPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Meu repasse</h1>
      <div
        className="rounded-xl p-8 shadow-sm flex items-center justify-center h-64"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <p style={{ color: "var(--text-soft)" }}>Em desenvolvimento</p>
      </div>
    </div>
  );
}
