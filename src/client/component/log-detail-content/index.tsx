import { JsonPreview } from "./json-preview";
import { RawPreview } from "./raw-preview";
import { useLogDetailContentState } from "./use-log-detail-content-state";

type LogContent =
	| { type: "json"; data: unknown; line: string }
	| { type: "text"; line: string };

function formatTimestamp(timestamp: number): string {
	return new Date(timestamp)
		.toISOString()
		.replace("T", " ")
		.replace("Z", "")
		.slice(0, 23);
}

function parseLogContent(line: string): LogContent {
	try {
		return { type: "json", data: JSON.parse(line), line };
	} catch {
		return { type: "text", line };
	}
}

export function LogDetailContent() {
	const event = useLogDetailContentState();
	if (event === null) {
		return null;
	}

	const content = parseLogContent(event.line);

	return (
		<div key={event.seq} className="space-y-3">
			<div className="grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1 text-xs">
				<span className="text-zinc-500">seq</span>
				<span className="text-zinc-200">#{event.seq}</span>
				<span className="text-zinc-500">time</span>
				<span className="text-zinc-200">
					{formatTimestamp(event.timestamp)}
				</span>
				<span className="text-zinc-500">source</span>
				<span className="text-zinc-200">{event.source}</span>
				<span className="text-zinc-500">stream</span>
				<span className="text-zinc-200">{event.stream}</span>
			</div>
			<div className="min-w-0 overflow-x-auto rounded-md border border-zinc-700 bg-zinc-950/70 p-3">
				{content.type === "json" ? (
					<JsonPreview data={content.data} line={content.line} />
				) : (
					<RawPreview line={content.line} />
				)}
			</div>
		</div>
	);
}

export { JsonPreview } from "./json-preview";
export { RawPreview } from "./raw-preview";
