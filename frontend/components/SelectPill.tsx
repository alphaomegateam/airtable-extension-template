import {memo} from 'react';
import {colorUtils, useColorScheme} from '@airtable/blocks/interface/ui';
import {getPillStyles} from '../utils/pillStyles';

interface SelectValue {
    name: string;
    color: string;
}

interface SelectPillProps {
    value: SelectValue;
}

/**
 * Renders a single select value as a colored pill.
 * Uses the Airtable color name to derive hex, with dark mode support.
 */
export const SelectPill = memo(function SelectPill({value}: SelectPillProps) {
    const {colorScheme} = useColorScheme();
    const isLightMode = colorScheme === 'light';
    const hexColor = colorUtils.getHexForColor(
        value.color as Parameters<typeof colorUtils.getHexForColor>[0],
    );

    return (
        <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={getPillStyles(hexColor, isLightMode)}
        >
            {value.name}
        </span>
    );
});

interface MultiSelectPillsProps {
    values: SelectValue[];
}

/**
 * Renders multiple select values as a row of colored pills.
 */
export const MultiSelectPills = memo(function MultiSelectPills({values}: MultiSelectPillsProps) {
    return (
        <div className="flex flex-wrap gap-1">
            {values.map((value) => (
                <SelectPill key={value.name} value={value} />
            ))}
        </div>
    );
});
