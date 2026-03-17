/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grand: {
          blue: '#1A237E',
          navy: '#002147',
          gold: '#C5A059',
          green: '#2E7D32',
          paper: '#F8F9FA',
        }
      },
      fontFamily: {
        serif: ['Lora', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'grand': '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
      }
    },
  },
  plugins: [],
}
