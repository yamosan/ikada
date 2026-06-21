import { useShallow } from "zustand/react/shallow";
import { useGlobalStateStore } from "@/client/store/global-state";
import { selectAvailableSources, selectIsLive } from "@/client/store/selectors";

export function useFilterBarState() {
	const filter = useGlobalStateStore((state) => state.filter);
	const availableSources = useGlobalStateStore(
		useShallow(selectAvailableSources),
	);
	const isLive = useGlobalStateStore(selectIsLive);
	const setTextFilter = useGlobalStateStore(
		(state) => state.actions.setTextFilter,
	);
	const setSourceFilter = useGlobalStateStore(
		(state) => state.actions.setSourceFilter,
	);
	const applyDateFilter = useGlobalStateStore(
		(state) => state.actions.applyDateFilter,
	);
	const toggleLive = useGlobalStateStore((state) => state.actions.toggleLive);

	return {
		filter,
		availableSources,
		isLive,
		setTextFilter,
		setSourceFilter,
		applyDateFilter,
		toggleLive,
	};
}
