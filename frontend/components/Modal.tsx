import {memo, useEffect} from 'react';

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
    /** Max-width class for the modal panel. Defaults to "max-w-md". */
    maxWidth?: string;
}

/**
 * Centered modal overlay with backdrop click and Escape key to close.
 */
export const Modal = memo(function Modal({children, onClose, maxWidth = 'max-w-md'}: ModalProps) {
    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className={`bg-white dark:bg-gray-gray700 rounded-lg shadow-xl ${maxWidth} w-full mx-4 p-6`}
            >
                {children}
            </div>
        </div>
    );
});
