import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGlobalStateStore } from "@/client/store/global-state";
import {
	selectDateBoundaryTimestamps,
	selectDisplayedLogs,
} from "@/client/store/selectors";

export function useLogListState() {
	const logs = useGlobalStateStore(useShallow(selectDisplayedLogs));
	const selectedSeq = useGlobalStateStore((state) => state.selectedSeq);
	const { startBoundaryTimestamp, endBoundaryTimestamp } = useGlobalStateStore(
		useShallow(selectDateBoundaryTimestamps),
	);
	const selectLog = useGlobalStateStore((state) => state.actions.selectLog);
	const startBoundary = useMemo(
		() =>
			startBoundaryTimestamp === null ? null : new Date(startBoundaryTimestamp),
		[startBoundaryTimestamp],
	);
	const endBoundary = useMemo(
		() =>
			endBoundaryTimestamp === null ? null : new Date(endBoundaryTimestamp),
		[endBoundaryTimestamp],
	);

	return {
		logs,
		selectedSeq,
		startBoundary,
		endBoundary,
		selectLog,
	};
}
