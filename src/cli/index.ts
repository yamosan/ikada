#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { Command } from "commander";
import { serve } from "../server/serve.js";

type GlobalOptions = {
	host: string;
	port: string;
	open: boolean;
	source: string;
};

const INGEST_RETRY_DELAYS_MS = [100, 300, 700];
const DEV_CLIENT_PORT = 5173;

function parsePort(value: string): number {
	const parsed = Number.parseInt(value, 10);
	if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
		throw new Error(`Invalid port: ${value}`);
	}
	return parsed;
}

function buildServerUrl(host: string, port: number): string {
	return `http://${host}:${port}`;
}

function buildBrowserUrl(serverUrl: string): string {
	if (process.env.NODE_ENV === "development") {
		return `http://localhost:${DEV_CLIENT_PORT}`;
	}
	return serverUrl;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function postLineWithRetry(
	serverUrl: string,
	line: string,
	source: string,
): Promise<void> {
	let lastError: unknown;
	const attempts = INGEST_RETRY_DELAYS_MS.length + 1;

	for (let attempt = 0; attempt < attempts; attempt += 1) {
		try {
			const response = await fetch(`${serverUrl}/api/ingest`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					line,
					source,
					stream: "stdout",
				}),
			});

			if (!response.ok) {
				throw new Error(
					`Ingest request failed: ${response.status} ${response.statusText}`,
				);
			}
			return;
		} catch (error) {
			lastError = error;
			if (attempt >= INGEST_RETRY_DELAYS_MS.length) {
				break;
			}
			await sleep(INGEST_RETRY_DELAYS_MS[attempt]);
		}
	}

	throw lastError instanceof Error
		? lastError
		: new Error("Failed to ingest line");
}

async function ingestFromStdin(
	serverUrl: string,
	source: string,
	options: {
		passthroughStdout: boolean;
	},
): Promise<void> {
	const reader = createInterface({
		input: process.stdin,
		crlfDelay: Number.POSITIVE_INFINITY,
	});

	for await (const line of reader) {
		if (options.passthroughStdout) {
			process.stdout.write(`${line}\n`);
		}
		await postLineWithRetry(serverUrl, line, source);
	}
}

function openBrowser(url: string): void {
	const platform = process.platform;

	if (platform === "darwin") {
		const child = spawn("open", [url], {
			detached: true,
			stdio: "ignore",
		});
		child.on("error", (error) => {
			console.warn(`Failed to open browser: ${String(error)}`);
		});
		child.unref();
		return;
	}

	if (platform === "win32") {
		const child = spawn("cmd", ["/c", "start", "", url], {
			detached: true,
			stdio: "ignore",
		});
		child.on("error", (error) => {
			console.warn(`Failed to open browser: ${String(error)}`);
		});
		child.unref();
		return;
	}

	const child = spawn("xdg-open", [url], {
		detached: true,
		stdio: "ignore",
	});
	child.on("error", (error) => {
		console.warn(`Failed to open browser: ${String(error)}`);
	});
	child.unref();
}

function resolveRuntimeOptions(command: Command): {
	host: string;
	port: number;
	serverUrl: string;
	shouldOpen: boolean;
	source: string;
} {
	const opts = command.optsWithGlobals<GlobalOptions>();
	const port = parsePort(opts.port);
	const serverUrl = buildServerUrl(opts.host, port);

	return {
		host: opts.host,
		port,
		serverUrl,
		shouldOpen: opts.open,
		source: opts.source,
	};
}

function logServerStart(url: string): void {
	console.log(`[json-log-viewer] server started: ${url}`);
}

function isOpenOptionExplicit(command: Command): boolean {
	const source = command.getOptionValueSource("open");
	if (source !== undefined) {
		return source !== "default";
	}

	if (command.parent) {
		const parentSource = command.parent.getOptionValueSource("open");
		return parentSource !== undefined && parentSource !== "default";
	}

	return false;
}

function shouldOpenBrowser(
	shouldOpen: boolean,
	options: { openOptionExplicit: boolean },
): boolean {
	if (!shouldOpen) {
		return false;
	}

	if (process.env.NODE_ENV === "development") {
		if (options.openOptionExplicit) {
			console.warn(
				"[json-log-viewer] warning: browser auto-open is disabled in development mode",
			);
		}
		return false;
	}

	return true;
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
		const openOptionExplicit = isOpenOptionExplicit(command);
		const hasPipedInput = process.stdin.isTTY === false;
		const serverUrl = buildServerUrl(runtime.host, runtime.port);
		const browserUrl = buildBrowserUrl(serverUrl);
		serve({
			host: runtime.host,
			port: runtime.port,
			onListen: hasPipedInput
				? undefined
				: (info) => {
						logServerStart(`http://${info.address}:${info.port}`);
					},
		});

		if (shouldOpenBrowser(runtime.shouldOpen, { openOptionExplicit })) {
			openBrowser(browserUrl);
		}

		if (!hasPipedInput) {
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
		const openOptionExplicit = isOpenOptionExplicit(command);
		const serverUrl = buildServerUrl(runtime.host, runtime.port);
		serve({
			host: runtime.host,
			port: runtime.port,
			onListen: (info) => {
				logServerStart(`http://${info.address}:${info.port}`);
			},
		});
		const browserUrl = buildBrowserUrl(serverUrl);

		if (shouldOpenBrowser(runtime.shouldOpen, { openOptionExplicit })) {
			openBrowser(browserUrl);
		}
	});

program
	.command("ingest")
	.description("Read stdin and ingest logs to server")
	.action(async (_options, command) => {
		const runtime = resolveRuntimeOptions(command);
		await ingestFromStdin(runtime.serverUrl, runtime.source, {
			passthroughStdout: true,
		});
	});

program.parseAsync().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});
