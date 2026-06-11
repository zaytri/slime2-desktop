export default {
	plugins: [
		'prettier-plugin-organize-imports',
		'prettier-plugin-tailwindcss', // MUST be last to work
	],
	arrowParens: 'avoid',
	semi: true,
	singleQuote: true,
	jsxSingleQuote: true,
	trailingComma: 'all',
	tailwindFunctions: ['clsx'],
	tailwindStylesheet: './src/css/custom.css',
	useTabs: true,
};
