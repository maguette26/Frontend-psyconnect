/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [ "./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
       screens: {
        'xs': '420px', // nouveau breakpoint utilisé pour les grilles de catégories/cartes sur mobile
      },
    },
  },
  plugins: [],
}

