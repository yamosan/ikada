export type DateFilterOperator = "between" | "before" | "after";

export type DateRangeValue = {
	start: string;
	end: string;
};

export type DateFilter = {
	operator: DateFilterOperator;
	between: DateRangeValue;
	before: { value: string };
	after: { value: string };
};

export type FilterDraft = {
	date: DateFilter;
};

export type AppliedFilter = FilterDraft & {
	appliedAt: number;
};

export const DEFAULT_FILTER_DRAFT: FilterDraft = {
	date: {
		operator: "between",
		between: { start: "", end: "" },
		before: { value: "" },
		after: { value: "" },
	},
};
