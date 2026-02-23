import { createTreeCollection, TreeView } from "@ark-ui/react";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import type { LogEvent } from "../hook/use-log-events";
import { ContentPanel } from "./content-panel";
import { ContentPanelJson } from "./content-panel-json";

type LogListProps = {
	logs: LogEvent[];
};

type LogTreeNode = {
	id: string;
	label: string;
	type: "root" | "entry" | "detail";
	log?: LogEvent;
	children?: LogTreeNode[];
};

const LOG_ROW_GRID_CLASS =
	"grid-cols-[2rem_fit-content(3rem)_10.5rem_fit-content(6rem)_minmax(0,1fr)]";

function parseJsonLine(line: string): unknown | null {
	try {
		return JSON.parse(line);
	} catch {
		return null;
	}
}

export function LogList({ logs }: LogListProps) {
	const collection = useMemo(() => {
		const rootNode: LogTreeNode = {
			id: "root",
			label: "Logs",
			type: "root",
			children: logs.map((log) => ({
				id: `log-${log.seq}`,
				label: `#${log.seq}`,
				type: "entry",
				log,
				children: [
					{
						id: `log-${log.seq}-detail`,
						label: "detail",
						type: "detail",
					},
				],
			})),
		};

		return createTreeCollection<LogTreeNode>({
			rootNode,
			nodeToValue: (node) => node.id,
			nodeToString: (node) => node.label,
			nodeToChildren: (node) => node.children ?? [],
		});
	}, [logs]);

	return (
		<main className="flex-1 overflow-y-auto px-4 py-2 overflow-x-auto">
			<div className={`grid ${LOG_ROW_GRID_CLASS} gap-y-0 gap-x-3 min-w-120`}>
				<div className="col-span-full grid grid-cols-subgrid items-center border-b border-zinc-700/80 px-2 py-1 text-[11px] uppercase tracking-[0.04em] text-zinc-500">
					<span aria-hidden="true"></span>
					<span>seq</span>
					<span>time</span>
					<span>source</span>
					<span>message</span>
				</div>
				<TreeView.Root
					collection={collection}
					className="col-span-full grid grid-cols-subgrid"
					selectionMode="single"
					expandOnClick={true}
					typeahead={false}
				>
					<TreeView.Tree className="col-span-full grid grid-cols-subgrid divide-y divide-zinc-700/70 border-y border-zinc-700/70 bg-zinc-900/35">
						{collection
							.getNodeChildren(collection.rootNode)
							.map((node, index) => {
								const event = node.log;
								if (!event) {
									return null;
								}

								const timestamp = new Date(event.timestamp)
									.toISOString()
									.replace("T", " ")
									.replace("Z", "")
									.slice(0, 23);
								const parsedJson = parseJsonLine(event.line);

								return (
									<TreeView.NodeProvider
										key={node.id}
										node={node}
										indexPath={[index]}
									>
										<TreeView.Branch className="col-span-full grid grid-cols-subgrid overflow-x-hidden">
											<TreeView.BranchControl className="col-span-full grid grid-cols-subgrid cursor-pointer items-center px-2 py-1.5 transition-colors hover:bg-teal-950/20 data-[state=open]:bg-teal-950/30 select-none">
												<TreeView.BranchTrigger className="flex h-5 w-5 items-center justify-center rounded text-zinc-500">
													<TreeView.BranchIndicator className="transition-transform data-[state=open]:rotate-90 data-[state=open]:text-teal-300">
														<ChevronRight
															className="h-3.5 w-3.5"
															aria-hidden="true"
														/>
													</TreeView.BranchIndicator>
												</TreeView.BranchTrigger>
												<TreeView.BranchText className="contents">
													<span className="whitespace-nowrap text-xs text-teal-300">
														#{event.seq}
													</span>
													<span className="whitespace-nowrap text-xs text-zinc-400">
														{timestamp}
													</span>
													<span className="truncate text-xs text-zinc-400">
														{event.source}
													</span>
													<span className="min-w-0 truncate text-xs text-zinc-200">
														{event.line || "\u00a0"}
													</span>
												</TreeView.BranchText>
											</TreeView.BranchControl>
											<TreeView.BranchContent className="col-span-full px-7 py-2.5">
												{parsedJson !== null ? (
													<ContentPanelJson data={parsedJson} />
												) : (
													<ContentPanel line={event.line} />
												)}
											</TreeView.BranchContent>
										</TreeView.Branch>
									</TreeView.NodeProvider>
								);
							})}
					</TreeView.Tree>
				</TreeView.Root>
			</div>
		</main>
	);
}
