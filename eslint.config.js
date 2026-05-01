import pluginJs from '@eslint/js';
import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import pluginTs from 'typescript-eslint';

export default defineConfig([
	pluginJs.configs.recommended,
	pluginTs.configs.recommended,
	pluginReact.configs.flat.recommended,
	pluginReact.configs.flat['jsx-runtime'],
	...pluginQuery.configs['flat/recommended'],
	pluginReactHooks.configs.flat['recommended-latest'],
	{
		files: ['**/*.d.ts'],
		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},
]);
