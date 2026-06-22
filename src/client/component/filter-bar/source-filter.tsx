import { Popover, Portal } from "@ark-ui/react";
import { ChevronDown, Tag } from "lucide-react";
import { useState } from "react";

type SourceFilterProps = {
	availableSources: string[];
	value: string[];
	onChange: (sources: string[]) => void;
};

export function SourceFilter({
	availableSources,
	value,
	onChange,
}: SourceFilterProps) {
	const [isOpen, setIsOpen] = useState(false);
	const isActive = value.length > 0;
	const isHighlighted = isActive || isOpen;
	const label =
		value.length === 0
			? "All logs"
			: value.length === 1
				? value[0]
				: `${value.length} sources`;

	const toggle = (source: string) => {
		if (value.includes(source)) {
			onChange(value.filter((s) => s !== source));
		} else {
			onChange([...value, source]);
		}
	};

	return (
		<Popover.Root
			open={isOpen}
			onOpenChange={(details) => setIsOpen(details.open)}
			positioning={{ placement: "bottom-start" }}
		>
			<Popover.Trigger
				className={`flex h-9 w-40 shrink-0 items-center gap-2 rounded-md bg-zinc-950 px-3 text-sm ring-inset transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/70 ${
					isOpen ? "ring-2" : "ring-1"
				} ${
					isHighlighted
						? `${isActive ? "text-teal-100" : "text-zinc-400"} ring-teal-600/70`
						: "text-zinc-400 ring-zinc-700 hover:ring-zinc-600"
				}`}
			>
				<Tag
					className={`h-3.5 w-3.5 shrink-0 transition-colors ${
						isActive ? "text-teal-400" : "text-zinc-500"
					}`}
				/>
				<span className="min-w-0 flex-1 truncate text-left">{label}</span>
				<ChevronDown
					className={`h-3.5 w-3.5 shrink-0 transition-colors ${
						isActive ? "text-teal-400" : "text-zinc-500"
					}`}
				/>
			</Popover.Trigger>

			<Portal>
				<Popover.Positioner className="z-100">
					<Popover.Content className="mt-1 w-52 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/60 focus:outline-none">
						{availableSources.length === 0 ? (
							<p className="px-3 py-2.5 text-xs text-zinc-500">
								No sources available
							</p>
						) : (
							<ul className="max-h-60 overflow-y-auto py-1">
								{availableSources.map((source) => {
									const checked = value.includes(source);
									return (
										<li key={source}>
											<button
												type="button"
												className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors hover:bg-zinc-800"
												onClick={() => toggle(source)}
											>
												<span
													className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border text-[9px] leading-none ${
														checked
															? "border-teal-500 bg-teal-500 text-zinc-900"
															: "border-zinc-600 bg-transparent"
													}`}
												>
													{checked ? "✓" : ""}
												</span>
												<span
													className={`truncate ${checked ? "text-teal-100" : "text-zinc-300"}`}
												>
													{source}
												</span>
											</button>
										</li>
									);
								})}
							</ul>
						)}
					</Popover.Content>
				</Popover.Positioner>
			</Portal>
		</Popover.Root>
	);
}
