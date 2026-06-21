import { useGlobalStateStore } from "@/client/store/global-state";
import { selectSelectedEvent } from "@/client/store/selectors";

export function useContentPanelState() {
	return useGlobalStateStore(selectSelectedEvent);
}
