#!/usr/bin/env node

import { Command } from "commander";
import open from "open";
import { serve } from "../server/serve.js";
import { ingestFromStdin } from "./ingest.js";
import { logger } from "./logger.js";
import { type RuntimeOptions, resolveRuntimeOptions } from "./options.js";

const DEV_CLIENT_PORT = 5173;

function buildBrowserUrl(serverUrl: string): string {
	if (process.env.NODE_ENV === "development") {
		return `http://localhost:${DEV_CLIENT_PORT}`;
	}
	return serverUrl;
}

function shouldOpenBrowser(options: RuntimeOptions): boolean {
	if (!options.shouldOpen) {
		return false;
	}

	if (process.env.NODE_ENV === "development") {
		if (options.openOptionExplicit) {
			logger.warn("browser auto-open is disabled in development mode");
		}
		return false;
	}

	return true;
}

function startServerWithBrowser(
	runtime: RuntimeOptions,
	options?: { silent?: boolean },
): void {
	serve({
		host: runtime.host,
		port: runtime.port,
		onListen: options?.silent
			? undefined
			: (info) => {
					logger.info(`server started: http://${info.address}:${info.port}`);
				},
	});

	if (shouldOpenBrowser(runtime)) {
		void open(buildBrowserUrl(runtime.serverUrl));
	}
}

const program = new Command();
program
	.name("json-log-viewer")
	.description("Local JSON log viewer")
	.option("--host <host>", "Host to listen on", "127.0.0.1")
	.option("--port <number>", "Port to listen on", "3030")
	.option("--no-open", "Do not open the browser automatically")
	.option("--source <name>", "Log source name", "stdin")
	.action(async (_options, command) => {
		const runtime = resolveRuntimeOptions(command);
		const hasPipedInput = !process.stdin.isTTY;

		startServerWithBrowser(runtime, { silent: hasPipedInput });

		if (!hasPipedInput) {
			logger.info(
				"no piped input detected. To ingest logs, pipe data to stdin.",
			);
			return;
		}

		await ingestFromStdin(runtime.serverUrl, runtime.source, {
			passthroughStdout: true,
		});
	});

program
	.command("serve")
	.description("Start viewer server")
	.action((_options, command) => {
		const runtime = resolveRuntimeOptions(command);
		startServerWithBrowser(runtime);
	});

program
	.command("ingest")
	.description("Read stdin and ingest logs to server")
	.action(async (_options, command) => {
		const hasPipedInput = !process.stdin.isTTY;
		if (!hasPipedInput) {
			command.error(
				"No piped input detected. Usage: cat logs.json | json-log-viewer ingest",
			);
		}
		const runtime = resolveRuntimeOptions(command);
		await ingestFromStdin(runtime.serverUrl, runtime.source, {
			passthroughStdout: true,
		});
	});

program.parseAsync().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});
