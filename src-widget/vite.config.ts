import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import babel from 'vite-plugin-babel';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		// tanstackRouter MUST be before react
		tanstackRouter({ target: 'react', autoCodeSplitting: true }),
		react(),
		babel({
			babelConfig: {
				plugins: ['babel-plugin-react-compiler'],
			},
		}),
		tailwindcss(),
	],
	build: {
		outDir: '../resources/widget_server',
	},
	server: {
		port: 57141,
		strictPort: true,
	},
});
