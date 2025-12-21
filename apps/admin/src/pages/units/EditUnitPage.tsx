/**
 * Edit Unit Page
 * Form to edit existing unit information
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { unitsApi } from '../../api/units.api';
import { projectsApi } from '../../api/projects.api';
import type { Unit } from '../../types/unit.types';
import type { Project } from '../../types/project.types';
import FormSection from '../../components/shared/FormSection';
import FormField from '../../components/shared/FormField';
import LoadingState from '../../components/ui/LoadingState';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { ArrowLeft } from 'lucide-react';

export default function EditUnitPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [buildings, setBuildings] = useState<Array<{
    id: string;
    code: string;
    name: string;
    floorsData?: Array<{
      id: string;
      number: number;
      buildingId: string;
    }>;
  }>>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_floors, setFloors] = useState<Array<{
    id: string;
    number: number;
    buildingId: string;
  }>>([]);
  const [unit, setUnit] = useState<Unit | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    unitNumber: '',
    projectId: '',
    buildingId: '',
    floorId: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    price: '',
    commissionRate: '',
    direction: '',
    status: 'AVAILABLE',
    notes: '',
  });

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

  const loadBuildings = useCallback(async (projectId: string) => {
    try {
      const project = await projectsApi.getById(projectId);
      // Project type doesn't have buildings property, need to fetch separately or cast
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setBuildings((project as any).buildings || []);
    } catch (error) {
      console.error('Failed to load buildings:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Không thể tải danh sách tòa nhà';
      toastError(errorMessage);
      setBuildings([]);
      setFloors([]);
    }
  }, [toastError]);

  const loadUnitData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await unitsApi.getById(id!);
      setUnit(data);
      
      // Populate form with unit data
      setFormData({
        code: data.code,
        unitNumber: data.unitNumber || '',
        projectId: data.projectId,
        buildingId: data.buildingId,
        floorId: data.floorId || '',
        area: data.area.toString(),
        bedrooms: (data.bedrooms ?? 0).toString(),
        bathrooms: (data.bathrooms ?? 0).toString(),
        price: data.price?.toString() || '',
        commissionRate: data.commissionRate?.toString() || '',
        direction: data.direction || '',
        status: data.status,
        notes: data.notes || '',
      });
    } catch (error) {
      console.error('Failed to load unit:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (typeof error === 'object' && error !== null && 'message' in error)
          ? String(error.message)
          : 'Không thể tải thông tin căn hộ';
      toastError(errorMessage);
      navigate('/units');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toastError]);

  useEffect(() => {
    loadProjects();
    loadUnitData();
  }, [loadProjects, loadUnitData]);

  useEffect(() => {
    if (formData.projectId) {
      loadBuildings(formData.projectId);
    }
  }, [formData.projectId, loadBuildings]);

  useEffect(() => {
    if (formData.buildingId && buildings.length > 0) {
      const selectedBuilding = buildings.find(b => b.id === formData.buildingId);
      if (selectedBuilding?.floorsData) {
        setFloors(selectedBuilding.floorsData);
      } else {
        setFloors([]);
      }
    } else {
      setFloors([]);
    }
  }, [formData.buildingId, buildings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      await unitsApi.update(id!, {
        area: parseFloat(formData.area),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        price: formData.price ? parseFloat(formData.price) : undefined,
        commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : undefined,
        direction: formData.direction || undefined,
        status: formData.status as Unit['status'],
        description: formData.notes || undefined,
      });

      toastSuccess('Cập nhật căn hộ thành công!');
      navigate(`/units/${id}`);
    } catch (error) {
      console.error('Failed to update unit:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (typeof error === 'object' && error !== null && 'message' in error)
          ? String(error.message)
          : 'Không thể cập nhật căn hộ';
      toastError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/units/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa căn hộ</h1>
          <p className="text-muted-foreground">
            {unit?.code} - {unit?.project?.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <FormSection title="Thông tin cơ bản">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Mã căn *"
              value={formData.code}
              onChange={(value) => handleChange('code', value)}
              placeholder="VD: A1-1001"
              required
            />
            <FormField
              label="Số căn hộ"
              value={formData.unitNumber}
              onChange={(value) => handleChange('unitNumber', value)}
              placeholder="VD: 1001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dự án *</label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => handleChange('projectId', value)}
                required
                disabled
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Tòa nhà *</label>
              <Select
                value={formData.buildingId}
                onValueChange={(value) => handleChange('buildingId', value)}
                required
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tòa nhà" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormSection>

        {/* Unit Details */}
        <FormSection title="Thông số căn hộ">
          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="Diện tích (m²) *"
              type="number"
              value={formData.area}
              onChange={(value) => handleChange('area', value)}
              placeholder="VD: 75"
              required
            />
            <FormField
              label="Số phòng ngủ *"
              type="number"
              value={formData.bedrooms}
              onChange={(value) => handleChange('bedrooms', value)}
              placeholder="VD: 2"
              required
            />
            <FormField
              label="Số phòng tắm *"
              type="number"
              value={formData.bathrooms}
              onChange={(value) => handleChange('bathrooms', value)}
              placeholder="VD: 2"
              required
            />
          </div>

          <FormField
            label="Hướng"
            value={formData.direction}
            onChange={(value) => handleChange('direction', value)}
            placeholder="VD: Đông Nam"
          />
        </FormSection>

        {/* Pricing */}
        <FormSection title="Thông tin giá">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Giá niêm yết (VND) *"
              type="number"
              value={formData.price}
              onChange={(value) => handleChange('price', value)}
              placeholder="VD: 2500000000"
              required
            />
            <FormField
              label="Hoa hồng (%)"
              type="number"
              value={formData.commissionRate}
              onChange={(value) => handleChange('commissionRate', value)}
              placeholder="VD: 2"
              step="0.1"
            />
          </div>
        </FormSection>

        {/* Status */}
        <FormSection title="Trạng thái">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trạng thái *</label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Còn trống</SelectItem>
                <SelectItem value="RESERVED">Đang giữ chỗ</SelectItem>
                <SelectItem value="BOOKED">Đã booking</SelectItem>
                <SelectItem value="DEPOSITED">Đã cọc</SelectItem>
                <SelectItem value="SOLD">Đã bán</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FormField
            label="Ghi chú"
            value={formData.notes}
            onChange={(value) => handleChange('notes', value)}
            placeholder="Ghi chú về căn hộ..."
            multiline
            rows={3}
          />
        </FormSection>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/units/${id}`)}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </div>
      </form>
    </div>
  );
}





