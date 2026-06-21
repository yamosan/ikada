import { useMatchMedia } from "./use-match-media";

// Keep these values in sync with Tailwind breakpoints defined in index.css.
const TAILWIND_BREAKPOINTS = {
	compact: "580px",
	tablet: "768px",
	desktop: "1024px",
} as const;

type TailwindBreakpoint = keyof typeof TAILWIND_BREAKPOINTS;
type BreakpointQuery = `max-${TailwindBreakpoint}`;

function getBreakpointMediaQuery(query: BreakpointQuery): string {
	const breakpoint = query.replace("max-", "") as TailwindBreakpoint;
	return `(width < ${TAILWIND_BREAKPOINTS[breakpoint]})`;
}

export function useBreakpoint(query: BreakpointQuery): boolean {
	return useMatchMedia(getBreakpointMediaQuery(query));
}
