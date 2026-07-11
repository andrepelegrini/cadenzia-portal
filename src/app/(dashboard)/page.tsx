// TODO: Main overview/dashboard screen
// Planned content:
//   - Summary stat cards (revenue this month, pending approvals, next payout)
//   - Payout projection chart (Recharts)
//   - Recent transactions list
// Data source: Supabase — filtered by the logged-in partner's client_id + partner_id via RLS

export default function OverviewPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Visão geral</h1>

      {/* Placeholder stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Receita do mês", value: "—" },
          { label: "Aprovações pendentes", value: "—" },
          { label: "Próximo repasse", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--bg-card)" }}
          >
            <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "var(--text-soft)" }}>
              {card.label}
            </p>
            <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder chart area */}
      <div
        className="rounded-xl p-6 shadow-sm mb-8 h-64 flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <p style={{ color: "var(--text-soft)" }}>Gráfico de repasses — em breve</p>
      </div>
    </div>
  );
}
