import { DateFilter } from "./date-filter";
import type { FilterDraft } from "./filter";

type FilterBarProps = {
	draft: FilterDraft;
	onDraftChange: (next: FilterDraft) => void;
	onApply: () => void;
};

export function FilterBar({ draft, onDraftChange, onApply }: FilterBarProps) {
	return (
		<section className="border-b border-zinc-700 bg-zinc-900/70 px-4 py-3">
			<DateFilter
				draft={draft}
				onDraftChange={onDraftChange}
				onApply={onApply}
			/>
		</section>
	);
}
