/**
 * Payment Requests Management Page
 * Admin approves CTV commission withdrawal requests
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
import { paymentRequestsApi, type PaymentRequest } from '../../api/payment-requests.api';

export default function PaymentRequestsPage() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
  });

  // Action dialog
  const [actionDialog, setActionDialog] = useState({
    open: false,
    requestId: '',
    action: '' as 'approve' | 'reject' | 'markPaid',
  });

  useEffect(() => {
    loadRequests();
  }, [filters]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      
      const data = await paymentRequestsApi.getAll(params);
      setRequests(data);
    } catch (error: any) {
      console.error('Failed to load payment requests:', error);
      alert(error.message || 'Lỗi tải yêu cầu!');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    try {
      switch (actionDialog.action) {
        case 'approve':
          await paymentRequestsApi.approve(actionDialog.requestId);
          alert('✅ Duyệt yêu cầu thành công!');
          break;
        case 'reject':
          const reason = prompt('Lý do từ chối:');
          if (!reason) return;
          await paymentRequestsApi.reject(actionDialog.requestId, reason);
          alert('✅ Từ chối yêu cầu thành công!');
          break;
        case 'markPaid':
          await paymentRequestsApi.markAsPaid(actionDialog.requestId);
          alert('✅ Đánh dấu đã thanh toán thành công!');
          break;
      }
      setActionDialog({ open: false, requestId: '', action: 'approve' });
      loadRequests();
    } catch (error: any) {
      console.error('Failed to process payment request:', error);
      alert(error.message || 'Lỗi xử lý yêu cầu!');
    }
  };

  if (loading && requests.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Action Dialog */}
      <ConfirmDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
        title={
          actionDialog.action === 'approve'
            ? 'Duyệt yêu cầu rút tiền'
            : actionDialog.action === 'reject'
            ? 'Từ chối yêu cầu'
            : 'Xác nhận đã thanh toán'
        }
        description={
          actionDialog.action === 'approve'
            ? 'Xác nhận duyệt yêu cầu rút hoa hồng của CTV?'
            : actionDialog.action === 'reject'
            ? 'Từ chối yêu cầu này? CTV sẽ cần tạo yêu cầu mới.'
            : 'Xác nhận đã chuyển tiền cho CTV? Hệ thống sẽ cập nhật trạng thái hoa hồng.'
        }
        onConfirm={handleAction}
        confirmText={
          actionDialog.action === 'approve'
            ? 'Duyệt'
            : actionDialog.action === 'reject'
            ? 'Từ chối'
            : 'Đã thanh toán'
        }
        variant={actionDialog.action === 'reject' ? 'destructive' : 'default'}
      />

      {/* Page Header */}
      <PageHeader
        title="Yêu cầu Rút hoa hồng"
        description="Duyệt và xử lý yêu cầu rút tiền của CTV"
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
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED">Bị từ chối</SelectItem>
                <SelectItem value="PAID">Đã thanh toán</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Tổng yêu cầu</div>
          <div className="text-2xl font-bold">{requests.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Chờ duyệt</div>
          <div className="text-2xl font-bold text-orange-600">
            {requests.filter((r) => r.status === 'PENDING').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Đã duyệt</div>
          <div className="text-2xl font-bold text-blue-600">
            {requests.filter((r) => r.status === 'APPROVED').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Tổng giá trị</div>
          <div className="text-2xl font-bold">
            {formatCurrency(
              requests
                .filter((r) => r.status === 'PAID')
                .reduce((sum, r) => sum + r.amount, 0)
            )}
          </div>
        </Card>
      </div>

      {/* Requests Table */}
      {requests.length === 0 ? (
        <EmptyState message="Chưa có yêu cầu rút tiền nào" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mã YC
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      CTV
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Số tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngân hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      STK
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày tạo
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
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {request.id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {request.ctv?.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.ctv?.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(request.amount)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{request.bankName}</div>
                        <div className="text-xs text-gray-500">
                          {request.bankAccountName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {request.bankAccountNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {request.status === 'PENDING' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setActionDialog({
                                    open: true,
                                    requestId: request.id,
                                    action: 'approve',
                                  })
                                }
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setActionDialog({
                                    open: true,
                                    requestId: request.id,
                                    action: 'reject',
                                  })
                                }
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {request.status === 'APPROVED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setActionDialog({
                                  open: true,
                                  requestId: request.id,
                                  action: 'markPaid',
                                })
                              }
                            >
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                              <span className="ml-1 text-xs">Đã chuyển</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => console.log('View request:', request.id)}
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

