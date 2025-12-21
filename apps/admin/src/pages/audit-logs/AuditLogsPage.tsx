import React, { useEffect, useState } from 'react';
import { auditLogApi, AuditLogItem } from '../../api/audit-log.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../../components/ui/select';
import LoadingState from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';

function renderBookingChange(oldValue?: string | null, newValue?: string | null) {
  try {
    const oldObj = oldValue ? JSON.parse(oldValue) : {};
    const newObj = newValue ? JSON.parse(newValue) : {};

    const statusFrom = oldObj.status;
    const statusTo = newObj.status;
    const approvedBy = newObj.approvedBy || newObj.approverId;
    const cancelledReason = newObj.cancelledReason || newObj.reason;
    const refundAmount = newObj.refundAmount;
    const paymentProofChange =
      oldObj.paymentProof !== undefined || newObj.paymentProof !== undefined;

    const rows: string[] = [];

    if (statusFrom || statusTo) {
      rows.push(`Trạng thái: ${statusFrom || '—'} → ${statusTo || '—'}`);
    }
    if (approvedBy) {
      rows.push(`Người duyệt: ${approvedBy}`);
    }
    if (cancelledReason) {
      rows.push(`Lý do hủy: ${cancelledReason}`);
    }
    if (typeof refundAmount === 'number') {
      rows.push(`Hoàn tiền: ${refundAmount.toLocaleString('vi-VN')}₫`);
    }
    if (paymentProofChange) {
      rows.push('Chứng từ thanh toán: cập nhật');
    }

    if (rows.length === 0) {
      return null;
    }

    return (
      <ul className="text-[11px] text-gray-700 list-disc pl-4 space-y-0.5">
        {rows.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    );
  } catch {
    return null;
  }
}

interface Filters {
  search: string;
  action: string;
  entityType: string;
  fromDate: string;
  toDate: string;
  page: number;
  pageSize: number;
}

const defaultFilters: Filters = {
  search: '',
  action: '',
  entityType: '',
  fromDate: '',
  toDate: '',
  page: 1,
  pageSize: 20,
};

const AuditLogsPage: React.FC = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actions, setActions] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiltersData = async () => {
    try {
      const [actionsRes, entityTypesRes] = await Promise.all([
        auditLogApi.getActions(),
        auditLogApi.getEntityTypes(),
      ]);
      setActions(actionsRes);
      setEntityTypes(entityTypesRes);
    } catch (err: unknown) {
      console.error('Error loading audit log filter data', err);
    }
  };

  const loadData = async (override?: Partial<Filters>) => {
    try {
      setLoading(true);
      setError(null);
      const current = { ...filters, ...override };
      const res = await auditLogApi.getAll({
        page: current.page,
        pageSize: current.pageSize,
        action: current.action || undefined,
        entityType: current.entityType || undefined,
        search: current.search || undefined,
        fromDate: current.fromDate || undefined,
        toDate: current.toDate || undefined,
        sortDirection: 'desc',
      });

      setLogs(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setFilters(current);
    } catch (err: unknown) {
      console.error('Error loading audit logs', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải nhật ký hệ thống';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiltersData();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (name: keyof Filters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: name === 'page' ? value as number : 1,
    }));
  };

  const handleApplyFilters = () => {
    loadData({ page: 1 });
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    loadData({ ...defaultFilters });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    loadData({ page });
  };

  if (loading && logs.length === 0 && !error) {
    return <LoadingState message="Đang tải nhật ký hệ thống..." />;
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <PageHeader
          title="Nhật ký hệ thống"
          description="Theo dõi các thao tác quan trọng trong hệ thống"
        />
        <ErrorState
          title="Lỗi tải nhật ký"
          description={error}
          onRetry={() => loadData()}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Nhật ký hệ thống"
        description="Xem và lọc các hoạt động trong hệ thống (AuditLog)"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Tìm kiếm</label>
              <Input
                placeholder="Từ khóa trong action, entity, dữ liệu..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Action</label>
              <Select
                value={filters.action || undefined}
                onValueChange={(value) => handleFilterChange('action', value || '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Entity Type</label>
              <Select
                value={filters.entityType || undefined}
                onValueChange={(value) => handleFilterChange('entityType', value || '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  {entityTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Từ ngày</label>
              <Input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Đến ngày</label>
              <Input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={handleApplyFilters}>
                Áp dụng
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Xóa lọc
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Tổng: {total.toLocaleString('vi-VN')} bản ghi</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhật ký</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && logs.length > 0 && (
            <p className="text-xs text-gray-500 mb-2">Đang tải...</p>
          )}
          {logs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Không có bản ghi nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Thời gian</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">User</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Action</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Entity</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Thay đổi</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">IP / Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 align-top">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {log.user?.fullName || 'Hệ thống'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {log.user?.email || log.user?.phone || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800">
                            {log.entityType}
                          </span>
                          <span className="text-xs text-gray-500 break-all">
                            {log.entityId}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        {log.entityType === 'BOOKING' ? (
                          renderBookingChange(log.oldValue, log.newValue) || (
                            <span className="text-[10px] text-gray-500">Không có thay đổi đáng chú ý</span>
                          )
                        ) : (
                          <div className="grid grid-cols-2 gap-2 max-w-xl">
                            <div className="border rounded p-1 bg-red-50">
                              <div className="text-[10px] font-semibold text-red-700 mb-1">
                                Old
                              </div>
                              <pre className="text-[10px] whitespace-pre-wrap break-all text-gray-700 max-h-32 overflow-auto">
                                {log.oldValue || '—'}
                              </pre>
                            </div>
                            <div className="border rounded p-1 bg-emerald-50">
                              <div className="text-[10px] font-semibold text-emerald-700 mb-1">
                                New
                              </div>
                              <pre className="text-[10px] whitespace-pre-wrap break-all text-gray-700 max-h-32 overflow-auto">
                                {log.newValue || '—'}
                              </pre>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-col text-xs text-gray-600">
                          <span>{log.ipAddress || '—'}</span>
                          <span className="text-[10px] text-gray-400 max-w-xs break-all">
                            {log.userAgent || '—'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-gray-600">
                Trang {filters.page} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={filters.page <= 1}
                  onClick={() => handlePageChange(filters.page - 1)}
                >
                  Trước
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={filters.page >= totalPages}
                  onClick={() => handlePageChange(filters.page + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;


