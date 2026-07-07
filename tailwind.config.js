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
          goldSoft: "#f6e6a8",
          paper: "#fffaf0",
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
        kenburns: {
          "0%": { transform: "scale(1) translate3d(0, 0, 0)" },
          "100%": { transform: "scale(1.12) translate3d(-1.5%, 1%, 0)" },
        },
        floatUp: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "12%": { opacity: "0.85" },
          "85%": { opacity: "0.3" },
          "100%": { transform: "translateY(-46vh)", opacity: "0" },
        },
      },
      animation: {
        floatCard: "floatCard 10s ease-in-out infinite",
        shine: "shine 2.8s ease-in-out infinite",
        kenburns: "kenburns 26s ease-in-out infinite alternate",
        floatUp: "floatUp 14s linear infinite",
      },
    },
  },
  plugins: [],
};
