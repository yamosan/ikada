import { DateInput, DatePicker, Portal, useDatePicker } from "@ark-ui/react";
import type { DateValue } from "@internationalized/date";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { toCalendarDateTime } from "./date-utils";

const SEGMENT_CLASS =
	"rounded px-px text-zinc-100 outline-none data-placeholder-shown:text-zinc-400 data-[type=literal]:min-w-0 data-[type=literal]:select-none data-[type=literal]:px-0 data-[type=literal]:text-zinc-400 focus:bg-teal-800 focus:text-zinc-50";

type DateInputWithPickerProps = {
	value: DateValue | undefined;
	onChange: (value: DateValue | undefined) => void;
};

export function DateInputWithPicker({
	value,
	onChange,
}: DateInputWithPickerProps) {
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
			onChange(toCalendarDateTime(newDate, existingTime));
		},
		closeOnSelect: true,
		locale: "en-US",
	});

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
					<DateInput.SegmentGroup className="flex h-8 w-full items-center rounded border border-zinc-700 bg-zinc-950 px-2.5 text-sm focus-within:border-teal-600">
						<DateInput.Context>
							{(api) =>
								api
									.getSegments()
									.map((segment, i) => (
										<DateInput.Segment
											key={`${segment.type}-${i}`}
											segment={segment}
											className={SEGMENT_CLASS}
										/>
									))
							}
						</DateInput.Context>
					</DateInput.SegmentGroup>
					<DateInput.HiddenInput />
				</DateInput.Root>

				<DatePicker.Trigger
					type="button"
					className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-zinc-700 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
				>
					<CalendarDays className="h-4 w-4" />
				</DatePicker.Trigger>
			</DatePicker.Control>

			<Portal>
				<DatePicker.Positioner>
					{/* relative z-200: Zag.js reads getComputedStyle(content).zIndex to set --z-index on the positioner */}
					<DatePicker.Content className="relative z-200 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-xl shadow-black/60 focus:outline-none">
						<DatePicker.View view="day">
							<DatePicker.Context>
								{(picker) => (
									<>
										<DatePicker.ViewControl className="flex items-center justify-between gap-2">
											<DatePicker.PrevTrigger
												type="button"
												className="inline-flex h-7 w-7 items-center justify-center rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
											>
												<ChevronLeft className="h-4 w-4" aria-hidden="true" />
											</DatePicker.PrevTrigger>
											<DatePicker.ViewTrigger
												type="button"
												className="rounded px-2 py-1 text-sm text-zinc-100 hover:bg-zinc-800"
											>
												<DatePicker.RangeText />
											</DatePicker.ViewTrigger>
											<DatePicker.NextTrigger
												type="button"
												className="inline-flex h-7 w-7 items-center justify-center rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
											>
												<ChevronRight className="h-4 w-4" aria-hidden="true" />
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
																<DatePicker.TableCellTrigger className="flex h-8 w-8 items-center justify-center rounded text-sm text-zinc-200 outline-none data-in-range:bg-teal-950/60 data-outside-range:text-zinc-600 data-selected:bg-teal-700 data-selected:text-zinc-50 data-today:ring-1 data-today:ring-teal-600">
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
					</DatePicker.Content>
				</DatePicker.Positioner>
			</Portal>
		</DatePicker.RootProvider>
	);
}
