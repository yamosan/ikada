import {
	CalendarDateTime,
	type DateValue,
	parseDate,
	parseDateTime,
} from "@internationalized/date";

export function localISOString(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function toDateValue(value: string): DateValue | undefined {
	if (!value) return undefined;
	try {
		return value.includes("T") ? parseDateTime(value) : parseDate(value);
	} catch {
		return undefined;
	}
}

export function toCalendarDateTime(
	value: DateValue,
	fallbackTime = { hour: 0, minute: 0, second: 0 },
): CalendarDateTime {
	const hour =
		"hour" in value ? (value.hour ?? fallbackTime.hour) : fallbackTime.hour;
	const minute =
		"minute" in value
			? (value.minute ?? fallbackTime.minute)
			: fallbackTime.minute;
	const second =
		"second" in value
			? (value.second ?? fallbackTime.second)
			: fallbackTime.second;
	return new CalendarDateTime(
		value.year,
		value.month,
		value.day,
		hour,
		minute,
		second,
	);
}
