import type { DateValue } from "@internationalized/date";
import { useMemo, useState } from "react";
import { DEFAULT_FILTER_DRAFT, type FilterDraft } from "../filter";
import { toCalendarDateTime } from "./date-utils";
import {
	buildDynamicPreset,
	PRESET_GROUPS,
	type PresetGroup,
	parseRelativeTimeMs,
} from "./presets";

// ─── Filter domain logic ───────────────────────────────────────────────────────

function describeDraft(draft: FilterDraft): string {
	const { date } = draft;
	if (date.operator === "between") {
		if (!date.between.start && !date.between.end) return "All time";
		return `${date.between.start || "-"} → ${date.between.end || "-"}`;
	}
	if (date.operator === "before") {
		if (!date.before.value) return "All time";
		return `Before ${date.before.value}`;
	}
	if (!date.after.value) return "All time";
	return `After ${date.after.value}`;
}

function checkInvalidRange(draft: FilterDraft): boolean {
	if (draft.date.operator !== "between") return false;
	const { start, end } = draft.date.between;
	if (!start || !end) return false;
	const startTs = Date.parse(start);
	const endTs = Date.parse(end);
	if (!Number.isNaN(startTs) && !Number.isNaN(endTs)) return endTs < startTs;
	return end < start;
}

function checkApplyDisabled(draft: FilterDraft): boolean {
	const { date } = draft;
	if (date.operator === "before") return !date.before.value;
	if (date.operator === "after") return !date.after.value;
	const hasStart = Boolean(date.between.start);
	const hasEnd = Boolean(date.between.end);
	if (hasStart !== hasEnd) return true;
	return checkInvalidRange(draft);
}

function checkIsDefault(draft: FilterDraft): boolean {
	const { date } = draft;
	return (
		date.operator === DEFAULT_FILTER_DRAFT.date.operator &&
		date.between.start === "" &&
		date.between.end === "" &&
		date.before.value === "" &&
		date.after.value === ""
	);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export type UseDateFilterReturn = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;

	searchInput: string;
	setSearchInput: (input: string) => void;

	filteredPresetGroups: PresetGroup[];
	dynamicPreset: { label: string; filter: FilterDraft } | null;

	applyDisabled: boolean;
	canClear: boolean;
	hasInvalidRange: boolean;
	triggerDescription: string;

	onPresetSelect: (filter: FilterDraft, label: string) => void;
	onDynamicPresetSelect: () => void;
	onApply: () => void;
	onClear: () => void;
	onDateChange: (
		field: "start" | "end" | "single",
		value: DateValue | undefined,
	) => void;
};

export function useDateFilter(
	draft: FilterDraft,
	onDraftChange: (next: FilterDraft) => void,
	onApply: () => void,
): UseDateFilterReturn {
	const [isOpen, setIsOpen] = useState(false);
	const [activeLabel, setActiveLabel] = useState<string | null>(null);
	const [searchInput, setSearchInput] = useState("");

	const filteredPresetGroups = useMemo<PresetGroup[]>(() => {
		const q = searchInput.trim().toLowerCase();
		if (!q) return PRESET_GROUPS;
		return PRESET_GROUPS.map((g) => ({
			...g,
			presets: g.presets.filter((p) => p.label.toLowerCase().includes(q)),
		})).filter((g) => g.presets.length > 0);
	}, [searchInput]);

	const dynamicPreset = useMemo(
		() => (searchInput.trim() ? buildDynamicPreset(searchInput) : null),
		[searchInput],
	);

	const handlePresetSelect = (filter: FilterDraft, label: string) => {
		onDraftChange(filter);
		onApply();
		setActiveLabel(label);
		setIsOpen(false);
	};

	const handleDynamicPresetSelect = () => {
		if (!dynamicPreset) return;
		handlePresetSelect(dynamicPreset.filter, dynamicPreset.label);
	};

	const handleApply = () => {
		if (checkApplyDisabled(draft)) return;
		onApply();
		setActiveLabel(null);
		setIsOpen(false);
	};

	const handleClear = () => {
		onDraftChange(DEFAULT_FILTER_DRAFT);
		onApply();
		setActiveLabel(null);
		setIsOpen(false);
	};

	const handleDateChange = (
		field: "start" | "end" | "single",
		newValue: DateValue | undefined,
	) => {
		const str = newValue ? toCalendarDateTime(newValue).toString() : "";
		if (field === "start") {
			onDraftChange({
				...draft,
				date: { ...draft.date, between: { ...draft.date.between, start: str } },
			});
		} else if (field === "end") {
			onDraftChange({
				...draft,
				date: { ...draft.date, between: { ...draft.date.between, end: str } },
			});
		} else if (draft.date.operator === "before") {
			onDraftChange({
				...draft,
				date: { ...draft.date, before: { value: str } },
			});
		} else {
			onDraftChange({
				...draft,
				date: { ...draft.date, after: { value: str } },
			});
		}
	};

	return {
		isOpen,
		setIsOpen,
		searchInput,
		setSearchInput,
		filteredPresetGroups,
		dynamicPreset,
		applyDisabled: checkApplyDisabled(draft),
		canClear: !checkIsDefault(draft),
		hasInvalidRange: checkInvalidRange(draft),
		triggerDescription: activeLabel ?? describeDraft(draft),
		onPresetSelect: handlePresetSelect,
		onDynamicPresetSelect: handleDynamicPresetSelect,
		onApply: handleApply,
		onClear: handleClear,
		onDateChange: handleDateChange,
	};
}

export { parseRelativeTimeMs };
