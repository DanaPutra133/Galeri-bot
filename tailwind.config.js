/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0d1117',
        'dark-card': '#161b22',
        'aqua-pink': '#ff2d55',
      },
    },
  },
  plugins: [],
}