import Link from "next/link";
import CadenziaMark from "@/components/ui/CadenziaMark";

const navItems = [
  { href: "/", label: "Visão geral" },
  { href: "/approvals", label: "Aprovações" },
  { href: "/transactions", label: "Transações" },
  { href: "/partners", label: "Sócios" },
  { href: "/settings", label: "Configurações" },
];

/**
 * Dashboard shell: midnight top bar + cream content area.
 * Reference design: dark navy chrome, isotonic used only on primary actions.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: "var(--cheviot)" }}>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: "var(--midnight)" }}
      >
        <div className="flex items-center gap-8">
          {/* Logo: mark + wordmark */}
          <Link href="/" className="flex items-center gap-2.5">
            <CadenziaMark
              size={28}
              style={{ color: "var(--isotonic)" }}
            />
            <span
              className="text-sm font-bold tracking-[0.22em]"
              style={{ color: "var(--pacific)" }}
            >
              CADENZIA
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-md text-sm transition-colors"
                style={{ color: "var(--pacific)" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side: partner name / logout placeholder */}
        <div className="flex items-center gap-3">
          {/* TODO: replace with real partner name from session */}
          <span className="text-sm" style={{ color: "var(--text-soft)" }}>
            Dr. Sócio
          </span>
          <button
            className="text-sm px-3 py-1 rounded-md"
            style={{ color: "var(--pacific)", border: "1px solid var(--line)" }}
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
