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
	selectedSeq: number | null;
	actions: GlobalStateActions;
};

export type GlobalStateActions = {
	setConnection: (connection: ConnectionState) => void;
	replaceLogs: (logs: LogEvent[]) => void;
	appendLogs: (logs: LogEvent[]) => void;
	setTextFilter: (text: string) => void;
	setSourceFilter: (sources: string[]) => void;
	applyDateFilter: (filter: FilterDraft) => void;
	toggleLive: () => void;
	selectLog: (seq: number) => void;
	closeSelectedLog: () => void;
};
