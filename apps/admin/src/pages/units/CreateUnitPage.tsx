/**
 * Create Unit Page (Admin)
 * Form to manually create a single unit
 */

import { useState, useEffect, useCallback } from 'react';
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
import { useToast } from '../../components/ui/toast';

interface Building {
  id: string;
  code: string;
  name: string;
  floorsData?: Floor[];
}

interface Floor {
  id: string;
  number: number;
  buildingId: string;
}

export default function CreateUnitPage() {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [formData, setFormData] = useState({
    projectId: '',
    buildingId: '',
    floorId: '',
    unitNumber: '',
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadProjects = useCallback(async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data.items || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Không thể tải danh sách dự án';
      toastError(errorMessage);
    }
  }, [toastError]);

  const loadBuildingsAndFloors = useCallback(async (projectId: string) => {
    try {
      setLoadingBuildings(true);
      const project = await projectsApi.getById(projectId);
      // Project type includes buildings with floorsData
      const projectWithBuildings = project as Project & {
        buildings?: Array<{
          id: string;
          code: string;
          name: string;
          floorsData?: Array<{
            id: string;
            number: number;
            buildingId: string;
          }>;
        }>;
      };
      if (projectWithBuildings.buildings && Array.isArray(projectWithBuildings.buildings)) {
        setBuildings(projectWithBuildings.buildings as Building[]);
      } else {
        setBuildings([]);
      }
    } catch (error) {
      console.error('Failed to load buildings:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (typeof error === 'object' && error !== null && 'message' in error)
          ? String(error.message)
          : 'Không thể tải danh sách tòa nhà';
      toastError(errorMessage);
      setBuildings([]);
      setFloors([]);
    } finally {
      setLoadingBuildings(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (formData.projectId) {
      loadBuildingsAndFloors(formData.projectId);
    } else {
      setBuildings([]);
      setFloors([]);
      setFormData(prev => ({ ...prev, buildingId: '', floorId: '' }));
      setLoadingBuildings(false);
    }
  }, [formData.projectId, loadBuildingsAndFloors]);

  useEffect(() => {
    if (formData.buildingId) {
      const selectedBuilding = buildings.find(b => b.id === formData.buildingId);
      if (selectedBuilding?.floorsData) {
        setFloors(selectedBuilding.floorsData);
      } else {
        setFloors([]);
      }
      setFormData(prev => ({ ...prev, floorId: '' }));
    } else {
      setFloors([]);
      setFormData(prev => ({ ...prev, floorId: '' }));
    }
  }, [formData.buildingId, buildings]);

  // Helper functions for parsing numbers
  const parseNumber = (value: string | number | undefined, allowEmpty = false): number | undefined => {
    if (value === '' || value === undefined || value === null) {
      return allowEmpty ? undefined : 0;
    }
    const parsed = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(parsed) ? (allowEmpty ? undefined : 0) : parsed;
  };

  const parseInteger = (value: string | number | undefined, allowEmpty = false): number | undefined => {
    if (value === '' || value === undefined || value === null) {
      return allowEmpty ? undefined : 0;
    }
    const parsed = typeof value === 'string' ? parseInt(value, 10) : Math.floor(value);
    return isNaN(parsed) ? (allowEmpty ? undefined : 0) : parsed;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectId) {
      newErrors.projectId = 'Vui lòng chọn dự án';
    }
    if (!formData.buildingId) {
      newErrors.buildingId = 'Vui lòng chọn tòa nhà';
    }
    if (!formData.floorId) {
      newErrors.floorId = 'Vui lòng chọn tầng';
    }
    if (!formData.unitNumber || formData.unitNumber.trim() === '') {
      newErrors.unitNumber = 'Vui lòng nhập số căn';
    }

    // Validate numeric fields with proper parsing
    const price = parseNumber(formData.price);
    if (!price || price <= 0) {
      newErrors.price = 'Giá phải lớn hơn 0';
    }

    const area = parseNumber(formData.area);
    if (!area || area <= 0) {
      newErrors.area = 'Diện tích phải lớn hơn 0';
    }

    if (formData.bedrooms) {
      const bedrooms = parseInteger(formData.bedrooms, true);
      if (bedrooms !== undefined && bedrooms < 0) {
        newErrors.bedrooms = 'Số phòng ngủ phải >= 0';
      }
    }

    if (formData.bathrooms) {
      const bathrooms = parseInteger(formData.bathrooms, true);
      if (bathrooms !== undefined && bathrooms < 0) {
        newErrors.bathrooms = 'Số toilet phải >= 0';
      }
    }

    if (formData.commissionRate) {
      const commissionRate = parseNumber(formData.commissionRate, true);
      if (commissionRate !== undefined && (commissionRate < 0 || commissionRate > 100)) {
        newErrors.commissionRate = 'Hoa hồng phải từ 0-100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user changes field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toastError('Vui lòng kiểm tra lại thông tin!');
      return;
    }

    try {
      setLoading(true);
      
      // Parse all numeric values properly
      const submitData = {
        projectId: formData.projectId,
        buildingId: formData.buildingId,
        floorId: formData.floorId,
        unitNumber: formData.unitNumber.trim(),
        price: parseNumber(formData.price)!,
        area: parseNumber(formData.area)!,
        bedrooms: parseInteger(formData.bedrooms, true),
        bathrooms: parseInteger(formData.bathrooms, true),
        direction: formData.direction?.trim() || undefined,
        view: formData.view?.trim() || undefined,
        balcony: formData.balcony,
        description: formData.description?.trim() || undefined,
        commissionRate: parseNumber(formData.commissionRate, true),
      };

      await unitsApi.create(submitData);

      toastSuccess('✅ Tạo căn hộ thành công!');
      navigate('/units');
    } catch (error) {
      console.error('Failed to create unit:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (typeof error === 'object' && error !== null && 'message' in error)
          ? String(error.message)
          : 'Lỗi tạo căn hộ!';
      toastError(errorMessage);
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
                  <SelectTrigger className={errors.projectId ? 'border-red-500' : ''}>
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
                {errors.projectId && (
                  <p className="text-sm text-red-500">{errors.projectId}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tòa nhà <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.buildingId}
                  onValueChange={(value) => handleChange('buildingId', value)}
                  required
                  disabled={!formData.projectId || loadingBuildings || buildings.length === 0}
                >
                  <SelectTrigger className={errors.buildingId ? 'border-red-500' : ''}>
                    <SelectValue placeholder={
                      !formData.projectId 
                        ? 'Chọn dự án trước' 
                        : loadingBuildings 
                          ? 'Đang tải...' 
                          : buildings.length === 0 
                            ? 'Chưa có tòa nhà' 
                            : 'Chọn tòa nhà'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.code} - {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.buildingId && (
                  <p className="text-sm text-red-500">{errors.buildingId}</p>
                )}
                {loadingBuildings && (
                  <p className="text-xs text-gray-500">Đang tải danh sách tòa nhà...</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tầng <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.floorId}
                  onValueChange={(value) => handleChange('floorId', value)}
                  required
                  disabled={!formData.buildingId || loadingBuildings || floors.length === 0}
                >
                  <SelectTrigger className={errors.floorId ? 'border-red-500' : ''}>
                    <SelectValue placeholder={
                      !formData.buildingId 
                        ? 'Chọn tòa nhà trước' 
                        : loadingBuildings
                          ? 'Đang tải...'
                          : floors.length === 0 
                            ? 'Chưa có tầng' 
                            : 'Chọn tầng'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {floors
                      .sort((a, b) => a.number - b.number)
                      .map((floor) => (
                        <SelectItem key={floor.id} value={floor.id}>
                          Tầng {floor.number}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.floorId && (
                  <p className="text-sm text-red-500">{errors.floorId}</p>
                )}
              </div>
              
              <FormField
                label="Số căn"
                value={formData.unitNumber}
                onChange={(value) => handleChange('unitNumber', value)}
                placeholder="02"
                required
                error={errors.unitNumber}
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
                error={errors.price}
                min={0.01}
                step={1000000}
              />
              
              <FormField
                label="Diện tích (m²)"
                type="number"
                value={formData.area}
                onChange={(value) => handleChange('area', value)}
                placeholder="75"
                required
                error={errors.area}
                min={0.01}
                step={0.1}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Số phòng ngủ"
                type="number"
                value={formData.bedrooms}
                onChange={(value) => handleChange('bedrooms', value)}
                error={errors.bedrooms}
                min={0}
              />
              
              <FormField
                label="Số toilet"
                type="number"
                value={formData.bathrooms}
                onChange={(value) => handleChange('bathrooms', value)}
                error={errors.bathrooms}
                min={0}
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
                error={errors.commissionRate}
                min={0}
                max={100}
                step={0.1}
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

