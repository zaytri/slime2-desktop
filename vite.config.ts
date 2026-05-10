import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import babel from 'vite-plugin-babel';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	plugins: [
		react(),
		babel({
			babelConfig: {
				plugins: ['babel-plugin-react-compiler'],
			},
		}),
		tsconfigPaths(),
		tailwindcss(),
	],

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 57142,
		strictPort: true,
		watch: {
			// 3. tell vite to ignore watching `src-tauri and src-overlay`
			ignored: ['**/src-tauri/**', '**/src-overlay/**'],
		},
	},
}));
