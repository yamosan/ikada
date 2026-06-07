import { useMemo, useState } from "react";
import { FilterBar } from "./component/filter-bar";
import {
	applyFilter,
	DEFAULT_FILTER_DRAFT,
	type FilterDraft,
} from "./component/filter-bar/filter";
import { LogList } from "./component/log-list";
import { useLogEvents } from "./hook/use-log-events";

function App() {
	const { logs } = useLogEvents();
	const [filter, setFilter] = useState<FilterDraft>(DEFAULT_FILTER_DRAFT);

	const availableSources = useMemo(() => {
		const seen = new Set<string>();
		for (const log of logs) seen.add(log.source);
		return Array.from(seen).sort();
	}, [logs]);

	const displayedLogs = useMemo(
		() => applyFilter(logs, filter),
		[logs, filter],
	);

	return (
		<div className="flex h-full flex-col bg-zinc-900 font-mono text-zinc-200">
			<FilterBar
				filter={filter}
				onFilterChange={setFilter}
				availableSources={availableSources}
			/>
			<LogList logs={displayedLogs} />
		</div>
	);
}

export default App;
