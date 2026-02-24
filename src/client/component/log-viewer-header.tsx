import type { ConnectionState } from "../hook/use-log-events";

type LogViewerHeaderProps = {
	connection: ConnectionState;
};

export function LogViewerHeader({ connection }: LogViewerHeaderProps) {
	return (
		<header className="flex items-center justify-between gap-3 border-b border-zinc-700 bg-zinc-800 px-4 py-3">
			<h1 className="m-0 text-base">Nenrin</h1>
			<div className="flex items-center gap-2">
				<span
					className={`rounded-full px-2 py-1 text-xs font-bold uppercase tracking-[0.03em] ${
						connection === "connected"
							? "bg-teal-950/60 text-teal-300 ring-1 ring-teal-800"
							: "bg-zinc-800 text-zinc-300 ring-1 ring-zinc-700"
					}`}
				>
					{connection}
				</span>
			</div>
		</header>
	);
}
