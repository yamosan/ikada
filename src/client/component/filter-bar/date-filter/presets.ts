import {
	createAfterDateFilter,
	DEFAULT_FILTER_DRAFT,
	type FilterDraft,
} from "../filter";

const SEC_MS = 1000;
const MIN_MS = 60 * SEC_MS;
const HOUR_MS = 60 * MIN_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

export type Preset = {
	label: string;
	buildFilter: () => FilterDraft;
};

export type PresetGroup = {
	group: string;
	presets: Preset[];
};

function buildAfterFilter(msAgo: number): FilterDraft {
	return {
		...DEFAULT_FILTER_DRAFT,
		date: createAfterDateFilter(new Date(), msAgo),
	};
}

export const PRESET_GROUPS: PresetGroup[] = [
	{
		group: "Seconds",
		presets: [
			{
				label: "Last 15 seconds",
				buildFilter: () => buildAfterFilter(15 * SEC_MS),
			},
			{
				label: "Last 30 seconds",
				buildFilter: () => buildAfterFilter(30 * SEC_MS),
			},
		],
	},
	{
		group: "Minutes",
		presets: [
			{ label: "Last 1 minute", buildFilter: () => buildAfterFilter(MIN_MS) },
			{
				label: "Last 5 minutes",
				buildFilter: () => buildAfterFilter(5 * MIN_MS),
			},
			{
				label: "Last 15 minutes",
				buildFilter: () => buildAfterFilter(15 * MIN_MS),
			},
			{
				label: "Last 30 minutes",
				buildFilter: () => buildAfterFilter(30 * MIN_MS),
			},
		],
	},
	{
		group: "Hours",
		presets: [
			{ label: "Last 1 hour", buildFilter: () => buildAfterFilter(HOUR_MS) },
			{
				label: "Last 2 hours",
				buildFilter: () => buildAfterFilter(2 * HOUR_MS),
			},
			{
				label: "Last 3 hours",
				buildFilter: () => buildAfterFilter(3 * HOUR_MS),
			},
			{
				label: "Last 6 hours",
				buildFilter: () => buildAfterFilter(6 * HOUR_MS),
			},
			{
				label: "Last 12 hours",
				buildFilter: () => buildAfterFilter(12 * HOUR_MS),
			},
		],
	},
	{
		group: "Days",
		presets: [
			{ label: "Last 1 day", buildFilter: () => buildAfterFilter(DAY_MS) },
			{
				label: "Last 2 days",
				buildFilter: () => buildAfterFilter(2 * DAY_MS),
			},
			{
				label: "Last 3 days",
				buildFilter: () => buildAfterFilter(3 * DAY_MS),
			},
			{
				label: "Last 30 days",
				buildFilter: () => buildAfterFilter(30 * DAY_MS),
			},
		],
	},
	{
		group: "Weeks",
		presets: [
			{ label: "Last 1 week", buildFilter: () => buildAfterFilter(WEEK_MS) },
			{
				label: "Last 2 weeks",
				buildFilter: () => buildAfterFilter(2 * WEEK_MS),
			},
			{
				label: "Last 4 weeks",
				buildFilter: () => buildAfterFilter(4 * WEEK_MS),
			},
		],
	},
];

export function parseRelativeTimeMs(input: string): number | null {
	const match = input.trim().match(/^(\d+(?:\.\d+)?)(s|m|h|d|w)$/i);
	if (!match) return null;
	const value = parseFloat(match[1]);
	const unit = match[2].toLowerCase();
	const multipliers: Record<string, number> = {
		s: SEC_MS,
		m: MIN_MS,
		h: HOUR_MS,
		d: DAY_MS,
		w: WEEK_MS,
	};
	const ms = value * (multipliers[unit] ?? 0);
	return ms > 0 ? ms : null;
}

export function formatRelativeTimeLabel(input: string): string {
	const match = input.trim().match(/^(\d+(?:\.\d+)?)(s|m|h|d|w)$/i);
	if (!match) return `Last ${input.trim()}`;
	const value = parseFloat(match[1]);
	const unit = match[2].toLowerCase();
	const unitNames: Record<string, [string, string]> = {
		s: ["second", "seconds"],
		m: ["minute", "minutes"],
		h: ["hour", "hours"],
		d: ["day", "days"],
		w: ["week", "weeks"],
	};
	const [singular, plural] = unitNames[unit] ?? [unit, `${unit}s`];
	return `Last ${value} ${value === 1 ? singular : plural}`;
}

export function buildDynamicPreset(
	input: string,
): { label: string; filter: FilterDraft } | null {
	const ms = parseRelativeTimeMs(input);
	if (ms === null) return null;
	return {
		label: formatRelativeTimeLabel(input),
		filter: buildAfterFilter(ms),
	};
}
