import { useState } from "react";
import { FilterBar } from "./component/filter-bar";
import { DEFAULT_FILTER_DRAFT } from "./component/filter-bar/filter";
import { LogList } from "./component/log-list";
import { LogViewerHeader } from "./component/log-viewer-header";
import { useLogEvents } from "./hook/use-log-events";

function App() {
	const { logs, connection } = useLogEvents();
	const [draft, setDraft] = useState(DEFAULT_FILTER_DRAFT);

	const displayedLogs = logs;

	return (
		<div className="flex h-full flex-col bg-zinc-900 font-mono text-zinc-200">
			<LogViewerHeader connection={connection} />
			<FilterBar draft={draft} onDraftChange={setDraft} onApply={() => {}} />
			<LogList logs={displayedLogs} />
		</div>
	);
}

export default App;
