import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import pluginTs from 'typescript-eslint';

export default defineConfig([
	pluginJs.configs.recommended,
	pluginTs.configs.recommended,
	pluginReact.configs.flat.recommended,
	pluginReactHooks.configs.flat['recommended-latest'],
	reactRefresh.configs.vite(),
	globalIgnores(['**/dist/']),
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
]);
