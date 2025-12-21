/**
 * Edit Project Page
 * Using React Hook Form for better form state management
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormProvider } from 'react-hook-form';
import PageHeader from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/button';
import LoadingState from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { projectsApi } from '../../api/projects.api';
import type { Project } from '../../types/project.types';
import { useToast } from '../../components/ui/toast';
import { useProjectForm } from '../../hooks/useProjectForm';
import ProjectFormFields from '../../components/projects/ProjectFormFields';
import type { ProjectFormData } from '../../schemas/project.schema';

export default function EditProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useProjectForm();

  const loadProject = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const project: Project = await projectsApi.getById(projectId);
      
      // Parse images from JSON string if exists
      let images: string[] = [];
      if (project.images) {
        try {
          if (typeof project.images === 'string') {
            // Try parsing as JSON array first
            const parsed = JSON.parse(project.images);
            images = Array.isArray(parsed) ? parsed : [];
          } else if (Array.isArray(project.images)) {
            images = project.images;
          }
        } catch {
          // If parsing fails, treat as comma-separated string
          images = project.images.split(',').filter(Boolean);
        }
      }

      // Reset form with project data
      form.reset({
        name: project.name,
        code: project.code,
        developer: project.developer || '',
        location: project.location || '',
        address: project.address || '',
        district: project.district || '',
        city: project.city || '',
        totalBuildings: project.totalBuildings || undefined,
        totalUnits: project.totalUnits || undefined,
        priceFrom: project.priceFrom || undefined,
        priceTo: project.priceTo || undefined,
        commissionRate: project.commissionRate || undefined,
        description: project.description || '',
        images: images,
      });
    } catch (err: unknown) {
      console.error('Failed to load project:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải thông tin dự án';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleSubmit = async (data: ProjectFormData) => {
    if (!projectId) return;

    try {
      setSaving(true);
      const payload = form.preparePayload(data);
      await projectsApi.update(projectId, payload);
      toastSuccess('Cập nhật dự án thành công!');
      navigate(`/projects/${projectId}`);
    } catch (err: unknown) {
      console.error('Failed to update project:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật dự án';
      toastError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !error) {
    return (
      <div className="p-6">
        <LoadingState message="Đang tải thông tin dự án..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <PageHeader
          title="Chỉnh sửa Dự án"
          description="Cập nhật thông tin dự án bất động sản"
        />
        <ErrorState
          title="Lỗi tải thông tin dự án"
          description={error}
          onRetry={loadProject}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Chỉnh sửa Dự án"
          description="Cập nhật thông tin dự án bất động sản"
        />
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <ProjectFormFields />

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
      </FormProvider>
    </div>
  );
}


