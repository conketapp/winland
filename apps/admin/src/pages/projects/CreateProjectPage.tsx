/**
 * Create/Edit Project Form
 * Using shared components for consistency
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import PageHeader from '../../components/ui/PageHeader';
import FormField from '../../components/shared/FormField';
import FormSection from '../../components/shared/FormSection';
import { projectsApi } from '../../api/projects.api';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    developer: '',
    location: '',
    address: '',
    district: '',
    city: '',
    totalBuildings: 0,
    totalUnits: 0,
    priceFrom: 0,
    priceTo: 0,
    commissionRate: 2.0,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await projectsApi.create(formData);
      alert('Tạo dự án thành công!');
      navigate('/projects');
    } catch (error: any) {
      alert('Lỗi: ' + (error.message || 'Không thể tạo dự án'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Tạo Dự Án Mới"
        description="Nhập thông tin dự án bất động sản"
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <FormSection title="Thông tin cơ bản">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Tên dự án"
                name="name"
                value={formData.name}
                onChange={(val) => handleChange('name', val)}
                placeholder="Vinhomes Smart City"
                required
              />
              <FormField
                label="Mã dự án"
                name="code"
                value={formData.code}
                onChange={(val) => handleChange('code', val)}
                placeholder="VHS-2025"
                required
              />
            </div>

            <FormField
              label="Chủ đầu tư"
              name="developer"
              value={formData.developer}
              onChange={(val) => handleChange('developer', val)}
              placeholder="Vingroup"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả chi tiết dự án..."
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md"
              />
            </div>
          </FormSection>

          {/* Location */}
          <FormSection title="Vị trí">
            <FormField
              label="Địa chỉ"
              name="address"
              value={formData.address}
              onChange={(val) => handleChange('address', val)}
              placeholder="Đại lộ Thăng Long"
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="Quận/Huyện"
                name="district"
                value={formData.district}
                onChange={(val) => handleChange('district', val)}
                placeholder="Nam Từ Liêm"
              />
              <FormField
                label="Thành phố"
                name="city"
                value={formData.city}
                onChange={(val) => handleChange('city', val)}
                placeholder="Hà Nội"
                required
              />
              <FormField
                label="Khu vực"
                name="location"
                value={formData.location}
                onChange={(val) => handleChange('location', val)}
                placeholder="Miền Bắc"
              />
            </div>
          </FormSection>

          {/* Project Details */}
          <FormSection title="Chi tiết dự án">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Số tòa"
                name="totalBuildings"
                type="number"
                value={formData.totalBuildings}
                onChange={(val) => handleChange('totalBuildings', Number(val))}
                placeholder="3"
              />
              <FormField
                label="Tổng số căn"
                name="totalUnits"
                type="number"
                value={formData.totalUnits}
                onChange={(val) => handleChange('totalUnits', Number(val))}
                placeholder="300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Giá từ (VNĐ)"
                name="priceFrom"
                type="number"
                value={formData.priceFrom}
                onChange={(val) => handleChange('priceFrom', Number(val))}
                placeholder="2000000000"
              />
              <FormField
                label="Giá đến (VNĐ)"
                name="priceTo"
                type="number"
                value={formData.priceTo}
                onChange={(val) => handleChange('priceTo', Number(val))}
                placeholder="5000000000"
              />
            </div>

            <FormField
              label="Tỷ lệ hoa hồng (%)"
              name="commissionRate"
              type="number"
              step="0.1"
              value={formData.commissionRate}
              onChange={(val) => handleChange('commissionRate', Number(val))}
              placeholder="2.0"
            />
          </FormSection>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/projects')}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Đang tạo...' : 'Tạo Dự Án'}
            </Button>
          </div>
        </form>
    </div>
  );
}

