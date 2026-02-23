import type { LogEvent } from "../hook/use-log-events";

type LogListProps = {
	logs: LogEvent[];
};

export function LogList({ logs }: LogListProps) {
	return (
		<main className="flex-1 overflow-auto px-4 py-3">
			{logs.map((event) => {
				const timestamp = new Date(event.timestamp).toLocaleTimeString();
				return (
					<article
						key={event.seq}
						className="grid grid-cols-[auto_auto_1fr] items-baseline gap-2.5 py-0.5 text-[13px] leading-[1.45] lg:grid-cols-[auto_auto_auto_auto_1fr]"
					>
						<span className="whitespace-nowrap text-slate-400">
							{event.seq}
						</span>
						<span className="whitespace-nowrap text-slate-400">
							{timestamp}
						</span>
						<span className="hidden whitespace-nowrap text-slate-400 lg:inline">
							{event.source}
						</span>
						<span className="hidden whitespace-nowrap text-slate-400 lg:inline">
							{event.stream}
						</span>
						<code className="wrap-break-word whitespace-pre-wrap text-slate-50">
							{event.line || "\u00a0"}
						</code>
					</article>
				);
			})}
		</main>
	);
}
