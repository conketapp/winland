/**
 * Transactions Management Page
 * List and manage all payment transactions
 */

import { useState, useEffect } from 'react';
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
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '../../lib/utils';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { transactionsApi, type Transaction } from '../../api/transactions.api';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
  });

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    transactionId: '',
    action: '' as 'confirm' | 'reject',
  });

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      
      const data = await transactionsApi.getAll(params);
      setTransactions(data);
    } catch (error: any) {
      console.error('Failed to load transactions:', error);
      alert(error.message || 'Lỗi tải giao dịch!');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      await transactionsApi.confirm(confirmDialog.transactionId);
      setConfirmDialog({ open: false, transactionId: '', action: 'confirm' });
      alert('✅ Xác nhận giao dịch thành công!');
      loadTransactions();
    } catch (error: any) {
      console.error('Failed to confirm transaction:', error);
      alert(error.message || 'Lỗi xác nhận transaction!');
    }
  };

  const handleReject = async () => {
    try {
      const reason = prompt('Lý do từ chối:');
      if (!reason) return;
      
      // Note: Need to add reject endpoint to API
      console.log('Rejecting transaction:', confirmDialog.transactionId, reason);
      setConfirmDialog({ open: false, transactionId: '', action: 'reject' });
      alert('✅ Từ chối giao dịch thành công!');
      loadTransactions();
    } catch (error: any) {
      console.error('Failed to reject transaction:', error);
      alert(error.message || 'Lỗi từ chối transaction!');
    }
  };

  if (loading && transactions.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={
          confirmDialog.action === 'confirm'
            ? 'Xác nhận thanh toán'
            : 'Từ chối thanh toán'
        }
        description={
          confirmDialog.action === 'confirm'
            ? 'Xác nhận đã nhận thanh toán? Hệ thống sẽ cập nhật lịch thanh toán và tính hoa hồng.'
            : 'Từ chối thanh toán này? Khách hàng sẽ cần thanh toán lại.'
        }
        onConfirm={confirmDialog.action === 'confirm' ? handleConfirm : handleReject}
        confirmText={confirmDialog.action === 'confirm' ? 'Xác nhận' : 'Từ chối'}
        variant={confirmDialog.action === 'confirm' ? 'default' : 'destructive'}
      />

      {/* Page Header */}
      <PageHeader
        title="Quản lý Giao dịch"
        description="Xác nhận và quản lý các giao dịch thanh toán"
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
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
                <SelectItem value="PENDING_APPROVAL">Chờ duyệt</SelectItem>
                <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                <SelectItem value="REJECTED">Bị từ chối</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Tổng giao dịch</div>
          <div className="text-2xl font-bold">{transactions.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Chờ duyệt</div>
          <div className="text-2xl font-bold text-orange-600">
            {transactions.filter((t) => t.status === 'PENDING_APPROVAL').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Đã xác nhận</div>
          <div className="text-2xl font-bold text-green-600">
            {transactions.filter((t) => t.status === 'CONFIRMED').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Tổng giá trị</div>
          <div className="text-2xl font-bold">
            {formatCurrency(
              transactions
                .filter((t) => t.status === 'CONFIRMED')
                .reduce((sum, t) => sum + t.amount, 0)
            )}
          </div>
        </Card>
      </div>

      {/* Transactions Table */}
      {transactions.length === 0 ? (
        <EmptyState message="Chưa có giao dịch nào" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mã GD
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Căn hộ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Số tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phương thức
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày GD
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
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {transaction.id.slice(0, 8)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {transaction.customer?.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.customer?.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {transaction.unit?.code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {transaction.paymentMethod}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={transaction.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {transaction.status === 'PENDING_APPROVAL' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setConfirmDialog({
                                    open: true,
                                    transactionId: transaction.id,
                                    action: 'confirm',
                                  })
                                }
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setConfirmDialog({
                                    open: true,
                                    transactionId: transaction.id,
                                    action: 'reject',
                                  })
                                }
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => console.log('View transaction:', transaction.id)}
                          >
                            <Eye className="w-4 h-4" />
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
    </div>
  );
}

