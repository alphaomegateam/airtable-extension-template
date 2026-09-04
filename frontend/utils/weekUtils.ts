/** A date-only value with no time component, e.g. "2026-09-01". */
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface WeekOption {
    startDate: Date;
    endDate: Date;
    label: string;
}

/** Sunday 00:00:00 local time for the week containing `date`. */
export function getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
}

/** Saturday 23:59:59.999 local time for the week containing `date`. */
export function getWeekEnd(date: Date): Date {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
}

/** Short label for a week: "Feb 22" (the Sunday). */
export function getWeekLabel(date: Date): string {
    const start = getWeekStart(date);
    return start.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

/** Format a Date as YYYY-MM-DD in local time (avoids UTC timezone shift). */
export function formatDateForAirtable(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parse an Airtable date value into a local Date at midnight.
 *
 * A date-only string is parsed as UTC midnight by `new Date()`, per the
 * ECMAScript spec — which is the previous day at any negative UTC offset. Every
 * comparison in these extensions uses local getters, so parse as local to match.
 * See `.claude/rules/dates.md`.
 *
 * Accepts both date-only strings ("2026-09-01") and full ISO timestamps.
 * Returns null for anything unparseable.
 */
export function parseLocalDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;

    // Date-only — construct directly in local time
    if (DATE_ONLY_RE.test(dateStr)) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    // Full ISO timestamp — a real instant; normalize to local midnight
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

/**
 * Generate week options centered around the current week.
 * @param weeksBefore Number of past weeks to include (default: 2)
 * @param weeksAfter Number of future weeks to include (default: 2)
 */
export function generateWeekOptions(weeksBefore = 2, weeksAfter = 2): WeekOption[] {
    const currentWeekStart = getWeekStart(new Date());
    const options: WeekOption[] = [];
    for (let offset = -weeksBefore; offset <= weeksAfter; offset++) {
        const start = new Date(currentWeekStart);
        start.setDate(start.getDate() + offset * 7);
        options.push({
            startDate: start,
            endDate: getWeekEnd(start),
            label: getWeekLabel(start),
        });
    }
    return options;
}

/** True if two dates fall in the same Sunday-to-Saturday week. */
export function isSameWeek(a: Date, b: Date): boolean {
    return getWeekStart(a).getTime() === getWeekStart(b).getTime();
}
