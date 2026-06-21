import type { DateValue } from "@internationalized/date";
import { useMemo, useState } from "react";
import {
	type DateFilterOperator,
	DEFAULT_FILTER_DRAFT,
	type FilterDraft,
} from "../filter";
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

	localDraft: FilterDraft;
	onOperatorChange: (operator: DateFilterOperator) => void;

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
	confirmedDraft: FilterDraft,
	onDraftChange: (next: FilterDraft) => void,
	onApply: () => void,
	onClear: () => void,
): UseDateFilterReturn {
	const [isOpen, setIsOpen] = useState(false);
	const [localDraft, setLocalDraft] = useState<FilterDraft>(confirmedDraft);
	const [activeLabel, setActiveLabel] = useState<string | null>(null);
	const [searchInput, setSearchInput] = useState("");

	const handleSetIsOpen = (open: boolean) => {
		if (open) {
			// ポップオーバーを開くたびに確定済み状態に戻す
			setLocalDraft(confirmedDraft);
		}
		setIsOpen(open);
	};

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

	// プリセット・Apply・Clear のみ親に伝播する
	const handlePresetSelect = (filter: FilterDraft, label: string) => {
		onDraftChange({ ...confirmedDraft, date: filter.date });
		onApply();
		setActiveLabel(label);
		setIsOpen(false);
	};

	const handleDynamicPresetSelect = () => {
		if (!dynamicPreset) return;
		handlePresetSelect(dynamicPreset.filter, dynamicPreset.label);
	};

	const handleApply = () => {
		if (checkApplyDisabled(localDraft)) return;
		onDraftChange(localDraft);
		onApply();
		setActiveLabel(null);
		setIsOpen(false);
	};

	const handleClear = () => {
		onClear();
		setActiveLabel(null);
		setIsOpen(false);
	};

	// 以下はローカル draft のみ更新（未確定状態）
	const handleOperatorChange = (operator: DateFilterOperator) => {
		setLocalDraft({
			...localDraft,
			date: { ...localDraft.date, operator },
		});
	};

	const handleDateChange = (
		field: "start" | "end" | "single",
		newValue: DateValue | undefined,
	) => {
		const str = newValue ? toCalendarDateTime(newValue).toString() : "";
		if (field === "start") {
			setLocalDraft({
				...localDraft,
				date: {
					...localDraft.date,
					between: { ...localDraft.date.between, start: str },
				},
			});
		} else if (field === "end") {
			setLocalDraft({
				...localDraft,
				date: {
					...localDraft.date,
					between: { ...localDraft.date.between, end: str },
				},
			});
		} else if (localDraft.date.operator === "before") {
			setLocalDraft({
				...localDraft,
				date: { ...localDraft.date, before: { value: str } },
			});
		} else {
			setLocalDraft({
				...localDraft,
				date: { ...localDraft.date, after: { value: str } },
			});
		}
	};

	return {
		isOpen,
		setIsOpen: handleSetIsOpen,
		localDraft,
		onOperatorChange: handleOperatorChange,
		searchInput,
		setSearchInput,
		filteredPresetGroups,
		dynamicPreset,
		applyDisabled: checkApplyDisabled(localDraft),
		canClear: !checkIsDefault(confirmedDraft),
		hasInvalidRange: checkInvalidRange(localDraft),
		triggerDescription:
			activeLabel !== null && !checkIsDefault(confirmedDraft)
				? activeLabel
				: describeDraft(confirmedDraft),
		onPresetSelect: handlePresetSelect,
		onDynamicPresetSelect: handleDynamicPresetSelect,
		onApply: handleApply,
		onClear: handleClear,
		onDateChange: handleDateChange,
	};
}

export { parseRelativeTimeMs };
