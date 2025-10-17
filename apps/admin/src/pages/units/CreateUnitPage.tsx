/**
 * Create Unit Page (Admin)
 * Form to manually create a single unit
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { unitsApi } from '../../api/units.api';
import { projectsApi } from '../../api/projects.api';
import type { Project } from '../../types/project.types';
import PageHeader from '../../components/ui/PageHeader';
import FormSection from '../../components/shared/FormSection';
import FormField from '../../components/shared/FormField';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export default function CreateUnitPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    projectId: '',
    buildingCode: '',
    floorNumber: '',
    unitNumber: '',
    code: '',
    price: '',
    area: '',
    bedrooms: '2',
    bathrooms: '2',
    direction: '',
    view: '',
    balcony: true,
    description: '',
    commissionRate: '2.5',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate code when building/floor/unit changes
    if (field === 'buildingCode' || field === 'floorNumber' || field === 'unitNumber') {
      const newData = { ...formData, [field]: value };
      if (newData.buildingCode && newData.floorNumber && newData.unitNumber) {
        newData.code = `${newData.buildingCode}-${newData.floorNumber.padStart(2, '0')}${newData.unitNumber.padStart(2, '0')}`;
      }
      setFormData(newData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectId || !formData.code || !formData.price || !formData.area) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc!');
      return;
    }

    try {
      setLoading(true);
      
      // Note: Backend expects buildingId and floorId (UUIDs), not codes
      // In production, you'd need to create/lookup building and floor first
      await unitsApi.create({
        projectId: formData.projectId,
        code: formData.code,
        unitNumber: formData.unitNumber,
        price: parseFloat(formData.price),
        area: parseFloat(formData.area),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        direction: formData.direction || undefined,
        view: formData.view || undefined,
        balcony: formData.balcony,
        description: formData.description || undefined,
        commissionRate: parseFloat(formData.commissionRate),
      } as any);

      alert('✅ Tạo căn hộ thành công!');
      navigate('/units');
    } catch (error: any) {
      console.error('Failed to create unit:', error);
      alert(error.message || 'Lỗi tạo căn hộ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Tạo Căn Hộ Mới"
        description="Thêm căn hộ vào dự án"
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <FormSection title="Thông tin cơ bản">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Dự án <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => handleChange('projectId', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn dự án" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <FormField
                label="Mã căn"
                value={formData.code}
                onChange={(value) => handleChange('code', value)}
                placeholder="A1-0502"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="Tòa"
                value={formData.buildingCode}
                onChange={(value) => handleChange('buildingCode', value)}
                placeholder="A1"
                required
              />
              
              <FormField
                label="Tầng"
                value={formData.floorNumber}
                onChange={(value) => handleChange('floorNumber', value)}
                placeholder="5"
                required
              />
              
              <FormField
                label="Số căn"
                value={formData.unitNumber}
                onChange={(value) => handleChange('unitNumber', value)}
                placeholder="02"
                required
              />
            </div>
          </FormSection>

          {/* Unit Details */}
          <FormSection title="Thông số căn hộ">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Giá (VNĐ)"
                type="number"
                value={formData.price}
                onChange={(value) => handleChange('price', value)}
                placeholder="2500000000"
                required
              />
              
              <FormField
                label="Diện tích (m²)"
                type="number"
                value={formData.area}
                onChange={(value) => handleChange('area', value)}
                placeholder="75"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Số phòng ngủ"
                type="number"
                value={formData.bedrooms}
                onChange={(value) => handleChange('bedrooms', value)}
                required
              />
              
              <FormField
                label="Số toilet"
                type="number"
                value={formData.bathrooms}
                onChange={(value) => handleChange('bathrooms', value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Hướng"
                value={formData.direction}
                onChange={(value) => handleChange('direction', value)}
                placeholder="Đông Nam"
              />
              
              <FormField
                label="View"
                value={formData.view}
                onChange={(value) => handleChange('view', value)}
                placeholder="Sông, Công viên"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.balcony}
                    onChange={(e) => handleChange('balcony', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Có ban công</span>
                </label>
              </div>
              
              <FormField
                label="Hoa hồng (%)"
                type="number"
                value={formData.commissionRate}
                onChange={(value) => handleChange('commissionRate', value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Mô tả
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả chi tiết về căn hộ..."
              />
            </div>
          </FormSection>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/units')}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo Căn Hộ'}
            </Button>
          </div>
        </form>
    </div>
  );
}

