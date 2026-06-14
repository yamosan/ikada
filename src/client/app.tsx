import { useCallback, useMemo, useRef, useState } from "react";
import { FilterBar } from "./component/filter-bar";
import {
	applyFilter,
	DEFAULT_FILTER_DRAFT,
	describePausedBanner,
	type FilterDraft,
	hasActiveDateFilter,
} from "./component/filter-bar/filter";
import { LogList } from "./component/log-list";
import { SnapshotBanner } from "./component/snapshot-banner";
import { useLogEvents } from "./hook/use-log-events";

function App() {
	const { logs } = useLogEvents();
	const [filter, setFilter] = useState<FilterDraft>(DEFAULT_FILTER_DRAFT);
	const [isLive, setIsLive] = useState(true);
	const [dateAppliedAt, setDateAppliedAt] = useState<number>(() => Date.now());
	const prevDateRef = useRef(DEFAULT_FILTER_DRAFT.date);

	const handleToggleLive = useCallback(() => {
		if (isLive) {
			setDateAppliedAt(Date.now());
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
			{!isLive && (
				<SnapshotBanner
					description={describePausedBanner(filter, dateAppliedAt)}
					onResumeLive={handleToggleLive}
				/>
			)}
			<LogList logs={displayedLogs} />
		</div>
	);
}

export default App;
