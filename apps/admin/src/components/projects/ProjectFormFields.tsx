/**
 * Shared Project Form Fields Component
 * Reusable form fields for Create/Edit Project
 * Using React Hook Form
 */

import { Controller, useFormContext } from 'react-hook-form';
import FormField from '../shared/FormField';
import FormSection from '../shared/FormSection';
import ImageUpload from '../shared/ImageUpload';
import type { ProjectFormData } from '../../schemas/project.schema';

export default function ProjectFormFields() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProjectFormData>();
  return (
    <>
      {/* Basic Info */}
      <FormSection title="Thông tin cơ bản">
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <FormField
                label="Tên dự án"
                name="name"
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Vinhomes Smart City"
                helperText="Đặt tên dễ nhận diện cho sale/CTV, ví dụ theo tên thương mại của chủ đầu tư."
                required
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <FormField
                label="Mã dự án"
                name="code"
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="VHS-2025"
                helperText="Mã viết HOA, không dấu, chứa chữ, số, dấu gạch ngang (VD: SUN-QUAN7-2026)."
                required
                error={errors.code?.message}
              />
            )}
          />
        </div>

        <Controller
          name="developer"
          control={control}
          render={({ field }) => (
            <FormField
              label="Chủ đầu tư"
              name="developer"
              value={field.value || ''}
              onChange={field.onChange}
              placeholder="Vingroup"
              helperText="Tên pháp lý hoặc thương mại của chủ đầu tư."
              required
              error={errors.developer?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Mô tả chi tiết dự án..."
                className={`w-full min-h-[100px] px-3 py-2 border border-input rounded-md ${
                  errors.description ? 'border-red-500' : ''
                }`}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUpload
              value={field.value || []}
              onChange={field.onChange}
              maxImages={10}
              error={errors.images?.message}
              helperText="Thêm hình ảnh dự án để hiển thị trên trang chi tiết. Có thể upload từ máy tính hoặc nhập URL."
            />
          )}
        />
      </FormSection>

      {/* Location */}
      <FormSection title="Vị trí">
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <FormField
              label="Địa chỉ"
              name="address"
              value={field.value || ''}
              onChange={field.onChange}
              placeholder="Đại lộ Thăng Long"
              helperText="Địa chỉ thực tế để khách dễ định vị trên bản đồ."
              required
              error={errors.address?.message}
            />
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <Controller
            name="district"
            control={control}
            render={({ field }) => (
              <FormField
                label="Quận/Huyện"
                name="district"
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Nam Từ Liêm"
                required
                error={errors.district?.message}
              />
            )}
          />
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <FormField
                label="Thành phố"
                name="city"
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Hà Nội"
                required
                error={errors.city?.message}
              />
            )}
          />
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <FormField
                label="Khu vực"
                name="location"
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Miền Bắc"
                helperText="Dùng để group theo vùng (VD: Miền Bắc, Miền Nam, TP.HCM, Hà Nội...)."
                required
                error={errors.location?.message}
              />
            )}
          />
        </div>
      </FormSection>

      {/* Project Details */}
      <FormSection title="Chi tiết dự án">
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="totalBuildings"
            control={control}
            render={({ field }) => (
              <FormField
                label="Số tòa"
                name="totalBuildings"
                type="number"
                value={field.value ?? ''}
                onChange={(val) => field.onChange(val === '' ? undefined : Number(val))}
                placeholder="3"
                helperText="Tùy chọn. Dùng để tham khảo tổng thể, không bắt buộc chính xác tuyệt đối."
                error={errors.totalBuildings?.message}
              />
            )}
          />
          <Controller
            name="totalUnits"
            control={control}
            render={({ field }) => (
              <FormField
                label="Tổng số căn"
                name="totalUnits"
                type="number"
                value={field.value ?? ''}
                onChange={(val) => field.onChange(val === '' ? undefined : Number(val))}
                placeholder="300"
                helperText="Tùy chọn. Hệ thống vẫn đếm theo số căn thực tế trong module Căn hộ."
                error={errors.totalUnits?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="priceFrom"
            control={control}
            render={({ field }) => (
              <FormField
                label="Giá từ (VNĐ)"
                name="priceFrom"
                type="number"
                value={field.value ?? ''}
                onChange={(val) => field.onChange(val === '' ? undefined : Number(val))}
                placeholder="2000000000"
                helperText="Khoảng giá tham khảo cho sale/CTV, có thể bỏ trống."
                error={errors.priceFrom?.message}
              />
            )}
          />
          <Controller
            name="priceTo"
            control={control}
            render={({ field }) => (
              <FormField
                label="Giá đến (VNĐ)"
                name="priceTo"
                type="number"
                value={field.value ?? ''}
                onChange={(val) => field.onChange(val === '' ? undefined : Number(val))}
                placeholder="5000000000"
                helperText={errors.priceTo?.message || 'Nếu nhập, Giá đến phải lớn hơn hoặc bằng Giá từ.'}
                error={errors.priceTo?.message}
              />
            )}
          />
        </div>

        <Controller
          name="commissionRate"
          control={control}
          render={({ field }) => (
            <FormField
              label="Tỷ lệ hoa hồng (%)"
              name="commissionRate"
              type="number"
              step="0.1"
              value={field.value ?? ''}
              onChange={(val) => field.onChange(val === '' ? undefined : Number(val))}
              placeholder="2.0"
              helperText="Mức hoa hồng mặc định cho dự án, có thể điều chỉnh sau cho từng căn."
              error={errors.commissionRate?.message}
            />
          )}
        />
      </FormSection>
    </>
  );
}
