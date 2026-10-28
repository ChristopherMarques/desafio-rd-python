/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Tangram Design System (RD Station) Tokens
        rd: {
          blue: {
            DEFAULT: "#0073FF",
            hover: "#0060D6",
            subtle: "#0E2A54",
            light: "#EBF4FF",
          },
          navy: {
            DEFAULT: "#19212C",
            dark: "#0C111A",
            card: "#151C26",
            border: "#243042",
            subtle: "#1C2634",
            muted: "#334155",
          },
          orange: {
            DEFAULT: "#F25C05",
            hover: "#D94F04",
            light: "#FFF1E8",
          },
          teal: {
            DEFAULT: "#00B37E",
            hover: "#00996B",
            light: "#E6F7F2",
          },
          coral: "#FF6B4A",
          yellow: "#FFB800",
          red: "#E53E3E",
        },
        mars: {
          sand: "#C1440E",
          rust: "#8C2D19",
          dust: "#E77D58",
          dark: "#3B140E",
          crater: "#24100D",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        sketch: "3px 3px 0px rgba(0, 0, 0, 0.4)",
        "sketch-blue": "3px 3px 0px rgba(0, 115, 255, 0.4)",
        "sketch-orange": "3px 3px 0px rgba(242, 92, 5, 0.4)",
      },
    },
  },
  plugins: [],
};
