import {memo, useMemo, useCallback} from 'react';
import {generateWeekOptions, getWeekStart} from '../utils/weekUtils';

interface WeekSelectorProps {
    selectedWeek: Date;
    onWeekChange: (week: Date) => void;
    /** Number of past weeks to show. Defaults to 2. */
    weeksBefore?: number;
    /** Number of future weeks to show. Defaults to 2. */
    weeksAfter?: number;
}

/**
 * Dropdown selector for choosing a week, with relative labels
 * ("This week", "Last week", etc.) for weeks near the current one.
 */
export const WeekSelector = memo(function WeekSelector({
    selectedWeek,
    onWeekChange,
    weeksBefore = 2,
    weeksAfter = 2,
}: WeekSelectorProps) {
    const weekOptions = useMemo(
        () => generateWeekOptions(weeksBefore, weeksAfter),
        [weeksBefore, weeksAfter],
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const time = parseInt(e.target.value, 10);
            onWeekChange(new Date(time));
        },
        [onWeekChange],
    );

    const labels = useMemo(() => {
        const currentWeekStart = getWeekStart(new Date());
        return weekOptions.map((opt) => {
            const diff = Math.round(
                (opt.startDate.getTime() - currentWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000),
            );
            let relative = '';
            switch (diff) {
                case -2:
                    relative = '2 weeks ago';
                    break;
                case -1:
                    relative = 'Last week';
                    break;
                case 0:
                    relative = 'This week';
                    break;
                case 1:
                    relative = 'Next week';
                    break;
                case 2:
                    relative = '2 weeks out';
                    break;
            }
            return `${opt.label}${relative ? ` (${relative})` : ''}`;
        });
    }, [weekOptions]);

    return (
        <select
            value={getWeekStart(selectedWeek).getTime()}
            onChange={handleChange}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-gray200 dark:border-gray-gray600 bg-white dark:bg-gray-gray800 text-gray-gray700 dark:text-gray-gray200 focus:outline-none focus:ring-2 focus:ring-blue-blue/50 focus:border-blue-blue"
        >
            {weekOptions.map((opt, i) => (
                <option key={opt.startDate.getTime()} value={opt.startDate.getTime()}>
                    {labels[i]}
                </option>
            ))}
        </select>
    );
});
