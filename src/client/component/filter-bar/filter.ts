import type { LogEvent } from "../../hook/use-log-events";

export type DateFilterOperator = "between" | "before" | "after";

export type DateRangeValue = {
	start: string;
	end: string;
};

export type DateFilter = {
	operator: DateFilterOperator;
	between: DateRangeValue;
	before: { value: string };
	after: { value: string };
};

export type FilterDraft = {
	text: string;
	sources: string[];
	date: DateFilter;
};

export type AppliedFilter = FilterDraft & {
	appliedAt: number;
};

export const DEFAULT_FILTER_DRAFT: FilterDraft = {
	text: "",
	sources: [],
	date: {
		operator: "between",
		between: { start: "", end: "" },
		before: { value: "" },
		after: { value: "" },
	},
};

function matchesDate(event: LogEvent, date: DateFilter): boolean {
	const ts = event.timestamp;
	if (date.operator === "between") {
		const { start, end } = date.between;
		if (!start && !end) return true;
		const startTs = start ? Date.parse(start) : -Infinity;
		const endTs = end ? Date.parse(end) : Infinity;
		return ts >= startTs && ts <= endTs;
	}
	if (date.operator === "before") {
		if (!date.before.value) return true;
		return ts < Date.parse(date.before.value);
	}
	if (!date.after.value) return true;
	return ts > Date.parse(date.after.value);
}

export function applyFilter(logs: LogEvent[], filter: FilterDraft): LogEvent[] {
	const text = filter.text.toLowerCase();
	return logs.filter((event) => {
		if (text && !event.line.toLowerCase().includes(text)) return false;
		if (filter.sources.length > 0 && !filter.sources.includes(event.source))
			return false;
		if (!matchesDate(event, filter.date)) return false;
		return true;
	});
}
