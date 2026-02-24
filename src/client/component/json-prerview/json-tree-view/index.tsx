import { TreeView, useTreeViewContext } from "@ark-ui/react";
import { JsonTreeView } from "@ark-ui/react/json-tree-view";
import {
	type CSSProperties,
	Fragment,
	type ReactElement,
	type ReactNode,
	useMemo,
} from "react";
import styles from "./index.module.css";

type JsonLikeNode = {
	type: string;
	value: unknown;
	keyPath: Array<string | number>;
	children?: JsonLikeNode[];
	isNonEnumerable?: boolean;
};

type TextValueNode = { type: "text"; value: unknown };

type JsonTreeNodeProps = {
	node: JsonLikeNode;
	indexPath: number[];
	arrow?: ReactElement;
	indentGuide?: boolean | ReactElement;
	renderValue?: (node: TextValueNode) => ReactNode;
};

const SCOPE_PROPS = { "data-scope": "json-tree-view" } as const;

function cx(...classes: Array<string | undefined>) {
	return classes.filter(Boolean).join(" ");
}

export const JsonTreeViewStyled = {
	Root(props: JsonTreeView.RootProps) {
		const { className, ...rest } = props;
		return (
			<JsonTreeView.Root className={cx(styles.root, className)} {...rest} />
		);
	},
	Tree(props: JsonTreeView.TreeProps) {
		const { className, arrow, indentGuide, renderValue, ...rest } = props;
		const tree = useTreeViewContext();
		const rootNode = tree.collection.rootNode as JsonLikeNode;
		const children = tree.collection.getNodeChildren(
			rootNode,
		) as JsonLikeNode[];
		const resolvedArrow = arrow ?? <ArrowIcon />;
		const resolvedIndentGuide = indentGuide ?? true;
		const resolvedRenderValue = renderValue as
			| ((node: TextValueNode) => ReactNode)
			| undefined;

		return (
			<TreeView.Tree
				{...SCOPE_PROPS}
				className={cx(styles.tree, className)}
				{...rest}
			>
				{children.map((child, index) =>
					shouldHideNode(child, rootNode.type) ? null : (
						<JsonTreeNode
							key={child.keyPath.join(".")}
							node={child}
							indexPath={[index]}
							arrow={resolvedArrow}
							indentGuide={resolvedIndentGuide}
							renderValue={resolvedRenderValue}
						/>
					),
				)}
			</TreeView.Tree>
		);
	},
};

function JsonTreeNode(props: JsonTreeNodeProps) {
	const { node, indexPath, arrow, indentGuide, renderValue } = props;
	const tree = useTreeViewContext();
	const nodeState = tree.getNodeState({ node, indexPath });
	const key = getNodeKey(node.keyPath, { excludeRoot: true });
	const isContainer = isContainerNode(node);
	const visibleChildren = getVisibleChildren(node.children, node.type);

	const nodeProps = useMemo(() => {
		const line = indexPath.reduce((acc, current) => acc + current, 1);
		const lineLength = indexPath.length - 1;
		return {
			...SCOPE_PROPS,
			"aria-label": key || getNodeAriaLabel(node),
			"data-line": line,
			style: { ["--line-length" as string]: lineLength } as CSSProperties,
		};
	}, [indexPath, key, node]);

	const lineContent = (
		<>
			{key ? <JsonTreeKeyNode node={node} /> : null}
			<JsonTreeValueNode
				node={node}
				isExpanded={nodeState.expanded}
				renderValue={renderValue}
			/>
		</>
	);

	return (
		<TreeView.NodeProvider node={node} indexPath={indexPath}>
			{nodeState.isBranch ? (
				<TreeView.Branch {...SCOPE_PROPS}>
					<TreeView.BranchControl {...nodeProps}>
						{arrow ? (
							<TreeView.BranchIndicator {...SCOPE_PROPS}>
								{arrow}
							</TreeView.BranchIndicator>
						) : null}
						<TreeView.BranchText {...SCOPE_PROPS}>{lineContent}</TreeView.BranchText>
					</TreeView.BranchControl>
					<TreeView.BranchContent {...SCOPE_PROPS}>
						{typeof indentGuide === "boolean" ? (
							indentGuide ? (
								<TreeView.BranchIndentGuide />
							) : null
						) : (
							indentGuide
						)}
							{visibleChildren.map((child, index) => (
								<JsonTreeNode
									key={child.keyPath.join(".")}
									node={child}
									indexPath={[...indexPath, index]}
									arrow={arrow}
									indentGuide={indentGuide}
									renderValue={renderValue}
								/>
							))}
						{nodeState.expanded && isContainer ? (
							<div
								className={styles.branchClosing}
								data-depth={nodeState.depth}
								style={
									{
										["--depth" as string]: nodeState.depth,
									} as CSSProperties
								}
							>
								<span data-kind="brace">{getClosingBrace(node)}</span>
							</div>
						) : null}
					</TreeView.BranchContent>
				</TreeView.Branch>
			) : (
				<TreeView.Item {...nodeProps}>
					<TreeView.ItemText {...SCOPE_PROPS}>{lineContent}</TreeView.ItemText>
				</TreeView.Item>
			)}
		</TreeView.NodeProvider>
	);
}

