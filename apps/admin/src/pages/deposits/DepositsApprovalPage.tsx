/**
 * Deposits Approval Page
 * Admin duyệt phiếu cọc - CRITICAL FEATURE
 */

import React, { useState, useEffect } from 'react';
import { depositsApi } from '../../api/deposits.api';
import type { Deposit } from '../../types/deposit.types';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DepositDetailModal from '../../components/deposits/DepositDetailModal';
import { Eye } from 'lucide-react';
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

const DepositsApprovalPage: React.FC = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    depositId: string;
  }>({ open: false, depositId: '' });

  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    deposit: any | null;
  }>({
    open: false,
    deposit: null,
  });

  useEffect(() => {
    loadDeposits();
  }, [statusFilter]);

  const loadDeposits = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const data = await depositsApi.getAll(params);
      setDeposits(data);
    } catch (err) {
      console.error('Error loading deposits:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    setConfirmDialog({ open: true, depositId: id });
  };

  const confirmApprove = async () => {
    try {
      await depositsApi.approve(confirmDialog.depositId);
      alert('✅ Duyệt phiếu cọc thành công!');
      loadDeposits();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi duyệt');
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const variants: Record<string, any> = {
      PENDING_APPROVAL: 'secondary',
      CONFIRMED: 'default',
      CANCELLED: 'destructive',
      OVERDUE: 'destructive',
      COMPLETED: 'outline',
    };
    return variants[status] || 'outline';
  };

  if (isLoading) {
    return <LoadingState message="Đang tải danh sách cọc..." />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title="Xác nhận duyệt phiếu cọc"
        description="🔥 CRITICAL: Hệ thống sẽ tự động tạo lịch thanh toán (4 đợt) và hoa hồng cho CTV!"
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
        title="Duyệt Phiếu Cọc"
        description="Xác nhận và duyệt các phiếu cọc từ CTV"
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
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
      </Card>

      {/* Deposits List */}
      {deposits.length === 0 ? (
        <EmptyState
          title="Không có phiếu cọc nào"
          description={statusFilter === 'PENDING_APPROVAL' ? 'Chưa có phiếu cọc chờ duyệt' : 'Không tìm thấy phiếu cọc'}
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Mã cọc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Căn hộ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">CTV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deposits.map((deposit) => (
                <tr key={deposit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{deposit.code}</div>
                    <div className="text-xs text-gray-500">{new Date(deposit.createdAt).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{deposit.unit?.code}</div>
                    <div className="text-xs text-gray-500">{deposit.unit?.project?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{deposit.customerName}</div>
                    <div className="text-xs text-gray-500">{deposit.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {(deposit.depositAmount / 1000000).toFixed(0)}tr
                    </div>
                    <div className="text-xs text-gray-500">{deposit.depositPercentage.toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{deposit.ctv?.fullName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(deposit.status)}>
                      {deposit.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailModal({ open: true, deposit })}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {deposit.status === 'PENDING_APPROVAL' && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(deposit.id)}
                        >
                          ✅ Duyệt
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default DepositsApprovalPage;

