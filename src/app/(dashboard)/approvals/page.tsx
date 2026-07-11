"use client";

// Pending approvals — transaction classification screen.
// Flow: select row → pick partner (toggle) → Aprovar
// TODO: replace mock data + approve() with Supabase calls once schema is ready.

import { useState } from "react";

type PaymentMethod = "Manual" | "Link" | "Cartão";

interface PendingTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  paidWith: PaymentMethod;
  installments: number | null;
  cardLast4: string | null;
}

// TODO: pull from session / Supabase
const PARTNERS = ["Ana Souza", "Marcos Lima"] as const;
type Partner = (typeof PARTNERS)[number];

const MOCK: PendingTransaction[] = [
  { id: "1", date: "03/07", description: "Transferência recebida",       amount: 1200.00, paidWith: "Manual", installments: null, cardLast4: null   },
  { id: "2", date: "05/07", description: "Link de pagamento — consulta", amount: 480.00,  paidWith: "Link",   installments: 1,    cardLast4: null   },
  { id: "3", date: "06/07", description: "Pix recebido — procedimento",  amount: 2150.00, paidWith: "Manual", installments: null, cardLast4: null   },
  { id: "4", date: "08/07", description: "Cartão de crédito — retorno",  amount: 350.00,  paidWith: "Cartão", installments: 3,    cardLast4: "4821" },
  { id: "5", date: "09/07", description: "Depósito em conta",            amount: 4250.00, paidWith: "Manual", installments: null, cardLast4: null   },
];

