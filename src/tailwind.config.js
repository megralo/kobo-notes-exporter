/** @type {import('tailwindcss').Config} */

export default {
	content: [
		"./index.html",
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	darkMode: 'class', // Use class strategy for dark mode
	theme: {
		extend: {
			colors: {
				// You can define custom colors here if needed
			},
		},
	},
	plugins: [],
}