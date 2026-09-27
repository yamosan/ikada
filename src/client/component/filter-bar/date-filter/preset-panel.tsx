import { createListCollection, Listbox } from "@ark-ui/react";
import { Clock } from "lucide-react";
import { useMemo } from "react";
import type { FilterDraft } from "@/client/types/filter";
import type { PresetGroup } from "./presets";

type PresetPanelProps = {
	searchInput: string;
	onSearchChange: (value: string) => void;
	filteredPresetGroups: PresetGroup[];
	dynamicPreset: { label: string; filter: FilterDraft } | null;
	onPresetSelect: (filter: FilterDraft, label: string) => void;
	onDynamicPresetSelect: () => void;
};

type PresetOption = {
	value: string;
	label: string;
	filter: FilterDraft | null;
	isDynamic: boolean;
};

export function PresetPanel({
	searchInput,
	onSearchChange,
	filteredPresetGroups,
	dynamicPreset,
	onPresetSelect,
	onDynamicPresetSelect,
}: PresetPanelProps) {
	const presetOptions = useMemo(() => {
		const options: PresetOption[] = [];

		if (dynamicPreset) {
			options.push({
				value: "dynamic",
				label: dynamicPreset.label,
				filter: dynamicPreset.filter,
				isDynamic: true,
			});
		}

		for (const group of filteredPresetGroups) {
			for (const preset of group.presets) {
				options.push({
					value: `${group.group}:${preset.label}`,
					label: preset.label,
					filter: preset.buildFilter(),
					isDynamic: false,
				});
			}
		}

		return options;
	}, [dynamicPreset, filteredPresetGroups]);
	const collection = useMemo(
		() =>
			createListCollection({
				items: presetOptions,
				itemToString: (item) => item.label,
				itemToValue: (item) => item.value,
			}),
		[presetOptions],
	);
	const handleSelect = (value: string) => {
		const selectedOption = presetOptions.find(
			(option) => option.value === value,
		);

		if (!selectedOption) {
			return;
		}

		if (selectedOption.isDynamic) {
			onDynamicPresetSelect();
			return;
		}

		if (selectedOption.filter) {
			onPresetSelect(selectedOption.filter, selectedOption.label);
		}
	};
	const getPresetOption = (value: string) => {
		const option = collection.find(value);

		if (!option) {
			throw new Error(`Preset option not found: ${value}`);
		}

		return option;
	};

	return (
		<Listbox.Root
			collection={collection}
			loopFocus
			selectionMode="single"
			value={[]}
			onSelect={(details) => handleSelect(details.value)}
			className="absolute inset-y-0 left-0 flex w-44 flex-col overflow-hidden border-r border-zinc-700/80"
		>
			<div className="shrink-0 px-2 pb-1.5 pt-2.5">
				<Listbox.Input
					keyboardPriority="caret"
					type="text"
					value={searchInput}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="e.g. 30s, 2h, 7d"
					className="h-7 w-full rounded border border-zinc-700 bg-zinc-950 px-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/50"
				/>
			</div>

			<Listbox.Content className="flex-1 overflow-y-auto px-1.5 py-1.5 outline-none">
				{dynamicPreset && (
					<>
						<Listbox.Item
							item={getPresetOption("dynamic")}
							highlightOnHover
							className="flex w-full cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-left text-sm text-ikada-300 hover:bg-zinc-800 data-highlighted:bg-zinc-800"
						>
							<Clock className="h-3.5 w-3.5 shrink-0" />
							{dynamicPreset.label}
						</Listbox.Item>
						{filteredPresetGroups.length > 0 && (
							<div className="my-1 border-t border-zinc-700/60" />
						)}
					</>
				)}

				{filteredPresetGroups.map((group, i) => (
					<div key={group.group} className={i === 0 ? "" : "mt-3"}>
						<p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
							{group.group}
						</p>
						{group.presets.map((preset) => (
							<Listbox.Item
								key={preset.label}
								item={getPresetOption(`${group.group}:${preset.label}`)}
								highlightOnHover
								className="w-full cursor-pointer rounded px-2 py-1.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-ikada-300 data-highlighted:bg-zinc-800 data-highlighted:text-ikada-300"
							>
								{preset.label}
							</Listbox.Item>
						))}
					</div>
				))}

				{!dynamicPreset && filteredPresetGroups.length === 0 && (
					<p className="px-2 py-3 text-xs text-zinc-500">No matches</p>
				)}
			</Listbox.Content>
		</Listbox.Root>
	);
}
