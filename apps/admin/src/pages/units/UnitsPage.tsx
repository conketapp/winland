/**
 * Units Management Page
 * List, filter, and manage units with CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilterRouting } from '../../hooks/useFilterRouting';
import { unitsApi } from '../../api/units.api';
import { projectsApi } from '../../api/projects.api';
import type { Unit, PaginatedResponse } from '../../types/unit.types';
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
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import StatusBadge from '../../components/shared/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import { Plus, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { useToast } from '../../components/ui/toast';
import { formatCurrency } from '../../lib/utils';

export default function UnitsPage() {
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState({
    projectId: 'all',
    status: 'all',
    priceMin: '',
    priceMax: '',
    areaMin: '',
    areaMax: '',
    bedrooms: '',
    hasReservation: 'all' as 'all' | 'has' | 'empty',
    viewMode: 'table' as 'table' | 'grouped',
    sortBy: 'code' as string,
    sortOrder: 'asc' as 'asc' | 'desc',
  });
  const { error: toastError } = useToast();

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    unitId: '',
    unitCode: '',
  });

  // Sync filters with URL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFilterRouting(filters, setFilters as any, {
    transformToUrl: (currentFilters) => {
      const result: Record<string, string> = {};
      if (currentFilters.projectId && currentFilters.projectId !== 'all') {
        result.projectId = String(currentFilters.projectId);
      }
      if (currentFilters.status && currentFilters.status !== 'all') {
        result.status = String(currentFilters.status);
      }
      if (currentFilters.priceMin) result.priceMin = String(currentFilters.priceMin);
      if (currentFilters.priceMax) result.priceMax = String(currentFilters.priceMax);
      if (currentFilters.areaMin) result.areaMin = String(currentFilters.areaMin);
      if (currentFilters.areaMax) result.areaMax = String(currentFilters.areaMax);
      if (currentFilters.bedrooms) result.bedrooms = String(currentFilters.bedrooms);
      if (currentFilters.hasReservation && currentFilters.hasReservation !== 'all') {
        result.hasReservation = String(currentFilters.hasReservation);
      }
      if (currentFilters.viewMode && currentFilters.viewMode !== 'table') {
        result.viewMode = String(currentFilters.viewMode);
      }
      if (currentFilters.sortBy && currentFilters.sortBy !== 'code') {
        result.sortBy = String(currentFilters.sortBy);
      }
      if (currentFilters.sortOrder && currentFilters.sortOrder !== 'asc') {
        result.sortOrder = String(currentFilters.sortOrder);
      }
      // Add pagination to URL
      if (pagination.page > 1) result.page = String(pagination.page);
      if (pagination.pageSize !== 20) result.pageSize = String(pagination.pageSize);
      return result;
    },
    transformFromUrl: (params) => {
      // Initialize pagination from URL
      const page = params.get('page') ? parseInt(params.get('page')!) : 1;
      const pageSize = params.get('pageSize') ? parseInt(params.get('pageSize')!) : 20;
      
      // Update pagination state if URL has different values
      if (page !== pagination.page || pageSize !== pagination.pageSize) {
        setPagination(prev => ({
          ...prev,
          page,
          pageSize,
        }));
      }

      return {
        projectId: params.get('projectId') || 'all',
        status: params.get('status') || 'all',
        priceMin: params.get('priceMin') || '',
        priceMax: params.get('priceMax') || '',
        areaMin: params.get('areaMin') || '',
        areaMax: params.get('areaMax') || '',
        bedrooms: params.get('bedrooms') || '',
        hasReservation: params.get('hasReservation') || 'all',
        viewMode: params.get('viewMode') || 'table',
        sortBy: params.get('sortBy') || 'code',
        sortOrder: (params.get('sortOrder') as 'asc' | 'desc') || 'asc',
      };
    },
  });

  // Reset to page 1 when filters change (but not sorting)
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [filters.projectId, filters.status, filters.priceMin, filters.priceMax, filters.areaMin, filters.areaMax, filters.bedrooms, filters.hasReservation, pagination.page]);

  useEffect(() => {
    // Reload units when filters or pagination change
    loadUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, pagination.pageSize]);

  const loadProjects = useCallback(async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data.items || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Không thể tải danh sách dự án';
      console.error('Error loading projects:', errorMessage);
      setProjects([]); // Set empty array on error to prevent map error
      toastError(errorMessage);
    }
  }, [toastError]);

  useEffect(() => {
    // Dự án thay đổi không thường xuyên, chỉ tải một lần
    loadProjects();
  }, [loadProjects]);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {};
      
      if (filters.projectId !== 'all') {
        params.projectId = filters.projectId;
      }
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.priceMin) {
        params.priceMin = Number(filters.priceMin);
      }
      if (filters.priceMax) {
        params.priceMax = Number(filters.priceMax);
      }
      if (filters.areaMin) {
        params.areaMin = Number(filters.areaMin);
      }
      if (filters.areaMax) {
        params.areaMax = Number(filters.areaMax);
      }
      if (filters.bedrooms) {
        params.bedrooms = Number(filters.bedrooms);
      }
      if (filters.hasReservation !== 'all') {
        params.hasReservation = filters.hasReservation;
      }
      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
      }
      if (filters.sortOrder) {
        params.sortOrder = filters.sortOrder;
      }

      // Add pagination params
      params.page = pagination.page;
      params.pageSize = pagination.pageSize;

      const response = await unitsApi.getAll(params);
      
      // Handle both paginated response (new) and array response (old/fallback)
      let paginatedData: PaginatedResponse<Unit>;
      if (Array.isArray(response)) {
        // Backend returned array (old format or error) - convert to paginated format
        paginatedData = {
          items: response,
          total: response.length,
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalPages: Math.ceil(response.length / pagination.pageSize),
          hasNext: pagination.page < Math.ceil(response.length / pagination.pageSize),
          hasPrev: pagination.page > 1,
        };
      } else {
        // Backend returned paginated object (new format)
        paginatedData = response;
      }
      
      // Update pagination state
      setPagination({
        page: paginatedData.page,
        pageSize: paginatedData.pageSize,
        total: paginatedData.total,
        totalPages: paginatedData.totalPages,
        hasNext: paginatedData.hasNext,
        hasPrev: paginatedData.hasPrev,
      });

      // Filter now handled by backend, no need for client-side filtering
      setUnits(paginatedData.items || []);
    } catch (error) {
      console.error('Failed to load units:', error);
      setUnits([]); // Ensure units is always an array
      toastError('Không thể tải danh sách căn hộ');
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
      const errorMessage = error instanceof Error 
        ? error.message 
        : (typeof error === 'object' && error !== null && 'message' in error)
          ? String(error.message)
          : 'Lỗi xóa căn hộ!';
      toastError(errorMessage);
    }
  };

  const handleExportCSV = () => {
    if (!units || units.length === 0) {
      toastError('Không có dữ liệu để xuất');
      return;
    }

    // Prepare CSV data
    const headers = [
      'Mã căn',
      'Dự án',
      'Tòa',
      'Tầng',
      'Trạng thái',
      'Giá (VND)',
      'Diện tích (m²)',
      'Số PN',
      'Số WC',
      'Hướng',
      'Hoa hồng (%)',
    ];

    const rows = units.map(unit => [
      unit.code,
      unit.project?.name || '',
      unit.building?.code || '',
      unit.floor?.number?.toString() || '',
      unit.status,
      unit.price.toString(),
      unit.area.toString(),
      (unit.bedrooms || 0).toString(),
      (unit.bathrooms || 0).toString(),
      unit.direction || '',
      (unit.commissionRate || 0).toString(),
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `units_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && (!units || units.length === 0)) {
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
      >
        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={loading || !units || units.length === 0}
        >
          <FileText className="w-4 h-4 mr-2" />
          Xuất CSV
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
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
                <SelectItem value="AVAILABLE">Còn trống</SelectItem>
                <SelectItem value="RESERVED_BOOKING">Đang giữ chỗ/booking</SelectItem>
                <SelectItem value="DEPOSITED">Đã cọc</SelectItem>
                <SelectItem value="SOLD">Đã bán</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Price range */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Giá từ
            </label>
            <Input
              type="number"
              placeholder="Giá tối thiểu"
              value={filters.priceMin}
              onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Đến
            </label>
            <Input
              type="number"
              placeholder="Giá tối đa"
              value={filters.priceMax}
              onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
            />
          </div>
          {/* Area range */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Diện tích từ
            </label>
            <Input
              type="number"
              placeholder="m² tối thiểu"
              value={filters.areaMin}
              onChange={(e) => setFilters({ ...filters, areaMin: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Đến
            </label>
            <Input
              type="number"
              placeholder="m² tối đa"
              value={filters.areaMax}
              onChange={(e) => setFilters({ ...filters, areaMax: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {/* Bedrooms */}
          <div className="w-32">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Số PN
            </label>
            <Input
              type="number"
              placeholder="VD: 2"
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              min={0}
            />
          </div>

          {/* CTV reservation status */}
          <div className="w-56">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Trạng thái CTV giữ chỗ
            </label>
            <Select
              value={filters.hasReservation}
              onValueChange={(value) =>
                setFilters({ ...filters, hasReservation: value as 'all' | 'has' | 'empty' })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="has">Đang có CTV giữ chỗ</SelectItem>
                <SelectItem value="empty">Chưa có CTV giữ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sorting */}
          <div className="w-40">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Sắp xếp theo
            </label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="code">Mã căn</SelectItem>
                <SelectItem value="price">Giá</SelectItem>
                <SelectItem value="area">Diện tích</SelectItem>
                <SelectItem value="bedrooms">Số phòng ngủ</SelectItem>
                <SelectItem value="createdAt">Ngày tạo</SelectItem>
                <SelectItem value="updatedAt">Ngày cập nhật</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-32">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Thứ tự
            </label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => setFilters({ ...filters, sortOrder: value as 'asc' | 'desc' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Tăng dần</SelectItem>
                <SelectItem value="desc">Giảm dần</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View mode */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-600">Chế độ xem:</span>
            <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
              <button
                type="button"
                className={`px-3 py-1 text-sm ${
                  filters.viewMode === 'table'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700'
                }`}
                onClick={() => setFilters({ ...filters, viewMode: 'table' })}
              >
                Bảng
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-sm border-l border-gray-200 ${
                  filters.viewMode === 'grouped'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700'
                }`}
                onClick={() => setFilters({ ...filters, viewMode: 'grouped' })}
              >
                Tòa / tầng
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Tổng căn</div>
          <div className="text-2xl font-bold">{units?.length || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Còn trống</div>
          <div className="text-2xl font-bold text-green-600">
            {units?.filter((u) => u.status === 'AVAILABLE').length || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Đang giữ chỗ/booking</div>
          <div className="text-2xl font-bold text-yellow-600">
            {units?.filter((u) => u.status === 'RESERVED_BOOKING').length || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Đã bán</div>
          <div className="text-2xl font-bold text-blue-600">
            {units?.filter((u) => u.status === 'SOLD').length || 0}
          </div>
        </Card>
      </div>

      {/* Units View */}
      {!units || units.length === 0 ? (
        <EmptyState message="Chưa có căn hộ nào" />
      ) : filters.viewMode === 'grouped' ? (
        // Grouped view by Building -> Floor
        <div className="space-y-4">
          {Object.entries(
            units.reduce<Record<string, Record<string, Unit[]>>>((acc, unit) => {
              const buildingLabel = unit.building?.code || unit.buildingId || 'N/A';
              const floorLabel =
                typeof unit.floor?.number === 'number'
                  ? unit.floor.number.toString().padStart(2, '0')
                  : unit.floorId || 'N/A';

              if (!acc[buildingLabel]) acc[buildingLabel] = {};
              if (!acc[buildingLabel][floorLabel]) acc[buildingLabel][floorLabel] = [];
              acc[buildingLabel][floorLabel].push(unit);
              return acc;
            }, {})
          ).map(([buildingCode, floors]) => (
            <Card key={buildingCode}>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900 text-lg">
                    Tòa {buildingCode}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Object.values(floors).reduce((sum, u) => sum + u.length, 0)} căn •{' '}
                    {Object.values(floors).reduce(
                      (sum, u) => sum + u.filter((x) => (x._count?.reservations || 0) > 0).length,
                      0
                    )}{' '}
                    căn đang có CTV giữ chỗ
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(floors)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([floorLabel, floorUnits]) => (
                      <div key={floorLabel} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-700">
                            Tầng {floorLabel}
                          </div>
                          <div className="text-xs text-gray-400">
                            {floorUnits.length} căn
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {floorUnits.map((unit) => (
                            <Card key={unit.id} className="border border-gray-200">
                              <CardContent className="p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-semibold text-gray-900">
                                      {unit.code}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {unit.area} m² • {unit.bedrooms || 0}PN /{' '}
                                      {unit.bathrooms || 0}WC
                                    </div>
                                  </div>
                                  <StatusBadge status={unit.status} />
                                </div>
                                <div className="text-sm text-gray-700">
                                  Giá:{' '}
                                  <span className="font-medium">
                                    {formatCurrency(unit.price)}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center justify-between">
                                  <span>HH: {unit.commissionRate || 0}%</span>
                                  {unit._count?.reservations ? (
                                    <Badge variant="secondary">
                                      {unit._count.reservations} CTV giữ chỗ
                                    </Badge>
                                  ) : (
                                    <span className="text-gray-400">Chưa có CTV giữ</span>
                                  )}
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-1">
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
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Default table view
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
                  {(units || []).map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{unit.code}</div>
                        <div className="text-sm text-gray-500">{unit.unitNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>
                          Tòa: {unit.building?.code || unit.buildingId}
                        </div>
                        <div>
                          Tầng:{' '}
                          {typeof unit.floor?.number === 'number'
                            ? unit.floor.number
                            : unit.floorId}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {unit.area} m²
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {unit.bedrooms || 0}PN / {unit.bathrooms || 0}WC
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(unit.price)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {unit.commissionRate || 0}%
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={unit.status} />
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {(pagination.page - 1) * pagination.pageSize + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} / {pagination.total.toLocaleString('vi-VN')} căn
            {pagination.totalPages > 1 && ` - Trang ${pagination.page} / ${pagination.totalPages}`}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasPrev || loading}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Trước
            </Button>
            <span className="text-sm text-gray-600 px-2">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasNext || loading}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

