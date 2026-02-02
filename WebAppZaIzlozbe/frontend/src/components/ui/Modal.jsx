import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

export default function Modal({
    isOpen,
    onClose,
    title,
    size = 'md',
    children,
    showCloseButton = true,
}) {
    const modalRef = useRef(null);

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-4xl',
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

            <div
                ref={modalRef}
                className={`
          relative w-full ${sizes[size]}
          bg-luxury-dark border border-luxury-gray
          shadow-luxury
          animate-scale-in
          flex flex-col max-h-[90vh]
        `}
            >
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-luxury-gray flex-shrink-0">
                        {title && (
                            <h2 className="text-xl font-display font-semibold text-white">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 text-luxury-silver hover:text-white hover:bg-luxury-gray transition-all duration-200"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                <div className="px-6 py-4 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

Modal.Footer = function ModalFooter({ children, className = '' }) {
    return (
        <div className={`flex items-center justify-end gap-3 pt-4 border-t border-luxury-gray mt-4 ${className}`}>
            {children}
        </div>
    );
};
