import { Clock } from "lucide-react";
import type { FilterDraft } from "../filter";
import type { PresetGroup } from "./presets";

type PresetPanelProps = {
	searchInput: string;
	onSearchChange: (value: string) => void;
	filteredPresetGroups: PresetGroup[];
	dynamicPreset: { label: string; filter: FilterDraft } | null;
	onPresetSelect: (filter: FilterDraft, label: string) => void;
	onDynamicPresetSelect: () => void;
};

export function PresetPanel({
	searchInput,
	onSearchChange,
	filteredPresetGroups,
	dynamicPreset,
	onPresetSelect,
	onDynamicPresetSelect,
}: PresetPanelProps) {
	return (
		<div className="absolute inset-y-0 left-0 flex w-44 flex-col overflow-hidden border-r border-zinc-700/80">
			<div className="shrink-0 px-2 pb-1.5 pt-2.5">
				<input
					type="text"
					value={searchInput}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="e.g. 30s, 2h, 7d"
					className="h-7 w-full rounded border border-zinc-700 bg-zinc-950 px-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-teal-600"
				/>
			</div>

			<div className="flex-1 overflow-y-auto px-1.5 pb-1.5">
				{dynamicPreset && (
					<>
						<button
							type="button"
							onClick={onDynamicPresetSelect}
							className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-sm text-teal-300 hover:bg-zinc-800"
						>
							<Clock className="h-3.5 w-3.5 shrink-0" />
							{dynamicPreset.label}
						</button>
						{filteredPresetGroups.length > 0 && (
							<div className="my-1 border-t border-zinc-700/60" />
						)}
					</>
				)}

				{filteredPresetGroups.map((group, i) => (
					<div key={group.group} className={i === 0 ? "mt-1.5" : "mt-3"}>
						<p className="px-2 pb-0 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
							{group.group}
						</p>
						{group.presets.map((preset) => (
							<button
								key={preset.label}
								type="button"
								onClick={() =>
									onPresetSelect(preset.buildFilter(), preset.label)
								}
								className="w-full rounded px-2 py-1.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-teal-300"
							>
								{preset.label}
							</button>
						))}
					</div>
				))}

				{!dynamicPreset && filteredPresetGroups.length === 0 && (
					<p className="px-2 py-3 text-xs text-zinc-500">No matches</p>
				)}
			</div>
		</div>
	);
}
