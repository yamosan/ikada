import { X } from "lucide-react";
import type { LogEvent } from "@/type";
import { ContentPanel } from "./content-panel";
import { LogList } from "./log-list";
import { SidePanel } from "./side-panel";

type LogExplorerProps = {
	logs: LogEvent[];
	selectedSeq: number | null;
	selectedEvent: LogEvent | null;
	startBoundary?: Date | null;
	endBoundary?: Date | null;
	onSelect: (seq: number) => void;
	onClose: () => void;
};

const LIST_PANEL_MIN_SIZE = 35;
const DETAIL_PANEL_MIN_SIZE = 20;

export function LogExplorer({
	logs,
	selectedSeq,
	selectedEvent,
	startBoundary,
	endBoundary,
	onSelect,
	onClose,
}: LogExplorerProps) {
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onClose();
		}
	};

	return (
		<div className="flex-1 min-h-0 overflow-hidden py-2">
			<SidePanel.Root
				open={selectedEvent !== null}
				onOpenChange={handleOpenChange}
				minMainSize={LIST_PANEL_MIN_SIZE}
				minPanelSize={DETAIL_PANEL_MIN_SIZE}
				className="min-w-120"
			>
				<SidePanel.Main className="min-w-0">
					<LogList
						logs={logs}
						selectedSeq={selectedSeq ?? undefined}
						startBoundary={startBoundary}
						endBoundary={endBoundary}
						onSelect={(event) => onSelect(event.seq)}
					/>
				</SidePanel.Main>

				<SidePanel.ResizeTrigger className="group relative w-2 shrink-0 border-x border-zinc-700/80 bg-zinc-900/60 transition-colors hover:bg-teal-950/30" />

				<SidePanel.Panel className="min-w-0 border-l border-zinc-700 bg-zinc-900">
					<div className="flex h-full min-h-0 flex-col">
						<SidePanel.Header className="flex items-center justify-between border-b border-zinc-700 px-4 py-3">
							<div className="flex items-baseline gap-2">
								{selectedEvent && (
									<>
										<SidePanel.Title className="text-sm font-semibold text-zinc-200">
											#{selectedEvent.seq}
										</SidePanel.Title>
										<span className="text-xs text-zinc-500">
											{selectedEvent.source}
										</span>
									</>
								)}
							</div>
							<SidePanel.CloseTrigger className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200">
								<X className="h-4 w-4" aria-hidden="true" />
							</SidePanel.CloseTrigger>
						</SidePanel.Header>
						<SidePanel.Body className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
							{selectedEvent && <ContentPanel event={selectedEvent} />}
						</SidePanel.Body>
					</div>
				</SidePanel.Panel>
			</SidePanel.Root>
		</div>
	);
}
