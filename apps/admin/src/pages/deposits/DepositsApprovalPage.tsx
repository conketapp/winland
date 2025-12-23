/**
 * Deposits Approval Page
 * Admin duyệt phiếu cọc - CRITICAL FEATURE
 */

import React, { useState, useEffect, useCallback } from 'react';
import { depositsApi } from '../../api/deposits.api';
import type { Deposit } from '../../types/deposit.types';
import LoadingState from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DepositDetailModal from '../../components/deposits/DepositDetailModal';
import { Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { formatCurrency, formatDate } from '../../lib/utils';
import { BUSINESS_MESSAGES } from '../../constants/businessMessages';
import StatusBadge from '../../components/shared/StatusBadge';

const DepositsApprovalPage: React.FC = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('PENDING_APPROVAL');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    depositId: string;
  }>({ open: false, depositId: '' });

  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    deposit: Deposit | null;
  }>({
    open: false,
    deposit: null,
  });

  const loadDeposits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const data = await depositsApi.getAll(params);
      // Handle paginated response
      const deposits = Array.isArray(data) ? data : (data as { items?: Deposit[] })?.items || [];
      setDeposits(deposits);
    } catch (err: unknown) {
      console.error('Error loading deposits:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách phiếu cọc';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  const handleApprove = (id: string) => {
    setConfirmDialog({ open: true, depositId: id });
  };

  const confirmApprove = async () => {
    try {
      await depositsApi.approve(confirmDialog.depositId);
      loadDeposits();
    } catch (err: unknown) {
      console.error('Error approving deposit:', err);
    }
  };

  if (isLoading && !error) {
    return <LoadingState message="Đang tải danh sách cọc..." />;
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <PageHeader
          title="Quản lý Phiếu Cọc"
          description="Duyệt và quản lý các phiếu cọc từ CTV"
        />
        <ErrorState
          title="Lỗi tải danh sách phiếu cọc"
          description={error}
          onRetry={loadDeposits}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title="Xác nhận duyệt phiếu cọc"
        description={BUSINESS_MESSAGES.DEPOSITS.APPROVE_CRITICAL}
        onConfirm={confirmApprove}
        confirmText="Duyệt"
        variant="default"
      />

      {/* Deposit Detail Modal */}
      <DepositDetailModal
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, deposit: null })}
        deposit={detailModal.deposit}
      />

      <PageHeader
        title="Quản lý Phiếu Cọc"
        description="Duyệt và quản lý các phiếu cọc từ CTV"
      />

      {/* Filters */}
      <Card className="p-3 md:p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <div className="flex-1">
            <label className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2 block">Trạng thái:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Chờ duyệt" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Chờ duyệt</SelectItem>
                <SelectItem value="CONFIRMED">Đã duyệt</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Deposits List */}
      {deposits.length === 0 ? (
        <EmptyState
          title="Không có phiếu cọc nào"
          description={statusFilter === 'PENDING_APPROVAL' ? 'Chưa có phiếu cọc chờ duyệt' : 'Không tìm thấy phiếu cọc'}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{deposit.code}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{formatDate(deposit.createdAt)}</div>
                    </div>
                    <StatusBadge status={deposit.status} />
                  </div>
                  
                  <div className="space-y-1.5 text-xs mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Căn hộ:</span>
                      <span className="font-medium text-gray-900">{deposit.unit?.code}</span>
                    </div>
                    <div className="text-xs text-gray-500">{deposit.unit?.project?.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Khách hàng:</span>
                      <span className="text-gray-900">{deposit.customerName}</span>
                    </div>
                    <div className="text-xs text-gray-500">{deposit.customerPhone}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Số tiền:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(deposit.depositAmount)}</span>
                    </div>
                    <div className="text-xs text-gray-500">{deposit.depositPercentage.toFixed(1)}%</div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">CTV:</span>
                      <span className="text-gray-900">{deposit.ctv?.fullName}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailModal({ open: true, deposit })}
                      className="flex-1 text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Xem
                    </Button>
                    {deposit.status === 'PENDING_APPROVAL' && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(deposit.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      >
                        Duyệt
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Mã cọc</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Căn hộ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Số tiền</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">CTV</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{deposit.code}</div>
                        <div className="text-xs text-gray-500">{formatDate(deposit.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{deposit.unit?.code}</div>
                        <div className="text-xs text-gray-500">{deposit.unit?.project?.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{deposit.customerName}</div>
                        <div className="text-xs text-gray-500">{deposit.customerPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(deposit.depositAmount)}
                        </div>
                        <div className="text-xs text-gray-500">{deposit.depositPercentage.toFixed(1)}%</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{deposit.ctv?.fullName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={deposit.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailModal({ open: true, deposit })}
                            className="h-8"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Xem
                          </Button>
                          {deposit.status === 'PENDING_APPROVAL' && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(deposit.id)}
                              className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Duyệt
                            </Button>
                          )}
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
};

export default DepositsApprovalPage;

