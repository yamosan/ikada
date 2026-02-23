import { createEventSource } from "eventsource-client";
import { useEffect, useRef, useState } from "react";

export type LogEvent = {
	seq: number;
	timestamp: number;
	source: string;
	stream: "stdout" | "stderr";
	line: string;
};

export type ConnectionState = "connected" | "reconnecting";

function isValidLogEvent(candidate: unknown): candidate is LogEvent {
	if (typeof candidate !== "object" || candidate === null) {
		return false;
	}
	const e = candidate as Partial<LogEvent>;
	return (
		typeof e.seq === "number" &&
		typeof e.timestamp === "number" &&
		typeof e.source === "string" &&
		(e.stream === "stdout" || e.stream === "stderr") &&
		typeof e.line === "string"
	);
}

function parseEventBatch(raw: string): LogEvent[] {
	try {
		const parsed: unknown = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			return parsed.filter(isValidLogEvent);
		}
		if (isValidLogEvent(parsed)) {
			return [parsed];
		}
		return [];
	} catch {
		return [];
	}
}

export function useLogEvents(): {
	logs: LogEvent[];
	connection: ConnectionState;
} {
	const [logs, setLogs] = useState<LogEvent[]>([]);
	const [connection, setConnection] = useState<ConnectionState>("reconnecting");
	const lastSeqRef = useRef<number>(0);
	const eventSourceRef = useRef<ReturnType<typeof createEventSource> | null>(
		null,
	);

	useEffect(() => {
		let isDisposed = false;

		const connect = (): void => {
			if (isDisposed) {
				return;
			}

			const requestBody = JSON.stringify(
				lastSeqRef.current > 0 ? { sinceSeq: lastSeqRef.current } : {},
			);
			const client = createEventSource({
				url: "/api/events",
				method: "POST",
				headers: {
					Accept: "text/event-stream",
					"Content-Type": "application/json",
				},
				body: requestBody,
				onConnect: () => {
					setConnection("connected");
				},
				onDisconnect: () => {
					if (!isDisposed) {
						setConnection("reconnecting");
					}
				},
				onMessage: (event) => {
					const batch = parseEventBatch(event.data);
					if (batch.length === 0) {
						return;
					}

					if (event.event === "snapshot") {
						setLogs(batch);
					} else if (event.event === "append") {
						setLogs((prev) => [...prev, ...batch]);
					}

					lastSeqRef.current = batch[batch.length - 1].seq;
					setConnection("connected");
				},
				onScheduleReconnect: () => {
					if (!isDisposed) {
						setConnection("reconnecting");
					}
				},
			});
			eventSourceRef.current = client;
		};

		connect();

		return () => {
			isDisposed = true;
			if (eventSourceRef.current !== null) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}
		};
	}, []);

	return { logs, connection };
}
