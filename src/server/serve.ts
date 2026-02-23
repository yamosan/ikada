import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serve as serveHono } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serve() {
	const app = new Hono();

	const isProduction =
		process.env.NODE_ENV === "production" ||
		process.env.NODE_ENV !== "development";

	app.get("/api/health", (c) => {
		return c.json({ status: "ok" });
	});

	if (isProduction) {
		const distPath = join(__dirname, "..", "client");
		app.use(serveStatic({ root: distPath }));

		app.get("*", serveStatic({ path: "index.html" }));
	}

	serveHono(app);
}
