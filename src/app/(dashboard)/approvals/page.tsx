"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Transaction {
  id: string;
  sale_date: string;
  gross_amount: number;
  product: string | null;
  installments: number;
  card_last4: string | null;
  capture_method: string | null;
}

interface Partner {
  id: string;
  name: string;
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function productBadge(product: string | null) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    Credito: { bg: "var(--pacific)", color: "var(--neptune)", label: "Crédito" },
    Debito:  { bg: "var(--grape)",   color: "#3d3742",        label: "Débito"  },
  };
  return map[product ?? ""] ?? { bg: "var(--cheviot)", color: "var(--text)", label: product ?? "—" };
}

export default function ApprovalsPage() {
  const supabase = createClient();

  const [rows, setRows]           = useState<Transaction[]>([]);
  const [partners, setPartners]   = useState<Partner[]>([]);
  const [myPartnerId, setMyPartnerId] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    async function load() {
      // Current user's partner_id
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: partner } = await supabase
          .from("partners")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();
        if (partner) setMyPartnerId(partner.id);
      }

      // All partners in this client (for the assignment toggle)
      const { data: partnerRows } = await supabase
        .from("partners")
        .select("id, name")
        .order("name");
      if (partnerRows) setPartners(partnerRows);

      // Pending transactions
      const { data: txRows } = await supabase
        .from("transactions")
        .select("id, sale_date, gross_amount, product, installments, card_last4, capture_method")
        .eq("approval_status", "pending")
        .order("sale_date", { ascending: false });
      if (txRows) setRows(txRows);

      setLoading(false);
    }
    load();
  }, []);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function assignPartner(txId: string, partnerId: string) {
    setAssignments((prev) => ({ ...prev, [txId]: partnerId }));
    setSelected((prev) => new Set(prev).add(txId));
  }

  async function approveSelected() {
    const toApprove = [...selected].filter((id) => assignments[id]);
    if (toApprove.length === 0) return;
    setSaving(true);

    await Promise.all(
      toApprove.map((id) =>
        supabase
          .from("transactions")
          .update({
            partner_id:      assignments[id],
            approval_status: "approved",
            approved_by:     myPartnerId,
            approved_at:     new Date().toISOString(),
          })
          .eq("id", id)
      )
    );

    setRows((prev) => prev.filter((r) => !toApprove.includes(r.id)));
    setSelected(new Set());
    setAssignments((prev) => {
      const next = { ...prev };
      toApprove.forEach((id) => delete next[id]);
      return next;
    });
    setSaving(false);
  }

  const pendingTotal  = rows.reduce((s, r) => s + r.gross_amount, 0);
  const readyCount    = [...selected].filter((id) => assignments[id]).length;
  const pendingPick   = selected.size - readyCount;

  if (loading) {
    return (
      <div style={{ color: "var(--text-soft)", paddingTop: 48, textAlign: "center" }}>
        Carregando…
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: selected.size > 0 ? 80 : 0 }}>
      {/* Header */}
      <h1 className="text-xl font-medium mb-1" style={{ color: "var(--midnight)" }}>
        Aprovações{" "}
        <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "var(--neptune)" }}>
          pendentes
        </em>
      </h1>
      <p className="text-sm mb-5" style={{ color: "var(--text-soft)" }}>
        Selecione uma transação, escolha a sócia e clique em Aprovar.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6" style={{ maxWidth: 480 }}>
        <div className="rounded-xl p-4" style={{ background: "#fff", border: "0.5px solid var(--line)" }}>
          <div className="text-xs mb-1.5" style={{ color: "var(--text-soft)" }}>Transações pendentes</div>
          <div className="text-2xl font-bold" style={{ color: "var(--midnight)" }}>{rows.length}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#fff", border: "0.5px solid var(--line)" }}>
          <div className="text-xs mb-1.5" style={{ color: "var(--text-soft)" }}>Valor aguardando aprovação</div>
          <div className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--neptune)" }}>
            <span className="inline-block rounded-full flex-shrink-0" style={{ width: 7, height: 7, background: "var(--isotonic)" }} />
            {fmt(pendingTotal)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-x-auto" style={{ background: "#fff", border: "0.5px solid var(--line)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 740 }}>
          <thead>
            <tr style={{ background: "#fbfaf6", borderBottom: "0.5px solid var(--line)" }}>
              <th style={{ width: 44, padding: "10px 14px" }} />
              {["Data", "Valor da consulta", "Pago com", "Nº de parcelas", "Final do cartão", "Sócia"].map((col) => (
                <th key={col} style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-soft)", fontWeight: 700, padding: "10px 14px" }}>
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
              const isSel = selected.has(row.id);
              const assignedId = assignments[row.id] ?? null;
              const badge = productBadge(row.product);

              return (
                <tr
                  key={row.id}
                  onClick={() => toggleRow(row.id)}
                  style={{ borderBottom: "0.5px solid var(--line)", background: isSel ? "rgba(0,34,51,0.03)" : "transparent", cursor: "pointer" }}
                >
                  <td style={{ padding: "12px 14px" }} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={isSel} onChange={() => toggleRow(row.id)}
                      style={{ accentColor: "var(--midnight)", width: 15, height: 15, cursor: "pointer" }} />
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text-soft)" }}>{formatDate(row.sale_date)}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--midnight)" }}>{fmt(row.gross_amount)}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: 11, padding: "4px 9px", borderRadius: 20, fontWeight: 500, background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text)" }}>
                    {row.installments > 1 ? `${row.installments}×` : "À vista"}
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                    {row.card_last4 ?? "—"}
                  </td>
                  <td style={{ padding: "12px 14px" }} onClick={(e) => e.stopPropagation()}>
                    {isSel ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        {partners.map((p) => {
                          const active = assignedId === p.id;
                          return (
                            <button key={p.id} onClick={() => assignPartner(row.id, p.id)}
                              style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.1s", border: active ? "1.5px solid var(--midnight)" : "0.5px solid var(--line)", background: active ? "var(--midnight)" : "transparent", color: active ? "var(--cheviot)" : "var(--text-soft)" }}>
                              <span style={{ width: 18, height: 18, borderRadius: "50%", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "var(--midnight)", color: "var(--cheviot)" }}>
                                {initials(p.name)}
                              </span>
                              {p.name.split(" ")[0]}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-soft)" }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sticky action bar */}
      {selected.size > 0 && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "var(--midnight)", borderRadius: 14, padding: "12px 20px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.25)", zIndex: 50, whiteSpace: "nowrap" }}>
          <span style={{ fontSize: 13, color: "var(--pacific)" }}>
            {selected.size} {selected.size === 1 ? "transação selecionada" : "transações selecionadas"}
            {pendingPick > 0 && <span style={{ color: "var(--text-soft)", marginLeft: 6 }}>· {pendingPick} sem sócia definida</span>}
          </span>
          <button onClick={approveSelected} disabled={readyCount === 0 || saving}
            style={{ background: readyCount > 0 ? "var(--isotonic)" : "rgba(221,255,85,0.3)", color: readyCount > 0 ? "var(--midnight)" : "rgba(0,34,51,0.4)", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: readyCount > 0 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
            {saving ? "Salvando…" : `Aprovar${readyCount > 0 ? ` ${readyCount}` : ""}`}
          </button>
          <button onClick={() => setSelected(new Set())}
            style={{ background: "transparent", color: "var(--text-soft)", border: "none", fontSize: 20, lineHeight: 1, cursor: "pointer", padding: "0 2px" }}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
