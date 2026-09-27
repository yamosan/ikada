import { Splitter } from "@ark-ui/react";
import {
	type ButtonHTMLAttributes,
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

type SidePanelContextValue = {
	isOpen: boolean;
	orientation: "horizontal" | "vertical";
	setOpen: (nextOpen: boolean) => void;
};

const SidePanelContext = createContext<SidePanelContextValue | null>(null);

function useSidePanelContext(): SidePanelContextValue {
	const context = useContext(SidePanelContext);
	if (!context) {
		throw new Error("SidePanel components must be used within SidePanel.Root");
	}
	return context;
}

function cx(...classes: Array<string | undefined>) {
	return classes.filter(Boolean).join(" ");
}

type SidePanelRootProps = {
	children: ReactNode;
	className?: string;
	orientation?: "horizontal" | "vertical";
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	defaultSize?: number[];
	collapsedSize?: number[];
	minMainSize?: number;
	minPanelSize?: number;
};

function Root({
	children,
	className,
	orientation = "horizontal",
	open,
	defaultOpen = false,
	onOpenChange,
	defaultSize = [70, 30],
	collapsedSize = [100],
	minMainSize = 35,
	minPanelSize = 20,
}: SidePanelRootProps) {
	const isControlledOpen = open !== undefined;
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const isOpen = isControlledOpen ? open : uncontrolledOpen;

	const [size, setSize] = useState<number[]>(
		isOpen ? defaultSize : collapsedSize,
	);

	useEffect(() => {
		if (isOpen && size.length === 1) {
			setSize(defaultSize);
		}
		if (!isOpen && size.length !== 1) {
			setSize(collapsedSize);
		}
	}, [collapsedSize, defaultSize, isOpen, size.length]);

	const setOpen = useCallback(
		(nextOpen: boolean) => {
			if (!isControlledOpen) {
				setUncontrolledOpen(nextOpen);
			}
			onOpenChange?.(nextOpen);
		},
		[isControlledOpen, onOpenChange],
	);

	const contextValue = useMemo(
		() => ({ isOpen, orientation, setOpen }),
		[isOpen, orientation, setOpen],
	);
	const resolvedSize =
		isOpen && size.length === 1
			? defaultSize
			: !isOpen && size.length !== 1
				? collapsedSize
				: size;

	return (
		<SidePanelContext.Provider value={contextValue}>
			<Splitter.Root
				orientation={orientation}
				panels={
					isOpen
						? [
								{ id: "main", minSize: minMainSize },
								{ id: "panel", minSize: minPanelSize },
							]
						: [{ id: "main", minSize: 100 }]
				}
				size={resolvedSize}
				onResize={(details) => {
					setSize(details.size);
				}}
				className={cx("flex h-full min-h-0", className)}
			>
				{children}
			</Splitter.Root>
		</SidePanelContext.Provider>
	);
}

type SidePanelSlotProps = {
	children: ReactNode;
	className?: string;
};

function Main({ children, className }: SidePanelSlotProps) {
	return (
		<Splitter.Panel id="main" className={className}>
			{children}
		</Splitter.Panel>
	);
}

function ResizeTrigger({ className }: { className?: string }) {
	const { isOpen, orientation } = useSidePanelContext();
	if (!isOpen) {
		return null;
	}
	const indicatorClassName =
		orientation === "horizontal"
			? "absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-zinc-500/70 transition-colors group-hover:bg-ikada-400/80 group-data-[focus]:bg-ikada-400/80 group-data-[dragging]:bg-ikada-400/80"
			: "absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-zinc-500/70 transition-colors group-hover:bg-ikada-400/80 group-data-[focus]:bg-ikada-400/80 group-data-[dragging]:bg-ikada-400/80";

	return (
		<Splitter.ResizeTrigger id="main:panel" className={className}>
			<Splitter.ResizeTriggerIndicator className={indicatorClassName} />
		</Splitter.ResizeTrigger>
	);
}

function Panel({ children, className }: SidePanelSlotProps) {
	const { isOpen } = useSidePanelContext();
	if (!isOpen) {
		return null;
	}
	return (
		<Splitter.Panel id="panel" className={className}>
			{children}
		</Splitter.Panel>
	);
}

function Header({ children, className }: SidePanelSlotProps) {
	return <div className={className}>{children}</div>;
}

function Title({ children, className }: SidePanelSlotProps) {
	return <h2 className={className}>{children}</h2>;
}

function Body({ children, className }: SidePanelSlotProps) {
	return <div className={className}>{children}</div>;
}

function CloseTrigger({
	children,
	onClick,
	...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
	const { setOpen } = useSidePanelContext();
	return (
		<button
			type="button"
			{...rest}
			onClick={(event) => {
				onClick?.(event);
				if (!event.defaultPrevented) {
					setOpen(false);
				}
			}}
		>
			{children}
		</button>
	);
}

export const SidePanel = {
	Root,
	Main,
	ResizeTrigger,
	Panel,
	Header,
	Title,
	Body,
	CloseTrigger,
};
