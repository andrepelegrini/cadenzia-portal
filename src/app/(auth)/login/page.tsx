import CadenziaMark from "@/components/ui/CadenziaMark";

// TODO: Build login screen
// Design direction: full-page midnight bg, cream card centred, isotonic CTA button.
// Auth: Supabase email+password (per-partner login — each partner has own credentials).

export default function LoginPage() {
  return (
    <main
      className="min-h-dvh flex items-center justify-center"
      style={{ backgroundColor: "var(--midnight)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-xl"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <CadenziaMark size={52} style={{ color: "var(--midnight)" }} />
          <span
            className="text-lg font-bold tracking-[0.25em]"
            style={{ color: "var(--midnight)" }}
          >
            CADENZIA
          </span>
        </div>

        <p className="text-center text-sm mb-6" style={{ color: "var(--text-soft)" }}>
          Acesse sua conta
        </p>

        {/* Login form — to be wired up with Supabase Auth */}
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                borderColor: "var(--line)",
                backgroundColor: "var(--cheviot)",
                focusRingColor: "var(--neptune)",
              }}
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: "var(--line)",
                backgroundColor: "var(--cheviot)",
              }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--isotonic)",
              color: "var(--midnight)",
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
