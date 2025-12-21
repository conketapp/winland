/**
 * Shared FormField Component
 * Reusable form field with label, input, and error message
 */

import { Input } from '../ui/input';

interface FormFieldProps {
  label: string;
  name?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'number' | 'tel' | 'date' | 'password';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  step?: string | number;
  min?: string | number;
  max?: string | number;
  multiline?: boolean;
  rows?: number;
  helperText?: string;
}

export default function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  step,
  min,
  max,
  multiline = false,
  rows = 3,
  helperText,
}: FormFieldProps) {
  const fieldId = name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={fieldId}
          name={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? 'border-red-500' : ''
          }`}
        />
      ) : (
        <Input
          id={fieldId}
          name={fieldId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          step={step}
          min={min}
          max={max}
          className={error ? 'border-red-500' : ''}
        />
      )}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

