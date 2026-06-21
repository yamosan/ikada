import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LogEvent } from "../../type";

type LogListProps = {
	logs: LogEvent[];
	selectedSeq?: number;
	startBoundary?: Date | null;
	endBoundary?: Date | null;
	onSelect: (event: LogEvent) => void;
};

const LOG_ROW_GRID_CLASS =
	"grid-cols-[3.5rem_10.5rem_fit-content(6rem)_minmax(0,1fr)]";
const ROW_HEIGHT_PX = 32;
const BOTTOM_THRESHOLD_PX = 4;

function formatBoundaryTs(date: Date): string {
	return date.toLocaleString("en-US", {
		month: "numeric",
		day: "numeric",
		year: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
}

function BoundaryRow({ date }: { date: Date }) {
	return (
		<div className="flex shrink-0 items-center gap-3 px-6 py-1">
			<div className="flex-1 border-t border-blue-800/50" />
			<span className="shrink-0 font-mono text-[11px] text-blue-400/80">
				{formatBoundaryTs(date)}
			</span>
			<div className="flex-1 border-t border-blue-800/50" />
		</div>
	);
}

function formatTimestamp(timestamp: number): string {
	return new Date(timestamp)
		.toISOString()
		.replace("T", " ")
		.replace("Z", "")
		.slice(0, 23);
}

export function LogList({
	logs,
	selectedSeq,
	startBoundary,
	endBoundary,
	onSelect,
}: LogListProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [isAtBottom, setIsAtBottom] = useState(true);
	const isAtBottomRef = useRef(true);
	const prevLogCountRef = useRef(logs.length);

	const syncAtBottomState = useCallback(() => {
		const scrollElement = scrollRef.current;
		if (!scrollElement) {
			return;
		}
		const distanceToBottom =
			scrollElement.scrollHeight -
			(scrollElement.scrollTop + scrollElement.clientHeight);
		const nextIsAtBottom = distanceToBottom <= BOTTOM_THRESHOLD_PX;
		if (isAtBottomRef.current === nextIsAtBottom) {
			return;
		}
		isAtBottomRef.current = nextIsAtBottom;
		setIsAtBottom(nextIsAtBottom);
	}, []);

	const rowVirtualizer = useVirtualizer({
		count: logs.length,
		getScrollElement: () => scrollRef.current,
		estimateSize: () => ROW_HEIGHT_PX,
		overscan: 8,
		useFlushSync: false,
	});

	const handleJumpToLatest = useCallback(() => {
		if (logs.length === 0) {
			return;
		}
		rowVirtualizer.scrollToIndex(logs.length - 1, {
			align: "end",
			behavior: "smooth",
		});
		isAtBottomRef.current = true;
		setIsAtBottom(true);
	}, [logs.length, rowVirtualizer]);

	useEffect(() => {
		const previousLogCount = prevLogCountRef.current;
		const hasAppended = logs.length > previousLogCount;
		prevLogCountRef.current = logs.length;

		if (!hasAppended || !isAtBottomRef.current || logs.length === 0) {
			return;
		}
		rowVirtualizer.scrollToIndex(logs.length - 1, {
			align: "end",
			behavior: "auto",
		});
	}, [logs.length, rowVirtualizer]);

	const virtualRows = rowVirtualizer.getVirtualItems();
	const totalSize = rowVirtualizer.getTotalSize();

	return (
		<div className="relative h-full min-w-0">
			<div className="flex h-full min-h-0 flex-col overflow-x-auto">
				<div className="px-4">
					<div
						className={`grid ${LOG_ROW_GRID_CLASS} px-2 gap-x-3 border-b border-zinc-700/80 py-1 text-[11px] uppercase tracking-[0.04em] text-zinc-500`}
					>
						<span>seq</span>
						<span>time</span>
						<span>source</span>
						<span>message</span>
					</div>
				</div>
				{startBoundary && <BoundaryRow date={startBoundary} />}
				<div
					ref={scrollRef}
					onScroll={syncAtBottomState}
					className="min-h-0 flex-1 overflow-y-auto px-4"
				>
					<div
						className="relative border-y border-zinc-700/70 bg-zinc-900/35"
						style={{ height: `${totalSize}px` }}
					>
						{virtualRows.map((virtualRow) => {
							const event = logs[virtualRow.index];
							if (!event) {
								return null;
							}
							return (
								<button
									type="button"
									key={event.seq}
									className={`absolute left-0 top-0 grid w-full ${LOG_ROW_GRID_CLASS} cursor-pointer gap-x-3 border-b border-zinc-700/70 px-2 py-1.5 text-left text-xs transition-colors outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-teal-400/50 ${
										selectedSeq === event.seq
											? "bg-teal-900/35 ring-1 ring-inset ring-teal-500/70 hover:bg-teal-800/45"
											: "hover:bg-teal-950/20"
									}`}
									style={{
										height: `${virtualRow.size}px`,
										transform: `translateY(${virtualRow.start}px)`,
									}}
									onClick={() => onSelect(event)}
								>
									<span className="whitespace-nowrap font-mono text-teal-300">
										#{event.seq}
									</span>
									<span className="whitespace-nowrap font-mono text-zinc-400">
										{formatTimestamp(event.timestamp)}
									</span>
									<span className="truncate text-zinc-400">{event.source}</span>
									<span className="truncate text-zinc-200">
										{event.line || "\u00a0"}
									</span>
								</button>
							);
						})}
					</div>
				</div>
				{endBoundary && <BoundaryRow date={endBoundary} />}
			</div>
			{logs.length > 0 && !isAtBottom ? (
				<button
					type="button"
					aria-label="Jump to latest"
					className="absolute bottom-3 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-teal-700/80 bg-zinc-900 text-teal-200 shadow-sm transition-colors hover:bg-teal-800"
					onClick={handleJumpToLatest}
				>
					<ArrowDown className="h-4 w-4" aria-hidden="true" />
				</button>
			) : null}
		</div>
	);
}
