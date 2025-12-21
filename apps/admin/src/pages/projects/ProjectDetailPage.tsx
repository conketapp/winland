/**
 * Project Detail Page
 * Hiển thị thông tin chi tiết dự án + thống kê cơ bản
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import LoadingState from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import StatusBadge from '../../components/shared/StatusBadge';
import DetailRow from '../../components/shared/DetailRow';
import { projectsApi } from '../../api/projects.api';
import type { Project, ProjectStatistics } from '../../types/project.types';
import { ArrowLeft, Building2, MapPin, BarChart3, Edit } from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { BUSINESS_MESSAGES } from '../../constants/businessMessages';
import { useToast } from '../../components/ui/toast';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    newStatus: 'UPCOMING' | 'OPEN' | 'CLOSED' | null;
  }>({
    open: false,
    newStatus: null,
  });

  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const loadData = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const [p, s] = await Promise.all([
        projectsApi.getById(projectId),
        projectsApi.getStatistics(projectId),
      ]);
      setProject(p);
      setStats(s);
    } catch (err: unknown) {
      console.error('Failed to load project detail:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải thông tin dự án';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleOpenStatusDialog = (newStatus: 'UPCOMING' | 'OPEN' | 'CLOSED') => {
    setStatusDialog({ open: true, newStatus });
  };

  const handleConfirmStatusChange = async () => {
    if (!project || !statusDialog.newStatus) return;
    
    const oldStatus = project.status;
    const newStatus = statusDialog.newStatus;

    try {
      // Optimistic update - update UI immediately
      setProject((prev) => prev ? { ...prev, status: newStatus } : null);
      setStatusDialog({ open: false, newStatus: null });
      setIsChangingStatus(true);

      // Call API
      await projectsApi.changeStatus(project.id, newStatus);
      
      // Success - reload to get latest data (including queue processing status)
      await loadData();
      toastSuccess(
        newStatus === 'OPEN'
          ? 'Đã mở bán dự án và xử lý queue giữ chỗ.'
          : 'Đã cập nhật trạng thái dự án.',
      );
    } catch (err: unknown) {
      // Rollback on error
      setProject((prev) => prev ? { ...prev, status: oldStatus } : null);
      console.error('Failed to change project status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể thay đổi trạng thái dự án';
      toastError(errorMessage);
    } finally {
      setIsChangingStatus(false);
    }
  };

  if (loading && !error) {
    return <LoadingState message="Đang tải thông tin dự án..." />;
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <PageHeader
          title="Chi tiết Dự án"
          description="Xem thông tin chi tiết dự án bất động sản"
        />
        <ErrorState
          title="Lỗi tải thông tin dự án"
          description={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Confirm status change dialog */}
      <ConfirmDialog
        open={statusDialog.open}
        onOpenChange={(open) => setStatusDialog((prev) => ({ ...prev, open }))}
        title="Xác nhận thay đổi trạng thái dự án"
        description={
          statusDialog.newStatus === 'OPEN'
            ? BUSINESS_MESSAGES.PROJECTS.OPEN_CRITICAL
            : 'Bạn có chắc muốn thay đổi trạng thái dự án?'
        }
        onConfirm={handleConfirmStatusChange}
        confirmText="Xác nhận"
        variant="default"
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">
              Mã dự án: {project.code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={project.status} />
          {project.status === 'UPCOMING' && (
            <Button 
              onClick={() => handleOpenStatusDialog('OPEN')}
              disabled={isChangingStatus || loading}
            >
              {isChangingStatus ? (
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
          {project.status === 'OPEN' && (
            <Button
              variant="outline"
              onClick={() => handleOpenStatusDialog('CLOSED')}
              disabled={isChangingStatus || loading}
            >
              {isChangingStatus ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                'Đóng dự án'
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${project.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* Thông tin cơ bản */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Thông tin dự án
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Tên dự án" value={project.name} />
            <DetailRow label="Mã dự án" value={project.code} />
            <DetailRow label="Chủ đầu tư" value={project.developer || 'N/A'} />
            <DetailRow label="Khu vực" value={project.location || 'N/A'} />
          </div>
        </CardContent>
      </Card>

      {/* Vị trí */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Vị trí
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Địa chỉ" value={project.address || 'N/A'} />
            <DetailRow label="Quận/Huyện" value={project.district || 'N/A'} />
            <DetailRow label="Thành phố" value={project.city || 'N/A'} />
          </div>
        </CardContent>
      </Card>

      {/* Thống kê cơ bản */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Thống kê dự án
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 rounded-lg bg-slate-50">
                <div className="text-sm text-slate-600">Tổng căn</div>
                <div className="text-2xl font-bold">
                  {stats.units.total}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50">
                <div className="text-sm text-emerald-700">Còn trống</div>
                <div className="text-2xl font-bold text-emerald-700">
                  {stats.units.available}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-orange-50">
                <div className="text-sm text-orange-700">Đang giữ chỗ/booking</div>
                <div className="text-2xl font-bold text-orange-700">
                  {stats.units.reserved_booking}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-indigo-50">
                <div className="text-sm text-indigo-700">Đã cọc</div>
                <div className="text-2xl font-bold text-indigo-700">
                  {stats.units.deposited}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50">
                <div className="text-sm text-blue-700">Đã bán</div>
                <div className="text-2xl font-bold text-blue-700">
                  {stats.units.sold}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hành động nhanh */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(`/projects/${project.id}/units`)}
        >
          Xem danh sách căn hộ
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/projects/${project.id}/bulk-import`)}
        >
          Bulk Import căn hộ
        </Button>
      </div>
    </div>
  );
}


