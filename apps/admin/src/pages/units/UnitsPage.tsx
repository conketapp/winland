/**
 * Units Management Page
 * List, filter, and manage units with CRUD operations
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { unitsApi } from '../../api/units.api';
import { projectsApi } from '../../api/projects.api';
import type { Unit } from '../../types/unit.types';
import type { Project } from '../../types/project.types';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import StatusBadge from '../../components/shared/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

export default function UnitsPage() {
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    projectId: 'all',
    status: 'all',
  });

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    unitId: '',
    unitCode: '',
  });

  useEffect(() => {
    loadProjects();
    loadUnits();
  }, [filters]);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadUnits = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filters.projectId !== 'all') {
        params.projectId = filters.projectId;
      }
      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      const data = await unitsApi.getAll(params);
      setUnits(data);
    } catch (error) {
      console.error('Failed to load units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await unitsApi.delete(deleteDialog.unitId);
      setDeleteDialog({ open: false, unitId: '', unitCode: '' });
      loadUnits();
    } catch (error) {
      console.error('Failed to delete unit:', error);
      alert('Lỗi xóa căn hộ!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading && units.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Xác nhận xóa căn hộ"
        description={`Bạn có chắc muốn xóa căn hộ ${deleteDialog.unitCode}? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        confirmText="Xóa"
        variant="destructive"
      />

      {/* Page Header */}
      <PageHeader
        title="Quản lý Căn hộ"
        description="Quản lý tất cả căn hộ trong các dự án"
        action={{
          label: 'Tạo Căn Hộ',
          onClick: () => navigate('/units/create'),
          icon: <Plus className="w-5 h-5" />
        }}
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* Project Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Dự án:
            </label>
            <Select
              value={filters.projectId}
              onValueChange={(value) => setFilters({ ...filters, projectId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn dự án" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả dự án</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Trạng thái:
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="RESERVED_BOOKING">Reserved/Booking</SelectItem>
                <SelectItem value="DEPOSITED">Deposited</SelectItem>
                <SelectItem value="SOLD">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Tổng căn</div>
          <div className="text-2xl font-bold">{units.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Còn trống</div>
          <div className="text-2xl font-bold text-green-600">
            {units.filter((u) => u.status === 'AVAILABLE').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Đang booking</div>
          <div className="text-2xl font-bold text-yellow-600">
            {units.filter((u) => u.status === 'RESERVED_BOOKING').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Đã bán</div>
          <div className="text-2xl font-bold text-blue-600">
            {units.filter((u) => u.status === 'SOLD').length}
          </div>
        </Card>
      </div>

      {/* Units Table */}
      {units.length === 0 ? (
        <EmptyState message="Chưa có căn hộ nào" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mã căn
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tòa/Tầng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Diện tích
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phòng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Giá
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hoa hồng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{unit.code}</div>
                        <div className="text-sm text-gray-500">{unit.unitNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>Building: {unit.buildingId}</div>
                        <div>Floor: {unit.floorId}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {unit.area} m²
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {unit.bedrooms || 0}PN / {unit.bathrooms || 0}WC
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {formatPrice(unit.price)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {unit.commissionRate || 0}%
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={unit.status} type="unit" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/units/${unit.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/units/${unit.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                unitId: unit.id,
                                unitCode: unit.code,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

