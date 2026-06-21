import { FilterBar } from "@/client/component/filter-bar";
import { LogExplorer } from "@/client/component/log-explorer";
import { useGlobalState } from "@/client/use-global-state";

function App() {
	const state = useGlobalState();

	return (
		<div className="flex h-full flex-col bg-zinc-900 text-zinc-200">
			<FilterBar
				filter={state.filter}
				availableSources={state.availableSources}
				isLive={state.isLive}
				onTextFilterChange={state.setTextFilter}
				onSourceFilterChange={state.setSourceFilter}
				onDateFilterApply={state.applyDateFilter}
				onToggleLive={state.toggleLive}
			/>
			<LogExplorer
				logs={state.displayedLogs}
				selectedSeq={state.selectedSeq}
				selectedEvent={state.selectedEvent}
				startBoundary={state.startBoundary}
				endBoundary={state.endBoundary}
				onSelect={state.selectLog}
				onClose={state.closeSelectedLog}
			/>
		</div>
	);
}

export default App;
