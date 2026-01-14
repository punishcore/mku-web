'use client';

import React, { useState, forwardRef, InputHTMLAttributes, ReactElement, cloneElement } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactElement<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  helperText,
  required = false,
  disabled = false,
  size = 'md',
  icon,
  iconPosition = 'left',
  showPasswordToggle = false,
  className = '',
  id,
  name,
  ...props
}, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const getPaddingClasses = () => {
    let pl = '', pr = '';
    if (icon && iconPosition === 'left') {
      pl = size === 'sm' ? 'pl-9' : size === 'md' ? 'pl-10' : 'pl-12';
    }
    if ((icon && iconPosition === 'right') || (showPasswordToggle && type === 'password') || error || success) {
      pr = size === 'sm' ? 'pr-9' : size === 'md' ? 'pr-10' : 'pr-12';
    }
    return `${pl} ${pr}`;
  };

  const inputType = type === 'password' && showPasswordToggle && isPasswordVisible ? 'text' : type;

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium mb-2 ${error ? 'text-red-700' : success ? 'text-green-700' : 'text-slate-700'}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isFocused ? 'text-blue-600' : 'text-slate-400'}`}>
            {cloneElement(icon, { className: iconSizeClasses[size] })}
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition duration-200 ease-in-out text-slate-900 ${sizeClasses[size]} ${disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'} ${error ? 'border-red-500 focus:ring-red-500' : success ? 'border-green-500 focus:ring-green-500' : 'border-slate-300 focus:ring-blue-500'} ${getPaddingClasses()} ${className}`}
          {...props}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {error && <AlertCircle className={`text-red-500 ${iconSizeClasses[size]}`} />}
          {success && <CheckCircle className={`text-green-500 ${iconSizeClasses[size]}`} />}

          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className={`text-slate-400 hover:text-slate-600 transition-colors ${error || success ? 'mr-6' : ''}`}
            >
              {isPasswordVisible ? <EyeOff className={iconSizeClasses[size]} /> : <Eye className={iconSizeClasses[size]} />}
            </button>
          )}

          {icon && iconPosition === 'right' && (
            <div className={isFocused ? 'text-blue-600' : 'text-slate-400'}>
              {cloneElement(icon, { className: iconSizeClasses[size] })}
            </div>
          )}
        </div>
      </div>

      {(helperText || error) && (
        <p className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
