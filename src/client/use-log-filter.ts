import { useCallback, useMemo, useRef, useState } from "react";
import type { LogEvent } from "../type";
import {
	applyFilter,
	createPausedDateFilter,
	DEFAULT_FILTER_DRAFT,
	type FilterDraft,
	getDateFilterBoundaries,
	hasActiveDateFilter,
} from "./component/filter-bar/filter";

export function useLogFilter(logs: LogEvent[]): {
	filter: FilterDraft;
	onFilterChange: (next: FilterDraft) => void;
	availableSources: string[];
	displayedLogs: LogEvent[];
	isLive: boolean;
	onToggleLive: () => void;
	startBoundary: Date | null;
	endBoundary: Date | null;
} {
	const [filter, setFilter] = useState<FilterDraft>(DEFAULT_FILTER_DRAFT);
	const [isLive, setIsLive] = useState(true);
	const [dateAppliedAt, setDateAppliedAt] = useState<number>(() => Date.now());
	const previousDateFilterRef = useRef(DEFAULT_FILTER_DRAFT.date);

	const handleToggleLive = useCallback(() => {
		if (isLive) {
			const now = Date.now();
			const pausedDateFilter = createPausedDateFilter(new Date(now));
			previousDateFilterRef.current = pausedDateFilter;
			setDateAppliedAt(now);
			setFilter((prev) => ({ ...prev, date: pausedDateFilter }));
			setIsLive(false);
			return;
		}

		previousDateFilterRef.current = DEFAULT_FILTER_DRAFT.date;
		setFilter((prev) => ({ ...prev, date: DEFAULT_FILTER_DRAFT.date }));
		setIsLive(true);
	}, [isLive]);

	const handleFilterChange = useCallback((next: FilterDraft) => {
		if (next.date !== previousDateFilterRef.current) {
			previousDateFilterRef.current = next.date;
			if (hasActiveDateFilter(next)) {
				setDateAppliedAt(Date.now());
				setIsLive(false);
			}
		}
		setFilter(next);
	}, []);

	const availableSources = useMemo(() => {
		const seen = new Set<string>();
		for (const log of logs) seen.add(log.source);
		return Array.from(seen).sort();
	}, [logs]);

	const displayedLogs = useMemo(() => {
		const baseLogs = isLive
			? logs
			: logs.filter((log) => log.timestamp <= dateAppliedAt);
		return applyFilter(baseLogs, filter);
	}, [logs, filter, isLive, dateAppliedAt]);

	const boundaries = useMemo(
		() =>
			isLive
				? { start: null, end: null }
				: getDateFilterBoundaries(filter.date, dateAppliedAt),
		[isLive, filter.date, dateAppliedAt],
	);

	return {
		filter,
		onFilterChange: handleFilterChange,
		availableSources,
		displayedLogs,
		isLive,
		onToggleLive: handleToggleLive,
		startBoundary: boundaries.start,
		endBoundary: boundaries.end,
	};
}
