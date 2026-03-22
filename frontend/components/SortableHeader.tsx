import {memo} from 'react';

export type SortDirection = 'asc' | 'desc';

interface SortableHeaderProps<T extends string> {
    label: string;
    column: T;
    currentSort: T | null;
    currentDirection: SortDirection | null;
    onSort: (column: T) => void;
    /** Text alignment within the header. Defaults to 'center'. */
    align?: 'left' | 'center' | 'right';
}

/**
 * A table header cell with sort direction indicators.
 * Generic over the column type for type-safe sort state.
 *
 * @example
 * type Col = 'name' | 'date' | 'amount';
 * <SortableHeader<Col> label="Name" column="name" currentSort={sort} currentDirection={dir} onSort={setSort} />
 */
export const SortableHeader = memo(function SortableHeader<T extends string>({
    label,
    column,
    currentSort,
    currentDirection,
    onSort,
    align = 'center',
}: SortableHeaderProps<T>) {
    const isActive = currentSort === column;

    const justifyClass =
        align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';

    return (
        <th
            className={`px-4 py-3 text-${align} text-xs font-semibold uppercase tracking-wider
                text-gray-gray600 dark:text-gray-gray300 cursor-pointer
                hover:bg-gray-gray100 dark:hover:bg-gray-gray600 select-none transition-colors`}
            onClick={() => onSort(column)}
        >
            <div className={`flex items-center ${justifyClass} gap-1`}>
                {label}
                <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                    {isActive && currentDirection === 'desc' ? '\u25BC' : '\u25B2'}
                </span>
            </div>
        </th>
    );
}) as <T extends string>(props: SortableHeaderProps<T>) => React.ReactElement;
