import { createListCollection, Portal, Select } from "@ark-ui/react";
import { Check, ChevronDown, Tag } from "lucide-react";
import { useMemo, useState } from "react";

type SourceFilterProps = {
	availableSources: string[];
	value: string[];
	onChange: (sources: string[]) => void;
};

type SourceOption = {
	value: string;
	label: string;
};

export function SourceFilter({
	availableSources,
	value,
	onChange,
}: SourceFilterProps) {
	const [isOpen, setIsOpen] = useState(false);
	const isActive = value.length > 0;
	const collection = useMemo(
		() =>
			createListCollection({
				items: availableSources.map(
					(source): SourceOption => ({
						value: source,
						label: source,
					}),
				),
				itemToString: (item) => item.label,
				itemToValue: (item) => item.value,
			}),
		[availableSources],
	);
	const label =
		value.length === 0
			? "All logs"
			: value.length === 1
				? value[0]
				: `${value.length} sources`;
	const toggleSource = (source: string) => {
		onChange(
			value.includes(source)
				? value.filter((selectedSource) => selectedSource !== source)
				: [...value, source],
		);
	};

	return (
		<Select.Root
			closeOnSelect={false}
			collection={collection}
			multiple
			open={isOpen}
			value={value}
			onOpenChange={(details) => setIsOpen(details.open)}
			onSelect={(details) => toggleSource(details.value)}
			positioning={{ placement: "bottom-start" }}
		>
			<Select.Control>
				<Select.Trigger
					className={`flex h-9 w-40 shrink-0 items-center gap-2 rounded-md bg-zinc-950 border border-zinc-700 px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:ring-2 data-[state=open]:ring-ring/50`}
				>
					<Tag
						className={`h-3.5 w-3.5 shrink-0 transition-colors ${
							isActive ? "text-ikada-400" : "text-zinc-500"
						}`}
					/>
					<span
						className={`min-w-0 flex-1 truncate text-left ${
							isActive ? "text-zinc-100" : "text-zinc-500"
						}`}
					>
						{label}
					</span>
					<Select.Indicator>
						<ChevronDown
							className={`h-3.5 w-3.5 shrink-0 transition-colors text-zinc-500`}
						/>
					</Select.Indicator>
				</Select.Trigger>
			</Select.Control>

			<Portal>
				<Select.Positioner style={{ zIndex: 100 }}>
					<Select.Content className="mt-1 w-52 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/60 outline-none">
						{availableSources.length === 0 ? (
							<p className="px-3 py-2.5 text-xs text-zinc-500">
								No sources available
							</p>
						) : (
							<div className="max-h-60 overflow-y-auto py-1">
								{collection.items.map((source) => (
									<Select.Item
										key={source.value}
										item={source}
										className="group flex w-full cursor-pointer items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors data-highlighted:bg-zinc-800"
									>
										<span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border border-zinc-600 bg-transparent group-data-[state=checked]:border-ikada-500 group-data-[state=checked]:bg-ikada-500">
											<Select.ItemIndicator className="hidden data-[state=checked]:block">
												<Check className="h-3 w-3 stroke-3 stroke-white" />
											</Select.ItemIndicator>
										</span>
										<Select.ItemText className="truncate text-zinc-300 data-[state=checked]:text-ikada-100">
											{source.label}
										</Select.ItemText>
									</Select.Item>
								))}
							</div>
						)}
					</Select.Content>
				</Select.Positioner>
			</Portal>
			<Select.HiddenSelect />
		</Select.Root>
	);
}
