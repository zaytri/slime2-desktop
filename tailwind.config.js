/** @type {import('tailwindcss').Config} */

import { fontFamily, spacing } from 'tailwindcss/defaultTheme';

export default {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				fredoka: ['Fredoka', ...fontFamily.sans],
				quicksand: ['Quicksand', ...fontFamily.sans],
				'radio-canada': ['Radio Canada', ...fontFamily.sans],
			},
			borderRadius: {
				'10%': '10%',
				'100%': '100%',
				...spacing,
			},
			keyframes: {
				fade: {
					from: { opacity: 1 },
					to: { opacity: 0 },
				},
				expand: {
					from: { transform: 'scale(.5)' },
					to: { transform: 'scale(1)' },
				},
			},
			animation: {
				'bounce-in':
					'fade .15s reverse forwards, expand .15s cubic-bezier(.43, -0.5, .62, 1.5) forwards',
				intro: 'fade .25s reverse forwards, expand .5s forwards',
				page: 'fade reverse .15s forwards',
			},
			transitionTimingFunction: {
				bounce: 'cubic-bezier(.43, -0.5, 0.62, 2)',
			},
		},
	},
};
