import type { Config } from "tailwindcss";

// Los colores y tipografías NO se definen dos veces: Tailwind lee las
// variables CSS que están centralizadas en app/globals.css (:root).
// Si en el futuro hay que cambiar un color o la fuente, se cambia en
// UN solo lugar (globals.css) y se propaga a toda la app automáticamente.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "var(--cream)",
        mint: "var(--mint)",
        "teal-bright": "var(--teal-bright)",
        teal: "var(--teal)",
        "teal-dark": "var(--teal-dark)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        bg: "var(--bg)",
        panel: "var(--panel)",
        line: "var(--line)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter-tight)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
