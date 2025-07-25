export default {
	plugins: [
		'prettier-plugin-organize-imports',
		'prettier-plugin-tailwindcss',
		'prettier-plugin-jsdoc',
	],
	arrowParens: 'avoid',
	semi: true,
	singleQuote: true,
	jsxSingleQuote: true,
	trailingComma: 'all',
	tailwindFunctions: ['clsx'],
	useTabs: true,
};
