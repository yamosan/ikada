import type { DateFilter, FilterDraft } from "@/client/types/filter";
import type { LogEvent } from "@/type";

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

function localDateTimeString(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function createAfterDateFilter(
	now: Date,
	durationMs: number,
): DateFilter {
	return {
		...DEFAULT_FILTER_DRAFT.date,
		operator: "after",
		after: { value: localDateTimeString(new Date(now.getTime() - durationMs)) },
	};
}

export function createPausedDateFilter(now: Date): DateFilter {
	return {
		...DEFAULT_FILTER_DRAFT.date,
		operator: "before",
		before: { value: localDateTimeString(now) },
	};
}

export function getDateFilterBoundaries(
	date: DateFilter,
	dateAppliedAt: number,
): { start: Date | null; end: Date | null } {
	const appliedAt = new Date(dateAppliedAt);

	if (date.operator === "after" && date.after.value) {
		return {
			start: new Date(Date.parse(date.after.value)),
			end: appliedAt,
		};
	}
	if (date.operator === "between") {
		return {
			start: date.between.start
				? new Date(Date.parse(date.between.start))
				: null,
			end: date.between.end
				? new Date(Date.parse(date.between.end))
				: appliedAt,
		};
	}
	if (date.operator === "before" && date.before.value) {
		return {
			start: null,
			end: new Date(Date.parse(date.before.value)),
		};
	}
	return { start: null, end: appliedAt };
}

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
