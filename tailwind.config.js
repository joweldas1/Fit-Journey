/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ক্লাস-বেসড ডার্ক/লাইট মোড টগলিংয়ের জন্য
  theme: {
    extend: {
      colors: {
        darkBg: "#0F172A",
        darkCard: "#1E293B",
        darkSurface: "#131B2E",
        brandOrange: "#FF6B4A",
        brandGreen: "#0D7C66",
        macroCarb: "#38BDF8",
        macroProtein: "#2DD4BF",
        macroFat: "#FBBF24",
      }
    },
  },
  plugins: [],
}   