import { 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Star,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  // Mock data - giữ nguyên logic
  const mockStats = {
    reservations: 0,
    bookings: 0,
    deposits: 0,
  };

  const mockUser = {
    fullName: 'CTV User 1',
    level: 'Gold',
    totalDeals: 24,
    totalRevenue: 1250000000,
  };

  const mockUrgentReservations = [
    {
      id: 1,
      unitCode: 'A1-1201',
      customerName: 'Nguyễn Văn A',
      expiryTime: '2 giờ',
      phone: '0901234567',
    },
    {
      id: 2,
      unitCode: 'B2-0803',
      customerName: 'Trần Thị B',
      expiryTime: '4 giờ',
      phone: '0901234568',
    },
  ];

  const mockRecentBookings = [
    {
      id: 1,
      unitCode: 'A1-1502',
      customerName: 'Lê Văn C',
      bookingDate: '2024-01-15',
      amount: 50000000,
      status: 'PENDING',
    },
    {
      id: 2,
      unitCode: 'B2-1005',
      customerName: 'Phạm Thị D',
      bookingDate: '2024-01-14',
      amount: 45000000,
      status: 'APPROVED',
    },
  ];

  const quickActions = [
    {
      title: 'Giữ chỗ mới',
      description: 'Tạo yêu cầu giữ chỗ',
      icon: Clock,
      color: 'from-emerald-500 to-green-600',
      action: () => alert('Tính năng đang phát triển'),
    },
    {
      title: 'Xem căn hộ',
      description: 'Duyệt danh sách căn hộ',
      icon: LayoutDashboard,
      color: 'from-blue-500 to-cyan-600',
      action: () => window.location.href = '/units',
    },
    {
      title: 'Giao dịch',
      description: 'Xem lịch sử giao dịch',
      icon: TrendingUp,
      color: 'from-purple-500 to-violet-600',
      action: () => window.location.href = '/transactions',
    },
    {
      title: 'Hoa hồng',
      description: 'Kiểm tra thu nhập',
      icon: DollarSign,
      color: 'from-amber-500 to-orange-600',
      action: () => window.location.href = '/commissions',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-6 py-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-white/80 text-sm">Chào mừng trở lại!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Bell className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Star className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* User info card */}
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{mockUser.fullName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="gradient" size="sm" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    <Award className="w-3 h-3 mr-1" />
                    {mockUser.level}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/90 text-sm font-medium">Tổng giao dịch</p>
                <p className="text-xl font-bold text-white">{mockUser.totalDeals}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Stats Cards - Modern Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Green Card - Giữ chỗ */}
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Giữ chỗ</p>
                <p className="text-2xl font-bold mt-1">{mockStats.reservations}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Blue Card - Booking */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Booking</p>
                <p className="text-2xl font-bold mt-1">{mockStats.bookings}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Purple Card - Đã cọc */}
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Đã cọc</p>
                <p className="text-2xl font-bold mt-1">{mockStats.deposits}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Orange Card - Doanh số */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Doanh số</p>
                <p className="text-lg font-bold mt-1">{formatCurrency(mockUser.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Urgent Reservations */}
        {mockUrgentReservations.length > 0 && (
          <Card variant="elevated" padding="md" className="animate-slide-up">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Giữ chỗ sắp hết hạn</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Cần xử lý ngay</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockUrgentReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{reservation.unitCode}</p>
                      <p className="text-sm text-gray-600">{reservation.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="error" size="sm" className="bg-red-500 text-white">
                      {reservation.expiryTime}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{reservation.phone}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Bookings */}
        <Card variant="elevated" padding="md" className="animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Booking gần đây</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Các giao dịch mới nhất</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600">
                Xem tất cả
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockRecentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{booking.unitCode}</p>
                    <p className="text-sm text-gray-600">{booking.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(booking.amount)}</p>
                  <Badge 
                    variant={booking.status === 'APPROVED' ? 'success' : 'warning'} 
                    size="sm"
                  >
                    {booking.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card variant="elevated" padding="md" className="animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Thao tác nhanh</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Các chức năng thường dùng</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.title}
                    onClick={action.action}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center mb-3 mx-auto`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{action.title}</h3>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}