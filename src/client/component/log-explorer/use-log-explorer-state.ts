import { useGlobalStateStore } from "@/client/store/global-state";
import { selectSelectedEvent } from "@/client/store/selectors";

export function useLogExplorerState() {
	const selectedEvent = useGlobalStateStore(selectSelectedEvent);
	const closeSelectedLog = useGlobalStateStore(
		(state) => state.actions.closeSelectedLog,
	);

	return {
		isPanelOpen: selectedEvent !== null,
		selectedEvent,
		closeSelectedLog,
	};
}
