import { createListCollection, Listbox } from "@ark-ui/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLogListState } from "./use-log-list-state";

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

function BoundaryRow({ date, className }: { date: Date; className?: string }) {
	return (
		<div
			className={`flex shrink-0 items-center gap-3 px-6 py-1 ${className ?? ""}`}
		>
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

export function LogList() {
	const { logs, selectedSeq, startBoundary, endBoundary, selectLog } =
		useLogListState();
	const scrollRef = useRef<HTMLDivElement>(null);
	const [isAtBottom, setIsAtBottom] = useState(true);
	const [highlightedValue, setHighlightedValue] = useState<string | null>(null);
	const isAtBottomRef = useRef(true);
	const prevLogCountRef = useRef(logs.length);
	const collection = useMemo(
		() =>
			createListCollection({
				items: logs,
				itemToString: (item) => item.line,
				itemToValue: (item) => String(item.seq),
			}),
		[logs],
	);
	const selectedValue = selectedSeq === null ? [] : [String(selectedSeq)];

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

	useEffect(() => {
		setHighlightedValue((currentValue) => {
			if (currentValue && collection.has(currentValue)) {
				return currentValue;
			}

			const selectedValue = selectedSeq === null ? null : String(selectedSeq);
			if (selectedValue && collection.has(selectedValue)) {
				return selectedValue;
			}

			return collection.lastValue ?? null;
		});
	}, [collection, selectedSeq]);

	const virtualRows = rowVirtualizer.getVirtualItems();
	const totalSize = rowVirtualizer.getTotalSize();
	const firstVirtualRow = virtualRows[0];
	const lastVirtualRow = virtualRows.at(-1);
	const topSpacerHeight = firstVirtualRow?.start ?? 0;
	const bottomSpacerHeight = lastVirtualRow
		? totalSize - (lastVirtualRow.start + lastVirtualRow.size)
		: 0;

	return (
		<div className="relative h-full min-w-0">
			<div className="flex h-full min-h-0 flex-col overflow-x-auto">
				<div className="grid h-full min-h-0 min-w-136 grid-cols-[3.5rem_10.5rem_fit-content(6rem)_minmax(0,1fr)] grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-x-4">
					<div className="col-span-full row-start-1 grid grid-cols-subgrid border-b border-zinc-700/80 px-6 py-1 text-[11px] uppercase tracking-[0.04em] text-zinc-500">
						<span>seq</span>
						<span>time</span>
						<span>source</span>
						<span>message</span>
					</div>
					{startBoundary && (
						<BoundaryRow
							date={startBoundary}
							className="col-span-full row-start-2"
						/>
					)}
					<Listbox.Root
						collection={collection}
						selectionMode="single"
						selectOnHighlight
						typeahead={false}
						value={selectedValue}
						highlightedValue={highlightedValue}
						onHighlightChange={(details) =>
							setHighlightedValue(details.highlightedValue)
						}
						onValueChange={(details) => {
							const nextValue = details.value[0];
							if (nextValue) {
								selectLog(Number(nextValue));
							}
						}}
						scrollToIndexFn={({ index }) => {
							rowVirtualizer.scrollToIndex(index, {
								align: "auto",
								behavior: "auto",
							});
						}}
						className="col-span-full row-start-3 grid min-h-0 grid-cols-subgrid"
					>
						<Listbox.Content
							ref={scrollRef}
							aria-label="Logs"
							onScroll={syncAtBottomState}
							className="col-span-full grid min-h-0 grid-cols-subgrid content-start overflow-y-auto overflow-x-hidden border-y border-zinc-700/70 bg-zinc-900/35 px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
						>
							{topSpacerHeight > 0 && (
								<div
									className="col-span-full"
									style={{ height: `${topSpacerHeight}px` }}
								/>
							)}
							{virtualRows.map((virtualRow) => {
								const event = logs[virtualRow.index];
								if (!event) {
									return null;
								}
								return (
									<Listbox.Item
										key={event.seq}
										item={event}
										className={`relative col-span-full grid w-full grid-cols-subgrid cursor-pointer border-b border-zinc-700/70 px-2 py-1.5 text-left text-xs outline-none transition-[color,background-color,box-shadow] data-highlighted:z-10 data-highlighted:ring-2 data-highlighted:ring-ring/50 ${
											selectedSeq === event.seq
												? "bg-ikada-900/35 ring-1 ring-inset ring-ikada-500/70 hover:bg-ikada-800/45"
												: "hover:bg-ikada-950/20"
										}`}
										style={{ height: `${virtualRow.size}px` }}
									>
										<span className="whitespace-nowrap font-mono text-ikada-300">
											#{event.seq}
										</span>
										<span className="whitespace-nowrap font-mono text-zinc-400">
											{formatTimestamp(event.timestamp)}
										</span>
										<span className="truncate text-zinc-400">
											{event.source}
										</span>
										<span className="truncate text-zinc-200">
											{event.line || "\u00a0"}
										</span>
									</Listbox.Item>
								);
							})}
							{bottomSpacerHeight > 0 && (
								<div
									className="col-span-full"
									style={{ height: `${bottomSpacerHeight}px` }}
								/>
							)}
						</Listbox.Content>
					</Listbox.Root>
					{endBoundary && (
						<BoundaryRow
							date={endBoundary}
							className="col-span-full row-start-4"
						/>
					)}
				</div>
			</div>
			{logs.length > 0 && !isAtBottom ? (
				<button
					type="button"
					aria-label="Jump to latest"
					className="absolute bottom-3 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-ikada-700/80 bg-zinc-900 text-ikada-200 shadow-sm outline-none transition-[color,background-color,box-shadow] hover:bg-ikada-800 focus-visible:ring-2 focus-visible:ring-ring/50"
					onClick={handleJumpToLatest}
				>
					<ArrowDown className="h-4 w-4" aria-hidden="true" />
				</button>
			) : null}
		</div>
	);
}
