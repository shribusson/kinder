import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./app/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#b6d5ff",
          300: "#85b8ff",
          400: "#4d8fff",
          500: "#2f6bff",
          600: "#1f4fe5",
          700: "#1b3db8",
          800: "#1c3391",
          900: "#1b2c76"
        }
      }
    }
  },
  plugins: []
};

export default config;
