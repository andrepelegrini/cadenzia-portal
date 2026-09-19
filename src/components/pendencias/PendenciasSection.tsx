"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Kind = "personal" | "third_party";

interface PendingItem {
  id: string;
  kind: Kind;
  description: string;
  due_date: string | null;
  completed: boolean;
}

const BOARD_META: Record<Kind, { title: string; addLabel: string }> = {
  personal:     { title: "Pendências pessoais",    addLabel: "+ Nova pendência pessoal" },
  third_party:  { title: "Pendências de terceiros", addLabel: "+ Nova pendência de terceiros" },
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function dueChip(item: PendingItem): { label: string; tone: "overdue" | "soon" | "neutral" } | null {
  if (!item.due_date) return null;
  const today = todayISO();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  if (item.completed) return { label: formatDate(item.due_date), tone: "neutral" };
  if (item.due_date < today) return { label: `Atrasado · ${formatDate(item.due_date)}`, tone: "overdue" };
  if (item.due_date === today) return { label: `Hoje · ${formatDate(item.due_date)}`, tone: "soon" };
  if (item.due_date === tomorrow) return { label: `Amanhã · ${formatDate(item.due_date)}`, tone: "soon" };
  return { label: `Prazo ${formatDate(item.due_date)}`, tone: "neutral" };
}

const chipStyles: Record<string, React.CSSProperties> = {
  overdue: { color: "#C4453B", background: "#FBEAE8" },
  soon:    { color: "#B8842E", background: "#FBF1DF" },
  neutral: { color: "var(--text-soft)", background: "var(--cheviot)" },
};

export default function PendenciasSection() {
  const supabase = createClient();

  const [items, setItems]           = useState<PendingItem[]>([]);
  const [clientId, setClientId]     = useState<string | null>(null);
  const [partnerId, setPartnerId]   = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  const [description, setDescription] = useState("");
  const [kind, setKind]               = useState<Kind>("personal");
  const [dueDate, setDueDate]         = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: partner } = await supabase
        .from("partners")
        .select("id, client_id")
        .eq("auth_user_id", user.id)
        .single();

      if (!partner) { setLoading(false); return; }
      setPartnerId(partner.id);
      setClientId(partner.client_id);

      const { data: rows } = await supabase
        .from("pending_items")
        .select("id, kind, description, due_date, completed")
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });

      if (rows) setItems(rows);
      setLoading(false);
    }
    load();
  }, []);

  async function addItem() {
    const text = description.trim();
    if (!text || !clientId || saving) return;

    setSaving(true);
    const { data, error } = await supabase
      .from("pending_items")
      .insert({
        client_id:   clientId,
        created_by:  partnerId,
        kind,
        description: text,
        due_date:    dueDate || null,
      })
      .select("id, kind, description, due_date, completed")
      .single();

    if (!error && data) {
      setItems((prev) => [...prev, data]);
      setDescription("");
      setDueDate("");
    }
    setSaving(false);
  }

  async function toggleComplete(item: PendingItem) {
    const completed = !item.completed;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, completed } : i)));

    await supabase
      .from("pending_items")
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq("id", item.id);
  }

  if (loading) return null;

  const boards: Kind[] = ["personal", "third_party"];

  return (
    <div className="mb-10">
      {/* Capture bar */}
      <div
        className="flex flex-wrap items-end gap-3.5 mb-6 rounded-2xl"
        style={{ background: "#fff", border: "1px solid var(--line)", padding: "18px 20px" }}
      >
        <div className="flex flex-col gap-1.5" style={{ flex: "1 1 280px", minWidth: 220 }}>
          <label htmlFor="pending-desc" className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-soft)" }}>
            Pendência
          </label>
          <input
            id="pending-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Ex: Cobrar Maria pela consulta de terça"
            className="text-sm rounded-lg outline-none"
            style={{ border: "1px solid var(--line)", padding: "10px 12px", background: "var(--cheviot)", color: "var(--text)" }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-soft)" }}>
            Classificação
          </span>
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--line)" }}>
            {boards.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className="text-sm font-semibold"
                style={{
                  padding:    "10px 14px",
                  background: kind === k ? "var(--midnight)" : "var(--cheviot)",
                  color:      kind === k ? "var(--pacific)" : "var(--text-soft)",
                  borderLeft: k === "third_party" ? "1px solid var(--line)" : "none",
                }}
              >
                {k === "personal" ? "Pessoal" : "Terceiros"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="pending-date" className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-soft)" }}>
            Prazo
          </label>
          <input
            id="pending-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="text-sm rounded-lg outline-none"
            style={{ border: "1px solid var(--line)", padding: "10px 12px", background: "var(--cheviot)", color: "var(--text)" }}
          />
        </div>

        <button
          type="button"
          onClick={addItem}
          disabled={!description.trim() || saving}
          className="text-sm font-bold rounded-lg whitespace-nowrap"
          style={{
            background: "var(--isotonic)",
            color:      "var(--midnight)",
            padding:    "11px 20px",
            opacity:    !description.trim() || saving ? 0.5 : 1,
            cursor:     !description.trim() || saving ? "default" : "pointer",
          }}
        >
          + Adicionar
        </button>
      </div>

      {/* Boards */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        {boards.map((k) => {
          const boardItems = items.filter((i) => i.kind === k);
          const openCount = boardItems.filter((i) => !i.completed).length;

          return (
            <div key={k} className="relative rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--line)", padding: "22px 22px 10px" }}>
              <span
                style={{
                  position: "absolute", left: 0, top: 20, bottom: 20, width: 3,
                  borderRadius: "0 3px 3px 0", background: "var(--isotonic)",
                }}
              />
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-base font-extrabold" style={{ color: "var(--midnight)", letterSpacing: "-0.01em" }}>
                  {BOARD_META[k].title}
                </h3>
                <span
                  className="text-xs font-bold rounded-full"
                  style={{ color: "var(--neptune)", background: "var(--cheviot)", padding: "3px 10px" }}
                >
                  {openCount}
                </span>
              </div>

              {boardItems.length === 0 && (
                <p className="text-sm py-3" style={{ color: "var(--text-soft)" }}>
                  Nenhuma pendência por aqui.
                </p>
              )}

              {boardItems.map((item, idx) => {
                const chip = dueChip(item);
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 py-3"
                    style={{ borderTop: idx === 0 ? "none" : "1px solid var(--line)" }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleComplete(item)}
                      aria-label={item.completed ? "Marcar como pendente" : "Marcar como concluída"}
                      className="rounded-full flex-none"
                      style={{
                        width: 18, height: 18, marginTop: 1, cursor: "pointer",
                        border: item.completed ? "none" : "1.5px solid var(--grape)",
                        background: item.completed ? "var(--midnight)" : "#fff",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm mb-1"
                        style={{
                          color: item.completed ? "var(--text-soft)" : "var(--text)",
                          textDecoration: item.completed ? "line-through" : "none",
                          lineHeight: 1.4,
                        }}
                      >
                        {item.description}
                      </div>
                      {chip && (
                        <span
                          className="text-xs font-bold rounded-full"
                          style={{ padding: "2px 9px", ...chipStyles[chip.tone] }}
                        >
                          {chip.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
