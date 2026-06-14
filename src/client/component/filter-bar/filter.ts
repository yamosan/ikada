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

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
	month: "numeric",
	day: "numeric",
	year: "2-digit",
	hour: "numeric",
	minute: "2-digit",
};

function formatTs(isoStr: string): string {
	return new Date(Date.parse(isoStr)).toLocaleString("en-US", DATE_FORMAT);
}

function formatEpoch(ms: number): string {
	return new Date(ms).toLocaleString("en-US", DATE_FORMAT);
}

export function hasActiveDateFilter(filter: FilterDraft): boolean {
	const { date } = filter;
	if (date.operator === "between") return Boolean(date.between.start || date.between.end);
	if (date.operator === "before") return Boolean(date.before.value);
	return Boolean(date.after.value);
}

export function isClosedPastWindow(filter: FilterDraft): boolean {
	const now = Date.now();
	const { date } = filter;
	if (date.operator === "between") {
		if (!date.between.end) return false;
		const endTs = Date.parse(date.between.end);
		return !Number.isNaN(endTs) && endTs < now;
	}
	if (date.operator === "before") {
		if (!date.before.value) return false;
		const valueTs = Date.parse(date.before.value);
		return !Number.isNaN(valueTs) && valueTs < now;
	}
	return false;
}

export function describeDateFilter(filter: FilterDraft, appliedAt: number): string {
	const { date } = filter;
	const appliedAtStr = formatEpoch(appliedAt);

	if (date.operator === "between") {
		const start = date.between.start ? formatTs(date.between.start) : null;
		const end = date.between.end ? formatTs(date.between.end) : null;
		if (start && end) return `Showing logs from ${start} to ${end}.`;
		if (start) return `Showing logs from ${start} to ${appliedAtStr}.`;
		if (end) return `Showing logs up to ${end}.`;
	}
	if (date.operator === "before" && date.before.value) {
		return `Showing logs before ${formatTs(date.before.value)}.`;
	}
	if (date.operator === "after" && date.after.value) {
		return `Showing logs from ${formatTs(date.after.value)} to ${appliedAtStr}.`;
	}
	return "Showing logs for a time range.";
}

export function describePausedBanner(filter: FilterDraft, dateAppliedAt: number): string {
	if (hasActiveDateFilter(filter)) {
		return describeDateFilter(filter, dateAppliedAt);
	}
	return `Paused at ${formatEpoch(dateAppliedAt)} · Viewing all logs up to this point.`;
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
