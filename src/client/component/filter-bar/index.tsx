import { DateFilter } from "./date-filter";
import type { FilterDraft } from "./filter";
import { SourceFilter } from "./source-filter";
import { TextSearch } from "./text-search";

type FilterBarProps = {
	filter: FilterDraft;
	onFilterChange: (next: FilterDraft) => void;
	availableSources: string[];
	isLive: boolean;
	onToggleLive: () => void;
};

export function FilterBar({
	filter,
	onFilterChange,
	availableSources,
	isLive,
	onToggleLive,
}: FilterBarProps) {
	return (
		<section className="border-b border-zinc-700 bg-zinc-900/60 px-3 py-2">
			<div className="flex items-center gap-1.5">
				<SourceFilter
					availableSources={availableSources}
					value={filter.sources}
					onChange={(sources) => onFilterChange({ ...filter, sources })}
				/>
				<TextSearch
					value={filter.text}
					onChange={(text) => onFilterChange({ ...filter, text })}
				/>
				<DateFilter
					draft={filter}
					onDraftChange={onFilterChange}
					isLive={isLive}
					onToggleLive={onToggleLive}
				/>
			</div>
		</section>
	);
}
