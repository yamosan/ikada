import { Search } from "lucide-react";

type TextSearchProps = {
	value: string;
	onChange: (value: string) => void;
};

export function TextSearch({ value, onChange }: TextSearchProps) {
	const isActive = value !== "";

	return (
		<div className="relative order-first flex min-w-0 basis-full items-center compact:order-0 compact:flex-1 compact:basis-auto">
			<Search
				className={`pointer-events-none absolute left-2.5 h-3.5 w-3.5 transition-colors ${
					isActive ? "text-teal-400" : "text-zinc-500"
				}`}
			/>
			<input
				type="text"
				value={value}
				placeholder="Search"
				className={`h-9 w-full rounded-md bg-zinc-950 pl-8 pr-3 text-sm border border-zinc-700 transition-[color,box-shadow] outline-none placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-ring/50 ${
					isActive
						? "text-zinc-100"
						: "text-zinc-500 ring-zinc-700 hover:ring-zinc-600"
				}`}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
}
