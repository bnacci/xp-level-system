import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05060a",
          900: "#0a0d16",
          800: "#12172a",
          700: "#1b2140",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px -4px rgba(124, 92, 255, 0.55)",
        gold: "0 0 24px -6px rgba(255, 200, 87, 0.65)",
      },
      keyframes: {
        "bar-fill": {
          from: { width: "var(--bar-from, 0%)" },
          to: { width: "var(--bar-to, 0%)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "15%": { opacity: "1", transform: "translateY(0)" },
          "80%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(-24px)" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(255, 200, 87, 0.55)" },
          "100%": { boxShadow: "0 0 0 14px rgba(255, 200, 87, 0)" },
        },
      },
      animation: {
        "bar-fill": "bar-fill 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "pop-in": "pop-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        shimmer: "shimmer 2.4s linear infinite",
        "float-up": "float-up 1.4s ease-out forwards",
        "toast-in": "toast-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
