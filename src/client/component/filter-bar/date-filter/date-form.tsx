import { createListCollection, Select } from "@ark-ui/react";
import type { DateValue } from "@internationalized/date";
import { Check, ChevronDown } from "lucide-react";
import type { DateFilterOperator, FilterDraft } from "@/client/types/filter";
import { DateInputWithPicker } from "./date-input-with-picker";
import { toDateValue } from "./date-utils";

const OPERATOR_OPTIONS: { value: DateFilterOperator; label: string }[] = [
	{ value: "between", label: "is between" },
	{ value: "before", label: "is before" },
	{ value: "after", label: "is after" },
];

const OPERATOR_COLLECTION = createListCollection({
	items: OPERATOR_OPTIONS,
	itemToString: (item) => item.label,
	itemToValue: (item) => item.value,
});

type DateFormProps = {
	draft: FilterDraft;
	onOperatorChange: (operator: DateFilterOperator) => void;
	onDateChange: (
		field: "start" | "end" | "single",
		value: DateValue | undefined,
	) => void;
	hasInvalidRange: boolean;
	applyDisabled: boolean;
	canClear: boolean;
	onApply: () => void;
	onClear: () => void;
};

export function DateForm({
	draft,
	onOperatorChange,
	onDateChange,
	hasInvalidRange,
	applyDisabled,
	canClear,
	onApply,
	onClear,
}: DateFormProps) {
	return (
		<div className="flex w-72 min-h-72 flex-col">
			<div className="flex flex-1 flex-col gap-5 p-4">
				{/* Condition */}
				<div className="space-y-1.5">
					<p className="text-xs font-medium text-zinc-400">Condition</p>
					<Select.Root
						collection={OPERATOR_COLLECTION}
						value={[draft.date.operator]}
						onValueChange={(details) => {
							const next = details.value[0] as DateFilterOperator | undefined;
							if (next) onOperatorChange(next);
						}}
					>
						<Select.Control>
							<Select.Trigger className="flex h-8 w-full items-center justify-between rounded border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-600">
								<Select.ValueText placeholder="Select condition" />
								<Select.Indicator>
									<ChevronDown className="h-4 w-4 text-zinc-400" />
								</Select.Indicator>
							</Select.Trigger>
						</Select.Control>
						<Select.Positioner className="z-110">
							<Select.Content className="mt-1 min-w-(--reference-width) overflow-hidden rounded border border-zinc-700 bg-zinc-900 p-1 shadow-lg shadow-black/40">
								{OPERATOR_OPTIONS.map((item) => (
									<Select.Item
										key={item.value}
										item={item}
										className="flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm text-zinc-200 data-highlighted:bg-zinc-800"
									>
										<Select.ItemText>{item.label}</Select.ItemText>
										<Select.ItemIndicator>
											<Check className="h-3.5 w-3.5 text-teal-300" />
										</Select.ItemIndicator>
									</Select.Item>
								))}
							</Select.Content>
						</Select.Positioner>
						<Select.HiddenSelect />
					</Select.Root>
				</div>

				{/* Date inputs */}
				<div className="space-y-3">
					{draft.date.operator === "between" ? (
						<>
							<div className="space-y-1.5">
								<p className="text-xs font-medium text-zinc-400">From</p>
								<DateInputWithPicker
									value={toDateValue(draft.date.between.start)}
									onChange={(v) => onDateChange("start", v)}
								/>
							</div>
							<div className="space-y-1.5">
								<p className="text-xs font-medium text-zinc-400">To</p>
								<DateInputWithPicker
									value={toDateValue(draft.date.between.end)}
									onChange={(v) => onDateChange("end", v)}
								/>
							</div>
						</>
					) : (
						<DateInputWithPicker
							value={toDateValue(
								draft.date.operator === "before"
									? draft.date.before.value
									: draft.date.after.value,
							)}
							onChange={(v) => onDateChange("single", v)}
						/>
					)}
					{hasInvalidRange && (
						<p className="text-xs text-rose-400">
							"To" must be later than "From".
						</p>
					)}
				</div>
			</div>

			{/* Footer */}
			<div className="flex items-center justify-end gap-2 border-t border-zinc-700/80 px-4 py-2.5">
				<button
					type="button"
					onClick={onClear}
					disabled={!canClear}
					className="h-7 rounded border border-zinc-700 bg-transparent px-4 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
				>
					Clear
				</button>
				<button
					type="button"
					onClick={onApply}
					disabled={applyDisabled}
					className="h-7 rounded border border-teal-700/90 bg-teal-900/60 px-4 text-xs text-teal-100 transition-colors hover:bg-teal-800/80 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-400"
				>
					Apply
				</button>
			</div>
		</div>
	);
}
