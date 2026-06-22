import { Search } from "lucide-react";

type TextSearchProps = {
	value: string;
	onChange: (value: string) => void;
};

export function TextSearch({ value, onChange }: TextSearchProps) {
	const isActive = value !== "";

	return (
		<div className="relative order-first flex min-w-0 basis-full items-center compact:order-none compact:flex-1 compact:basis-auto">
			<Search
				className={`pointer-events-none absolute left-2.5 h-3.5 w-3.5 transition-colors ${
					isActive ? "text-teal-400" : "text-zinc-500"
				}`}
			/>
			<input
				type="text"
				value={value}
				placeholder="Search"
				className={`h-9 w-full rounded-md bg-zinc-950 pl-8 pr-3 text-sm ring-1 ring-inset transition-[color,box-shadow] focus:outline-none focus:ring-2 focus:ring-teal-600/70 focus:text-zinc-100 ${
					isActive
						? "text-zinc-100 placeholder-zinc-500 ring-teal-600/70"
						: "text-zinc-400 placeholder-zinc-600 ring-zinc-700 hover:ring-zinc-600"
				}`}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
}
