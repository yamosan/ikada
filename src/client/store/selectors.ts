import {
	applyFilter,
	getDateFilterBoundaries,
} from "@/client/component/filter-bar/filter";
import type { GlobalState } from "@/client/types/global-state";
import type { LogEvent } from "@/type";

export type DateBoundaryTimestamps = {
	startBoundaryTimestamp: number | null;
	endBoundaryTimestamp: number | null;
};

export function selectIsLive(state: GlobalState): boolean {
	return state.viewMode.type === "live";
}

export function selectAvailableSources(state: GlobalState): string[] {
	const seen = new Set<string>();
	for (const log of state.logs) seen.add(log.source);
	return Array.from(seen).sort();
}

export function selectDisplayedLogs(state: GlobalState): LogEvent[] {
	const { viewMode } = state;
	const baseLogs =
		viewMode.type === "live"
			? state.logs
			: state.logs.filter((log) => log.timestamp <= viewMode.pausedAt);
	return applyFilter(baseLogs, state.filter);
}

export function selectSelectedEvent(state: GlobalState): LogEvent | null {
	if (state.selectedSeq === null) {
		return null;
	}
	return state.logs.find((log) => log.seq === state.selectedSeq) ?? null;
}

export function selectDateBoundaryTimestamps(
	state: GlobalState,
): DateBoundaryTimestamps {
	if (state.viewMode.type === "live") {
		return {
			startBoundaryTimestamp: null,
			endBoundaryTimestamp: null,
		};
	}
	const dateBoundaries = getDateFilterBoundaries(
		state.filter.date,
		state.viewMode.pausedAt,
	);
	return {
		startBoundaryTimestamp: dateBoundaries.start?.getTime() ?? null,
		endBoundaryTimestamp: dateBoundaries.end?.getTime() ?? null,
	};
}
