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
        'sans-alt': "Basis Grotesque Pro, 'Open Sans', Helvetica, sans-serif",
        serif: '"GT Super Display", Georgia, serif'
      },
      fontSize: {
        headline: ['2.625rem', '2.75rem']
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
};
