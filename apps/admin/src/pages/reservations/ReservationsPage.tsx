/**
 * Reservations Management Page
 * Admin quản lý queue giữ chỗ cho dự án UPCOMING
 */

import React, { useState, useEffect, useCallback } from 'react';
import { reservationsApi, type Reservation } from '../../api/reservations.api';
import LoadingState from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Eye, X, Download, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { formatCurrency, formatDate } from '../../lib/utils';
import StatusBadge from '../../components/shared/StatusBadge';
import { useToast } from '../../components/ui/toast';
import { pdfApi } from '../../api/pdf.api';

const ReservationsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    reservationId: string;
  }>({ open: false, reservationId: '' });
  const [cancelReason, setCancelReason] = useState('');
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    reservation: Reservation | null;
  }>({ open: false, reservation: null });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  // Global ticking clock for countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCountdownText = (reservedUntil: string) => {
    const target = new Date(reservedUntil).getTime();
    const current = now.getTime();
    const diffMs = target - current;
    if (Number.isNaN(target)) return '';
    if (diffMs <= 0) return 'Đã hết hạn';
    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    if (hours <= 0) {
      return `Còn ${minutes} phút`;
    }
    return `Còn ${hours}h ${minutes}p`;
  };

  const loadReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const data = await reservationsApi.getAll(params);
      // Handle paginated responses - extract items if it's a paginated response
      const reservations = Array.isArray(data) ? data : (data as { items?: Reservation[] })?.items || [];
      setReservations(reservations);
    } catch (err: unknown) {
      console.error('Error loading reservations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách giữ chỗ';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleViewDetail = async (id: string) => {
    try {
      const reservation = await reservationsApi.getById(id);
      setDetailModal({ open: true, reservation });
    } catch (err: unknown) {
      showError('Không thể tải chi tiết giữ chỗ');
    }
  };

  const handleCancel = (id: string) => {
    setConfirmDialog({ open: true, reservationId: id });
    setCancelReason('');
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      setDownloadingId(id);
      const res = await pdfApi.getReservationPdf(id);
      if (res.pdfUrl) {
        window.open(res.pdfUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo PDF giữ chỗ';
      showError(errorMessage);
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmCancel = async () => {
    try {
      await reservationsApi.cancel(confirmDialog.reservationId, cancelReason);
      showSuccess('Hủy giữ chỗ thành công');
      setConfirmDialog({ open: false, reservationId: '' });
      setCancelReason('');
      loadReservations();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể hủy giữ chỗ';
      showError(errorMessage);
    }
  };

  if (isLoading && !error) {
    return <LoadingState message="Đang tải danh sách giữ chỗ..." />;
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <PageHeader
          title="Quản lý Giữ chỗ"
          description="Quản lý queue giữ chỗ cho dự án UPCOMING"
        />
        <ErrorState
          title="Lỗi tải danh sách giữ chỗ"
          description={error}
          onRetry={loadReservations}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Quản lý Giữ chỗ"
        description="Quản lý queue giữ chỗ cho dự án UPCOMING"
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Lọc theo trạng thái</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="ACTIVE">Đang chờ</SelectItem>
                <SelectItem value="YOUR_TURN">Đến lượt</SelectItem>
                <SelectItem value="MISSED">Bỏ lỡ</SelectItem>
                <SelectItem value="EXPIRED">Hết hạn</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Tổng giữ chỗ</div>
          <div className="text-2xl font-bold">{reservations.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Đang chờ</div>
          <div className="text-2xl font-bold">
            {reservations.filter((r) => r.status === 'ACTIVE').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Đến lượt</div>
          <div className="text-2xl font-bold">
            {reservations.filter((r) => r.status === 'YOUR_TURN').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Hết hạn/Hủy</div>
          <div className="text-2xl font-bold">
            {reservations.filter((r) => ['EXPIRED', 'CANCELLED'].includes(r.status)).length}
          </div>
        </Card>
      </div>

      {/* Table */}
      {reservations.length === 0 ? (
        <EmptyState
          title="Chưa có giữ chỗ nào"
          description="Chưa có phiếu giữ chỗ nào trong hệ thống"
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Mã</th>
                  <th className="text-left p-4 font-medium">Căn hộ</th>
                  <th className="text-left p-4 font-medium">Khách hàng</th>
                  <th className="text-left p-4 font-medium">CTV</th>
                  <th className="text-left p-4 font-medium">Vị trí</th>
                  <th className="text-left p-4 font-medium">Trạng thái</th>
                  <th className="text-left p-4 font-medium">Hết hạn</th>
                  <th className="text-left p-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => {
                  const isYourTurn = reservation.status === 'YOUR_TURN';
                  const countdown = getCountdownText(reservation.reservedUntil);
                  return (
                  <tr
                    key={reservation.id}
                    className={`border-b hover:bg-muted/50 ${
                      isYourTurn ? 'bg-amber-50' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-mono text-sm">{reservation.code}</div>
                    </td>
                    <td className="p-4">
                      {reservation.unit ? (
                        <div>
                          <div className="font-medium">{reservation.unit.code}</div>
                          <div className="text-sm text-muted-foreground">
                            {reservation.unit.project?.name}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{reservation.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {reservation.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {reservation.ctv ? (
                        <div>
                          <div className="font-medium">{reservation.ctv.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {reservation.ctv.phone}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="text-center">
                        <div
                          className={`text-lg font-bold ${
                            isYourTurn ? 'text-amber-700' : 'text-primary'
                          }`}
                        >
                          #{reservation.priority}
                        </div>
                        {isYourTurn && (
                          <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-medium">
                            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Đến lượt
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={reservation.status} />
                    </td>
                    <td className="p-4 align-middle">
                      <div className="text-sm">
                        {formatDate(reservation.reservedUntil)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{countdown}</span>
                      </div>
                      {reservation.depositDeadline && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Hạn cọc: {formatDate(reservation.depositDeadline)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(reservation.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPdf(reservation.id)}
                          disabled={downloadingId === reservation.id}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {['ACTIVE', 'YOUR_TURN'].includes(reservation.status) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(reservation.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Detail Modal */}
      {detailModal.open && detailModal.reservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Chi tiết Giữ chỗ</h2>
                <Button variant="ghost" size="sm" onClick={() => setDetailModal({ open: false, reservation: null })}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Mã giữ chỗ</div>
                  <div className="font-mono font-medium">{detailModal.reservation.code}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Trạng thái</div>
                  <StatusBadge status={detailModal.reservation.status} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Vị trí trong queue</div>
                  <div className="text-lg font-bold text-primary">#{detailModal.reservation.priority}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Hết hạn</div>
                  <div>{formatDate(detailModal.reservation.reservedUntil)}</div>
                </div>
                {detailModal.reservation.depositDeadline && (
                  <div>
                    <div className="text-sm text-muted-foreground">Hạn nộp cọc</div>
                    <div>{formatDate(detailModal.reservation.depositDeadline)}</div>
                  </div>
                )}
                {detailModal.reservation.notifiedAt && (
                  <div>
                    <div className="text-sm text-muted-foreground">Đã thông báo</div>
                    <div>{formatDate(detailModal.reservation.notifiedAt)}</div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Thông tin Căn hộ</h3>
                {detailModal.reservation.unit ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Mã căn</div>
                      <div className="font-medium">{detailModal.reservation.unit.code}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Dự án</div>
                      <div>{detailModal.reservation.unit.project?.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Giá</div>
                      <div>{formatCurrency(detailModal.reservation.unit.price)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Diện tích</div>
                      <div>{detailModal.reservation.unit.area}m²</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">Không có thông tin</div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Thông tin Khách hàng</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Tên</div>
                    <div className="font-medium">{detailModal.reservation.customerName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">SĐT</div>
                    <div>{detailModal.reservation.customerPhone}</div>
                  </div>
                  {detailModal.reservation.customerEmail && (
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div>{detailModal.reservation.customerEmail}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Thông tin CTV</h3>
                {detailModal.reservation.ctv ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Tên</div>
                      <div className="font-medium">{detailModal.reservation.ctv.fullName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">SĐT</div>
                      <div>{detailModal.reservation.ctv.phone}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">Không có thông tin</div>
                )}
              </div>

              {detailModal.reservation.notes && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Ghi chú</h3>
                  <div className="text-sm">{detailModal.reservation.notes}</div>
                </div>
              )}

              <div className="border-t pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDetailModal({ open: false, reservation: null })}>
                  Đóng
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Cancel Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open, reservationId: '' })}
        title="Hủy giữ chỗ"
        description="Bạn có chắc chắn muốn hủy giữ chỗ này?"
        onConfirm={confirmCancel}
        confirmText="Hủy giữ chỗ"
        variant="destructive"
      >
        <div className="mt-4">
          <label className="text-sm font-medium mb-2 block">Lý do hủy (tùy chọn)</label>
          <textarea
            className="w-full p-2 border rounded-md"
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Nhập lý do hủy..."
          />
        </div>
      </ConfirmDialog>
    </div>
  );
};

export default ReservationsPage;

