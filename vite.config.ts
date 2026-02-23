import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	root: "src/client",
	publicDir: "../../public",
	server: {
		proxy: {
			"/api": {
				target: "http://127.0.0.1:3030",
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: "../../dist/client",
		emptyOutDir: true,
	},
});
