import type { AddressInfo } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serve as serveHono } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import * as v from "valibot";
import type { LogEvent } from "../type.js";
import { InMemoryLogStore } from "./log-store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type ServeOptions = {
	host?: string;
	port?: number;
	onListen?: (info: AddressInfo) => void;
};

const MAX_EVENTS = 10_000;
const logStore = new InMemoryLogStore(MAX_EVENTS);

function whenAborted(
	stream: { onAbort: (fn: () => void) => void },
	signal: AbortSignal,
	onAbort?: () => void,
): Promise<void> {
	return new Promise((resolve) => {
		const finish = () => {
			onAbort?.();
			resolve();
		};
		stream.onAbort(finish);
		signal.addEventListener("abort", finish, { once: true });
	});
}

export function serve(options: ServeOptions = {}) {
	const app = new Hono();
	const host = options.host ?? "127.0.0.1";
	const port = options.port ?? 3030;

	const isProduction =
		process.env.NODE_ENV === "production" ||
		process.env.NODE_ENV !== "development";

	app.get("/api/health", (c) => {
		return c.json({ status: "ok" });
	});

	app.post(
		"/api/ingest",
		sValidator(
			"json",
			v.object({
				line: v.string(),
				source: v.optional(v.string()),
				stream: v.optional(v.picklist(["stdout", "stderr"])),
			}),
		),
		(c) => {
			const payload = c.req.valid("json");
			const event = logStore.append({
				line: payload.line,
				source: payload.source,
				stream: payload.stream,
			});

			return c.json({ ok: true, seq: event.seq });
		},
	);

	app.post(
		"/api/events",
		sValidator(
			"json",
			v.object({
				sinceSeq: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
			}),
		),
		(c) => {
			const payload = c.req.valid("json");
			const snapshot = logStore.snapshot(payload.sinceSeq);
			return streamSSE(c, async (stream) => {
				let unsubscribe = (): void => {};
				let finished = false;

				const cleanup = (): void => {
					if (finished) return;
					finished = true;
					unsubscribe();
				};

				await stream.writeSSE({
					event: "snapshot",
					data: JSON.stringify(snapshot),
					id:
						snapshot.length > 0
							? String(snapshot[snapshot.length - 1]?.seq)
							: undefined,
				});

				unsubscribe = logStore.subscribe((event: LogEvent) => {
					if (finished) {
						return;
					}
					void stream
						.writeSSE({
							event: "append",
							data: JSON.stringify(event),
							id: String(event.seq),
						})
						.catch(() => {
							cleanup();
						});
				});

				await whenAborted(stream, c.req.raw.signal, cleanup);
			});
		},
	);

	if (isProduction) {
		const distPath = join(__dirname, "..", "client");
		app.use(serveStatic({ root: distPath }));

		app.get("*", serveStatic({ root: distPath, path: "index.html" }));
	}

	return serveHono(
		{
			fetch: app.fetch,
			hostname: host,
			port,
		},
		options.onListen,
	);
}
