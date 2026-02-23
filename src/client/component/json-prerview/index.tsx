import { Clipboard, useTreeViewContext } from "@ark-ui/react";
import { useMemo } from "react";
import { JsonTreeViewStyled } from "./json-tree-view";

type JsonPreviewProps = {
	data: unknown;
};

const DEFAULT_EXPANDED_DEPTH = 1;

export function JsonPreview({ data }: JsonPreviewProps) {
	return (
		<JsonTreeViewStyled.Root
			defaultExpandedDepth={DEFAULT_EXPANDED_DEPTH}
			data={data}
		>
			<Toolbar>
				<CopyButton data={data} />
				<ExpandCollapseButton />
			</Toolbar>
			<JsonTreeViewStyled.Tree />
		</JsonTreeViewStyled.Root>
	);
}

function Toolbar({ children }: { children: React.ReactNode }) {
	return (
		<div className="mb-1.5 flex items-center gap-2 px-1 pt-0.5 pb-2">
			<div className="inline-flex items-center gap-1.5">{children}</div>
		</div>
	);
}

function ToolbarButton({
	children,
	onClick,
}: {
	children: React.ReactNode;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
	return (
		<button
			type="button"
			className="inline-flex min-h-[1.6rem] cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-zinc-600 bg-zinc-800 px-[0.55rem] py-[0.2rem] text-[0.688rem] font-medium leading-[1.4] text-zinc-300 transition-colors duration-100 ease-out hover:border-teal-700/70 hover:bg-teal-950/25 hover:text-teal-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-300/60"
			onClick={onClick}
		>
			{children}
		</button>
	);
}

function CopyButton({ data }: JsonPreviewProps) {
	const jsonText = useMemo(() => JSON.stringify(data, null, 2), [data]);

	return (
		<Clipboard.Root value={jsonText} timeout={1200}>
			<Clipboard.Context>
				{(clipboard) => (
					<Clipboard.Trigger asChild>
						<ToolbarButton>
							{clipboard.copied ? "Copied" : "Copy JSON"}
						</ToolbarButton>
					</Clipboard.Trigger>
				)}
			</Clipboard.Context>
		</Clipboard.Root>
	);
}

function ExpandCollapseButton() {
	const tree = useTreeViewContext();
	const branchValues = useMemo(
		() => tree.collection.getBranchValues(),
		[tree.collection],
	);
	const defaultExpandedValues = useMemo(
		() =>
			tree.collection.getBranchValues(undefined, {
				depth: DEFAULT_EXPANDED_DEPTH,
			}),
		[tree.collection],
	);
	const isAllExpanded = useMemo(
		() => branchValues.every((value) => tree.expandedValue.includes(value)),
		[tree.expandedValue, branchValues],
	);

	return isAllExpanded ? (
		<ToolbarButton
			onClick={() => {
				tree.setExpandedValue(defaultExpandedValues);
			}}
		>
			Collapse all
		</ToolbarButton>
	) : (
		<ToolbarButton
			onClick={() => {
				tree.expand();
			}}
		>
			Expand all
		</ToolbarButton>
	);
}
