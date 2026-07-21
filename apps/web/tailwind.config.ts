import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#dcecff",
          500: "#2f6fed",
          600: "#1f57d6",
          700: "#1943ab",
        },
      },
    },
  },
  plugins: [],
};

export default config;
