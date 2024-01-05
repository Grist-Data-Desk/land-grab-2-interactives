/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        earth: '#3c3830',
        smog: '#f0f0f0'
      },
      fontFamily: {
        sans: '"PolySans", "Open Sans", Helvetica, sans-serif',
        serif: '"Basis Grotesque", Georgia, serif'
      }
    }
  },
  plugins: []
};