import type { FilterDraft } from "@/client/types/filter";
import { DateFilter } from "./date-filter";
import { SourceFilter } from "./source-filter";
import { TextSearch } from "./text-search";
import { useFilterBarState } from "./use-filter-bar-state";

export function FilterBar() {
	const {
		filter,
		availableSources,
		isLive,
		setTextFilter,
		setSourceFilter,
		applyDateFilter,
		toggleLive,
	} = useFilterBarState();

	return (
		<section className="border-b border-zinc-700 bg-zinc-900/60 px-3 py-2">
			<div className="flex flex-wrap items-center gap-1.5">
				<SourceFilter
					availableSources={availableSources}
					value={filter.sources}
					onChange={setSourceFilter}
				/>
				<TextSearch value={filter.text} onChange={setTextFilter} />
				<DateFilter
					draft={filter}
					onDraftChange={(next: FilterDraft) => applyDateFilter(next)}
					isLive={isLive}
					onToggleLive={toggleLive}
				/>
			</div>
		</section>
	);
}
