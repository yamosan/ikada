import { JsonTreeView } from "@ark-ui/react/json-tree-view";
import styles from "./index.module.css";

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
		const { className, arrow, indentGuide, ...rest } = props;
		return (
			<JsonTreeView.Tree
				className={cx(styles.tree, className)}
				arrow={arrow ?? <ArrowIcon />}
				indentGuide={indentGuide ?? true}
				{...rest}
			/>
		);
	},
};

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
