import Link from "next/link";
import PendenciasSection from "@/components/pendencias/PendenciasSection";

const products = [
  {
    href:        "/recebiveis",
    label:       "Recebíveis",
    description: "Acompanhe os pagamentos recebidos, aprovações pendentes e repasses às sócias.",
    active:      true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href:        "#",
    label:       "Custos",
    description: "Gerencie despesas e custos operacionais da clínica.",
    active:      false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    href:        "#",
    label:       "Fluxo de caixa",
    description: "Visualize entradas e saídas no tempo e projete seu saldo.",
    active:      false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <>
      <style>{`
        .product-card-active:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.45);
        }
        .product-card-active:hover .accent-bar {
          top: 16px;
          bottom: 16px;
        }
      `}</style>

      <div
        style={{
          margin:        "-32px -24px",
          minHeight:     "calc(100dvh - 60px)",
          background:    "#000d14",
          padding:       "72px 24px 64px",
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
        }}
      >
        {/* Pendências */}
        <div style={{ width: "100%", maxWidth: 980, marginBottom: 56 }}>
          <PendenciasSection />
        </div>

        {/* Eyebrow */}
        <p
          style={{
            fontSize:      11,
            fontWeight:    700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color:         "var(--neptune)",
            marginBottom:  12,
          }}
        >
          Clínica DermaSul
        </p>

        {/* Heading */}
        <h1
          style={{
            fontSize:      36,
            fontWeight:    800,
            letterSpacing: "-0.03em",
            color:         "var(--cheviot)",
            marginBottom:  10,
            textAlign:     "center",
            fontFamily:    "Manrope, sans-serif",
            lineHeight:    1.15,
          }}
        >
          O que você quer ver?
        </h1>
        <p style={{ fontSize: 15, color: "var(--neptune)", marginBottom: 56, textAlign: "center" }}>
          Escolha um módulo para começar.
        </p>

        {/* Cards */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap:                 20,
            width:               "100%",
            maxWidth:            860,
          }}
        >
          {products.map((p) => (
            <Link
              key={p.label}
              href={p.href}
              className={p.active ? "product-card-active" : ""}
              style={{
                display:        "block",
                textDecoration: "none",
                position:       "relative",
                background:     p.active ? "#fff" : "rgba(255,255,255,0.04)",
                borderRadius:   20,
                border:         p.active
                  ? "1px solid var(--line)"
                  : "1px solid rgba(255,255,255,0.06)",
                padding:        "28px 28px 28px 36px",
                transition:     "transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s cubic-bezier(.16,1,.3,1)",
                overflow:       "hidden",
                cursor:         p.active ? "pointer" : "default",
                pointerEvents:  p.active ? "auto" : "none",
              }}
            >
              {/* Isotonic left accent bar */}
              <span
                className="accent-bar"
                style={{
                  position:     "absolute",
                  left:         0,
                  top:          24,
                  bottom:       24,
                  width:        3,
                  borderRadius: "0 3px 3px 0",
                  background:   p.active ? "var(--isotonic)" : "rgba(221,255,85,0.12)",
                  transition:   "top 0.35s cubic-bezier(.16,1,.3,1), bottom 0.35s cubic-bezier(.16,1,.3,1)",
                }}
              />

              {/* Icon block */}
              <div
                style={{
                  width:          54,
                  height:         54,
                  borderRadius:   14,
                  background:     p.active ? "var(--midnight)" : "rgba(17,66,93,0.35)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  marginBottom:   20,
                  color:          p.active ? "var(--isotonic)" : "rgba(221,255,85,0.25)",
                }}
              >
                {p.icon}
              </div>

              {/* Label */}
              <div
                style={{
                  fontWeight:    800,
                  fontSize:      18,
                  letterSpacing: "-0.02em",
                  marginBottom:  8,
                  color:         p.active ? "var(--midnight)" : "rgba(255,255,255,0.25)",
                  fontFamily:    "Manrope, sans-serif",
                }}
              >
                {p.label}
              </div>

              {/* Description */}
              <div
                style={{
                  fontSize:   13,
                  lineHeight: 1.55,
                  color:      p.active ? "var(--neptune)" : "rgba(255,255,255,0.18)",
                }}
              >
                {p.description}
              </div>

              {/* "Em breve" tag */}
              {!p.active && (
                <div
                  style={{
                    marginTop:     16,
                    fontSize:      10,
                    fontWeight:    700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color:         "rgba(221,255,85,0.18)",
                  }}
                >
                  Em breve
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
