import { createEventSource } from "eventsource-client";
import { useEffect, useRef } from "react";
import type { LogEvent } from "@/type";

type SubscribeServerLogEventsOptions = {
	onConnected: () => void;
	onReconnecting: () => void;
	onSnapshot: (logs: LogEvent[]) => void;
	onAppend: (logs: LogEvent[]) => void;
};

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

export function useSubscribeServerLogEvents({
	onConnected,
	onReconnecting,
	onSnapshot,
	onAppend,
}: SubscribeServerLogEventsOptions): void {
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
					onConnected();
				},
				onDisconnect: () => {
					if (!isDisposed) {
						onReconnecting();
					}
				},
				onMessage: (event) => {
					const batch = parseEventBatch(event.data);
					if (batch.length === 0) {
						return;
					}

					if (event.event === "snapshot") {
						onSnapshot(batch);
					} else if (event.event === "append") {
						onAppend(batch);
					}

					lastSeqRef.current = batch[batch.length - 1].seq;
					onConnected();
				},
				onScheduleReconnect: () => {
					if (!isDisposed) {
						onReconnecting();
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
	}, [onAppend, onConnected, onReconnecting, onSnapshot]);
}
