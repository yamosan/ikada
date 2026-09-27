import { useCallback } from "react";
import { FilterBar } from "@/client/component/filter-bar";
import { LogExplorer } from "@/client/component/log-explorer";
import { useGlobalStateStore } from "@/client/store/global-state";
import { useServerLogEvents } from "@/client/use-server-log-events";

function App() {
	const actions = useGlobalStateStore((state) => state.actions);
	const handleConnected = useCallback(() => {
		actions.setConnection("connected");
	}, [actions]);
	const handleReconnecting = useCallback(() => {
		actions.setConnection("reconnecting");
	}, [actions]);

	useServerLogEvents({
		onConnected: handleConnected,
		onReconnecting: handleReconnecting,
		onSnapshot: actions.replaceLogs,
		onAppend: actions.appendLogs,
	});

	return (
		<div className="flex h-full flex-col bg-gray-900 text-gray-200">
			<FilterBar />
			<LogExplorer />
		</div>
	);
}

export default App;
