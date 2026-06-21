import type { LogEvent } from "@/type";
import type { ConnectionState } from "./connection";
import type { FilterDraft } from "./filter";

export type GlobalStateViewMode =
	| { type: "live" }
	| { type: "paused"; pausedAt: number };

export type GlobalState = {
	logs: LogEvent[];
	connection: ConnectionState;
	filter: FilterDraft;
	viewMode: GlobalStateViewMode;
	isLive: boolean;
	availableSources: string[];
	displayedLogs: LogEvent[];
	selectedSeq: number | null;
	selectedEvent: LogEvent | null;
	startBoundary: Date | null;
	endBoundary: Date | null;
	setTextFilter: (text: string) => void;
	setSourceFilter: (sources: string[]) => void;
	applyDateFilter: (filter: FilterDraft) => void;
	toggleLive: () => void;
	selectLog: (seq: number) => void;
	closeSelectedLog: () => void;
};
