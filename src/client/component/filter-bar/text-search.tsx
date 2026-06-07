import { Search } from "lucide-react";

type TextSearchProps = {
	value: string;
	onChange: (value: string) => void;
};

export function TextSearch({ value, onChange }: TextSearchProps) {
	const isActive = value !== "";

	return (
		<div className="relative flex min-w-0 flex-1 items-center">
			<Search
				className={`pointer-events-none absolute left-2.5 h-3.5 w-3.5 transition-colors ${
					isActive ? "text-teal-400" : "text-zinc-500"
				}`}
			/>
			<input
				type="text"
				value={value}
				placeholder="Search"
				className={`h-9 w-full rounded-md border bg-zinc-950 pl-8 pr-3 text-sm transition-colors focus:outline-none focus:border-teal-600 focus:text-zinc-100 ${
					isActive
						? "border-teal-600/70 text-zinc-100 placeholder-zinc-500 hover:border-teal-500"
						: "border-zinc-700 text-zinc-400 placeholder-zinc-600 hover:border-zinc-600"
				}`}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
}
