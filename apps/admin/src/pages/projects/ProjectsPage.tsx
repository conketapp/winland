/**
 * Projects Management Page
 * Clean, modular structure with CRUD operations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../../api/projects.api';
import type { Project } from '../../types/project.types';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Plus } from 'lucide-react';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    projectId: string;
    newStatus: 'UPCOMING' | 'OPEN' | 'CLOSED';
  }>({ open: false, projectId: '', newStatus: 'OPEN' });

  useEffect(() => {
    loadProjects();
  }, [statusFilter]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const data = await projectsApi.getAll(params);
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách dự án');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: 'UPCOMING' | 'OPEN' | 'CLOSED') => {
    setConfirmDialog({ open: true, projectId, newStatus });
  };

  const confirmStatusChange = async () => {
    try {
      await projectsApi.changeStatus(confirmDialog.projectId, confirmDialog.newStatus);
      await loadProjects();
      alert('Cập nhật trạng thái thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái');
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

  if (isLoading) {
    return <LoadingState message="Đang tải danh sách dự án..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
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
            ? '⚠️ CRITICAL: Hệ thống sẽ tự động xử lý queue giữ chỗ và thông báo cho CTV!'
            : 'Bạn có chắc muốn thay đổi trạng thái dự án?'
        }
        onConfirm={confirmStatusChange}
        confirmText="Xác nhận"
        variant={confirmDialog.newStatus === 'OPEN' ? 'default' : 'default'}
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
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                  {project.status}
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
                  {project.totalUnits || 0} căn
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
                  onClick={() => navigate(`/projects/${project.id}/units`)}
                >
                  Căn hộ
                </Button>
              </div>

              {/* Status Actions */}
              {project.status === 'UPCOMING' && (
                <Button
                  className="w-full mt-3"
                  onClick={() => handleStatusChange(project.id, 'OPEN')}
                >
                  🔥 Mở Bán (Trigger Queue)
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;

