'use client';

/**
 * 📊 DASHBOARD PAGE (CTV Portal)
 * CTV home screen with stats and quick actions
 * 
 * @route /dashboard
 * @features Real-time stats, Expiring reservations, Pending bookings, Quick actions
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { Bell, Clock, TrendingUp, FileText, DollarSign, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';

interface DashboardStats {
  reservations: number;
  bookings: number;
  deposits: number;
  totalCommission: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    reservations: 0,
    bookings: 0,
    deposits: 0,
    totalCommission: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('ctv_token');
    const userData = localStorage.getItem('ctv_user');
    
    if (!token || !userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadDashboardData(parsedUser.id);
  }, [router]);

  const loadDashboardData = async (ctvId: string) => {
    try {
      setError(null);
      // In future: GET /api/dashboard/ctv-stats
      // For now, fetch individual counts
      const [reservations, bookings, deposits] = await Promise.all([
        apiClient.get('/reservations').catch(() => []),
        apiClient.get('/bookings').catch(() => []),
        apiClient.get('/deposits').catch(() => []),
      ]);

      setStats({
        reservations: Array.isArray(reservations) ? reservations.filter((r: any) => r.ctvId === ctvId).length : 0,
        bookings: Array.isArray(bookings) ? bookings.filter((b: any) => b.ctvId === ctvId).length : 0,
        deposits: Array.isArray(deposits) ? deposits.filter((d: any) => d.ctvId === ctvId).length : 0,
        totalCommission: 0,
      });
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError(error.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (loading || !user) {
    return (
      <MobileLayout>
        <LoadingState message="Đang tải dashboard..." type="page" />
      </MobileLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <MobileLayout>
        <ErrorState 
          title="Không thể tải dữ liệu"
          message={error}
          onRetry={() => user && loadDashboardData(user.id)}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-screen-md mx-auto">
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <p className="text-sm text-blue-100">Xin chào, {user.fullName}</p>
          </div>
          <button className="relative p-2 hover:bg-blue-500 rounded-full">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <div className="max-w-screen-md mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : stats.reservations}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Giữ chỗ</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {loading ? '...' : stats.bookings}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Booking</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : stats.deposits}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Đã cọc</div>
            </CardContent>
          </Card>
        </div>

        {/* Expiring Reservations */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Giữ chỗ sắp hết hạn
            </h2>
            <span className="text-sm text-red-600 font-medium">2 căn</span>
          </div>

          <div className="space-y-3">
            {[
              {
                code: 'A1-08-05',
                bedrooms: 2,
                area: 75,
                price: '2.5 tỷ',
                customer: 'Nguyễn Văn A',
                timeLeft: '02:15:30',
              },
              {
                code: 'B2-10-12',
                bedrooms: 3,
                area: 85,
                price: '3.2 tỷ',
                customer: 'Trần Thị B',
                timeLeft: '05:40:15',
              },
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">🏠 {item.code}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.bedrooms}PN • {item.area}m² • {item.price}
                      </p>
                    </div>
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.timeLeft}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Khách: {item.customer}
                  </p>
                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">Gia hạn</Button>
                    <Button className="flex-1" size="sm" variant="default">Booking</Button>
                    <Button className="flex-1" size="sm" variant="outline">Hủy</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pending Bookings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Booking chờ duyệt
            </h2>
            <span className="text-sm text-orange-600 font-medium">1 căn</span>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">🏠 C1-15-03</h3>
                  <p className="text-sm text-muted-foreground">3PN • 95m² • 4.5 tỷ</p>
                </div>
                <Badge variant="secondary">Chờ duyệt</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Khách: Phạm Văn C</p>
              <p className="text-sm text-muted-foreground">Booking: 10,000,000 VNĐ</p>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Thao tác nhanh
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-sm">Tạo phiếu</h3>
                <p className="text-xs text-muted-foreground mt-1">Giữ chỗ/Booking</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-sm">Hoa hồng</h3>
                <p className="text-xs text-muted-foreground mt-1">Xem & rút tiền</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-sm">Thống kê</h3>
                <p className="text-xs text-muted-foreground mt-1">Doanh số tháng</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-sm">Lịch sử</h3>
                <p className="text-xs text-muted-foreground mt-1">Giao dịch</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}

