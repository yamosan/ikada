import { createListCollection, Listbox } from "@ark-ui/react";
import { type RefObject, useEffect, useRef, useState } from "react";
import styles from "./index.module.css";

type TimeOption = {
	value: string;
	label: string;
};

const createTimeCollection = (length: number) =>
	createListCollection<TimeOption>({
		items: Array.from({ length }, (_, index) => {
			const label = String(index).padStart(2, "0");
			return { value: label, label };
		}),
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value,
	});

export const HOUR_COLLECTION = createTimeCollection(24);
export const MINUTE_COLLECTION = createTimeCollection(60);
export const SECOND_COLLECTION = createTimeCollection(60);

type TimeColumnProps = {
	label: string;
	collection: typeof HOUR_COLLECTION;
	value: number | undefined;
	onChange: (value: number) => void;
	isOpen: boolean;
	rootRef: RefObject<HTMLDivElement | null>;
	onAdvance?: () => void;
	className?: string;
};

export function TimeColumn({
	label,
	collection,
	value,
	onChange,
	isOpen,
	rootRef,
	onAdvance,
	className,
}: TimeColumnProps) {
	const contentRef = useRef<HTMLDivElement>(null);
	const pointerDownRef = useRef(false);
	const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
	const selectedValue =
		value === undefined ? null : String(value).padStart(2, "0");
	const selectedValueRef = useRef(selectedValue);
	selectedValueRef.current = selectedValue;

	useEffect(() => {
		const initialSelectedValue = selectedValueRef.current;
		if (!isOpen || !initialSelectedValue) return;

		const content = contentRef.current;
		if (!content) return;

		const centerSelectedItem = () => {
			const selectedItem = content.querySelector<HTMLElement>(
				`[data-value="${initialSelectedValue}"]`,
			);
			if (!selectedItem || content.clientHeight === 0) return;

			content.scrollTop =
				selectedItem.offsetTop -
				(content.clientHeight - selectedItem.clientHeight) / 2;
		};

		centerSelectedItem();
		const observer = new ResizeObserver(centerSelectedItem);
		observer.observe(content);

		return () => observer.disconnect();
	}, [isOpen]);

	return (
		<Listbox.Root
			ref={rootRef}
			collection={collection}
			selectionMode="single"
			selectOnHighlight
			typeahead={false}
			value={selectedValue ? [selectedValue] : []}
			highlightedValue={selectedValue}
			onValueChange={(details) => {
				const nextValue = details.value[0];
				if (nextValue) onChange(Number(nextValue));
			}}
			className={`flex min-h-0 w-14 flex-col ${className ?? ""}`}
		>
			<Listbox.Label className="sr-only">{label}</Listbox.Label>
			<Listbox.Content
				ref={contentRef}
				onFocus={(event) => {
					setIsKeyboardFocused(
						!pointerDownRef.current &&
							event.currentTarget.matches(":focus-visible"),
					);
				}}
				onBlur={() => {
					pointerDownRef.current = false;
					setIsKeyboardFocused(false);
				}}
				onPointerDown={() => {
					pointerDownRef.current = true;
					setIsKeyboardFocused(false);
				}}
				onPointerUp={() => {
					pointerDownRef.current = false;
				}}
				onPointerCancel={() => {
					pointerDownRef.current = false;
				}}
				onKeyDown={() => setIsKeyboardFocused(true)}
				onKeyUp={(event) => {
					if (event.key === "Enter") onAdvance?.();
				}}
				className={`${styles.timeColumnScrollbar} min-h-0 flex-1 snap-y overflow-y-auto p-1 outline-none ${isKeyboardFocused ? "bg-zinc-800/40" : ""}`}
			>
				{collection.items.map((item) => (
					<Listbox.Item
						key={item.value}
						item={item}
						className="flex h-8 snap-center cursor-pointer items-center justify-center rounded text-sm text-zinc-300 outline-none data-highlighted:bg-ikada-700 data-highlighted:text-zinc-50 data-selected:bg-ikada-700 data-selected:text-zinc-50 [&:hover:not([data-highlighted]):not([data-selected])]:bg-zinc-800"
					>
						<Listbox.ItemText>{item.label}</Listbox.ItemText>
					</Listbox.Item>
				))}
			</Listbox.Content>
		</Listbox.Root>
	);
}
