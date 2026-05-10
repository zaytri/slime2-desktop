import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import pluginTs from 'typescript-eslint';

export default defineConfig([
	pluginJs.configs.recommended,
	pluginTs.configs.recommended,
	pluginReact.configs.flat.recommended,
	pluginReact.configs.flat['jsx-runtime'],
	pluginReactHooks.configs.flat['recommended-latest'],
	reactRefresh.configs.vite(),
	globalIgnores(['**/dist/']),
	{
		files: ['**/*.d.ts'],
		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},
]);
