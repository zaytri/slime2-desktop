/** @type {import('tailwindcss').Config} */

import { fontFamily } from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

export default {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				fredoka: ['Fredoka', ...fontFamily.sans],
				'radio-canada': ['Radio Canada', ...fontFamily.sans],
				'radio-canada-big': ['Radio Canada Big', ...fontFamily.sans],
			},
			borderRadius: {
				'10%': '10%',
				'100%': '100%',
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
	plugins: [
		// "over" variant that adds styles for both :hover and :focus-visible
		plugin(({ addVariant }) => {
			addVariant('over', ['&:hover', '&:focus-visible']);
			addVariant('group-over', [
				':merge(.group):hover &',
				':merge(.group):focus-visible &',
			]);
			addVariant('peer-over', [
				':merge(.peer):hover ~ &',
				':merge(.peer):focus-visible ~ &',
			]);
		}),

		// border radius values to create a slime shape
		plugin(({ addUtilities }) => {
			addUtilities({
				'.rounded-slime': {
					'border-top-left-radius': '100% 150%',
					'border-top-right-radius': '100% 150%',
					'border-bottom-left-radius': '100% 50%',
					'border-bottom-right-radius': '100% 50%',
				},
			});
		}),
	],
};
