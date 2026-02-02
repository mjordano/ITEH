import { forwardRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const InputField = forwardRef(({
    label,
    type = 'text',
    placeholder,
    error,
    required = false,
    icon: Icon,
    helper,
    className = '',
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-luxury-light mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icon className="w-5 h-5 text-luxury-silver" />
                    </div>
                )}

                <input
                    ref={ref}
                    type={inputType}
                    placeholder={placeholder}
                    className={`
            w-full px-4 py-3 
            bg-luxury-dark border text-white
            placeholder-luxury-silver
            transition-all duration-300 ease-out
            focus:outline-none focus:ring-1
            ${Icon ? 'pl-12' : ''}
            ${isPassword ? 'pr-12' : ''}
            ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-luxury-gray focus:border-white focus:ring-white'
                        }
          `}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-luxury-silver hover:text-white transition-colors"
                    >
                        {showPassword ? (
                            <FiEyeOff className="w-5 h-5" />
                        ) : (
                            <FiEye className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}

            {helper && !error && (
                <p className="mt-2 text-sm text-luxury-silver">{helper}</p>
            )}
        </div>
    );
});

InputField.displayName = 'InputField';

export default InputField;
