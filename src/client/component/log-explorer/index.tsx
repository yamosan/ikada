import { X } from "lucide-react";
import { useBreakpoint } from "@/client/hook/use-breakpoint";
import { LogDetailContent } from "../log-detail-content";
import { LogList } from "../log-list";
import { SidePanel } from "../side-panel";
import { useLogExplorerState } from "./use-log-explorer-state";

const LIST_PANEL_MIN_SIZE = 35;
const DETAIL_PANEL_MIN_SIZE = 20;

export function LogExplorer() {
	const { isPanelOpen, selectedEvent, closeSelectedLog } =
		useLogExplorerState();
	const isNarrowViewport = useBreakpoint("max-compact");

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeSelectedLog();
		}
	};

	return (
		<div className="flex-1 min-h-0 overflow-hidden py-2">
			<SidePanel.Root
				open={isPanelOpen}
				onOpenChange={handleOpenChange}
				orientation={isNarrowViewport ? "vertical" : "horizontal"}
				minMainSize={LIST_PANEL_MIN_SIZE}
				minPanelSize={DETAIL_PANEL_MIN_SIZE}
				className="min-w-0 max-compact:flex-col compact:min-w-120"
			>
				<SidePanel.Main className="min-w-0">
					<LogList />
				</SidePanel.Main>

				<SidePanel.ResizeTrigger className="group relative shrink-0 border-zinc-700/80 bg-zinc-900/60 outline-none transition-[background-color,box-shadow] hover:bg-amber-950/30 focus-visible:ring-2 focus-visible:ring-ring/50 data-[focus]:ring-2 data-[focus]:ring-ring/50 data-[dragging]:ring-2 data-[dragging]:ring-ring/50 max-compact:h-2 max-compact:border-y compact:w-2 compact:border-x" />

				<SidePanel.Panel className="min-w-0 border-zinc-700 bg-zinc-900 max-compact:border-t compact:border-l">
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
							<SidePanel.CloseTrigger className="rounded-md p-1 text-zinc-400 outline-none transition-[color,background-color,box-shadow] hover:bg-zinc-800 hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-ring/50">
								<X className="h-4 w-4" aria-hidden="true" />
							</SidePanel.CloseTrigger>
						</SidePanel.Header>
						<SidePanel.Body className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
							<LogDetailContent />
						</SidePanel.Body>
					</div>
				</SidePanel.Panel>
			</SidePanel.Root>
		</div>
	);
}
