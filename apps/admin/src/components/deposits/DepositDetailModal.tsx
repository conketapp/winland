/**
 * Deposit Detail Modal
 * Shows full deposit information with payment schedules
 */

import { useMemo, useState } from 'react';
import DetailModal from '../shared/DetailModal';
import DetailRow from '../shared/DetailRow';
import StatusBadge from '../shared/StatusBadge';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import type { Deposit } from '../../types/deposit.types';
import { pdfApi } from '../../api/pdf.api';
import { formatCurrency, formatDate } from '../../lib/utils';

interface DepositDetailModalProps {
  open: boolean;
  onClose: () => void;
  deposit: Deposit | null;
  onApprove?: (deposit: Deposit) => void;
  onReject?: (deposit: Deposit) => void;
}

export default function DepositDetailModal({
  open,
  onClose,
  deposit,
  onApprove,
  onReject,
}: DepositDetailModalProps) {
  const [downloading, setDownloading] = useState(false);

  const schedules = useMemo(() => deposit?.paymentSchedules || [], [deposit?.paymentSchedules]);

  const paymentSummary = useMemo(() => {
    if (!schedules.length) {
      return null;
    }
    const totalAmount = schedules.reduce((sum: number, s) => sum + (s.amount || 0), 0);
    const totalPaid = schedules.reduce((sum: number, s) => sum + (s.paidAmount || 0), 0);
    const remaining = totalAmount - totalPaid;
    const ratio = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
    return {
      totalAmount,
      totalPaid,
      remaining,
      percent: Math.round(ratio * 100) / 100,
    };
  }, [schedules]);

  if (!deposit) return null;

  const handleDownloadPdf = async () => {
    if (!deposit) return;
    try {
      setDownloading(true);
      const res = await pdfApi.getDepositPdf(deposit.id);
      if (res.pdfUrl) {
        window.open(res.pdfUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
       
      console.error('Error downloading deposit PDF', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DetailModal
      open={open}
      onClose={onClose}
      title={`Chi tiết Cọc - ${deposit.code}`}
      description="Thông tin đầy đủ phiếu cọc và lịch thanh toán"
      footer={
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={downloading}
          >
            {downloading ? 'Đang tạo PDF...' : '📄 Tải PDF'}
          </Button>
          {deposit.status === 'PENDING_APPROVAL' && onApprove && onReject ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
              <Button variant="destructive" onClick={() => onReject(deposit)}>
                Từ chối
              </Button>
              <Button onClick={() => onApprove(deposit)}>
                Duyệt ngay
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Đóng</Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="font-semibold mb-3">Thông tin cơ bản</h3>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Mã cọc" value={deposit.code} />
            <DetailRow label="Trạng thái" value={<StatusBadge status={deposit.status} />} />
            <DetailRow label="Số tiền cọc" value={formatCurrency(deposit.depositAmount)} />
            <DetailRow label="Tỷ lệ cọc" value={`${deposit.depositPercentage || 0}%`} />
          </dl>
        </div>

        {/* Unit Info */}
        <div>
          <h3 className="font-semibold mb-3">Thông tin căn hộ</h3>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Mã căn" value={deposit.unit?.code || 'N/A'} />
            <DetailRow label="Dự án" value={deposit.unit?.project?.name || 'N/A'} />
            <DetailRow label="Diện tích" value={`${deposit.unit?.area || 0}m²`} />
            <DetailRow label="Giá bán" value={formatCurrency(deposit.unit?.price || 0)} />
          </dl>
        </div>

        {/* Customer Info */}
        <div>
          <h3 className="font-semibold mb-3">Thông tin khách hàng</h3>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Tên khách hàng" value={deposit.customerName} />
            <DetailRow label="Số CCCD/CMT" value={deposit.customerIdCard} />
            <DetailRow label="Số điện thoại" value={deposit.customerPhone || 'N/A'} />
            <DetailRow label="Email" value={deposit.customerEmail || 'N/A'} />
          </dl>
        </div>

        {/* CTV Info */}
        <div>
          <h3 className="font-semibold mb-3">Thông tin CTV</h3>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Tên CTV" value={deposit.ctv?.fullName || 'N/A'} />
            <DetailRow label="SĐT CTV" value={deposit.ctv?.phone || 'N/A'} />
          </dl>
        </div>

        {/* Payment Schedules Timeline */}
        {schedules.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Lịch thanh toán</h3>

            {paymentSummary && (
              <Card className="mb-3">
                <CardContent className="py-3 px-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tổng giá trị lịch thanh toán</span>
                      <span className="font-semibold">{formatCurrency(paymentSummary.totalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Đã thanh toán</span>
                      <span className="font-semibold text-emerald-700">
                        {formatCurrency(paymentSummary.totalPaid)} ({paymentSummary.percent}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Còn lại</span>
                      <span className="font-semibold text-amber-700">
                        {formatCurrency(paymentSummary.remaining)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(paymentSummary.percent, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Đợt</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tên</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Số tiền</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">%</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Hạn TT</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Đã trả</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule) => {
                      const isOverdue =
                        schedule.status === 'OVERDUE' ||
                        (schedule.status === 'PENDING' &&
                          schedule.dueDate &&
                          new Date(schedule.dueDate) < new Date());
                      const remainingAmount =
                        (schedule.amount || 0) - (schedule.paidAmount || 0);

                      return (
                        <tr
                          key={schedule.id}
                          className={`border-t ${isOverdue ? 'bg-red-50' : ''}`}
                        >
                          <td className="px-4 py-3 text-sm font-medium">
                            Đợt {schedule.installment}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {schedule.installment === 1 ? 'Cọc' : `Đợt ${schedule.installment}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {formatCurrency(schedule.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {deposit?.unit?.price ? `${Math.round((schedule.amount / deposit.unit.price) * 100)}%` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {schedule.dueDate ? formatDate(schedule.dueDate) : 'TBD'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex flex-col text-right">
                              <span className="text-emerald-700 font-medium">
                                {formatCurrency(schedule.paidAmount || 0)}
                              </span>
                              {remainingAmount > 0 && (
                                <span className="text-xs text-gray-500">
                                  Còn lại: {formatCurrency(remainingAmount)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <StatusBadge status={schedule.status as 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'} />
                            {isOverdue && (
                              <Badge variant="destructive" className="mt-1 text-[10px]">
                                Quá hạn
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contract URL */}
        {deposit.contractUrl && (
          <DetailRow 
            label="Hợp đồng" 
            value={
              <a href={deposit.contractUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                📄 Tải hợp đồng
              </a>
            }
            fullWidth
          />
        )}

        {/* Payment Proof */}
        {deposit.paymentProof && (
          <div>
            <h3 className="font-semibold mb-3">Chứng từ cọc</h3>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(deposit.paymentProof, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div>
          <h3 className="font-semibold mb-3">Lịch sử</h3>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Ngày tạo" value={formatDate(deposit.createdAt)} />
            {deposit.approvedAt && (
              <DetailRow label="Ngày duyệt" value={formatDate(deposit.approvedAt)} />
            )}
            {deposit.approvedBy && (
              <DetailRow label="Người duyệt" value={deposit.approver?.fullName || 'N/A'} />
            )}
          </dl>
        </div>
      </div>
    </DetailModal>
  );
}

