/**
 * Bookings Approval Page
 * Admin duyệt phiếu booking (10tr)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { bookingsApi } from '../../api/bookings.api';
import type { Booking } from '../../types/booking.types';
import type { Project } from '../../types/project.types';
import type { User } from '../../types/auth.types';
import LoadingState from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import BookingDetailModal from '../../components/bookings/BookingDetailModal';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { formatCurrency, formatDate } from '../../lib/utils';
import { projectsApi } from '../../api/projects.api';
import { apiRequest } from '../../api/client';
import { API_ENDPOINTS } from '../../constants/api';
import StatusBadge from '../../components/shared/StatusBadge';
import { useFilterRouting } from '../../hooks/useFilterRouting';

const BookingsApprovalPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ctvs, setCtvs] = useState<User[]>([]);
  const [filters, setFilters] = useState({
    status: 'PENDING_APPROVAL',
    projectId: 'all',
    ctvId: 'all',
  });
  const statusFilter = filters.status;
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject';
    bookingId: string;
  }>({ open: false, type: 'approve', bookingId: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    booking: Booking | null;
  }>({ open: false, booking: null });

  // Sync filters with URL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFilterRouting(filters, setFilters as any, {
    transformToUrl: (currentFilters) => {
      const result: Record<string, string> = {};
      if (currentFilters.status && currentFilters.status !== 'all') {
        result.status = String(currentFilters.status);
      }
      if (currentFilters.projectId && currentFilters.projectId !== 'all') {
        result.projectId = String(currentFilters.projectId);
      }
      if (currentFilters.ctvId && currentFilters.ctvId !== 'all') {
        result.ctvId = String(currentFilters.ctvId);
      }
      return result;
    },
    transformFromUrl: (params) => {
      return {
        status: params.get('status') || 'PENDING_APPROVAL',
        projectId: params.get('projectId') || 'all',
        ctvId: params.get('ctvId') || 'all',
      };
    },
  });

  useEffect(() => {
    loadMeta();
  }, []);

  const loadMeta = async () => {
    try {
      const [projectsData, usersData] = await Promise.all([
        projectsApi.getAll(),
        apiRequest<User[]>({
          method: 'GET',
          url: API_ENDPOINTS.USERS.BASE,
          params: { role: 'CTV', status: 'active' },
        }),
      ]);
      
      // Handle both paginated response (new) and array response (old/fallback)
      const projectsList = Array.isArray(projectsData) 
        ? projectsData 
        : (projectsData?.items || []);
      
      setProjects(projectsList);
      setCtvs(usersData || []);
    } catch (err) {
      // ignore meta errors, only log
      console.error('Error loading booking meta:', err);
      setProjects([]); // Set empty array on error
      setCtvs([]);
    }
  };

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (filters.projectId !== 'all') {
        params.projectId = filters.projectId;
      }
      if (filters.ctvId !== 'all') {
        params.ctvId = filters.ctvId;
      }
      const data = await bookingsApi.getAll(params);
      // Handle paginated responses - extract items if it's a paginated response
      const bookings = Array.isArray(data) ? data : (data as { items?: Booking[] })?.items || [];
      setBookings(bookings);
    } catch (err: unknown) {
      console.error('Error loading bookings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách booking';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, filters]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

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
      } else {
        if (!rejectReason) {
          return;
        }
        await bookingsApi.reject(confirmDialog.bookingId, rejectReason);
        setRejectReason('');
      }
      loadBookings();
    } catch (err: unknown) {
      console.error('Error handling booking action:', err);
    }
  };

  if (isLoading && !error) {
    return <LoadingState message="Đang tải danh sách booking..." />;
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <PageHeader
          title="Duyệt Phiếu Booking"
          description="Xác nhận booking 10 triệu từ CTV"
        />
        <ErrorState
          title="Lỗi tải danh sách booking"
          description={error}
          onRetry={loadBookings}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
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
        title="Quản lý Phiếu Booking"
        description="Duyệt và quản lý các phiếu booking từ CTV"
      />

      {/* Filters */}
      <Card className="p-3 md:p-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3 md:gap-4">
          {/* Status filter */}
          <div className="flex-1 min-w-0 sm:flex-initial">
            <label className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2 block">Trạng thái:</label>
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Chờ duyệt</SelectItem>
                <SelectItem value="CONFIRMED">Đã duyệt</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project filter */}
          <div className="flex-1 min-w-0 sm:flex-initial">
            <label className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2 block">Dự án:</label>
            <Select
              value={filters.projectId}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, projectId: value }))}
            >
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Chọn dự án" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả dự án</SelectItem>
                {(projects || []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CTV filter */}
          <div className="flex-1 min-w-0 sm:flex-initial">
            <label className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2 block">CTV:</label>
            <Select
              value={filters.ctvId}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, ctvId: value }))}
            >
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Chọn CTV" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả CTV</SelectItem>
                {(ctvs || []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fullName} {c.phone ? `(${c.phone})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <EmptyState
          title="Không có booking nào"
          description={statusFilter === 'PENDING_APPROVAL' ? 'Chưa có booking chờ duyệt' : 'Không tìm thấy booking'}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {bookings.map((booking) => (
                <div key={booking.id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{booking.code}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{formatDate(booking.createdAt)}</div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  
                  <div className="space-y-1.5 text-xs mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Căn hộ:</span>
                      <span className="font-medium text-gray-900">{booking.unit?.code}</span>
                    </div>
                    <div className="text-xs text-gray-500">{booking.unit?.project?.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Khách hàng:</span>
                      <span className="text-gray-900">{booking.customerName}</span>
                    </div>
                    <div className="text-xs text-gray-500">{booking.customerPhone}</div>
                    <div className="text-xs text-gray-500">CMND: {booking.customerIdCard}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Số tiền:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(booking.bookingAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">CTV:</span>
                      <span className="text-gray-900">{booking.ctv?.fullName}</span>
                    </div>
                    <div className="text-xs text-gray-500">{booking.ctv?.phone}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hạn:</span>
                      <span className="text-gray-900">{formatDate(booking.expiresAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailModal({ open: true, booking })}
                      className="flex-1 text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Xem
                    </Button>
                    {booking.status === 'PENDING_APPROVAL' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(booking.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(booking.id)}
                          className="flex-1 text-xs"
                        >
                          Từ chối
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Mã booking</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Căn hộ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Số tiền</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">CTV</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hạn</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{booking.code}</div>
                        <div className="text-xs text-gray-500">{formatDate(booking.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{booking.unit?.code}</div>
                        <div className="text-xs text-gray-500">{booking.unit?.project?.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{booking.customerName}</div>
                        <div className="text-xs text-gray-500">{booking.customerPhone}</div>
                        <div className="text-xs text-gray-500">CMND: {booking.customerIdCard}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(booking.bookingAmount)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{booking.ctv?.fullName}</div>
                        <div className="text-xs text-gray-500">{booking.ctv?.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600">
                          {formatDate(booking.expiresAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailModal({ open: true, booking })}
                            className="h-8"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Xem
                          </Button>
                          {booking.status === 'PENDING_APPROVAL' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(booking.id)}
                                className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(booking.id)}
                                className="h-8"
                              >
                                Từ chối
                              </Button>
                            </>
                          )}
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
};

export default BookingsApprovalPage;

