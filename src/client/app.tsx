import { useCallback, useMemo, useRef, useState } from "react";
import { FilterBar } from "./component/filter-bar";
import {
	applyFilter,
	DEFAULT_FILTER_DRAFT,
	type FilterDraft,
	hasActiveDateFilter,
} from "./component/filter-bar/filter";
import { localISOString } from "./component/filter-bar/date-filter/date-utils";
import { LogList } from "./component/log-list";
import { useLogEvents } from "./hook/use-log-events";

function getBoundaries(
	filter: FilterDraft,
	dateAppliedAt: number,
): { start: Date | null; end: Date | null } {
	const { date } = filter;
	const appliedAt = new Date(dateAppliedAt);

	if (date.operator === "after" && date.after.value) {
		return {
			start: new Date(Date.parse(date.after.value)),
			end: appliedAt,
		};
	}
	if (date.operator === "between") {
		return {
			start: date.between.start ? new Date(Date.parse(date.between.start)) : null,
			end: date.between.end ? new Date(Date.parse(date.between.end)) : appliedAt,
		};
	}
	if (date.operator === "before" && date.before.value) {
		return {
			start: null,
			end: new Date(Date.parse(date.before.value)),
		};
	}
	return { start: null, end: appliedAt };
}

function App() {
	const { logs } = useLogEvents();
	const [filter, setFilter] = useState<FilterDraft>(DEFAULT_FILTER_DRAFT);
	const [isLive, setIsLive] = useState(true);
	const [dateAppliedAt, setDateAppliedAt] = useState<number>(() => Date.now());
	const prevDateRef = useRef(DEFAULT_FILTER_DRAFT.date);

	const handleToggleLive = useCallback(() => {
		if (isLive) {
			const now = Date.now();
			const beforeDate = {
				...DEFAULT_FILTER_DRAFT.date,
				operator: "before" as const,
				before: { value: localISOString(new Date(now)) },
			};
			prevDateRef.current = beforeDate;
			setDateAppliedAt(now);
			setFilter((prev) => ({ ...prev, date: beforeDate }));
			setIsLive(false);
		} else {
			prevDateRef.current = DEFAULT_FILTER_DRAFT.date;
			setFilter((prev) => ({ ...prev, date: DEFAULT_FILTER_DRAFT.date }));
			setIsLive(true);
		}
	}, [isLive]);

	const handleFilterChange = useCallback((next: FilterDraft) => {
		if (next.date !== prevDateRef.current) {
			prevDateRef.current = next.date;
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
			: logs.filter((l) => l.timestamp <= dateAppliedAt);
		return applyFilter(baseLogs, filter);
	}, [logs, filter, isLive, dateAppliedAt]);

	const boundaries = useMemo(
		() => (isLive ? { start: null, end: null } : getBoundaries(filter, dateAppliedAt)),
		[isLive, filter, dateAppliedAt],
	);

	return (
		<div className="flex h-full flex-col bg-zinc-900 text-zinc-200">
			{/* <div className="flex h-full flex-col bg-zinc-900 font-mono text-zinc-200"> */}
			<FilterBar
				filter={filter}
				onFilterChange={handleFilterChange}
				availableSources={availableSources}
				isLive={isLive}
				onToggleLive={handleToggleLive}
			/>
			<LogList
				logs={displayedLogs}
				startBoundary={boundaries.start}
				endBoundary={boundaries.end}
			/>
		</div>
	);
}

export default App;
