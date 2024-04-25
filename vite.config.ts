import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: [{ find: "@", replacement: resolve(__dirname, "src") }],
	},
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, "src/index.html"),
			},
		},
	},
	plugins: [react()],
});
