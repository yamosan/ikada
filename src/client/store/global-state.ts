import { create } from "zustand";
import {
	createPausedDateFilter,
	DEFAULT_FILTER_DRAFT,
} from "@/client/component/filter-bar/filter";
import type {
	GlobalState,
	GlobalStateViewMode,
} from "@/client/types/global-state";

const LIVE_VIEW_MODE: GlobalStateViewMode = { type: "live" };

export const useGlobalStateStore = create<GlobalState>((set, get) => ({
	logs: [],
	connection: "reconnecting",
	filter: DEFAULT_FILTER_DRAFT,
	viewMode: LIVE_VIEW_MODE,
	selectedSeq: null,
	actions: {
		setConnection: (connection) => {
			set({ connection });
		},
		replaceLogs: (logs) => {
			set({ logs });
		},
		appendLogs: (logs) => {
			set((state) => ({ logs: [...state.logs, ...logs] }));
		},
		setTextFilter: (text) => {
			set((state) => ({
				filter: { ...state.filter, text },
			}));
		},
		setSourceFilter: (sources) => {
			set((state) => ({
				filter: { ...state.filter, sources },
			}));
		},
		applyDateFilter: (filter) => {
			set({
				filter,
				viewMode: { type: "paused", pausedAt: Date.now() },
			});
		},
		toggleLive: () => {
			const { viewMode } = get();
			if (viewMode.type === "live") {
				const pausedAt = Date.now();
				const pausedDateFilter = createPausedDateFilter(new Date(pausedAt));
				set((state) => ({
					filter: { ...state.filter, date: pausedDateFilter },
					viewMode: { type: "paused", pausedAt },
				}));
				return;
			}

			set((state) => ({
				filter: { ...state.filter, date: DEFAULT_FILTER_DRAFT.date },
				viewMode: LIVE_VIEW_MODE,
			}));
		},
		selectLog: (seq) => {
			set({ selectedSeq: seq });
		},
		closeSelectedLog: () => {
			set({ selectedSeq: null });
		},
	},
}));
