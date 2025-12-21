import React, { useEffect, useState } from 'react';
import { bookingsApi } from '../../api/bookings.api';
import { depositsApi } from '../../api/deposits.api';
import type { Booking } from '../../types/booking.types';
import type { Deposit } from '../../types/deposit.types';
import LoadingState from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import StatusBadge from '../../components/shared/StatusBadge';
import { formatCurrency, formatDate, formatShortAmount } from '../../lib/utils';
import { useToast } from '../../components/ui/toast';

const CleanupPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingTrash, depositTrash] = await Promise.all([
        bookingsApi.getTrash(),
        depositsApi.getTrash(),
      ]);
      setBookings(bookingTrash);
      setDeposits(depositTrash);
    } catch (err: unknown) {
      console.error('Error loading cleanup data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách phiếu đã hủy/hết hạn';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCleanupBooking = async (id: string) => {
    try {
      await bookingsApi.cleanup(id);
      toastSuccess('Đã trả căn về trạng thái trống thành công');
      loadData();
    } catch (err: unknown) {
      console.error('Cleanup booking failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể trả căn về trạng thái trống';
      toastError(errorMessage);
    }
  };

  const handleCleanupDeposit = async (id: string) => {
    try {
      await depositsApi.cleanup(id);
      toastSuccess('Đã trả căn về trạng thái trống thành công');
      loadData();
    } catch (err: unknown) {
      console.error('Cleanup deposit failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể trả căn về trạng thái trống';
      toastError(errorMessage);
    }
  };

  if (loading && !error) {
    return <LoadingState message="Đang tải danh sách phiếu đã hủy/hết hạn..." />;
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <PageHeader
          title="Giải phóng Căn hộ"
          description="Trả các căn đang bị khóa bởi phiếu booking/cọc đã hủy hoặc hết hạn về trạng thái trống"
        />
        <ErrorState
          title="Lỗi tải danh sách"
          description={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Giải phóng Căn hộ"
        description="Quản lý và trả các căn đang bị khóa bởi phiếu booking/cọc đã hủy hoặc hết hạn về trạng thái trống"
      />

      {/* Booking Trash */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Phiếu Booking đã hủy/hết hạn</h2>
          <span className="text-sm text-gray-500">
            Tổng: <span className="font-semibold">{bookings.length}</span>
          </span>
        </div>

        {bookings.length === 0 ? (
          <p className="text-sm text-gray-500">Không có phiếu booking nào đã hủy hoặc hết hạn.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left">Mã booking</th>
                  <th className="px-3 py-2 text-left">Căn hộ</th>
                  <th className="px-3 py-2 text-left">Khách hàng</th>
                  <th className="px-3 py-2 text-left">Số tiền</th>
                  <th className="px-3 py-2 text-left">Trạng thái</th>
                  <th className="px-3 py-2 text-left">Cập nhật</th>
                  <th className="px-3 py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="font-medium">{b.code}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(b.createdAt)}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">
                        {b.unit?.code ?? 'N/A'} - {b.unit?.project?.name ?? 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {b.unit?.building?.code ?? 'N/A'} / Tầng {b.unit?.floor?.number ?? 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{b.customerName}</div>
                      <div className="text-xs text-gray-500">{b.customerPhone}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-semibold">
                        {formatShortAmount(b.bookingAmount)} ({formatCurrency(b.bookingAmount)})
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {formatDate(b.updatedAt)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCleanupBooking(b.id)}
                      >
                        Trả căn về trống
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Deposit Trash */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Phiếu Cọc đã hủy/quá hạn</h2>
          <span className="text-sm text-gray-500">
            Tổng: <span className="font-semibold">{deposits.length}</span>
          </span>
        </div>

        {deposits.length === 0 ? (
          <p className="text-sm text-gray-500">Không có phiếu cọc nào đã hủy hoặc quá hạn.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left">Mã phiếu cọc</th>
                  <th className="px-3 py-2 text-left">Căn hộ</th>
                  <th className="px-3 py-2 text-left">Khách hàng</th>
                  <th className="px-3 py-2 text-left">Số tiền cọc</th>
                  <th className="px-3 py-2 text-left">Trạng thái</th>
                  <th className="px-3 py-2 text-left">Cập nhật</th>
                  <th className="px-3 py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {deposits.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="font-medium">{d.code}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(d.createdAt)}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">
                        {d.unit?.code ?? 'N/A'} - {d.unit?.project?.name ?? 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {d.unit?.building?.code ?? 'N/A'} / Tầng {d.unit?.floor?.number ?? 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{d.customerName}</div>
                      <div className="text-xs text-gray-500">{d.customerPhone}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-semibold">
                        {formatShortAmount(d.depositAmount)} ({formatCurrency(d.depositAmount)})
                      </div>
                      <div className="text-xs text-gray-500">
                        {d.depositPercentage.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {formatDate(d.updatedAt)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCleanupDeposit(d.id)}
                      >
                        Trả căn về trống
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CleanupPage;


