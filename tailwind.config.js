/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Bengali"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Noto Sans Bengali"', 'sans-serif'],
      },
      colors: {
        darkBg: "#09090B",
        darkCard: "#121217",
        darkSurface: "#181820",
        brandOrange: "#F97316",
        brandTeal: "#0D9488",
        brandTealLight: "#14B8A6",
        macroCarb: "#38BDF8",
        macroProtein: "#2DD4BF",
        macroFat: "#FBBF24",
      }
    },
  },
  plugins: [],
}
