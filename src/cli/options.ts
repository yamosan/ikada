import type { Command } from "commander";

type GlobalOptions = {
	host: string;
	port: string;
	open: boolean;
	source: string;
};

export type RuntimeOptions = {
	host: string;
	port: number;
	serverUrl: string;
	shouldOpen: boolean;
	openOptionExplicit: boolean;
	source: string;
};

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

export function resolveRuntimeOptions(command: Command): RuntimeOptions {
	const opts = command.optsWithGlobals<GlobalOptions>();
	const port = parsePort(opts.port);
	const serverUrl = buildServerUrl(opts.host, port);

	return {
		host: opts.host,
		port,
		serverUrl,
		shouldOpen: opts.open,
		openOptionExplicit: isOpenOptionExplicit(command),
		source: opts.source,
	};
}
