/**
 * Booking Detail Modal
 * Shows full booking information with payment proof
 */

import React from 'react';
import DetailModal from '../shared/DetailModal';
import DetailRow from '../shared/DetailRow';
import StatusBadge from '../shared/StatusBadge';
import { Button } from '../ui/button';
import type { Booking } from '../../types/booking.types';

interface BookingDetailModalProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onApprove?: (booking: Booking) => void;
  onReject?: (booking: Booking) => void;
}

export default function BookingDetailModal({
  open,
  onClose,
  booking,
  onApprove,
  onReject,
}: BookingDetailModalProps) {
  if (!booking) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  return (
    <DetailModal
      open={open}
      onClose={onClose}
      title={`Chi tiết Booking - ${booking.code}`}
      description="Thông tin đầy đủ phiếu booking"
      footer={
        booking.status === 'PENDING_APPROVAL' && onApprove && onReject ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button variant="destructive" onClick={() => onReject(booking)}>
              Từ chối
            </Button>
            <Button onClick={() => onApprove(booking)}>
              Duyệt ngay
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>Đóng</Button>
        )
      }
    >
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-3">Thông tin cơ bản</h3>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Mã booking" value={booking.code} />
            <DetailRow label="Trạng thái" value={<StatusBadge status={booking.status} />} />
            <DetailRow label="Số tiền booking" value={formatCurrency(booking.bookingAmount)} />
            <DetailRow label="Hạn thanh toán" value={formatDate(booking.expiresAt)} />
          </dl>
        </div>

        {/* Unit Info */}
        <div>
          <h3 className="font-semibold mb-3">Thông tin căn hộ</h3>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Mã căn" value={booking.unit?.code || 'N/A'} />
            <DetailRow label="Dự án" value={booking.unit?.project?.name || 'N/A'} />
            <DetailRow label="Diện tích" value={`${booking.unit?.area || 0}m²`} />
            <DetailRow label="Giá bán" value={formatCurrency(booking.unit?.price || 0)} />
          </dl>
        </div>

        {/* Customer Info */}
        <div>
          <h3 className="font-semibold mb-3">Thông tin khách hàng</h3>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Tên khách hàng" value={booking.customerName} />
            <DetailRow label="Số điện thoại" value={booking.customerPhone} />
            {booking.customerEmail && (
              <DetailRow label="Email" value={booking.customerEmail} />
            )}
            {booking.customerIdCard && (
              <DetailRow label="CCCD/CMT" value={booking.customerIdCard} />
            )}
          </dl>
        </div>

        {/* CTV Info */}
        <div>
          <h3 className="font-semibold mb-3">Thông tin CTV</h3>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Tên CTV" value={booking.ctv?.fullName || 'N/A'} />
            <DetailRow label="SĐT CTV" value={booking.ctv?.phone || 'N/A'} />
          </dl>
        </div>

        {/* Payment Proof */}
        {booking.paymentProof && (
          <div>
            <h3 className="font-semibold mb-3">Chứng từ thanh toán</h3>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(booking.paymentProof, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <DetailRow label="Ghi chú" value={booking.notes} fullWidth />
        )}

        {/* Timestamps */}
        <div>
          <h3 className="font-semibold mb-3">Lịch sử</h3>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Ngày tạo" value={formatDate(booking.createdAt)} />
            {booking.approvedAt && (
              <DetailRow label="Ngày duyệt" value={formatDate(booking.approvedAt)} />
            )}
            {booking.approvedBy && (
              <DetailRow label="Người duyệt" value={booking.approver?.fullName || 'N/A'} />
            )}
          </dl>
        </div>
      </div>
    </DetailModal>
  );
}

