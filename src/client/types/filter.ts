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
	text: string;
	sources: string[];
	date: DateFilter;
};
