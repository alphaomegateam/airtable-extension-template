import {memo, useState, useCallback, useMemo, useRef, useEffect} from 'react';
import {CaretLeftIcon, CaretRightIcon, CalendarBlankIcon, XIcon} from '@phosphor-icons/react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateString(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDate(value: string): {year: number; month: number; day: number} | null {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return {year: Number(m[1]), month: Number(m[2]) - 1, day: Number(m[3])};
}

function formatDisplay(value: string): string {
    const parsed = parseDate(value);
    if (!parsed) return '';
    return `${MONTHS[parsed.month].slice(0, 3)} ${parsed.day}, ${parsed.year}`;
}

interface DatePickerProps {
    /** Current value in "YYYY-MM-DD" format, or "" for no selection. */
    value: string;
    /** Called with "YYYY-MM-DD" on selection, or null on clear. */
    onChange: (date: string | null) => void;
}

/**
 * A dropdown calendar date picker with month/year navigation,
 * today indicator, selected date highlighting, and clear button.
 */
export const DatePicker = memo(function DatePicker({value, onChange}: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const parsed = useMemo(() => parseDate(value), [value]);
    const today = useMemo(() => {
        const d = new Date();
        return {year: d.getFullYear(), month: d.getMonth(), day: d.getDate()};
    }, []);

    const [viewYear, setViewYear] = useState(parsed?.year ?? today.year);
    const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.month);

    useEffect(() => {
        if (parsed) {
            setViewYear(parsed.year);
            setViewMonth(parsed.month);
        }
    }, [parsed]);

    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    const handlePrevMonth = useCallback(() => {
        setViewMonth((m) => {
            if (m === 0) {
                setViewYear((y) => y - 1);
                return 11;
            }
            return m - 1;
        });
    }, []);

    const handleNextMonth = useCallback(() => {
        setViewMonth((m) => {
            if (m === 11) {
                setViewYear((y) => y + 1);
                return 0;
            }
            return m + 1;
        });
    }, []);

    const handleSelect = useCallback(
        (day: number) => {
            onChange(toDateString(viewYear, viewMonth, day));
            setOpen(false);
        },
        [onChange, viewYear, viewMonth],
    );

    const handleClear = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange(null);
            setOpen(false);
        },
        [onChange],
    );

    const handleToggle = useCallback(() => {
        setOpen((o) => {
            if (!o && parsed) {
                setViewYear(parsed.year);
                setViewMonth(parsed.month);
            }
            return !o;
        });
    }, [parsed]);

    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const rows: Array<Array<number | null>> = [];
        let row: Array<number | null> = new Array(firstDay).fill(null);

        for (let d = 1; d <= daysInMonth; d++) {
            row.push(d);
            if (row.length === 7) {
                rows.push(row);
                row = [];
            }
        }
        if (row.length > 0) {
            while (row.length < 7) row.push(null);
            rows.push(row);
        }
        return rows;
    }, [viewYear, viewMonth]);

    const isSelected = useCallback(
        (day: number) =>
            parsed && parsed.year === viewYear && parsed.month === viewMonth && parsed.day === day,
        [parsed, viewYear, viewMonth],
    );

    const isToday = useCallback(
        (day: number) =>
            today.year === viewYear && today.month === viewMonth && today.day === day,
        [today, viewYear, viewMonth],
    );

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={handleToggle}
                className="flex items-center gap-1.5 px-2 py-0.5 text-sm rounded border border-gray-gray200 dark:border-gray-gray600 hover:border-gray-gray300 dark:hover:border-gray-gray500 bg-white dark:bg-gray-gray700 transition-colors cursor-pointer"
            >
                <CalendarBlankIcon size={13} className="text-gray-gray400 shrink-0" />
                {value ? (
                    <span className="text-gray-gray700 dark:text-gray-gray200">
                        {formatDisplay(value)}
                    </span>
                ) : (
                    <span className="text-gray-gray400">Set date</span>
                )}
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="ml-0.5 p-0.5 rounded hover:bg-gray-gray100 dark:hover:bg-gray-gray600 text-gray-gray400 hover:text-gray-gray600 dark:hover:text-gray-gray300 transition-colors cursor-pointer"
                        title="Clear date"
                    >
                        <XIcon size={10} weight="bold" />
                    </button>
                )}
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-gray700 border border-gray-gray200 dark:border-gray-gray600 rounded-lg shadow-lg p-3 w-[252px]">
                    <div className="flex items-center justify-between mb-2">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1 rounded hover:bg-gray-gray75 dark:hover:bg-gray-gray600 text-gray-gray500 dark:text-gray-gray300 transition-colors cursor-pointer"
                        >
                            <CaretLeftIcon size={14} weight="bold" />
                        </button>
                        <span className="text-xs font-semibold text-gray-gray700 dark:text-gray-gray200">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1 rounded hover:bg-gray-gray75 dark:hover:bg-gray-gray600 text-gray-gray500 dark:text-gray-gray300 transition-colors cursor-pointer"
                        >
                            <CaretRightIcon size={14} weight="bold" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-1">
                        {DAYS.map((d) => (
                            <div
                                key={d}
                                className="text-center text-[10px] font-medium text-gray-gray400 py-1"
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    {calendarDays.map((row, ri) => (
                        <div key={ri} className="grid grid-cols-7">
                            {row.map((day, ci) => (
                                <div key={ci} className="flex items-center justify-center">
                                    {day ? (
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(day)}
                                            className={[
                                                'w-8 h-8 text-xs rounded-full transition-colors cursor-pointer',
                                                isSelected(day)
                                                    ? 'bg-blue-blue text-white font-semibold'
                                                    : isToday(day)
                                                      ? 'border border-blue-blue text-blue-blue dark:text-blue-blueLight1 font-medium hover:bg-blue-blue/10'
                                                      : 'text-gray-gray700 dark:text-gray-gray200 hover:bg-gray-gray75 dark:hover:bg-gray-gray600',
                                            ].join(' ')}
                                        >
                                            {day}
                                        </button>
                                    ) : (
                                        <div className="w-8 h-8" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});
