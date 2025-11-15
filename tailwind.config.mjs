/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mysticBg: "#050314",
        mysticCard: "#12071f",
        mysticAccent: "#a855f7",
        mysticAccentSoft: "#7c3aed"
      },
      boxShadow: {
        "mystic-card": "0 0 25px rgba(168,85,247,0.35)"
      }
    }
  },
  plugins: []
};
