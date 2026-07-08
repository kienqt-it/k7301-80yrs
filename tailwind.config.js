/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./admin.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Be Vietnam Pro"',
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: ['"Playfair Display"', "Georgia", "serif"],
        hand: ['"Dancing Script"', "cursive"],
      },
      colors: {
        heritage: {
          red: "#b91c1c",
          redDark: "#7f1d1d",
          blue: "#1d4ed8",
          blueDark: "#172554",
          gold: "#d4af37",
          goldDeep: "#9c7b26",
          goldSoft: "#f6e6a8",
          paper: "#fffaf0",
          paperShade: "#faf7ef",
          cream: "#fdf1d7",
          sepia: "#8a6a35",
        },
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 37, 84, 0.12)",
        letter: "0 24px 60px rgba(90, 62, 20, 0.18)",
      },
      keyframes: {
        floatCard: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "12%": { opacity: "1" },
          "80%": { opacity: "1" },
          "100%": { transform: "translateY(-260px)", opacity: "0" },
        },
        shine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        floatUp: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "12%": { opacity: "0.85" },
          "85%": { opacity: "0.3" },
          "100%": { transform: "translateY(-46vh)", opacity: "0" },
        },
        nudgeDown: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(7px)" },
        },
      },
      animation: {
        floatCard: "floatCard 10s ease-in-out infinite",
        shine: "shine 2.8s ease-in-out infinite",
        // Vệt sáng chạy đúng một lần qua nút CTA sau màn mở đầu hero
        shineOnce: "shine 1.1s ease-in-out 2.3s 1 both",
        floatUp: "floatUp 14s linear infinite",
        nudgeDown: "nudgeDown 1.4s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate",
      },
    },
  },
  plugins: [],
};
