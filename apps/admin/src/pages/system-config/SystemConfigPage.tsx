/**
 * System Config Management Page
 * Manage system-wide configurations
 */

import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import LoadingState from '../../components/ui/LoadingState';
import { useToast } from '../../components/ui/toast';
import { Save } from 'lucide-react';
import { systemConfigApi, type SystemConfig } from '../../api/system-config.api';

export default function SystemConfigPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedConfigs, setEditedConfigs] = useState<Record<string, string>>({});
  const { error: toastError, success: toastSuccess } = useToast();

  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await systemConfigApi.getAll();
      setConfigs(data);
    } catch (error: unknown) {
      console.error('Failed to load configs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi tải cấu hình!';
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const handleChange = (key: string, value: string) => {
    setEditedConfigs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (configId: string, key: string) => {
    try {
      setSaving(true);
      const newValue = editedConfigs[key];
      
      await systemConfigApi.update(configId, { value: newValue });
      
      // Update local state
      setConfigs((prev) =>
        prev.map((c) => (c.id === configId ? { ...c, value: newValue } : c))
      );
      
      // Clear edited state
      setEditedConfigs((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      toastSuccess('✅ Cập nhật cấu hình thành công!');
    } catch (error: unknown) {
      console.error('Failed to save config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi cập nhật cấu hình!';
      toastError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'BOOKING':
        return 'Đặt chỗ / Booking';
      case 'DEPOSIT':
        return 'Cọc / Deposit';
      case 'COMMISSION':
        return 'Hoa hồng';
      case 'GENERAL':
        return 'Chung';
      default:
        return category;
    }
  };

  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, SystemConfig[]>);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Cấu hình Hệ thống"
        description="Quản lý các thông số cấu hình toàn hệ thống"
      />

      {/* Alert */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h4 className="font-semibold text-yellow-800">Lưu ý quan trọng</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Thay đổi cấu hình hệ thống sẽ ảnh hưởng đến toàn bộ hoạt động của hệ thống.
                Vui lòng cân nhắc kỹ trước khi thay đổi!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Config Sections by Category */}
      {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{getCategoryLabel(category)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryConfigs.map((config) => {
              const currentValue =
                editedConfigs[config.key] !== undefined
                  ? editedConfigs[config.key]
                  : config.value;
              const hasChanged = editedConfigs[config.key] !== undefined;

              return (
                <div
                  key={config.id}
                  className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        {config.key}
                      </div>
                      {config.description && (
                        <div className="text-sm text-gray-600 mb-2">
                          {config.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          value={currentValue}
                          onChange={(e) => handleChange(config.key, e.target.value)}
                          className={`max-w-md ${
                            hasChanged ? 'border-orange-400' : ''
                          }`}
                        />
                        {hasChanged && (
                          <Button
                            size="sm"
                            onClick={() => handleSave(config.id, config.key)}
                            disabled={saving}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Lưu
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Metadata */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-700 mb-2">Metadata</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Tổng số cấu hình: {configs.length}</div>
            <div>
              Cập nhật gần nhất:{' '}
              {configs.length > 0
                ? new Date(configs[0].updatedAt).toLocaleString('vi-VN')
                : '-'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

