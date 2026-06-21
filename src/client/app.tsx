import { FilterBar } from "@/client/component/filter-bar";
import { LogExplorer } from "@/client/component/log-explorer";
import { useLogEvents } from "@/client/use-log-events";
import { useLogFilter } from "@/client/use-log-filter";

function App() {
	const { logs } = useLogEvents();
	const logFilter = useLogFilter(logs);

	return (
		<div className="flex h-full flex-col bg-zinc-900 text-zinc-200">
			<FilterBar
				filter={logFilter.filter}
				onFilterChange={logFilter.onFilterChange}
				availableSources={logFilter.availableSources}
				isLive={logFilter.isLive}
				onToggleLive={logFilter.onToggleLive}
			/>
			<LogExplorer
				logs={logFilter.displayedLogs}
				startBoundary={logFilter.startBoundary}
				endBoundary={logFilter.endBoundary}
			/>
		</div>
	);
}

export default App;
