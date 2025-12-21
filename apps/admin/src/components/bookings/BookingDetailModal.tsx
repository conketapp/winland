/**
 * Booking Detail Modal
 * Shows full booking information with payment proof
 */

import { useState } from 'react';
import DetailModal from '../shared/DetailModal';
import DetailRow from '../shared/DetailRow';
import StatusBadge from '../shared/StatusBadge';
import { Button } from '../ui/button';
import { pdfApi } from '../../api/pdf.api';
import { bookingsApi } from '../../api/bookings.api';
import type { Booking } from '../../types/booking.types';
import { formatCurrency, formatDate } from '../../lib/utils';

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
  const [downloading, setDownloading] = useState(false);
  const [updatingProof, setUpdatingProof] = useState(false);
  const [localProof, setLocalProof] = useState<string | File | null>(booking?.paymentProof || null);

  if (!booking) return null;

  const handleDownloadPdf = async () => {
    if (!booking) return;
    try {
      setDownloading(true);
      const res = await pdfApi.getBookingPdf(booking.id);
      if (res.pdfUrl) {
        window.open(res.pdfUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
       
      console.error('Error downloading booking PDF', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleUpdatePaymentProof = async () => {
    if (!booking) return;
    try {
      setUpdatingProof(true);
      // Ở đây giả sử localProof đã là object/URL sau khi upload ở nơi khác
      if (localProof) {
        const res = await bookingsApi.updatePaymentProof(booking.id, localProof);
        // Cập nhật lại local proof từ response
        setLocalProof(res.booking.paymentProof || null);
      }
    } catch (error) {
      console.error('Error updating payment proof', error);
    } finally {
      setUpdatingProof(false);
    }
  };

  return (
    <DetailModal
      open={open}
      onClose={onClose}
      title={`Chi tiết Booking - ${booking.code}`}
      description="Thông tin đầy đủ phiếu booking"
      footer={
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" onClick={handleDownloadPdf} disabled={downloading}>
            {downloading ? 'Đang tạo PDF...' : '📄 Tải PDF'}
          </Button>
          {booking.status === 'PENDING_APPROVAL' && onApprove && onReject ? (
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
          )}
        </div>
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
        {localProof && (
          <div>
            <h3 className="font-semibold mb-3">Chứng từ thanh toán</h3>
            <div className="bg-gray-50 rounded-lg p-4 border space-y-3">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(localProof, null, 2)}
              </pre>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpdatePaymentProof}
                  disabled={updatingProof}
                >
                  {updatingProof ? 'Đang lưu...' : 'Cập nhật chứng từ'}
                </Button>
              </div>
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

