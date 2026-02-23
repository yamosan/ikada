import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	root: "src/client",
	publicDir: "../../public",
	build: {
		outDir: "../../dist/client",
		emptyOutDir: true,
	},
});
