import { Accordion } from "@ark-ui/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronRight } from "lucide-react";
import { memo, useRef } from "react";
import type { LogEvent } from "../hook/use-log-events";
import { ContentPanel } from "./content-panel";
import { ContentPanelJson } from "./content-panel-json";

type LogListProps = {
	logs: LogEvent[];
};

const LOG_ROW_GRID_CLASS =
	"grid-cols-[2rem_fit-content(3rem)_10.5rem_fit-content(6rem)_minmax(0,1fr)]";

function parseJsonLine(line: string): unknown | null {
	try {
		return JSON.parse(line);
	} catch {
		return null;
	}
}

export function LogList({ logs }: LogListProps) {
	const parentRef = useRef<HTMLElement>(null);
	const rowVirtualizer = useVirtualizer({
		count: logs.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 44,
		overscan: 8,
		useFlushSync: false,
	});
	const virtualRows = rowVirtualizer.getVirtualItems();
	const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
	const paddingBottom =
		virtualRows.length > 0
			? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
			: 0;

	return (
		<main
			ref={parentRef}
			className="flex-1 overflow-y-auto px-4 py-2 overflow-x-auto"
		>
			<div className={`grid ${LOG_ROW_GRID_CLASS} gap-y-0 gap-x-3 min-w-120`}>
				<div className="col-span-full grid grid-cols-subgrid items-center border-b border-zinc-700/80 px-2 py-1 text-[11px] uppercase tracking-[0.04em] text-zinc-500">
					<span aria-hidden="true"></span>
					<span>seq</span>
					<span>time</span>
					<span>source</span>
					<span>message</span>
				</div>
				<Accordion.Root
					collapsible={true}
					multiple={true}
					lazyMount={true}
					unmountOnExit={true}
					className="col-span-full grid grid-cols-subgrid"
				>
					<div className="col-span-full grid grid-cols-subgrid border-y border-zinc-700/70 bg-zinc-900/35">
						{paddingTop > 0 ? (
							<div
								aria-hidden="true"
								className="col-span-full"
								style={{ height: `${paddingTop}px` }}
							/>
						) : null}
						<div className="col-span-full grid grid-cols-subgrid divide-y divide-zinc-700/70">
							{virtualRows.map((virtualRow) => {
								const event = logs[virtualRow.index];
								if (!event) {
									return null;
								}
								return (
									<div
										key={event.seq}
										data-index={virtualRow.index}
										ref={rowVirtualizer.measureElement}
										className="col-span-full grid grid-cols-subgrid"
									>
										<MemoizedLogListItem event={event} />
									</div>
								);
							})}
						</div>
						{paddingBottom > 0 ? (
							<div
								aria-hidden="true"
								className="col-span-full"
								style={{ height: `${paddingBottom}px` }}
							/>
						) : null}
					</div>
				</Accordion.Root>
			</div>
		</main>
	);
}

const MemoizedLogListItem = memo(({ event }: { event: LogEvent }) => {
	return <LogListItem event={event} />;
});

function LogListItem({ event }: { event: LogEvent }) {
	const itemValue = `log-${event.seq}`;
	const timestamp = new Date(event.timestamp)
		.toISOString()
		.replace("T", " ")
		.replace("Z", "")
		.slice(0, 23);
	const parsedJson = parseJsonLine(event.line);

	return (
		<Accordion.Item
			key={itemValue}
			value={itemValue}
			className="col-span-full grid grid-cols-subgrid overflow-x-hidden"
		>
			<Accordion.ItemTrigger className="text-left col-span-full grid grid-cols-subgrid cursor-pointer items-center px-2 py-1.5 transition-colors hover:bg-teal-950/20 data-[state=open]:bg-teal-950/30 select-none">
				<Accordion.ItemIndicator className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 transition-transform data-[state=open]:rotate-90 data-[state=open]:text-teal-300">
					<ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
				</Accordion.ItemIndicator>
				<span className="whitespace-nowrap text-xs text-teal-300">
					#{event.seq}
				</span>
				<span className="whitespace-nowrap text-xs text-zinc-400">
					{timestamp}
				</span>
				<span className="truncate text-xs text-zinc-400">{event.source}</span>
				<span className="min-w-0 truncate text-xs text-zinc-200">
					{event.line || "\u00a0"}
				</span>
			</Accordion.ItemTrigger>
			<Accordion.ItemContent className="accordion-content-motion col-span-full px-7 py-2.5">
				{parsedJson !== null ? (
					<ContentPanelJson data={parsedJson} />
				) : (
					<ContentPanel line={event.line} />
				)}
			</Accordion.ItemContent>
		</Accordion.Item>
	);
}
