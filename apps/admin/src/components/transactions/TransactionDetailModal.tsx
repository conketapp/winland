/**
 * Transaction Detail Modal
 * Shows full transaction information
 */

import DetailModal from '../shared/DetailModal';
import DetailRow from '../shared/DetailRow';
import StatusBadge from '../shared/StatusBadge';
import { Button } from '../ui/button';
import type { Transaction } from '../../api/transactions.api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Card, CardContent } from '../ui/card';

interface TransactionDetailModalProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export default function TransactionDetailModal({
  open,
  onClose,
  transaction,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <DetailModal
      open={open}
      onClose={onClose}
      title={`Chi tiết Giao dịch - ${transaction.id.slice(0, 8)}`}
      description="Thông tin đầy đủ giao dịch thanh toán"
      footer={
        <Button 
          onClick={onClose}
          className="text-xs sm:text-sm h-9 sm:h-10"
          size="sm"
        >
          Đóng
        </Button>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Thông tin cơ bản</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <DetailRow label="Mã giao dịch" value={transaction.id} />
            <DetailRow label="Trạng thái" value={<StatusBadge status={transaction.status} />} />
            <DetailRow label="Số tiền" value={formatCurrency(transaction.amount)} />
            <DetailRow label="Phương thức thanh toán" value={transaction.paymentMethod} />
            <DetailRow label="Ngày thanh toán" value={formatDate(transaction.paymentDate)} />
            <DetailRow label="Ngày tạo" value={formatDate(transaction.createdAt)} />
            {transaction.transactionRef && (
              <DetailRow label="Mã tham chiếu" value={transaction.transactionRef} />
            )}
          </dl>
        </div>

        {/* Deposit Info */}
        {transaction.deposit && (
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Thông tin phiếu cọc</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <DetailRow label="Mã phiếu cọc" value={transaction.deposit.code} />
              <DetailRow label="Số tiền cọc" value={formatCurrency(transaction.deposit.depositAmount)} />
              {transaction.deposit.unit && (
                <>
                  <DetailRow label="Mã căn hộ" value={transaction.deposit.unit.code} />
                  {transaction.deposit.unit.project && (
                    <DetailRow label="Dự án" value={transaction.deposit.unit.project.name} />
                  )}
                </>
              )}
            </dl>
          </div>
        )}

        {/* Payment Schedule Info */}
        {transaction.paymentSchedule && (
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Thông tin đợt thanh toán</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <DetailRow label="Tên đợt" value={transaction.paymentSchedule.name} />
              <DetailRow label="Đợt số" value={`Đợt ${transaction.paymentSchedule.installment}`} />
              <DetailRow label="Số tiền đợt" value={formatCurrency(transaction.paymentSchedule.amount)} />
              {transaction.paymentSchedule.dueDate && (
                <DetailRow label="Hạn thanh toán" value={formatDate(transaction.paymentSchedule.dueDate)} />
              )}
              <DetailRow label="Trạng thái đợt" value={<StatusBadge status={transaction.paymentSchedule.status as any} />} />
            </dl>
          </div>
        )}

        {/* Customer Info */}
        {transaction.deposit && (
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Thông tin khách hàng</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <DetailRow label="Tên khách hàng" value={transaction.deposit.customerName} />
              {transaction.deposit.customerPhone && (
                <DetailRow label="Số điện thoại" value={transaction.deposit.customerPhone} />
              )}
            </dl>
          </div>
        )}

        {/* Payment Proof */}
        {transaction.paymentProof && (
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Chứng từ thanh toán</h3>
            <Card>
              <CardContent className="p-3 sm:p-4">
                {typeof transaction.paymentProof === 'string' ? (
                  <div className="space-y-2">
                    {transaction.paymentProof.split(',').map((url, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <img 
                          src={url.trim()} 
                          alt={`Chứng từ ${index + 1}`}
                          className="w-full h-auto max-h-96 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="p-4 text-center text-sm text-gray-500">Không thể tải hình ảnh</div>`;
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    {JSON.stringify(transaction.paymentProof, null, 2)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notes */}
        {transaction.notes && (
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Ghi chú</h3>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{transaction.notes}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Confirmation Info */}
        {transaction.confirmedAt && (
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Thông tin xác nhận</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <DetailRow label="Ngày xác nhận" value={formatDate(transaction.confirmedAt)} />
            </dl>
          </div>
        )}
      </div>
    </DetailModal>
  );
}
