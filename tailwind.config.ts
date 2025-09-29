import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["Inter", "sans-serif"],
        headline: ["Poppins", "sans-serif"],
        code: ["JetBrains Mono", "monospace"],
      },
      colors: {
        background: "#f8f9fa",
        foreground: "#1a202c",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#2d3748",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#2d3748",
        },
        primary: {
          DEFAULT: "#ff7f50",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#4fd1c5",
          foreground: "#1a202c",
        },
        accent: {
          DEFAULT: "#f6e05e",
          foreground: "#1a202c",
        },
        highlight: {
          DEFAULT: "#fefcbf",
          foreground: "#1a202c",
        },
        destructive: {
          DEFAULT: "#e53e3e",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#e2e8f0",
          foreground: "#718096",
        },
        border: "#e2e8f0",
        input: "#edf2f7",
        ring: "#ff7f50",
        chart: {
          "1": "#ff7f50",
          "2": "#4fd1c5",
          "3": "#805ad5",
          "4": "#f6e05e",
          "5": "#3b82f6",
        },
        sidebar: {
          DEFAULT: "#1a202c",
          foreground: "#f7fafc",
          primary: "#ff7f50",
          "primary-foreground": "#ffffff",
          accent: "#2d3748",
          "accent-foreground": "#f7fafc",
          border: "#2d3748",
          ring: "#ff7f50",
        },
      },
      borderRadius: {
        lg: "16px",
        md: "10px",
        sm: "6px",
      },
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
        "accordion-down": "accordion-down 0.25s ease-out",
        "accordion-up": "accordion-up 0.25s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
