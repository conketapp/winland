/**
 * Bookings Approval Page
 * Admin duyệt phiếu booking (10tr)
 */

import React, { useState, useEffect } from 'react';
import { bookingsApi } from '../../api/bookings.api';
import type { Booking } from '../../types/booking.types';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import BookingDetailModal from '../../components/bookings/BookingDetailModal';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const BookingsApprovalPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject';
    bookingId: string;
  }>({ open: false, type: 'approve', bookingId: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    booking: any | null;
  }>({ open: false, booking: null });

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const data = await bookingsApi.getAll(params);
      setBookings(data);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    setConfirmDialog({ open: true, type: 'approve', bookingId: id });
  };

  const handleReject = (id: string) => {
    setConfirmDialog({ open: true, type: 'reject', bookingId: id });
  };

  const confirmAction = async () => {
    try {
      if (confirmDialog.type === 'approve') {
        await bookingsApi.approve(confirmDialog.bookingId);
        alert('✅ Duyệt booking thành công!');
      } else {
        if (!rejectReason) {
          alert('Vui lòng nhập lý do từ chối');
          return;
        }
        await bookingsApi.reject(confirmDialog.bookingId, rejectReason);
        alert('Từ chối booking thành công');
        setRejectReason('');
      }
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xử lý');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING_PAYMENT: 'bg-orange-100 text-orange-800',
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return <LoadingState message="Đang tải danh sách booking..." />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.type === 'approve' ? 'Xác nhận duyệt booking' : 'Từ chối booking'}
        description={
          confirmDialog.type === 'approve'
            ? 'Bạn có chắc muốn duyệt booking này?'
            : 'Bạn có chắc muốn từ chối booking này?'
        }
        onConfirm={confirmAction}
        confirmText={confirmDialog.type === 'approve' ? 'Duyệt' : 'Từ chối'}
        variant={confirmDialog.type === 'approve' ? 'default' : 'destructive'}
      />

      {/* Booking Detail Modal */}
      <BookingDetailModal
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, booking: null })}
        booking={detailModal.booking}
      />

      <PageHeader
        title="Duyệt Phiếu Booking"
        description="Xác nhận booking 10 triệu từ CTV"
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

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <EmptyState
          title="Không có booking nào"
          description={statusFilter === 'PENDING_APPROVAL' ? 'Chưa có booking chờ duyệt' : 'Không tìm thấy booking'}
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Mã booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Căn hộ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">CTV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hạn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{booking.code}</div>
                    <div className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{booking.unit?.code}</div>
                    <div className="text-xs text-gray-500">{booking.unit?.project?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{booking.customerName}</div>
                    <div className="text-xs text-gray-500">{booking.customerPhone}</div>
                    <div className="text-xs text-gray-500">CMND: {booking.customerIdCard}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {(booking.bookingAmount / 1000000).toFixed(0)}tr
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{booking.ctv?.fullName}</div>
                    <div className="text-xs text-gray-500">{booking.ctv?.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-600">
                      {new Date(booking.expiresAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      booking.status === 'PENDING_APPROVAL' ? 'secondary' :
                      booking.status === 'CONFIRMED' ? 'default' :
                      booking.status === 'CANCELLED' ? 'destructive' :
                      'outline'
                    }>
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailModal({ open: true, booking })}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {booking.status === 'PENDING_APPROVAL' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(booking.id)}
                          >
                            ✅ Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(booking.id)}
                          >
                            ❌ Từ chối
                          </Button>
                        </>
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

export default BookingsApprovalPage;

