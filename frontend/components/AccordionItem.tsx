import {memo} from 'react';
import {CaretRightIcon, CaretDownIcon} from '@phosphor-icons/react';

interface AccordionItemProps {
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    header: React.ReactNode;
    /**
     * Visual nesting level.
     * Level 1: no left padding, darker background.
     * Level 2: indented, lighter background.
     */
    level?: 1 | 2;
}

/**
 * A single expand/collapse accordion row with caret icon.
 * Compose multiple AccordionItems for multi-level hierarchies.
 *
 * @example
 * const [open, setOpen] = useState(false);
 * <AccordionItem
 *   isExpanded={open}
 *   onToggle={() => setOpen(prev => !prev)}
 *   level={1}
 *   header={<span className="font-semibold">Section Title</span>}
 * >
 *   <p>Collapsed content here</p>
 * </AccordionItem>
 */
export const AccordionItem = memo(function AccordionItem({
    isExpanded,
    onToggle,
    children,
    header,
    level = 1,
}: AccordionItemProps) {
    const paddingClass = level === 1 ? 'pl-0' : 'pl-6';
    const bgClass =
        level === 1
            ? 'bg-gray-gray100 dark:bg-gray-gray600'
            : 'bg-gray-gray50 dark:bg-gray-gray700';

    return (
        <div className={paddingClass}>
            <button
                onClick={onToggle}
                className={`w-full flex items-center gap-2 p-3 text-left ${bgClass} hover:bg-gray-gray200 dark:hover:bg-gray-gray500 rounded-lg mb-1 transition-colors cursor-pointer`}
            >
                {isExpanded ? (
                    <CaretDownIcon size={16} className="text-gray-gray500 flex-shrink-0" />
                ) : (
                    <CaretRightIcon size={16} className="text-gray-gray500 flex-shrink-0" />
                )}
                {header}
            </button>
            {isExpanded && <div className="ml-6 mb-2">{children}</div>}
        </div>
    );
});
