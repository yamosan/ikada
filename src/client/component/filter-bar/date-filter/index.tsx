import { Popover, Portal, Swap, Tooltip } from "@ark-ui/react";
import { ChevronDown, Clock, Play, Square } from "lucide-react";
import type { FilterDraft } from "@/client/types/filter";
import { DateForm } from "./date-form";
import styles from "./index.module.css";
import { PresetPanel } from "./preset-panel";
import { useDateFilter } from "./use-date-filter";

type DateFilterProps = {
	draft: FilterDraft;
	onDraftChange: (next: FilterDraft) => void;
	isLive: boolean;
	onToggleLive: () => void;
};

export function DateFilter({
	draft,
	onDraftChange,
	isLive,
	onToggleLive,
}: DateFilterProps) {
	const filter = useDateFilter(draft, onDraftChange, () => {
		if (!isLive) onToggleLive();
	});
	const isActive = filter.canClear;
	const isTriggerHighlighted = !isLive && (isActive || filter.isOpen);

	const triggerShellClass = isLive
		? "opacity-40"
		: isTriggerHighlighted
			? "ring-teal-600/70"
			: "ring-zinc-700 hover:ring-zinc-600";

	const triggerShellRingClass = isLive
		? ""
		: `${filter.isOpen ? "ring-2" : "ring-1 focus-within:ring-2"} ring-inset focus-within:ring-teal-600/70`;

	return (
		<Popover.Root
			open={filter.isOpen}
			onOpenChange={(details) => filter.setIsOpen(details.open)}
			positioning={{ placement: "bottom-start" }}
		>
			<div
				className={`relative z-10 flex shrink-0 ${isLive ? "rounded-md ring-1 ring-inset ring-teal-600/70" : ""}`}
			>
				<Tooltip.Root
					openDelay={400}
					closeDelay={0}
					disabled={filter.isOpen || isLive}
				>
					<Tooltip.Trigger asChild>
						<div
							className={`relative z-10 rounded-l-md bg-zinc-950 transition-[color,box-shadow] ${triggerShellRingClass} ${triggerShellClass}`}
						>
							<Popover.Trigger
								disabled={isLive}
								className={`flex h-9 w-52 items-center gap-2 rounded-l-md border-0 bg-transparent px-3 text-sm transition-colors focus-visible:outline-none ${
									isLive ? "cursor-not-allowed" : ""
								}`}
							>
								<Clock
									className={`h-3.5 w-3.5 shrink-0 transition-colors ${
										isLive
											? "text-zinc-500"
											: isActive
												? "text-teal-400"
												: "text-zinc-500"
									}`}
								/>
								<span
									className={`min-w-0 flex-1 truncate text-left ${
										isLive
											? "text-zinc-500"
											: isActive
												? "text-teal-100"
												: "text-zinc-400"
									}`}
								>
									{isLive ? "Live" : filter.triggerDescription}
								</span>
								<ChevronDown
									className={`h-3.5 w-3.5 shrink-0 transition-colors ${
										isLive
											? "text-zinc-600"
											: isActive
												? "text-teal-400"
												: "text-zinc-500"
									}`}
								/>
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

				<div
					className={`rounded-r-md ring-inset transition-[box-shadow] focus-within:ring-2 focus-within:ring-teal-600/70 ${
						isLive ? "" : "ring-1 ring-zinc-700 hover:ring-zinc-600"
					}`}
				>
					<button
						type="button"
						onClick={onToggleLive}
						className={`flex h-9 items-center gap-2.5 rounded-r-md px-3.5 text-xs font-semibold tracking-wide transition-colors focus-visible:outline-none ${
							isLive
								? "border-0 bg-teal-900/50 text-teal-300 hover:bg-teal-800/60"
								: "border-0 bg-zinc-800 text-zinc-400 hover:text-zinc-200"
						}`}
					>
						<Swap.Root
							swap={isLive}
							className="grid h-3.5 w-3.5 shrink-0 place-items-center"
						>
							<Swap.Indicator
								type="on"
								className={`${styles.liveModeIcon} col-start-1 row-start-1 flex h-3.5 w-3.5 items-center justify-center`}
							>
								<Square
									className="h-3.5 w-3.5 fill-current"
									aria-hidden="true"
								/>
							</Swap.Indicator>
							<Swap.Indicator
								type="off"
								className={`${styles.liveModeIcon} col-start-1 row-start-1 flex h-3.5 w-3.5 items-center justify-center`}
							>
								<Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
							</Swap.Indicator>
						</Swap.Root>
						LIVE
					</button>
				</div>
			</div>

			<Portal>
				<Popover.Positioner style={{ zIndex: 100 }}>
					<Popover.Content className="mt-1.5 max-w-[calc(100vw-1.5rem)] overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/60 focus:outline-none">
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
								draft={filter.localDraft}
								onOperatorChange={filter.onOperatorChange}
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
	);
}
