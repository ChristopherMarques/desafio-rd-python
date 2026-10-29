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
        // Tokens Oficiais Tangram Design System (RD Station)
        // https://tangram.rdstation.com.br/docs/foundations/color/
        tangram: {
          primary: {
            DEFAULT: "#00DBFF",
            border: "#00DBFF",
            hover: "#0088CC",
            icon: "#0077B2",
            "icon-hover": "#005580",
            surface: "#00DBFF",
            "surface-low": "#B2F4FF",
            "surface-hover": "#66EBFF",
            text: "#0077B2",
            "text-hover": "#005580",
            "on-color": "#00DBFF",
          },
          neutral: {
            surface: "#FFFFFF",
            "surface-low": "#ECEEEF",
            "surface-high": "#E5E8EA",
            "surface-hover": "#DADEE0",
            inverse: "#002233",
            "dark-bg": "#001824",
            "dark-card": "#002233",
            "dark-subtle": "#002D42",
            "dark-border": "#003E5C",
            "dark-border-hover": "#005A84",
            "text-high": "#002233",
            "text-low": "#596B7A",
            "text-inverse": "#FFFFFF",
            "text-muted": "#8C9BA3",
            border: "#D6DBDE",
            "border-interactive": "#B2BCC1",
          },
          danger: {
            DEFAULT: "#E60F57",
            border: "#C20046",
            text: "#C20046",
            "surface-high": "#E60F57",
            "surface-low": "#FFD6E4",
            hover: "#F53D74",
          },
          success: {
            DEFAULT: "#0ED869",
            border: "#0AAF54",
            text: "#087A3A",
            "surface-high": "#0ED869",
            "surface-low": "#D6FAE8",
            hover: "#29DE82",
          },
          warning: {
            DEFAULT: "#FFBD28",
            border: "#D4920A",
            text: "#A06800",
            "surface-high": "#FFBD28",
            "surface-low": "#FFF3D0",
            hover: "#FFC73E",
          },
          highlight: {
            DEFAULT: "#8800F7",
            border: "#6E00C5",
            text: "#6E00C5",
            "surface-high": "#8800F7",
            "surface-low": "#EDD6FF",
            hover: "#9E38FF",
          },
          support: {
            mint: "#00F2C9",
            magenta: "#ED0093",
            orange: "#FF8900",
            lime: "#C3F628",
          },
          ia: {
            start: "#CFFCF2",
            middle: "#CCF9FF",
            end: "#EAD6FF",
          },
        },
        // Legado RD compatível
        rd: {
          blue: {
            DEFAULT: "#00DBFF",
            hover: "#0088CC",
            subtle: "#002D42",
            light: "#B2F4FF",
          },
          navy: {
            DEFAULT: "#002233",
            dark: "#001824",
            card: "#002233",
            border: "#003E5C",
            subtle: "#002D42",
            muted: "#596B7A",
          },
          orange: {
            DEFAULT: "#FF8900",
            hover: "#E07800",
            light: "#FFF1E8",
          },
          teal: {
            DEFAULT: "#0ED869",
            hover: "#0AAF54",
            light: "#D6FAE8",
          },
          coral: "#E60F57",
          yellow: "#FFBD28",
          red: "#C20046",
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
