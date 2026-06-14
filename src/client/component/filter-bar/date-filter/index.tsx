import { Popover, Portal, Tooltip } from "@ark-ui/react";
import { ChevronDown, Clock, Play, Square } from "lucide-react";
import type { FilterDraft } from "../filter";
import { DateForm } from "./date-form";
import { PresetPanel } from "./preset-panel";
import { useDateFilter } from "./use-date-filter";

type DateFilterProps = {
	draft: FilterDraft;
	onDraftChange: (next: FilterDraft) => void;
	onApply: () => void;
	isLive: boolean;
	onToggleLive: () => void;
};

export function DateFilter({
	draft,
	onDraftChange,
	onApply,
	isLive,
	onToggleLive,
}: DateFilterProps) {
	const filter = useDateFilter(draft, onDraftChange, onApply, () => {
		if (!isLive) onToggleLive();
	});
	const isActive = filter.canClear;

	return (
		<Popover.Root
			open={filter.isOpen}
			onOpenChange={(details) => filter.setIsOpen(details.open)}
			positioning={{ placement: "bottom-start" }}
		>
			<div className="flex">
				{/* ── 左: 日付ピッカートリガー ── */}
				<Tooltip.Root openDelay={400} closeDelay={0} disabled={filter.isOpen || isLive}>
					<Tooltip.Trigger asChild>
						<div className="inline-flex">
							<Popover.Trigger
								disabled={isLive}
								className={`flex h-9 w-52 items-center gap-2 rounded-l-md border border-r-0 bg-zinc-950 px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-600/70 ${
									isLive
										? "cursor-not-allowed border-zinc-700 opacity-40"
										: isActive
											? "border-teal-600/70 hover:border-teal-500"
											: "border-zinc-700 hover:border-zinc-600"
								}`}
							>
								<Clock
									className={`h-3.5 w-3.5 shrink-0 transition-colors ${
										isLive ? "text-zinc-500" : isActive ? "text-teal-400" : "text-zinc-500"
									}`}
								/>
								<span
									className={`min-w-0 flex-1 truncate text-left ${
										isLive ? "text-zinc-500" : isActive ? "text-teal-100" : "text-zinc-400"
									}`}
								>
									{isLive ? "Live" : filter.triggerDescription}
								</span>
								<ChevronDown
									className={`h-3.5 w-3.5 shrink-0 transition-colors ${
										isLive ? "text-zinc-600" : isActive ? "text-teal-400" : "text-zinc-500"
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

				{/* ── 右: Live / Paused トグル ── */}
				<button
					type="button"
					onClick={onToggleLive}
					className={`flex h-9 items-center gap-2.5 rounded-r-md border px-3.5 text-xs font-semibold tracking-wide transition-colors ${
						isLive
							? "border-teal-600/70 bg-teal-900/50 text-teal-300 hover:bg-teal-800/60"
							: "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
					}`}
				>
					{isLive ? (
						<Square className="h-3.5 w-3.5 shrink-0 fill-current" aria-hidden="true" />
					) : (
						<Play className="h-3.5 w-3.5 shrink-0 fill-current" aria-hidden="true" />
					)}
					LIVE
				</button>
			</div>

			{/* ── ポップオーバー（日付ピッカー） ── */}
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
