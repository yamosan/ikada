import type { ConnectionState } from "../hook/use-log-events";

type LogViewerHeaderProps = {
	connection: ConnectionState;
};

export function LogViewerHeader({ connection }: LogViewerHeaderProps) {
	return (
		<header className="flex items-center justify-between gap-3 border-b border-slate-800 bg-gray-900 px-4 py-3">
			<h1 className="m-0 text-base">JSON Log Viewer</h1>
			<div className="flex items-center gap-2">
				<span
					className={`rounded-full px-2 py-1 text-xs font-bold uppercase tracking-[0.03em] ${
						connection === "connected"
							? "bg-[#052e1a] text-green-300"
							: "bg-[#3f1d02] text-orange-300"
					}`}
				>
					{connection}
				</span>
			</div>
		</header>
	);
}
