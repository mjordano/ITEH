import { forwardRef } from 'react';

const CustomButton = forwardRef(({
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    children,
    className = '',
    ...props
}, ref) => {
    const baseStyles = `
    inline-flex items-center justify-center font-medium
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

    const variants = {
        primary: `
      bg-white text-black hover:bg-luxury-light hover:shadow-glow
      focus:ring-white
    `,
        outline: `
      bg-transparent text-white border border-white
      hover:bg-white hover:text-black
      focus:ring-white
    `,
        gold: `
      bg-accent-gold text-black hover:bg-yellow-500 hover:shadow-glow
      focus:ring-accent-gold
    `,
        danger: `
      bg-red-600 text-white hover:bg-red-700
      focus:ring-red-500
    `,
        ghost: `
      bg-transparent text-luxury-silver hover:text-white hover:bg-luxury-gray
      focus:ring-white
    `,
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const buttonStyles = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={buttonStyles}
            {...props}
        >
            {loading && (
                <svg
                    className={`animate-spin ${iconSizes[size]} ${children ? 'mr-2' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}

            {!loading && Icon && iconPosition === 'left' && (
                <Icon className={`${iconSizes[size]} ${children ? 'mr-2' : ''}`} />
            )}

            {children}

            {!loading && Icon && iconPosition === 'right' && (
                <Icon className={`${iconSizes[size]} ${children ? 'ml-2' : ''}`} />
            )}
        </button>
    );
});

CustomButton.displayName = 'CustomButton';

export default CustomButton;
