import { useCallback, useMemo, useState } from "react";
import {
	applyFilter,
	createPausedDateFilter,
	DEFAULT_FILTER_DRAFT,
	getDateFilterBoundaries,
} from "@/client/component/filter-bar/filter";
import type { FilterDraft } from "@/client/types/filter";
import type {
	GlobalState,
	GlobalStateViewMode,
} from "@/client/types/global-state";
import { useLogEvents } from "./use-log-events";

export function useGlobalState(): GlobalState {
	const { logs, connection } = useLogEvents();
	const [filter, setFilter] = useState<FilterDraft>(DEFAULT_FILTER_DRAFT);
	const [viewMode, setViewMode] = useState<GlobalStateViewMode>({
		type: "live",
	});
	const [selectedSeq, setSelectedSeq] = useState<number | null>(null);

	const isLive = viewMode.type === "live";

	const setTextFilter = useCallback((text: string) => {
		setFilter((current) => ({ ...current, text }));
	}, []);

	const setSourceFilter = useCallback((sources: string[]) => {
		setFilter((current) => ({ ...current, sources }));
	}, []);

	const pauseAt = useCallback((pausedAt: number) => {
		setViewMode({ type: "paused", pausedAt });
	}, []);

	const resumeLive = useCallback(() => {
		setFilter((current) => ({ ...current, date: DEFAULT_FILTER_DRAFT.date }));
		setViewMode({ type: "live" });
	}, []);

	const applyDateFilter = useCallback(
		(nextFilter: FilterDraft) => {
			setFilter(nextFilter);
			pauseAt(Date.now());
		},
		[pauseAt],
	);

	const toggleLive = useCallback(() => {
		if (viewMode.type === "live") {
			const pausedAt = Date.now();
			const pausedDateFilter = createPausedDateFilter(new Date(pausedAt));
			setFilter((current) => ({ ...current, date: pausedDateFilter }));
			pauseAt(pausedAt);
			return;
		}

		resumeLive();
	}, [pauseAt, resumeLive, viewMode.type]);

	const availableSources = useMemo(() => {
		const seen = new Set<string>();
		for (const log of logs) seen.add(log.source);
		return Array.from(seen).sort();
	}, [logs]);

	const displayedLogs = useMemo(() => {
		const baseLogs =
			viewMode.type === "live"
				? logs
				: logs.filter((log) => log.timestamp <= viewMode.pausedAt);
		return applyFilter(baseLogs, filter);
	}, [logs, filter, viewMode]);

	const selectedEvent = useMemo(() => {
		if (selectedSeq === null) {
			return null;
		}
		return logs.find((log) => log.seq === selectedSeq) ?? null;
	}, [logs, selectedSeq]);

	const boundaries = useMemo(
		() =>
			viewMode.type === "live"
				? { start: null, end: null }
				: getDateFilterBoundaries(filter.date, viewMode.pausedAt),
		[filter.date, viewMode],
	);

	return {
		logs,
		connection,
		filter,
		viewMode,
		isLive,
		availableSources,
		displayedLogs,
		selectedSeq,
		selectedEvent,
		startBoundary: boundaries.start,
		endBoundary: boundaries.end,
		setTextFilter,
		setSourceFilter,
		applyDateFilter,
		toggleLive,
		selectLog: setSelectedSeq,
		closeSelectedLog: () => setSelectedSeq(null),
	};
}
