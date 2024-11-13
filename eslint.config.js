import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	{
		files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
		languageOptions: { globals: globals.browser },
		rules: {
			'react/react-in-jsx-scope': 'off',
			'react/jsx-uses-react': 'off',
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
	{
		files: ['**/*.d.ts'],
		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},
];