function JsonTreeKeyNode({ node }: { node: JsonLikeNode }) {
	const key = getNodeKey(node.keyPath);
	return (
		<Fragment>
			<span
				data-kind="key"
				suppressHydrationWarning
				data-non-enumerable={node.isNonEnumerable ? "" : undefined}
			>
				{key}
			</span>
			<span data-kind="colon">: </span>
		</Fragment>
	);
}

function JsonTreeValueNode({
	node,
	isExpanded,
	renderValue,
}: {
	node: JsonLikeNode;
	isExpanded: boolean;
	renderValue?: (node: TextValueNode) => ReactNode;
}) {
	if (isContainerNode(node)) {
		if (!isExpanded) {
			return (
				<span data-kind="preview-text">{getCompactPreviewText(node)}</span>
			);
		}
		return <span data-kind="brace">{getOpeningBrace(node)}</span>;
	}

	const value = formatLeafValue(node);
	const rendered = renderValue?.({ type: "text", value }) ?? value;
	return (
		<span data-type={node.type} suppressHydrationWarning>
			{rendered}
		</span>
	);
}

function shouldHideNode(node: JsonLikeNode, parentType: string) {
	return parentType === "array" && getNodeKey(node.keyPath) === "length";
}

function isContainerNode(node: JsonLikeNode) {
	return node.type === "array" || node.type === "object";
}

function getVisibleChildren(children: JsonLikeNode[] | undefined, parentType: string) {
	return (children ?? []).filter((child) => !shouldHideNode(child, parentType));
}

function getCompactPreviewText(node: JsonLikeNode) {
	if (node.type === "array") {
		const count = Array.isArray(node.value) ? node.value.length : 0;
		return `[${count}]`;
	}

	const count = (node.children ?? []).filter(
		(child) => !child.isNonEnumerable,
	).length;
	return `{${count}}`;
}

function getOpeningBrace(node: JsonLikeNode) {
	return node.type === "array" ? "[" : "{";
}

function getClosingBrace(node: JsonLikeNode) {
	return node.type === "array" ? "]" : "}";
}

function formatLeafValue(node: JsonLikeNode) {
	if (node.type === "string") {
		return JSON.stringify(String(node.value));
	}
	if (node.value === null) {
		return "null";
	}
	if (typeof node.value === "undefined") {
		return "undefined";
	}
	return String(node.value);
}

function getNodeAriaLabel(node: JsonLikeNode) {
	if (node.type === "array") {
		return `array (${Array.isArray(node.value) ? node.value.length : 0})`;
	}
	if (node.type === "object") {
		return `object (${(node.children ?? []).length})`;
	}
	return `${node.type}: ${formatLeafValue(node)}`;
}

function getNodeKey(
	keyPath: Array<string | number>,
	opts?: { excludeRoot?: boolean },
) {
	if (keyPath.length === 0) {
		return "";
	}
	if (opts?.excludeRoot && keyPath.length === 1 && keyPath[0] === "$") {
		return "";
	}
	if (opts?.excludeRoot && keyPath[0] === "$") {
		return String(keyPath[keyPath.length - 1]);
	}
	return String(keyPath[keyPath.length - 1]);
}

function ArrowIcon() {
	return (
		<svg
			data-icon-name="arrowRightIcon"
			viewBox="0 0 24 24"
			width="24"
			height="24"
			aria-hidden="true"
			className={styles.arrow}
		>
			<path d="m10 17 5-5-5-5v10z"></path>
		</svg>
	);
}
