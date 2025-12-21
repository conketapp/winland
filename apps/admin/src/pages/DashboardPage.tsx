/**
 * Admin Dashboard Page - Full shadcn/ui + lucide-react
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, type AdminDashboardStats } from '../api/dashboard.api';
import { bookingsApi } from '../api/bookings.api';
import { depositsApi } from '../api/deposits.api';
import { paymentRequestsApi } from '../api/payment-requests.api';
import type { Project } from '../types/project.types';
import type { Booking } from '../types/booking.types';
import type { Deposit } from '../types/deposit.types';
import LoadingState from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PageHeader } from '../components/ui/PageHeader';
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  Home, 
  Plus, 
  FileCheck, 
  CircleDollarSign,
  ChevronRight,
  AlertTriangle 
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

type DashboardStats = AdminDashboardStats;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingBookingsList, setPendingBookingsList] = useState<Booking[]>([]);
  const [pendingDepositsList, setPendingDepositsList] = useState<Deposit[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pendingPaymentRequestsList, setPendingPaymentRequestsList] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [data, bookingsRes, depositsRes, paymentRequestsRes] = await Promise.all([
        dashboardApi.getAdminStats(),
        bookingsApi.getAll({ status: 'PENDING_APPROVAL' }),
        depositsApi.getAll({ status: 'PENDING_APPROVAL' }),
        paymentRequestsApi.getAll({ status: 'PENDING' }),
      ]);

      setStats(data);
      setRecentProjects((data as AdminDashboardStats & { recentProjects?: Project[] }).recentProjects || []);
      
      // Handle paginated responses - extract items if it's a paginated response
      const bookings = Array.isArray(bookingsRes) ? bookingsRes : (bookingsRes as { items?: Booking[] })?.items || [];
      const deposits = Array.isArray(depositsRes) ? depositsRes : (depositsRes as { items?: Deposit[] })?.items || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentRequests = Array.isArray(paymentRequestsRes) ? paymentRequestsRes : (paymentRequestsRes as any)?.items || [];
      
      setPendingBookingsList(bookings.slice(0, 5));
      setPendingDepositsList(deposits.slice(0, 5));
      setPendingPaymentRequestsList(paymentRequests.slice(0, 5));
    } catch (err: unknown) {
      console.error('Error loading dashboard:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu dashboard';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if ((isLoading || !stats) && !error) {
    return <LoadingState message="Đang tải dashboard..." />;
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <PageHeader
          title="Tổng quan hệ thống"
          description="Theo dõi nhanh tình trạng dự án, sản phẩm và hiệu quả bán hàng"
        />
        <ErrorState
          title="Lỗi tải dữ liệu tổng quan"
          description={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  // At this point, stats is guaranteed to be non-null
  const statsData = stats!;

  const statCards = [
    {
        title: 'Tổng dự án',
        value: statsData.projects.total,
      icon: Building2,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-gray-900',
    },
    {
        title: 'Dự án sắp mở bán',
        value: statsData.projects.upcoming,
      icon: Clock,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      valueColor: 'text-yellow-600',
    },
    {
        title: 'Dự án đang mở bán',
        value: statsData.projects.open,
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
    },
    {
        title: 'Tổng căn hộ',
        value: statsData.units.total,
      icon: Home,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      valueColor: 'text-gray-900',
    },
  ];

  const unitCards = [
    {
        title: 'Căn đang mở bán',
        value: statsData.units.available,
      icon: Home,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
    },
    {
        title: 'Căn đang giữ chỗ/booking',
        value: statsData.units.reserved,
      icon: Clock,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      valueColor: 'text-orange-700',
    },
    {
        title: 'Căn đã cọc',
        value: statsData.units.deposited,
      icon: CircleDollarSign,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      valueColor: 'text-indigo-700',
    },
    {
        title: 'Căn đã bán',
        value: statsData.units.sold,
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-700',
    },
  ];

  const pendingCards = [
    {
        title: 'Booking chờ duyệt',
        value: statsData.pending.bookings,
      icon: FileCheck,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-700',
      valueColor: 'text-yellow-700',
    },
    {
        title: 'Cọc chờ duyệt',
        value: statsData.pending.deposits,
      icon: CircleDollarSign,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-700',
      valueColor: 'text-orange-700',
    },
    {
        title: 'Yêu cầu hoa hồng chờ',
        value: statsData.pending.paymentRequests,
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-700',
    },
    {
        title: 'Doanh thu đã xác nhận',
        value: formatCurrency(statsData.revenue?.totalRevenue || 0),
      icon: CircleDollarSign,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-700',
      valueColor: 'text-teal-700',
    },
  ];

  const quickActions = [
    {
      title: 'Tạo mới',
      subtitle: 'Dự Án',
      icon: Plus,
      gradient: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      onClick: () => navigate('/projects/create'),
    },
    {
      title: 'Duyệt',
      subtitle: 'Bookings',
      icon: FileCheck,
      gradient: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      onClick: () => navigate('/bookings'),
    },
    {
      title: 'Duyệt',
      subtitle: 'Cọc',
      icon: CircleDollarSign,
      gradient: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      onClick: () => navigate('/deposits'),
    },
  ];

  const funnel = statsData.funnel || {
    reservations: {
      total: 0,
      active: 0,
      yourTurn: 0,
      expiredOrMissed: 0,
    },
    bookings: {
      total: 0,
      confirmed: 0,
    },
    deposits: {
      total: 0,
      confirmed: 0,
      cancelled: 0,
      overdue: 0,
    },
    conversionRates: {
      reservationToBooking: 0,
      reservationToDeposit: 0,
    },
  };

  const risksRaw = statsData.risks ?? {
    overdueSchedules: 0,
    overdueDeposits: 0,
    reservations: {
      yourTurn: 0,
      expiredOrMissed: 0,
    },
  };
  const risks = {
    overdueSchedules: risksRaw.overdueSchedules ?? 0,
    overdueDeposits: risksRaw.overdueDeposits ?? 0,
    reservations: {
      yourTurn: risksRaw.reservations.yourTurn ?? funnel.reservations.yourTurn ?? 0,
      expiredOrMissed:
        risksRaw.reservations?.expiredOrMissed ?? funnel.reservations.expiredOrMissed ?? 0,
    },
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="Tổng quan hệ thống" 
        description="Theo dõi nhanh tình trạng dự án, sản phẩm và hiệu quả bán hàng"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.valueColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.iconBg} p-3 rounded-lg`}>
                  <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Units & Pending Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái căn hộ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unitCards.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100"
                >
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className={`text-2xl font-bold mt-1 ${stat.valueColor}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.iconBg} p-3 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals & Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Cần xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingCards.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    if (stat.title.includes('Booking')) navigate('/bookings');
                    else if (stat.title.includes('Cọc')) navigate('/deposits');
                    else if (stat.title.includes('hoa hồng')) navigate('/payment-requests');
                    else if (stat.title.includes('Doanh thu')) navigate('/transactions');
                  }}
                >
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className={`text-2xl font-bold mt-1 ${stat.valueColor}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.iconBg} p-3 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel & Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel giữ chỗ → Booking → Cọc */}
        <Card>
          <CardHeader>
            <CardTitle>Hành trình: Giữ chỗ → Booking → Cọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Giữ chỗ</p>
                  <p className="text-lg font-bold text-gray-900">
                    {funnel.reservations.total.toLocaleString('vi-VN')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Đang trong hàng chờ:{' '}
                    <span className="font-medium">
                      {funnel.reservations.active} (trong đó {funnel.reservations.yourTurn} đang đến lượt)
                    </span>
                  </p>
                </div>
                <div className="h-2 w-24 rounded-full bg-blue-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width:
                        funnel.reservations.total > 0
                          ? `${Math.min(
                              (funnel.reservations.active / funnel.reservations.total) * 100,
                              100,
                            )}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Booking đã duyệt</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {funnel.bookings.confirmed.toLocaleString('vi-VN')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Tỷ lệ từ giữ chỗ:{' '}
                    <span className="font-medium">
                      {funnel.conversionRates.reservationToBooking}%
                    </span>
                  </p>
                </div>
                <div className="h-2 w-24 rounded-full bg-emerald-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{
                      width:
                        funnel.reservations.total > 0
                          ? `${Math.min(
                              (funnel.bookings.confirmed / funnel.reservations.total) * 100,
                              100,
                            )}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Cọc đã duyệt</p>
                  <p className="text-lg font-bold text-indigo-700">
                    {funnel.deposits.confirmed.toLocaleString('vi-VN')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Tỷ lệ từ giữ chỗ:{' '}
                    <span className="font-medium">
                      {funnel.conversionRates.reservationToDeposit}%
                    </span>
                  </p>
                </div>
                <div className="h-2 w-24 rounded-full bg-indigo-100 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500"
                    style={{
                      width:
                        funnel.reservations.total > 0
                          ? `${Math.min(
                              (funnel.deposits.confirmed / funnel.reservations.total) * 100,
                              100,
                            )}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rủi ro & cảnh báo */}
        <Card>
          <CardHeader>
            <CardTitle>Rủi ro & cảnh báo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="flex flex-col justify-between p-4 rounded-lg border border-amber-100 bg-amber-50 cursor-pointer"
                onClick={() => navigate('/reservations')}
              >
                <div>
                  <p className="text-xs text-amber-700 font-medium">Giữ chỗ đến lượt</p>
                  <p className="text-2xl font-bold text-amber-800 mt-1">
                    {risks.reservations.yourTurn}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Cần theo dõi để tránh hết lượt / lỡ lượt.
                  </p>
                </div>
              </div>
              <div
                className="flex flex-col justify-between p-4 rounded-lg border border-red-100 bg-red-50 cursor-pointer"
                onClick={() => navigate('/deposits')}
              >
                <div>
                  <p className="text-xs text-red-700 font-medium">Phiếu cọc quá hạn</p>
                  <p className="text-2xl font-bold text-red-800 mt-1">
                    {risks.overdueDeposits}
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Đã quá hạn thanh toán, cần xử lý/đôn đốc.
                  </p>
                </div>
              </div>
              <div
                className="flex flex-col justify-between p-4 rounded-lg border border-red-100 bg-red-50 cursor-pointer"
                onClick={() => navigate('/transactions')}
              >
                <div>
                  <p className="text-xs text-red-700 font-medium">Đợt thanh toán quá hạn</p>
                  <p className="text-2xl font-bold text-red-800 mt-1">
                    {risks.overdueSchedules}
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Đợt thanh toán bị OVERDUE theo lịch cọc.
                  </p>
                </div>
              </div>
              <div
                className="flex flex-col justify-between p-4 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer"
                onClick={() => navigate('/reservations')}
              >
                <div>
                  <p className="text-xs text-gray-700 font-medium">Giữ chỗ hết hạn / lỡ lượt</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {risks.reservations.expiredOrMissed}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Theo dõi tỷ lệ lãng phí queue.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card 
            key={index}
            className={`p-6 bg-gradient-to-br ${action.gradient} text-white cursor-pointer shadow-lg transition transform hover:scale-105`}
            onClick={action.onClick}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm opacity-90">{action.title}</p>
                <p className="text-xl font-bold mt-1">{action.subtitle}</p>
              </div>
              <action.icon className="w-12 h-12 opacity-75" />
            </div>
          </Card>
        ))}
      </div>

      {/* Action center & Recent projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action center */}
        <Card>
          <CardHeader>
            <CardTitle>Việc cần làm</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingBookingsList.length === 0 &&
            pendingDepositsList.length === 0 &&
            pendingPaymentRequestsList.length === 0 ? (
              <p className="text-sm text-gray-500">Không có việc cần xử lý.</p>
            ) : (
              <div className="space-y-3">
                {pendingBookingsList.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">
                        Booking chờ duyệt ({pendingBookingsList.length})
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs px-0"
                        onClick={() => navigate('/bookings')}
                      >
                        Xem tất cả
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {pendingBookingsList.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate('/bookings')}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {b.code} • {b.unit?.code}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {b.customerName} • {b.ctv?.fullName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pendingDepositsList.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">
                        Cọc chờ duyệt ({pendingDepositsList.length})
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs px-0"
                        onClick={() => navigate('/deposits')}
                      >
                        Xem tất cả
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {pendingDepositsList.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate('/deposits')}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {d.code} • {d.unit?.code}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {d.customerName} • {d.ctv?.fullName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pendingPaymentRequestsList.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">
                        Yêu cầu hoa hồng ({pendingPaymentRequestsList.length})
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs px-0"
                        onClick={() => navigate('/payment-requests')}
                      >
                        Xem tất cả
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {pendingPaymentRequestsList.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate('/payment-requests')}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {r.ctv?.fullName}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {formatCurrency(r.amount)} • {r.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Dự án gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Chưa có dự án nào</p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600">
                        {project.code} • {project.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          project.status === 'UPCOMING'
                            ? 'secondary'
                            : project.status === 'OPEN'
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {project.status}
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
