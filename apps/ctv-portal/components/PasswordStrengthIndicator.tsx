/**
 * Password Strength Indicator Component
 * Reusable component for displaying password validation feedback
 */

import React from 'react';
import { PasswordValidation } from '@/lib/password-validation';

interface PasswordStrengthIndicatorProps {
  validation: PasswordValidation;
  password: string;
}

export function PasswordStrengthIndicator({ validation, password }: PasswordStrengthIndicatorProps) {
  const getStatusColor = (isValid: boolean, hasInput: boolean) => {
    if (isValid) return 'text-green-600';
    if (hasInput) return 'text-red-500';
    return 'text-gray-500';
  };

  const getIcon = (isValid: boolean) => {
    return isValid ? '✓' : '○';
  };

  return (
    <div className="space-y-2 text-sm">
      <div className="font-medium text-gray-700">Yêu cầu mật khẩu:</div>
      <div className="space-y-1">
        <div className={`flex items-center gap-2 transition-colors duration-200 ${
          getStatusColor(validation.minLength, !!password)
        }`}>
          <span className="text-lg">{getIcon(validation.minLength)}</span>
          <span>Ít nhất 8 ký tự</span>
        </div>
        <div className={`flex items-center gap-2 transition-colors duration-200 ${
          getStatusColor(validation.hasUpperCase, !!password)
        }`}>
          <span className="text-lg">{getIcon(validation.hasUpperCase)}</span>
          <span>Có chữ hoa (A-Z)</span>
        </div>
        <div className={`flex items-center gap-2 transition-colors duration-200 ${
          getStatusColor(validation.hasLowerCase, !!password)
        }`}>
          <span className="text-lg">{getIcon(validation.hasLowerCase)}</span>
          <span>Có chữ thường (a-z)</span>
        </div>
        <div className={`flex items-center gap-2 transition-colors duration-200 ${
          getStatusColor(validation.hasSpecialChar, !!password)
        }`}>
          <span className="text-lg">{getIcon(validation.hasSpecialChar)}</span>
          <span>Có ký tự đặc biệt (!@#$%^&*...)</span>
        </div>
      </div>
    </div>
  );
}
