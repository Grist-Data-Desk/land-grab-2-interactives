/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				earth: '#3c3830',
				smog: '#f0f0f0',
				orange: '#f79945',
				turquoise: '#12a07f',
				fuchsia: '#ac00e8',
				cobalt: '#3977f3'
			},
			fontFamily: {
				sans: '"PolySans", "Open Sans", Helvetica, sans-serif',
				'sans-alt': "Basis Grotesque Pro, 'Open Sans', Helvetica, sans-serif",
				serif: '"GT Super Display", Georgia, serif'
			},
			fontSize: {
				'2xs': '0.625rem'
			}
		}
	},
	plugins: []
};
