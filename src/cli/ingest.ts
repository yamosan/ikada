import { createInterface } from "node:readline";

async function postLine(
	serverUrl: string,
	line: string,
	source: string,
): Promise<void> {
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
}

export async function ingestFromStdin(
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
		await postLine(serverUrl, line, source);
	}
}
