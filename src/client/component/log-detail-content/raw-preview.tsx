import { Clipboard } from "@ark-ui/react";

type RawPreviewProps = {
	line: string;
};

export function RawPreview({ line }: RawPreviewProps) {
	return (
		<div>
			<div className="mb-1.5 px-1 pt-0.5 pb-2">
				<div className="inline-flex items-center gap-1.5">
					<Clipboard.Root value={line} timeout={1200}>
						<Clipboard.Context>
							{(clipboard) => (
								<Clipboard.Trigger asChild>
									<button
										type="button"
										className="inline-flex min-h-[1.6rem] cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-zinc-600 bg-zinc-800 px-[0.55rem] py-[0.2rem] text-[0.688rem] font-medium leading-[1.4] text-zinc-300 outline-none transition-[color,background-color,border-color,box-shadow] duration-100 ease-out hover:border-teal-700/70 hover:bg-teal-950/25 hover:text-teal-100 focus-visible:ring-2 focus-visible:ring-ring/50"
									>
										{clipboard.copied ? "Copied" : "Copy Raw"}
									</button>
								</Clipboard.Trigger>
							)}
						</Clipboard.Context>
					</Clipboard.Root>
				</div>
			</div>
			<pre className="px-1 m-0 wrap-break-word whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-100">
				{line || "\u00a0"}
			</pre>
		</div>
	);
}
