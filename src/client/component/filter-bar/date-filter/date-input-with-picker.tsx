import { DateInput, DatePicker, Portal, useDatePicker } from "@ark-ui/react";
import {
	type DateValue,
	getLocalTimeZone,
	today,
} from "@internationalized/date";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { type RefObject, useEffect, useRef } from "react";
import { toCalendarDateTime } from "./date-utils";
import {
	HOUR_COLLECTION,
	MINUTE_COLLECTION,
	SECOND_COLLECTION,
	TimeColumn,
} from "./time-column";

const SEGMENT_CLASS =
	"rounded px-px text-zinc-100 outline-none data-placeholder-shown:text-zinc-400 data-[type=literal]:min-w-0 data-[type=literal]:select-none data-[type=literal]:px-0 data-[type=literal]:text-zinc-400 focus-visible:bg-ikada-800 focus-visible:text-zinc-50";

function focusTimeColumn(ref: RefObject<HTMLDivElement | null>) {
	ref.current?.querySelector<HTMLElement>('[role="listbox"]')?.focus();
}

type DateInputWithPickerProps = {
	value: DateValue | undefined;
	onChange: (value: DateValue | undefined) => void;
};

export function DateInputWithPicker({
	value,
	onChange,
}: DateInputWithPickerProps) {
	const hourRef = useRef<HTMLDivElement>(null);
	const minuteRef = useRef<HTMLDivElement>(null);
	const secondRef = useRef<HTMLDivElement>(null);
	const calendarTriggerRef = useRef<HTMLButtonElement>(null);
	const restoreCalendarTriggerFocusRef = useRef(false);
	const datePicker = useDatePicker({
		value: value ? [value] : [],
		onValueChange: (details) => {
			const newDate = details.value[0];
			if (!newDate) {
				onChange(undefined);
				return;
			}
			const existingTime =
				value && "hour" in value
					? {
							hour: value.hour ?? 0,
							minute: value.minute ?? 0,
							second: value.second ?? 0,
						}
					: { hour: 0, minute: 0, second: 0 };
			onChange(toCalendarDateTime(newDate).set(existingTime));
		},
		closeOnSelect: false,
		locale: "en-US",
	});
	useEffect(() => {
		if (datePicker.open || !restoreCalendarTriggerFocusRef.current) return;

		restoreCalendarTriggerFocusRef.current = false;
		calendarTriggerRef.current?.focus();
	}, [datePicker.open]);
	const hour = value && "hour" in value ? (value.hour ?? 0) : undefined;
	const minute = value && "minute" in value ? (value.minute ?? 0) : undefined;
	const second = value && "second" in value ? (value.second ?? 0) : undefined;
	const handleTimeChange = (
		part: "hour" | "minute" | "second",
		nextValue: number,
	) => {
		const baseValue = value ?? today(getLocalTimeZone());
		const dateTime = toCalendarDateTime(baseValue);
		if (part === "hour") {
			onChange(dateTime.set({ hour: nextValue }));
			return;
		}
		if (part === "minute") {
			onChange(dateTime.set({ minute: nextValue }));
			return;
		}
		onChange(dateTime.set({ second: nextValue }));
	};

	return (
		<DatePicker.RootProvider value={datePicker}>
			{/* DatePicker.Control is required as the floating anchor for the Positioner; no visual styling */}
			<DatePicker.Control className="flex w-full items-center gap-2">
				<DateInput.Root
					value={datePicker.value}
					onValueChange={(details) => {
						onChange(details.value[0] as DateValue | undefined);
					}}
					granularity="second"
					locale="en-US"
					hourCycle={24}
					className="min-w-0 flex-1"
				>
					<DateInput.SegmentGroup className="flex h-8 w-full items-center rounded border border-zinc-700 bg-zinc-950 px-2.5 text-sm transition-[box-shadow] focus-within:ring-2 focus-within:ring-ring/50">
						<DateInput.Context>
							{(api) => {
								const segmentCounts = new Map<string, number>();

								return api.getSegments().map((segment) => {
									const keyBase = `${segment.type}-${segment.text}`;
									const occurrence = segmentCounts.get(keyBase) ?? 0;
									segmentCounts.set(keyBase, occurrence + 1);

									return (
										<DateInput.Segment
											key={`${keyBase}-${occurrence}`}
											segment={segment}
											className={SEGMENT_CLASS}
										/>
									);
								});
							}}
						</DateInput.Context>
					</DateInput.SegmentGroup>
					<DateInput.HiddenInput />
				</DateInput.Root>

				<DatePicker.Trigger
					ref={calendarTriggerRef}
					type="button"
					className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-zinc-700 bg-zinc-950 text-zinc-400 outline-none transition-[color,background-color,box-shadow] hover:bg-zinc-800 hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:ring-2 data-[state=open]:ring-ring/50"
				>
					<CalendarDays className="h-4 w-4" />
				</DatePicker.Trigger>
			</DatePicker.Control>

			<Portal>
				<DatePicker.Positioner>
					{/* relative z-200: Zag.js reads getComputedStyle(content).zIndex to set --z-index on the positioner */}
					<DatePicker.Content className="relative z-200 max-w-[calc(100vw-1.5rem)] overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/60 outline-none">
						<div className="flex w-max">
							<DatePicker.View
								view="day"
								className="p-3 [&:has(:focus-visible)]:bg-zinc-800/40"
								onKeyUpCapture={(event) => {
									if (
										event.key === "Enter" &&
										event.target instanceof HTMLElement &&
										event.target.closest('[data-part="table-cell-trigger"]')
									) {
										focusTimeColumn(hourRef);
									}
								}}
							>
								<DatePicker.Context>
									{(picker) => (
										<>
											<DatePicker.ViewControl className="flex items-center justify-between gap-2">
												<DatePicker.PrevTrigger
													type="button"
													className="inline-flex h-7 w-7 items-center justify-center rounded border border-zinc-700 text-zinc-300 outline-none transition-[background-color,box-shadow] hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-ring/50"
												>
													<ChevronLeft className="h-4 w-4" aria-hidden="true" />
												</DatePicker.PrevTrigger>
												<DatePicker.ViewTrigger
													type="button"
													className="rounded px-2 py-1 text-sm text-zinc-100 outline-none transition-[background-color,box-shadow] hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-ring/50"
												>
													<DatePicker.RangeText />
												</DatePicker.ViewTrigger>
												<DatePicker.NextTrigger
													type="button"
													className="inline-flex h-7 w-7 items-center justify-center rounded border border-zinc-700 text-zinc-300 outline-none transition-[background-color,box-shadow] hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-ring/50"
												>
													<ChevronRight
														className="h-4 w-4"
														aria-hidden="true"
													/>
												</DatePicker.NextTrigger>
											</DatePicker.ViewControl>

											<DatePicker.Table className="mt-2 w-full border-collapse">
												<DatePicker.TableHead>
													<DatePicker.TableRow>
														{picker.weekDays.map((weekDay) => (
															<DatePicker.TableHeader
																key={weekDay.short}
																className="pb-1 text-center text-xs font-normal text-zinc-400"
															>
																{weekDay.short}
															</DatePicker.TableHeader>
														))}
													</DatePicker.TableRow>
												</DatePicker.TableHead>
												<DatePicker.TableBody>
													{picker.weeks.map((week) => (
														<DatePicker.TableRow
															key={week.map((d) => d.toString()).join("-")}
														>
															{week.map((day) => (
																<DatePicker.TableCell
																	key={day.toString()}
																	value={day}
																	className="p-0.5"
																>
																	<DatePicker.TableCellTrigger className="flex h-8 w-8 items-center justify-center rounded text-sm text-zinc-200 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 data-in-range:bg-ikada-950/60 data-outside-range:text-zinc-600 data-selected:bg-ikada-700 data-selected:text-zinc-50 data-today:ring-1 data-today:ring-ikada-600 [&:hover:not([data-in-range]):not([data-selected])]:bg-zinc-800">
																		{day.day}
																	</DatePicker.TableCellTrigger>
																</DatePicker.TableCell>
															))}
														</DatePicker.TableRow>
													))}
												</DatePicker.TableBody>
											</DatePicker.Table>
										</>
									)}
								</DatePicker.Context>
							</DatePicker.View>
							<div className="flex h-72 border-l border-zinc-700">
								<TimeColumn
									label="Hour"
									collection={HOUR_COLLECTION}
									value={hour}
									isOpen={datePicker.open}
									rootRef={hourRef}
									onChange={(nextHour) => handleTimeChange("hour", nextHour)}
									onAdvance={() => focusTimeColumn(minuteRef)}
								/>
								<TimeColumn
									label="Minute"
									collection={MINUTE_COLLECTION}
									value={minute}
									isOpen={datePicker.open}
									rootRef={minuteRef}
									onChange={(nextMinute) =>
										handleTimeChange("minute", nextMinute)
									}
									onAdvance={() => focusTimeColumn(secondRef)}
									className="border-l border-zinc-700"
								/>
								<TimeColumn
									label="Second"
									collection={SECOND_COLLECTION}
									value={second}
									isOpen={datePicker.open}
									rootRef={secondRef}
									onChange={(nextSecond) =>
										handleTimeChange("second", nextSecond)
									}
									onAdvance={() => {
										restoreCalendarTriggerFocusRef.current = true;
										datePicker.setOpen(false);
									}}
									className="border-l border-zinc-700"
								/>
							</div>
						</div>
					</DatePicker.Content>
				</DatePicker.Positioner>
			</Portal>
		</DatePicker.RootProvider>
	);
}
