import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "var(--midnight)",
        neptune: "var(--neptune)",
        pacific: "var(--pacific)",
        grape: "var(--grape)",
        cheviot: "var(--cheviot)",
        isotonic: "var(--isotonic)",
        text: "var(--text)",
        "text-soft": "var(--text-soft)",
        line: "var(--line)",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        accent: ["Fraunces", "Georgia", "serif"],
      },
      borderColor: {
        DEFAULT: "var(--line)",
      },
    },
  },
  plugins: [],
};

export default config;
