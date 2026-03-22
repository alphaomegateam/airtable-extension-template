import {memo, useEffect, useState, useCallback} from 'react';

type ToastType = 'success' | 'error';

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastProps {
    visible: boolean;
    message: string;
    type: ToastType;
    onDismiss: () => void;
    /** Auto-dismiss delay in ms. Set to 0 to disable. Defaults to 4000. */
    duration?: number;
}

/**
 * A single toast notification. Auto-dismisses after `duration` ms.
 */
export const Toast = memo(function Toast({
    visible,
    message,
    type,
    onDismiss,
    duration = 4000,
}: ToastProps) {
    useEffect(() => {
        if (visible && duration > 0) {
            const timer = setTimeout(onDismiss, duration);
            return () => clearTimeout(timer);
        }
    }, [visible, duration, onDismiss]);

    if (!visible) return null;

    const bgColor =
        type === 'success'
            ? 'bg-gray-800 dark:bg-gray-200'
            : 'bg-red-600 dark:bg-red-500';
    const textColor =
        type === 'success' ? 'text-white dark:text-gray-800' : 'text-white';
    const icon = type === 'success' ? '\u2713' : '\u2715';
    const iconColor = type === 'success' ? 'text-green-400' : 'text-white';

    return (
        <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${bgColor} ${textColor}`}
            role="alert"
        >
            <span className={iconColor}>{icon}</span>
            <span className="text-sm font-medium">{message}</span>
            <button
                onClick={onDismiss}
                className="ml-2 opacity-70 hover:opacity-100 cursor-pointer"
                aria-label="Dismiss"
            >
                {'\u2715'}
            </button>
        </div>
    );
});

/**
 * Hook for managing a stack of toast notifications.
 *
 * @example
 * const {toasts, showToast, dismissToast} = useToast();
 * showToast('Saved!', 'success');
 * return <ToastContainer toasts={toasts} onDismiss={dismissToast} />;
 */
export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        setToasts((prev) => [...prev, {id: Date.now(), message, type}]);
    }, []);

    const dismissToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return {toasts, showToast, dismissToast};
}

interface ToastContainerProps {
    toasts: ToastMessage[];
    onDismiss: (id: number) => void;
    /** Auto-dismiss delay in ms. Defaults to 4000. */
    duration?: number;
}

/**
 * Renders a stack of toast notifications. Pair with `useToast()`.
 */
export const ToastContainer = memo(function ToastContainer({
    toasts,
    onDismiss,
    duration = 4000,
}: ToastContainerProps) {
    return (
        <>
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{transform: `translateX(-50%) translateY(-${index * 60}px)`}}
                >
                    <Toast
                        visible
                        message={toast.message}
                        type={toast.type}
                        onDismiss={() => onDismiss(toast.id)}
                        duration={duration}
                    />
                </div>
            ))}
        </>
    );
});
