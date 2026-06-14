import { PauseCircle, Play } from "lucide-react";

type SnapshotBannerProps = {
	description: string;
	onResumeLive: () => void;
};

export function SnapshotBanner({ description, onResumeLive }: SnapshotBannerProps) {
	return (
		<div className="flex shrink-0 items-center gap-2 border-b border-blue-800/50 bg-blue-950/40 px-4 py-2 text-sm text-blue-300">
			<PauseCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
			<span className="flex-1">{description}</span>
			<button
				type="button"
				onClick={onResumeLive}
				className="flex items-center gap-1.5 rounded border border-blue-700/60 px-2 py-0.5 text-xs text-blue-300 transition-colors hover:border-blue-500 hover:text-blue-100"
			>
				<Play className="h-3 w-3" aria-hidden="true" />
				Resume Live
			</button>
		</div>
	);
}
