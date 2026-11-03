import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(function Input({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  required,
  ...props
}, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <LeftIcon size={16} />
          </div>
        )}
        <input
          ref={ref}
          {...props}
          className={clsx(
            'w-full rounded-lg border px-3 py-2 text-sm text-gray-900',
            'placeholder:text-gray-400',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            LeftIcon && 'pl-9',
            RightIcon && 'pr-9',
            error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300',
            className
          )}
        />
        {RightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <RightIcon size={16} />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 flex items-center gap-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
});

export default Input;
