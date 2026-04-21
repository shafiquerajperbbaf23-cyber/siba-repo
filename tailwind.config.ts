import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-syne)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
        display: ["var(--font-dm-serif)", "Georgia", "serif"],
      },
      colors: {
        ink: {
          50: "#f7f6f3",
          100: "#eeece6",
          200: "#ddd9cf",
          300: "#c4bfb0",
          400: "#a89e8a",
          500: "#918471",
          600: "#7d6f5f",
          700: "#685c4f",
          800: "#564d43",
          900: "#49423a",
          950: "#272119",
        },
        sienna: {
          400: "#c97b4b",
          500: "#b8622e",
          600: "#9d5026",
        },
        paper: "#faf9f6",
      },
      boxShadow: {
        card: "0 1px 3px rgba(39,33,25,0.08), 0 4px 16px rgba(39,33,25,0.06)",
        "card-hover":
          "0 2px 8px rgba(39,33,25,0.12), 0 8px 32px rgba(39,33,25,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
