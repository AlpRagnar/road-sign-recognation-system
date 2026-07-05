import type { Config } from "tailwindcss";

// Traffic Sign Mapping — shared design tokens (Stitch redesign, TASK 030).
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary infrastructure blue
        brand: {
          DEFAULT: "#1d4ed8",
          dark: "#1e40af",
        },
        primary: {
          DEFAULT: "#1d4ed8",
          dark: "#1e40af",
        },
        // Sidebar / dark surfaces
        navy: {
          DEFAULT: "#0f172a",
          800: "#1e293b",
        },
        // Geo / map accent
        teal: {
          DEFAULT: "#0d9488",
        },
        // Selected map marker
        amber: {
          marker: "#f59e0b",
        },
        // Neutral surfaces
        canvas: "#f5f7fa",
        panel: "#f1f5f9",
        line: "#e2e8f0",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        md: "0.5rem", // 8px cards/buttons/fields
        lg: "0.625rem", // 10px modals/drawers
        badge: "0.375rem", // 6px badges
      },
    },
  },
  plugins: [],
};

export default config;
