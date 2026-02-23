import { LogList } from "./component/log-list";
import { LogViewerHeader } from "./component/log-viewer-header";
import { useLogEvents } from "./hook/use-log-events";

function App() {
	const { logs, connection } = useLogEvents();

	return (
		<div className="flex h-full flex-col bg-[#0b1220] font-mono text-slate-200">
			<LogViewerHeader connection={connection} />
			<LogList logs={logs} />
		</div>
	);
}

export default App;
