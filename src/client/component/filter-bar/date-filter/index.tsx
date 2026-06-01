import { Popover, Portal, Tooltip } from "@ark-ui/react";
import { Clock } from "lucide-react";
import type { DateFilterOperator, FilterDraft } from "../filter";
import { DateForm } from "./date-form";
import { PresetPanel } from "./preset-panel";
import { useDateFilter } from "./use-date-filter";

type DateFilterProps = {
	draft: FilterDraft;
	onDraftChange: (next: FilterDraft) => void;
	onApply: () => void;
};

export function DateFilter({ draft, onDraftChange, onApply }: DateFilterProps) {
	const filter = useDateFilter(draft, onDraftChange, onApply);

	return (
		<div className="flex items-center gap-2">
			<span className="text-xs font-medium text-zinc-500">Time</span>

			<Popover.Root
				open={filter.isOpen}
				onOpenChange={(details) => filter.setIsOpen(details.open)}
				positioning={{ placement: "bottom-start" }}
			>
				<Tooltip.Root openDelay={400} closeDelay={0} disabled={filter.isOpen}>
					<Tooltip.Trigger asChild>
						{/* Plain div as tooltip anchor — keeps Popover.Trigger props independent */}
						<div className="inline-flex">
							<Popover.Trigger className="flex h-9 w-56 items-center gap-2 rounded-md border border-zinc-700 bg-zinc-950 px-3 transition-colors hover:border-zinc-600 focus:border-teal-600 focus:outline-none">
								<Clock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
								<span className="min-w-0 flex-1 truncate text-left text-sm text-zinc-100">
									{filter.triggerDescription}
								</span>
							</Popover.Trigger>
						</div>
					</Tooltip.Trigger>

					<Portal>
						<Tooltip.Positioner>
							<Tooltip.Content className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-200 shadow-lg">
								{filter.triggerDescription}
							</Tooltip.Content>
						</Tooltip.Positioner>
					</Portal>
				</Tooltip.Root>

				<Portal>
					<Popover.Positioner className="z-100">
						<Popover.Content className="mt-1.5 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/60 focus:outline-none">
							<div className="relative flex">
								<PresetPanel
									searchInput={filter.searchInput}
									onSearchChange={filter.setSearchInput}
									filteredPresetGroups={filter.filteredPresetGroups}
									dynamicPreset={filter.dynamicPreset}
									onPresetSelect={filter.onPresetSelect}
									onDynamicPresetSelect={filter.onDynamicPresetSelect}
								/>

								{/* Spacer matching left panel width */}
								<div className="w-44 shrink-0" aria-hidden="true" />

								<DateForm
									draft={draft}
									onOperatorChange={(operator: DateFilterOperator) =>
										onDraftChange({
											...draft,
											date: { ...draft.date, operator },
										})
									}
									onDateChange={filter.onDateChange}
									hasInvalidRange={filter.hasInvalidRange}
									applyDisabled={filter.applyDisabled}
									canClear={filter.canClear}
									onApply={filter.onApply}
									onClear={filter.onClear}
								/>
							</div>
						</Popover.Content>
					</Popover.Positioner>
				</Portal>
			</Popover.Root>
		</div>
	);
}
