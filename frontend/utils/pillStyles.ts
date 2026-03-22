/**
 * Generates pill styles that work well in both light and dark modes.
 * Light mode: full hex color background with dark text
 * Dark mode: 40% opacity hex color background with full hex color text
 */
export function getPillStyles(hexColor: string | null, isLightMode: boolean): React.CSSProperties {
    if (!hexColor) return {};

    if (isLightMode) {
        return {
            backgroundColor: hexColor,
            color: 'rgb(37, 29, 29)',
        };
    }

    return {
        backgroundColor: `${hexColor}40`,
        color: hexColor,
    };
}
