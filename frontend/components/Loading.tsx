import {memo} from 'react';

interface LoadingProps {
    /** Text displayed next to the spinner. Defaults to "Loading...". */
    message?: string;
}

/**
 * Centered loading spinner with an optional message.
 */
export const Loading = memo(function Loading({message = 'Loading...'}: LoadingProps) {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-blue border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-gray600 dark:text-gray-gray400">{message}</span>
            </div>
        </div>
    );
});
