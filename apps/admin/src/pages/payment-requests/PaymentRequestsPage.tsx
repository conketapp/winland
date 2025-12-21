/**
 * Payment Requests Management Page
 * Admin approves CTV commission withdrawal requests
 */

import { useState, useEffect, useCallback } from 'react';
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
import { ErrorState } from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '../../lib/utils';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { paymentRequestsApi, type PaymentRequest } from '../../api/payment-requests.api';
import { ReasonDialog } from '../../components/ui/ReasonDialog';
import { useToast } from '../../components/ui/toast';

export default function PaymentRequestsPage() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
  });

  // Action dialog
  const [actionDialog, setActionDialog] = useState({
    open: false,
    requestId: '',
    action: '' as 'approve' | 'reject' | 'markPaid',
  });
  const [rejectDialog, setRejectDialog] = useState({
    open: false,
    requestId: '',
    reason: '',
  });
  const { success: toastSuccess, error: toastError } = useToast();

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      
      const data = await paymentRequestsApi.getAll(params);
      setRequests(data);
    } catch (error: unknown) {
      console.error('Failed to load payment requests:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách yêu cầu rút hoa hồng';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAction = async () => {
    try {
      switch (actionDialog.action) {
        case 'approve':
          await paymentRequestsApi.approve(actionDialog.requestId);
          break;
        case 'reject':
          if (!rejectDialog.reason.trim()) {
            toastError('Vui lòng nhập lý do từ chối');
            return;
          }
          await paymentRequestsApi.reject(rejectDialog.requestId, rejectDialog.reason.trim());
          break;
        case 'markPaid':
          await paymentRequestsApi.markAsPaid(actionDialog.requestId);
          break;
      }
      setActionDialog({ open: false, requestId: '', action: 'approve' });
      setRejectDialog({ open: false, requestId: '', reason: '' });
      toastSuccess('Xử lý yêu cầu thành công');
      loadRequests();
    } catch (error: unknown) {
      console.error('Failed to process payment request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi xử lý yêu cầu!';
      setError(errorMessage);
    }
  };

  if (loading && !error && requests.length === 0) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <PageHeader
          title="Yêu cầu Rút hoa hồng"
          description="Duyệt và xử lý yêu cầu rút tiền của CTV"
        />
        <ErrorState
          title="Lỗi tải danh sách yêu cầu"
          description={error}
          onRetry={loadRequests}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ReasonDialog
        open={rejectDialog.open}
        title="Từ chối yêu cầu rút tiền"
        description="Nhập lý do từ chối yêu cầu rút hoa hồng của CTV. Lý do này sẽ được lưu lại để đối soát sau."
        reason={rejectDialog.reason}
        onReasonChange={(value) =>
          setRejectDialog((prev) => ({ ...prev, reason: value }))
        }
        onConfirm={handleAction}
        onCancel={() => setRejectDialog({ open: false, requestId: '', reason: '' })}
        confirmText="Từ chối"
      />
      {/* Action Dialog */}
      <ConfirmDialog
        open={actionDialog.open && actionDialog.action !== 'reject'}
        onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
        title={
          actionDialog.action === 'approve'
            ? 'Duyệt yêu cầu rút tiền'
            : 'Xác nhận đã thanh toán'
        }
        description={
          actionDialog.action === 'approve'
            ? 'Xác nhận duyệt yêu cầu rút hoa hồng của CTV?'
            : 'Xác nhận đã chuyển tiền cho CTV? Hệ thống sẽ cập nhật trạng thái hoa hồng.'
        }
        onConfirm={handleAction}
        confirmText={
          actionDialog.action === 'approve'
            ? 'Duyệt'
            : 'Đã thanh toán'
        }
        variant="default"
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
                                  setRejectDialog({
                                    open: true,
                                    requestId: request.id,
                                    reason: '',
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
                            // TODO: Implement request detail drawer/modal
                            onClick={() => {
                              if (process.env.NODE_ENV !== 'production') {
                                console.log('View request (stub):', request.id);
                              }
                            }}
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

