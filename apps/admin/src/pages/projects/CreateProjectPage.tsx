/**
 * Create Project Page
 * Using React Hook Form for better form state management
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
import { Button } from '../../components/ui/button';
import PageHeader from '../../components/ui/PageHeader';
import { projectsApi } from '../../api/projects.api';
import { useToast } from '../../components/ui/toast';
import { useProjectForm } from '../../hooks/useProjectForm';
import ProjectFormFields from '../../components/projects/ProjectFormFields';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useProjectForm();

  const handleSubmit = async (data: Parameters<Parameters<typeof form.handleSubmit>[0]>[0]) => {
    setLoading(true);

    try {
      const payload = form.preparePayload(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await projectsApi.create(payload as any);
      toastSuccess('Tạo dự án thành công!');
      navigate('/projects');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo dự án';
      toastError('Lỗi: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Tạo Dự Án Mới"
        description="Nhập thông tin dự án bất động sản"
      />

      {/* Form */}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <ProjectFormFields />

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
      </FormProvider>
    </div>
  );
}

