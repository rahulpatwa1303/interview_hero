// tailwind.config.ts
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme'; // Correct import

const config: Config = {
  // darkMode: ["class"],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}', // If you use an src directory
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // === Shadcn/ui Core Semantic Color Slots ===
        // These ensure Shadcn components work and Tailwind can generate utilities like bg-primary
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // === Your Custom Semantic Colors from Figma (referenced by --my- prefix in CSS) ===
        // This makes utilities like `bg-my-text-title` available.
        'my-bg-base-high': 'hsl(var(--my-bg-base-high))',
        'my-bg-base-highest': 'hsl(var(--my-bg-base-highest))',
        'my-bg-base-hover': 'hsl(var(--my-bg-base-hover))',
        'my-bg-divider': 'hsl(var(--my-bg-divider))',
        'my-bgborder': 'hsl(var(--my-bgborder))', // if you need a separate one from 'border'
        'my-bg-border-hover': 'hsl(var(--my-bg-border-hover))',
        'my-bg-selected': { // Group related states
            DEFAULT: 'hsl(var(--my-bg-selected))',
            hover: 'hsl(var(--my-bg-selected-hover))',
            border: 'hsl(var(--my-bg-selected-border))',
        },
        'my-text-title': 'hsl(var(--my-text-title))',
        'my-text-base': 'hsl(var(--my-text-base))',
        'my-text-faint': 'hsl(var(--my-text-faint))',
        'my-cont-bg': 'hsl(var(--my-cont-bg))',
        'my-cont-bg-hover': 'hsl(var(--my-cont-bg-hover))',
        'my-cont-text': 'hsl(var(--my-cont-text))',
        'my-cont-secondary-text': 'hsl(var(--my-cont-secondary-text))',
        'my-cont-bg-secondary': 'hsl(var(--my-cont-bg-secondary))',
        'my-cont-bg-secondary-hover': 'hsl(var(--my-cont-bg-secondary-hover))',
        'my-cont-link': 'hsl(var(--my-cont-link))',
        'my-cont-disabled-bg': 'hsl(var(--my-cont-disabled-bg))',
        'my-alert-bg-base': 'hsl(var(--my-alert-bg-base))',
        'my-alert-text': 'hsl(var(--my-alert-text))',
        'my-alert-cont-bg': 'hsl(var(--my-alert-cont-bg))',
        'my-warn-cont-bg': 'hsl(var(--my-warn-cont-bg))',
        'my-warn-bg-base': 'hsl(var(--my-warn-bg-base))',
        'my-warn-text': 'hsl(var(--my-warn-text))',
        // For overlay with alpha, define the base RGB color for Tailwind JIT
        // Then use Tailwind opacity utilities: e.g., bg-my-overlay/80
        'my-overlay': 'rgb(var(--my-overlay-rgb))', // Use with --my-overlay-rgb in CSS
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans], // Ensure --font-sans is defined
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0px" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0px" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;