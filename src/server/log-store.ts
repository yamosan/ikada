import type { LogEvent, LogStream } from "../type.js";
import { RingBuffer } from "./ring-buffer.js";

export type LogIngestInput = {
	line: string;
	source?: string;
	stream?: LogStream;
};

export type LogSubscriber = (event: LogEvent) => void;

export interface LogStore {
	append(input: LogIngestInput): LogEvent;
	snapshot(sinceSeq?: number): LogEvent[];
	subscribe(subscriber: LogSubscriber): () => void;
}

export class InMemoryLogStore implements LogStore {
	private readonly ringBuffer: RingBuffer<LogEvent>;
	private readonly subscribers = new Set<LogSubscriber>();
	private nextSeq = 1;

	constructor(maxEvents: number) {
		this.ringBuffer = new RingBuffer<LogEvent>(maxEvents);
	}

	append(input: LogIngestInput): LogEvent {
		const event: LogEvent = {
			seq: this.nextSeq++,
			timestamp: Date.now(),
			source: input.source ?? "stdin",
			stream: input.stream ?? "stdout",
			line: input.line,
		};

		this.ringBuffer.push(event);
		for (const subscriber of this.subscribers) {
			subscriber(event);
		}
		return event;
	}

	snapshot(sinceSeq?: number): LogEvent[] {
		if (sinceSeq === undefined) {
			return this.ringBuffer.toArray();
		}
		return this.ringBuffer.filter((event) => event.seq > sinceSeq);
	}

	subscribe(subscriber: LogSubscriber): () => void {
		this.subscribers.add(subscriber);
		return () => {
			this.subscribers.delete(subscriber);
		};
	}
}
