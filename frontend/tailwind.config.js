/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#0d1117',
          800: '#161b22',
          700: '#1c2230',
          600: '#21293a',
          500: '#2d3a50',
        },
        brand: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        }
      }
    }
  },
  plugins: []
}
