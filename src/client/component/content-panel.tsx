type ContentPanelProps = {
	line: string;
};

export function ContentPanel({ line }: ContentPanelProps) {
	return (
		<pre className="m-0 wrap-break-word whitespace-pre-wrap text-xs leading-relaxed text-zinc-100">
			{line || "\u00a0"}
		</pre>
	);
}
