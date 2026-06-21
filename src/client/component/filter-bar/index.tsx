import type { FilterDraft } from "@/client/types/filter";
import { DateFilter } from "./date-filter";
import { SourceFilter } from "./source-filter";
import { TextSearch } from "./text-search";

type FilterBarProps = {
	filter: FilterDraft;
	availableSources: string[];
	isLive: boolean;
	onTextFilterChange: (text: string) => void;
	onSourceFilterChange: (sources: string[]) => void;
	onDateFilterApply: (next: FilterDraft) => void;
	onToggleLive: () => void;
};

export function FilterBar({
	filter,
	availableSources,
	isLive,
	onTextFilterChange,
	onSourceFilterChange,
	onDateFilterApply,
	onToggleLive,
}: FilterBarProps) {
	return (
		<section className="border-b border-zinc-700 bg-zinc-900/60 px-3 py-2">
			<div className="flex items-center gap-1.5">
				<SourceFilter
					availableSources={availableSources}
					value={filter.sources}
					onChange={onSourceFilterChange}
				/>
				<TextSearch value={filter.text} onChange={onTextFilterChange} />
				<DateFilter
					draft={filter}
					onDraftChange={onDateFilterApply}
					isLive={isLive}
					onToggleLive={onToggleLive}
				/>
			</div>
		</section>
	);
}
