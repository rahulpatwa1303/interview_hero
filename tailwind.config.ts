import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        light: {
          background: "#F5F5FF",
          main: "#212E35",
          primary: "#4B8CF5",
          card:'#D3DFF2',
          borderPrimaryDark:'#D9DADA',
        },
        dark: {
          background: "#0A0A0A",
          main: "#E1E1E1",
          primary: "#4EB9FF",
          card:'#2D5067',
          borderPrimaryDark:'#2C2D2B',
        },
      },
    },
  },
  plugins: [],
};
export default config;
