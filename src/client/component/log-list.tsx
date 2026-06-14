import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LogEvent } from "../hook/use-log-events";
import { JsonPreview, RawPreview } from "./content-panel";
import { SidePanel } from "./side-panel";

type LogListProps = {
	logs: LogEvent[];
};

const LOG_ROW_GRID_CLASS =
	"grid-cols-[3.5rem_10.5rem_fit-content(6rem)_minmax(0,1fr)]";
const ROW_HEIGHT_PX = 32;
const BOTTOM_THRESHOLD_PX = 4;
const LIST_PANEL_MIN_SIZE = 35;
const DETAIL_PANEL_MIN_SIZE = 20;

function formatTimestamp(timestamp: number): string {
	return new Date(timestamp)
		.toISOString()
		.replace("T", " ")
		.replace("Z", "")
		.slice(0, 23);
}

function parseJsonLine(line: string): unknown | null {
	try {
		return JSON.parse(line);
	} catch {
		return null;
	}
}

export function LogList({ logs }: LogListProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [isAtBottom, setIsAtBottom] = useState(true);
	const isAtBottomRef = useRef(true);
	const prevLogCountRef = useRef(logs.length);
	const [selectedEvent, setSelectedEvent] = useState<LogEvent | null>(null);

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

	const handleRowClick = useCallback((event: LogEvent) => {
		setSelectedEvent(event);
	}, []);

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

	const parsedSelectedJson = useMemo(() => {
		if (!selectedEvent) {
			return null;
		}
		return parseJsonLine(selectedEvent.line);
	}, [selectedEvent]);

	const virtualRows = rowVirtualizer.getVirtualItems();
	const totalSize = rowVirtualizer.getTotalSize();

	const isOpen = selectedEvent !== null;
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setSelectedEvent(null);
		}
	};
	return (
		<div className="flex-1 min-h-0 overflow-hidden py-2">
			<SidePanel.Root
				open={isOpen}
				onOpenChange={handleOpenChange}
				minMainSize={LIST_PANEL_MIN_SIZE}
				minPanelSize={DETAIL_PANEL_MIN_SIZE}
				className="min-w-120"
			>
				<SidePanel.Main className="relative min-w-0">
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
												selectedEvent?.seq === event.seq
													? "bg-teal-900/35 ring-1 ring-inset ring-teal-500/70 hover:bg-teal-800/45"
													: "hover:bg-teal-950/20"
											}`}
											style={{
												height: `${virtualRow.size}px`,
												transform: `translateY(${virtualRow.start}px)`,
											}}
											onClick={() => handleRowClick(event)}
										>
											<span className="whitespace-nowrap font-mono text-teal-300">
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
										</button>
									);
								})}
							</div>
						</div>
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
				</SidePanel.Main>

				<SidePanel.ResizeTrigger className="group relative w-2 shrink-0 border-x border-zinc-700/80 bg-zinc-900/60 transition-colors hover:bg-teal-950/30" />

				<SidePanel.Panel className="min-w-0 border-l border-zinc-700 bg-zinc-900">
					<div className="flex h-full min-h-0 flex-col">
						<SidePanel.Header className="flex items-center justify-between border-b border-zinc-700 px-4 py-3">
							<div className="flex items-baseline gap-2">
								{selectedEvent && (
									<>
										<SidePanel.Title className="text-sm font-semibold text-zinc-200">
											#{selectedEvent.seq}
										</SidePanel.Title>
										<span className="text-xs text-zinc-500">
											{selectedEvent.source}
										</span>
									</>
								)}
							</div>
							<SidePanel.CloseTrigger className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200">
								<X className="h-4 w-4" aria-hidden="true" />
							</SidePanel.CloseTrigger>
						</SidePanel.Header>
						<SidePanel.Body className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
							{selectedEvent && (
								<div key={selectedEvent.seq} className="space-y-3">
									<div className="grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1 text-xs">
										<span className="text-zinc-500">seq</span>
										<span className="text-zinc-200">#{selectedEvent.seq}</span>
										<span className="text-zinc-500">time</span>
										<span className="text-zinc-200">
											{formatTimestamp(selectedEvent.timestamp)}
										</span>
										<span className="text-zinc-500">source</span>
										<span className="text-zinc-200">
											{selectedEvent.source}
										</span>
										<span className="text-zinc-500">stream</span>
										<span className="text-zinc-200">
											{selectedEvent.stream}
										</span>
									</div>
									<div className="rounded-md border border-zinc-700 bg-zinc-950/70 p-3">
										{parsedSelectedJson !== null ? (
											<JsonPreview
												data={parsedSelectedJson}
												line={selectedEvent.line}
											/>
										) : (
											<RawPreview line={selectedEvent.line} />
										)}
									</div>
								</div>
							)}
						</SidePanel.Body>
					</div>
				</SidePanel.Panel>
			</SidePanel.Root>
		</div>
	);
}
