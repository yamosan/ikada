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
					isActive ? "text-primary-400" : "text-gray-500"
				}`}
			/>
			<input
				type="text"
				value={value}
				placeholder="Search"
				className={`h-9 w-full rounded-md bg-gray-950 pl-8 pr-3 text-sm border border-gray-700 transition-[color,box-shadow] outline-none placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-ring/50 ${
					isActive
						? "text-gray-100"
						: "text-gray-500 ring-gray-700 hover:ring-gray-600"
				}`}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
}
