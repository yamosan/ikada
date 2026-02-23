import { LogList } from "./component/log-list";
import { LogViewerHeader } from "./component/log-viewer-header";
import { useLogEvents } from "./hook/use-log-events";

function App() {
	const { logs, connection } = useLogEvents();

	return (
		<div className="flex h-full flex-col bg-zinc-900 font-mono text-zinc-200">
			<LogViewerHeader connection={connection} />
			<LogList logs={logs} />
		</div>
	);
}

export default App;
