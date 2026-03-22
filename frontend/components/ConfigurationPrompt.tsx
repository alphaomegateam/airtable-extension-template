import {memo} from 'react';
import {WarningCircleIcon} from '@phosphor-icons/react';

interface ConfigurationPromptProps {
    /** List of missing table/field names to display. */
    missingProperties: string[];
    /** Optional heading text. Defaults to "Configuration Required". */
    heading?: string;
    /** Optional description. Defaults to a standard message about missing tables/fields. */
    description?: string;
}

/**
 * Centered prompt shown when required custom properties (tables or fields)
 * are not accessible in the current Interface layout.
 */
export const ConfigurationPrompt = memo(function ConfigurationPrompt({
    missingProperties,
    heading = 'Configuration Required',
    description = 'The following required tables or fields are not accessible. Please ensure they are visible in the Interface layout:',
}: ConfigurationPromptProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <WarningCircleIcon size={48} weight="light" className="text-yellow-yellow mb-4" />
            <h2 className="text-lg font-semibold text-gray-gray700 dark:text-gray-gray200 mb-2">
                {heading}
            </h2>
            <p className="text-sm text-gray-gray500 dark:text-gray-gray400 mb-4 max-w-md">
                {description}
            </p>
            <ul className="text-sm text-gray-gray600 dark:text-gray-gray300 list-disc list-inside text-left">
                {missingProperties.map((prop) => (
                    <li key={prop}>{prop}</li>
                ))}
            </ul>
        </div>
    );
});
