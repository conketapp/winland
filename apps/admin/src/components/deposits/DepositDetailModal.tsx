/**
 * Deposit Detail Modal
 * Shows full deposit information with payment schedules
 */

import React from 'react';
import DetailModal from '../shared/DetailModal';
import DetailRow from '../shared/DetailRow';
import StatusBadge from '../shared/StatusBadge';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { Deposit } from '../../types/deposit.types';

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
  if (!deposit) return null;

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
      title={`Chi tiết Cọc - ${deposit.code}`}
      description="Thông tin đầy đủ phiếu cọc và lịch thanh toán"
      footer={
        deposit.status === 'PENDING_APPROVAL' && onApprove && onReject ? (
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
        )
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

        {/* Payment Schedules */}
        {deposit.paymentSchedules && deposit.paymentSchedules.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Lịch thanh toán</h3>
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
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposit.paymentSchedules.map((schedule) => (
                      <tr key={schedule.id} className="border-t">
                        <td className="px-4 py-3 text-sm">{schedule.installment}</td>
                        <td className="px-4 py-3 text-sm">{schedule.name}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {formatCurrency(schedule.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">{schedule.percentage}%</td>
                        <td className="px-4 py-3 text-sm">
                          {schedule.dueDate ? formatDate(schedule.dueDate) : 'TBD'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={schedule.status} />
                        </td>
                      </tr>
                    ))}
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

