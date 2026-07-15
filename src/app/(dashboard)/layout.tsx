"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CadenziaMark from "@/components/ui/CadenziaMark";

const navItems = [
  { href: "/",           label: "Início",      exactMatch: true  },
  { href: "/recebiveis", label: "Recebíveis",  exactMatch: false },
  { href: "/approvals",  label: "Aprovações",  exactMatch: false, badge: true },
  { href: "/extratos",   label: "Extratos",    exactMatch: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const supabase  = createClient();

  const [partnerName,  setPartnerName]  = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: partner } = await supabase
          .from("partners")
          .select("name")
          .eq("auth_user_id", user.id)
          .single();
        if (partner) setPartnerName(partner.name);
      }

      const { count } = await supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("approval_status", "pending");
      setPendingCount(count ?? 0);
    }
    load();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: "var(--cheviot)" }}>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6"
        style={{ backgroundColor: "var(--midnight)", height: 60 }}
      >
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
            <CadenziaMark size={26} style={{ color: "var(--isotonic)" }} />
            <span className="text-sm font-bold tracking-[0.22em]" style={{ color: "var(--pacific)" }}>
              CADENZIA
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = item.exactMatch
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors"
                  style={{
                    color:           isActive ? "var(--cheviot)"                  : "var(--pacific)",
                    backgroundColor: isActive ? "rgba(255,255,255,0.09)"          : "transparent",
                    fontWeight:      isActive ? 600                               : 400,
                    textDecoration: "none",
                  }}
                >
                  {item.label}
                  {item.badge && pendingCount > 0 && (
                    <span
                      style={{
                        background:   "var(--isotonic)",
                        color:        "var(--midnight)",
                        borderRadius: 20,
                        fontSize:     10,
                        fontWeight:   700,
                        lineHeight:   1,
                        padding:      "2px 6px",
                      }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {partnerName && (
            <span className="text-sm" style={{ color: "rgba(192,214,234,0.55)" }}>
              {partnerName}
            </span>
          )}
          <button
            onClick={signOut}
            className="text-sm px-3 py-1.5 rounded-md transition-opacity hover:opacity-80"
            style={{
              color:        "var(--pacific)",
              border:       "0.5px solid rgba(192,214,234,0.2)",
              background:   "transparent",
              cursor:       "pointer",
              fontFamily:   "inherit",
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────── */}
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
