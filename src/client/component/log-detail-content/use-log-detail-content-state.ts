import { useGlobalStateStore } from "@/client/store/global-state";
import { selectSelectedEvent } from "@/client/store/selectors";

export function useLogDetailContentState() {
	return useGlobalStateStore(selectSelectedEvent);
}
