import { useEffect, useMemo, useRef, useState } from "react";

type LogEvent = {
	seq: number;
	timestamp: number;
	source: string;
	stream: "stdout" | "stderr";
	line: string;
};

type ConnectionState = "connected" | "reconnecting";

const RECONNECT_DELAY_MS = 1_000;

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

function App() {
	const [logs, setLogs] = useState<LogEvent[]>([]);
	const [tailEnabled, setTailEnabled] = useState(true);
	const [connection, setConnection] = useState<ConnectionState>("reconnecting");
	const lastSeqRef = useRef<number>(0);
	const reconnectTimerRef = useRef<number | null>(null);
	const eventSourceRef = useRef<EventSource | null>(null);
	const listEndRef = useRef<HTMLDivElement | null>(null);
	const lastRenderedSeq = logs[logs.length - 1]?.seq ?? 0;

	useEffect(() => {
		if (!tailEnabled) {
			return;
		}
		if (lastRenderedSeq < 0) {
			return;
		}
		listEndRef.current?.scrollIntoView({ block: "end" });
	}, [lastRenderedSeq, tailEnabled]);

	useEffect(() => {
		let isDisposed = false;

		const connect = (): void => {
			if (isDisposed) {
				return;
			}

			const params =
				lastSeqRef.current > 0 ? `?sinceSeq=${String(lastSeqRef.current)}` : "";
			const eventSource = new EventSource(`/api/events${params}`);
			eventSourceRef.current = eventSource;

			eventSource.onopen = () => {
				setConnection("connected");
			};

			eventSource.addEventListener("snapshot", (event) => {
				const batch = parseEventBatch(event.data);
				setLogs(batch);
				if (batch.length > 0) {
					lastSeqRef.current = batch[batch.length - 1].seq;
				}
				setConnection("connected");
			});

			eventSource.addEventListener("append", (event) => {
				const batch = parseEventBatch(event.data);
				if (batch.length === 0) {
					return;
				}
				lastSeqRef.current = batch[batch.length - 1].seq;
				setLogs((prev) => [...prev, ...batch]);
				setConnection("connected");
			});

			eventSource.onerror = () => {
				setConnection("reconnecting");
				eventSource.close();

				if (isDisposed || reconnectTimerRef.current !== null) {
					return;
				}

				reconnectTimerRef.current = window.setTimeout(() => {
					reconnectTimerRef.current = null;
					connect();
				}, RECONNECT_DELAY_MS);
			};
		};

		connect();

		return () => {
			isDisposed = true;
			if (reconnectTimerRef.current !== null) {
				window.clearTimeout(reconnectTimerRef.current);
				reconnectTimerRef.current = null;
			}
			if (eventSourceRef.current !== null) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}
		};
	}, []);

	const statusLabel = useMemo(() => {
		return connection === "connected" ? "connected" : "reconnecting";
	}, [connection]);

	return (
		<div className="app-shell">
			<header className="toolbar">
				<h1>JSON Log Viewer</h1>
				<div className="toolbar-actions">
					<span className={`connection connection-${connection}`}>
						{statusLabel}
					</span>
					<button
						type="button"
						className="tail-toggle"
						onClick={() => {
							setTailEnabled((enabled) => !enabled);
						}}
					>
						Tail: {tailEnabled ? "ON" : "OFF"}
					</button>
				</div>
			</header>

			<main className="log-list">
				{logs.map((event) => {
					const timestamp = new Date(event.timestamp).toLocaleTimeString();
					return (
						<article key={event.seq} className="log-line">
							<span className="meta">{event.seq}</span>
							<span className="meta">{timestamp}</span>
							<span className="meta">{event.source}</span>
							<span className="meta">{event.stream}</span>
							<code>{event.line || "\u00a0"}</code>
						</article>
					);
				})}
				<div ref={listEndRef} />
			</main>
		</div>
	);
}

export default App;
