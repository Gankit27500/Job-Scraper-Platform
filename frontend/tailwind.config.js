import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
        border: "rgba(255, 255, 255, 0.1)",
        input: "rgba(255, 255, 255, 0.05)",
        ring: "rgb(99, 102, 241)",
        background: "rgb(9, 9, 11)",
        foreground: "rgb(250, 250, 250)",
        primary: {
          DEFAULT: "rgb(99, 102, 241)", // Sleek Indigo
          foreground: "rgb(255, 255, 255)",
        },
        secondary: {
          DEFAULT: "rgb(39, 39, 42)",
          foreground: "rgb(244, 244, 245)",
        },
        destructive: {
          DEFAULT: "rgb(239, 68, 68)",
          foreground: "rgb(255, 255, 255)",
        },
        muted: {
          DEFAULT: "rgb(39, 39, 42)",
          foreground: "rgb(161, 161, 170)",
        },
        accent: {
          DEFAULT: "rgb(99, 102, 241)",
          foreground: "rgb(255, 255, 255)",
        },
        card: {
          DEFAULT: "rgba(20, 20, 23, 0.6)",
          foreground: "rgb(250, 250, 250)",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      backdropBlur: {
        xs: "2px",
      }
    },
  },
  plugins: [tailwindcssAnimate],
}
