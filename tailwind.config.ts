import type { Config } from "tailwindcss";

const config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    colors: {
      light: {
        surface: "#FEF7FF",
        surfaceContainer: "#F3EDF7",
        onSurface: "#1D1B20",
        surfaceContainerHighest: "#E6E0E9",
        primary:'#6750A4',
        onPrimary:'#FFFFFF',
        secondaryContainer:'#E8DEF8',
        onSecondaryContainer:'#1D192B',
        outline:'#79747E',
        error:'#B3261E',
        backgroundQTag:'#6b4cf6'
      },
      dark: {
        surface: "#141218",
        surfaceContainer: "#211F26",
        onSurface: "#E6E0E9",
        surfaceContainerHighest: "#36343B",
        primary:'#D0BCFF',
        onPrimary:'#381E72',
        secondaryContainer:'#4A4458',
        onSecondaryContainer:'#E8DEF8',
        onSurfaceVariant:'#CAC4D0',
        outline:'#938F99',
        backgroundQTag:'#6b4cf6'
      },
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
