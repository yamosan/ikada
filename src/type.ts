export type LogStream = "stdout" | "stderr";

export type LogEvent = {
	seq: number;
	timestamp: number;
	source: string;
	stream: LogStream;
	line: string;
};