const BADGE: Record<PaymentMethod, { bg: string; color: string }> = {
  Manual: { bg: "var(--pacific)", color: "var(--neptune)" },
  Link:   { bg: "var(--grape)",   color: "#3d3742"        },
  Cartão: { bg: "var(--cheviot)", color: "var(--text)"    },
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function ApprovalsPage() {
  const [rows, setRows]             = useState(MOCK);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  // partner assignment per row (id → Partner)
  const [assignments, setAssignments] = useState<Record<string, Partner>>({});

  const pendingCount = rows.length;
  const pendingTotal = rows.reduce((s, r) => s + r.amount, 0);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function setPartner(id: string, partner: Partner) {
    setAssignments((prev) => ({ ...prev, [id]: partner }));
    // selecting a partner also selects the row
    setSelected((prev) => new Set(prev).add(id));
  }

  // Approve all selected rows that have a partner assigned
  function approveSelected() {
    const toApprove = [...selected].filter((id) => assignments[id]);
    // TODO: persist to Supabase
    setRows((prev) => prev.filter((r) => !toApprove.includes(r.id)));
    setSelected(new Set());
    setAssignments((prev) => {
      const next = { ...prev };
      toApprove.forEach((id) => delete next[id]);
      return next;
    });
  }

  const readyCount   = [...selected].filter((id) => assignments[id]).length;
  const pendingPickCount = selected.size - readyCount;

  return (
    <div style={{ paddingBottom: selected.size > 0 ? 80 : 0 }}>
      {/* ── Header ── */}
      <h1 className="text-xl font-medium mb-1" style={{ color: "var(--midnight)" }}>
        Aprovações{" "}
        <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "var(--neptune)" }}>
          pendentes
        </em>
      </h1>
      <p className="text-sm mb-5" style={{ color: "var(--text-soft)" }}>
        Selecione uma transação, escolha a sócia e clique em Aprovar.
      </p>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 mb-6" style={{ maxWidth: 480 }}>
        <div className="rounded-xl p-4" style={{ background: "#fff", border: "0.5px solid var(--line)" }}>
          <div className="text-xs mb-1.5" style={{ color: "var(--text-soft)" }}>Transações pendentes</div>
          <div className="text-2xl font-bold" style={{ color: "var(--midnight)" }}>{pendingCount}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#fff", border: "0.5px solid var(--line)" }}>
          <div className="text-xs mb-1.5" style={{ color: "var(--text-soft)" }}>Valor aguardando aprovação</div>
          <div className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--neptune)" }}>
            <span className="inline-block rounded-full flex-shrink-0" style={{ width: 7, height: 7, background: "var(--isotonic)" }} />
            {fmt(pendingTotal)}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl overflow-x-auto" style={{ background: "#fff", border: "0.5px solid var(--line)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 740 }}>
          <thead>
            <tr style={{ background: "#fbfaf6", borderBottom: "0.5px solid var(--line)" }}>
              {/* checkbox col */}
              <th style={{ width: 44, padding: "10px 14px" }} />
              {["Data", "Valor da consulta", "Pago com", "Nº de parcelas", "Final do cartão", "Sócia"].map((col) => (
                <th
                  key={col}
                  style={{
                    textAlign: "left", fontSize: 11, textTransform: "uppercase",
                    letterSpacing: "0.04em", color: "var(--text-soft)",
                    fontWeight: 700, padding: "10px 14px",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "48px 14px", textAlign: "center", color: "var(--text-soft)" }}>
                  Nenhuma aprovação pendente.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const isSelected = selected.has(row.id);
              const badge = BADGE[row.paidWith];
              const assignedPartner = assignments[row.id] ?? null;

              return (
                <tr
                  key={row.id}
                  onClick={() => toggleRow(row.id)}
                  style={{
                    borderBottom: "0.5px solid var(--line)",
                    background: isSelected ? "rgba(0,34,51,0.03)" : "transparent",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                >
                  {/* Checkbox */}
                  <td style={{ padding: "12px 14px" }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(row.id)}
                      style={{ accentColor: "var(--midnight)", width: 15, height: 15, cursor: "pointer" }}
                    />
                  </td>

                  {/* Data */}
                  <td style={{ padding: "12px 14px", color: "var(--text-soft)" }}>{row.date}</td>

                  {/* Valor */}
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--midnight)" }}>{fmt(row.amount)}</td>

                  {/* Pago com */}
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: 11, padding: "4px 9px", borderRadius: 20, fontWeight: 500, background: badge.bg, color: badge.color, whiteSpace: "nowrap" }}>
                      {row.paidWith}
                    </span>
                  </td>

                  {/* Nº parcelas */}
                  <td style={{ padding: "12px 14px", color: "var(--text)" }}>
                    {row.installments != null ? `${row.installments}×` : "—"}
                  </td>

                  {/* Final do cartão */}
                  <td style={{ padding: "12px 14px", color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                    {row.cardLast4 ?? "—"}
                  </td>

                  {/* Sócia — partner toggle when row is selected */}
                  <td style={{ padding: "12px 14px" }} onClick={(e) => e.stopPropagation()}>
                    {isSelected ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        {PARTNERS.map((p) => {
                          const active = assignedPartner === p;
                          return (
                            <button
                              key={p}
                              onClick={() => setPartner(row.id, p)}
                              style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "5px 10px", borderRadius: 20, fontSize: 12,
                                fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                                border: active ? "1.5px solid var(--midnight)" : "0.5px solid var(--line)",
                                background: active ? "var(--midnight)" : "transparent",
                                color: active ? "var(--cheviot)" : "var(--text-soft)",
                                transition: "all 0.1s",
                              }}
                            >
                              <span style={{
                                width: 18, height: 18, borderRadius: "50%", fontSize: 9, fontWeight: 700,
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                background: active ? "rgba(246,242,232,0.2)" : "var(--midnight)",
                                color: active ? "var(--cheviot)" : "var(--cheviot)",
                              }}>
                                {initials(p)}
                              </span>
                              {p.split(" ")[0]}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-soft)", fontSize: 13 }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Sticky action bar — appears when rows are selected ── */}
      {selected.size > 0 && (
        <div
          style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            background: "var(--midnight)", borderRadius: 14,
            padding: "12px 20px", display: "flex", alignItems: "center", gap: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.25)", zIndex: 50, whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--pacific)" }}>
            {selected.size} {selected.size === 1 ? "transação selecionada" : "transações selecionadas"}
            {pendingPickCount > 0 && (
              <span style={{ color: "var(--text-soft)", marginLeft: 6 }}>
                · {pendingPickCount} sem sócia definida
              </span>
            )}
          </span>

          <button
            onClick={approveSelected}
            disabled={readyCount === 0}
            style={{
              background: readyCount > 0 ? "var(--isotonic)" : "rgba(221,255,85,0.3)",
              color: readyCount > 0 ? "var(--midnight)" : "rgba(0,34,51,0.4)",
              border: "none", borderRadius: 8, padding: "8px 16px",
              fontSize: 13, fontWeight: 600, cursor: readyCount > 0 ? "pointer" : "not-allowed",
              fontFamily: "inherit", transition: "all 0.1s",
            }}
          >
            Aprovar {readyCount > 0 ? `${readyCount}` : ""}
          </button>

          <button
            onClick={() => { setSelected(new Set()); }}
            style={{
              background: "transparent", color: "var(--text-soft)", border: "none",
              fontSize: 20, lineHeight: 1, cursor: "pointer", padding: "0 2px",
            }}
            aria-label="Cancelar seleção"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
