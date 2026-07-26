import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/templates/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#1c1f22",
          green: "#4c9a2a",
          greenLight: "#6fbf3e",
          gold: "#c9a227"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      boxShadow: {
        soft: "0 4px 24px rgba(0,0,0,0.06)",
        softDark: "0 4px 24px rgba(0,0,0,0.4)"
      }
    }
  },
  plugins: []
};

export default config;
