/**
 * Project Form Schema
 * Zod schema for project form validation
 */

import { z } from 'zod';

export const projectFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên dự án là bắt buộc')
    .min(5, 'Tên dự án phải có ít nhất 5 ký tự')
    .trim(),
  
  code: z
    .string()
    .min(1, 'Mã dự án là bắt buộc')
    .regex(
      /^[A-Z0-9-]+$/,
      'Mã dự án phải viết HOA, chỉ chứa chữ, số và dấu gạch ngang (VD: VHS-2025)'
    )
    .transform((val) => val.trim().toUpperCase()),
  
  developer: z
    .string()
    .min(1, 'Chủ đầu tư là bắt buộc')
    .trim(),
  
  location: z
    .string()
    .min(1, 'Khu vực là bắt buộc')
    .trim(),
  
  address: z
    .string()
    .min(1, 'Địa chỉ là bắt buộc')
    .trim(),
  
  district: z
    .string()
    .min(1, 'Quận/Huyện là bắt buộc')
    .trim(),
  
  city: z
    .string()
    .min(1, 'Thành phố là bắt buộc')
    .trim(),
  
  totalBuildings: z
    .number()
    .int('Số tòa phải là số nguyên')
    .min(0, 'Số tòa không thể âm')
    .optional()
    .nullable()
    .transform((val) => (val === 0 || val === null ? undefined : val)),
  
  totalUnits: z
    .number()
    .int('Tổng số căn phải là số nguyên')
    .min(0, 'Tổng số căn không thể âm')
    .optional()
    .nullable()
    .transform((val) => (val === 0 || val === null ? undefined : val)),
  
  priceFrom: z
    .number()
    .min(0, 'Giá từ không thể âm')
    .optional()
    .nullable()
    .transform((val) => (val === 0 || val === null ? undefined : val)),
  
  priceTo: z
    .number()
    .min(0, 'Giá đến không thể âm')
    .optional()
    .nullable()
    .transform((val) => (val === 0 || val === null ? undefined : val)),
  
  commissionRate: z
    .number()
    .min(0, 'Tỷ lệ hoa hồng không thể âm')
    .max(100, 'Tỷ lệ hoa hồng không thể vượt quá 100%')
    .optional()
    .nullable()
    .transform((val) => (val === 0 || val === null ? undefined : val)),
  
  description: z
    .string()
    .optional()
    .nullable()
    .default(''),
  
  images: z
    .array(z.string().url('URL hình ảnh không hợp lệ'))
    .max(10, 'Tối đa 10 hình ảnh')
    .optional()
    .default([]),
}).refine(
  (data) => {
    // Price range validation: priceTo must be >= priceFrom if both are provided
    if (data.priceFrom && data.priceTo) {
      return data.priceTo >= data.priceFrom;
    }
    return true;
  },
  {
    message: 'Giá đến phải lớn hơn hoặc bằng Giá từ',
    path: ['priceTo'], // Attach error to priceTo field
  }
);

export type ProjectFormData = z.infer<typeof projectFormSchema>;
