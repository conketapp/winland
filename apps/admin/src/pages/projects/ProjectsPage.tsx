/**
 * Projects Management Page
 * Clean, modular structure with CRUD operations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilterRouting } from '../../hooks/useFilterRouting';
import { projectsApi } from '../../api/projects.api';
import type { Project } from '../../types/project.types';
import LoadingState from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '../../components/ui/toast';
import { BUSINESS_MESSAGES } from '../../constants/businessMessages';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });
  const statusFilter = filters.status;
  const search = filters.search;
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Confirm Dialog - change status
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    projectId: string;
    newStatus: 'UPCOMING' | 'OPEN' | 'CLOSED';
  }>({ open: false, projectId: '', newStatus: 'OPEN' });

  // Confirm Dialog - delete project
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    projectId: string;
    projectName: string;
  }>({ open: false, projectId: '', projectName: '' });

  // Loading states for individual actions
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  // Sync filters with URL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFilterRouting(filters, setFilters as any, {
    transformToUrl: (currentFilters) => {
      const result: Record<string, string> = {};
      if (currentFilters.status && currentFilters.status !== 'all') {
        result.status = String(currentFilters.status);
      }
      if (currentFilters.search && currentFilters.search.trim()) {
        result.search = String(currentFilters.search);
      }
      return result;
    },
    transformFromUrl: (params) => {
      return {
        status: params.get('status') || 'all',
        search: params.get('search') || '',
      };
    },
  });

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search, page]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: Record<string, string | number> = {
        page,
        pageSize,
      };
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (filters.search && filters.search.trim().length > 0) {
        params.search = filters.search.trim();
      }
      const response = await projectsApi.getAll(params);
      setProjects(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách dự án';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleStatusChange = async (projectId: string, newStatus: 'UPCOMING' | 'OPEN' | 'CLOSED') => {
    setConfirmDialog({ open: true, projectId, newStatus });
  };

  const confirmStatusChange = async () => {
    const { projectId, newStatus } = confirmDialog;
    const actionKey = `status-${projectId}`;
    
    // Find project to save old state for rollback
    const project = projects.find((p) => p.id === projectId);
    const oldStatus = project?.status;

    if (!project) {
      toastError('Không tìm thấy dự án');
      return;
    }

    try {
      // Optimistic update - update UI immediately
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, status: newStatus } : p
        )
      );
      setConfirmDialog({ open: false, projectId: '', newStatus: 'OPEN' });
      setLoadingActions((prev) => ({ ...prev, [actionKey]: true }));

      // Call API
      await projectsApi.changeStatus(projectId, newStatus);
      
      // Success - reload to get latest data (including queue processing status)
      await loadProjects();
      success('Cập nhật trạng thái dự án thành công!');
    } catch (err: unknown) {
      // Rollback on error
      if (oldStatus) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, status: oldStatus } : p
          )
        );
      }
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái';
      toastError(errorMessage);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleDeleteClick = (project: Project) => {
    setDeleteDialog({
      open: true,
      projectId: project.id,
      projectName: project.name,
    });
  };

  const confirmDelete = async () => {
    const { projectId } = deleteDialog;
    const actionKey = `delete-${projectId}`;
    
    // Find project to save for rollback
    const project = projects.find((p) => p.id === projectId);

    try {
      // Optimistic update - remove from UI immediately
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setDeleteDialog((prev) => ({ ...prev, open: false }));
      setLoadingActions((prev) => ({ ...prev, [actionKey]: true }));

      // Call API
      await projectsApi.delete(projectId);
      
      // Success - reload to sync with server
      await loadProjects();
      success('Xóa dự án thành công!');
    } catch (err: unknown) {
      // Rollback on error - restore project
      if (project) {
        setProjects((prev) => [...prev, project].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
      // Backend trả message business (vd: còn căn đang giữ/cọc/bán), hiển thị lại cho admin
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa dự án';
      toastError(errorMessage);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const variants = {
      UPCOMING: 'secondary' as const,
      OPEN: 'default' as const,
      CLOSED: 'outline' as const,
    };
    return variants[status as keyof typeof variants] || 'outline' as const;
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'UPCOMING':
        return 'Sắp mở bán';
      case 'OPEN':
        return 'Đang mở bán';
      case 'CLOSED':
        return 'Đã đóng';
      default:
        return status;
    }
  };

  const getTotalUnitsDisplay = (project: Project & { _count?: { units?: number } }): number => {
    // Ưu tiên _count.units (Prisma include) rồi tới totalUnits field, cuối cùng fallback 0
    if (project._count?.units != null) {
      return project._count.units;
    }
    if (project.totalUnits != null) {
      return project.totalUnits;
    }
    return 0;
  };

  if (isLoading && !error) {
    return <LoadingState message="Đang tải danh sách dự án..." />;
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <PageHeader
          title="Quản lý Dự án"
          description="Quản lý các dự án bất động sản"
          action={{
            label: 'Tạo Dự Án',
            onClick: () => navigate('/projects/create'),
            icon: <Plus className="w-5 h-5" />
          }}
        />
        <ErrorState
          title="Lỗi tải danh sách dự án"
          description={error}
          onRetry={loadProjects}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title="Xác nhận thay đổi trạng thái"
        description={
          confirmDialog.newStatus === 'OPEN'
            ? BUSINESS_MESSAGES.PROJECTS.OPEN_CRITICAL
            : 'Bạn có chắc muốn thay đổi trạng thái dự án?'
        }
        onConfirm={confirmStatusChange}
        confirmText="Xác nhận"
        variant={confirmDialog.newStatus === 'OPEN' ? 'default' : 'default'}
      />

      {/* Delete Project Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        title="Xóa dự án"
        description={
          deleteDialog.projectName
            ? `Bạn có chắc muốn xóa dự án "${deleteDialog.projectName}"? 

Lưu ý: Chỉ có thể xóa dự án khi tất cả căn thuộc dự án đang ở trạng thái Còn trống.`
            : 'Bạn có chắc muốn xóa dự án này?'
        }
        onConfirm={confirmDelete}
        confirmText="Xóa dự án"
        variant="destructive"
      />

      <PageHeader
        title="Quản lý Dự án"
        description="Quản lý các dự án bất động sản"
        action={{
          label: 'Tạo Dự Án',
          onClick: () => navigate('/projects/create'),
          icon: <Plus className="w-5 h-5" />
        }}
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="UPCOMING">Sắp mở bán</SelectItem>
                <SelectItem value="OPEN">Đang mở bán</SelectItem>
                <SelectItem value="CLOSED">Đã đóng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Tìm theo tên hoặc mã dự án..."
              value={search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1); // Reset to first page when searching
                  loadProjects();
                }
              }}
            />
          </div>
        </div>
      </Card>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState
          title="Chưa có dự án nào"
          description="Tạo dự án mới để bắt đầu"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="p-6 hover:shadow-lg transition">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.code}</p>
                </div>
                <Badge variant={getStatusVariant(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center text-gray-700">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {project.city}
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {getTotalUnitsDisplay(project)} căn
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {project.commissionRate}% HH
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  size="sm"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  Chi tiết
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  size="sm"
                  onClick={() => navigate(`/units?projectId=${project.id}`)}
                >
                  Căn hộ
                </Button>
                {project.status !== 'OPEN' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleDeleteClick(project)}
                    disabled={loadingActions[`delete-${project.id}`] || isLoading}
                  >
                    {loadingActions[`delete-${project.id}`] ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Xóa'
                    )}
                  </Button>
                )}
              </div>

              {/* Status Actions */}
              {project.status === 'UPCOMING' && (
                <Button
                  className="w-full mt-3"
                  onClick={() => handleStatusChange(project.id, 'OPEN')}
                  disabled={loadingActions[`status-${project.id}`] || isLoading}
                >
                  {loadingActions[`status-${project.id}`] ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    '🔥 Mở bán & kích hoạt lượt giữ chỗ'
                  )}
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {projects.length} / {total.toLocaleString('vi-VN')} dự án
            {totalPages > 1 && ` - Trang ${page} / ${totalPages}`}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || isLoading}
              onClick={() => handlePageChange(page - 1)}
            >
              Trước
            </Button>
            <span className="text-sm text-gray-600 px-2">
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || isLoading}
              onClick={() => handlePageChange(page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;

