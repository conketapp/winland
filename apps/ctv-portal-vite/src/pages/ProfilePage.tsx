import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Award,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

export default function ProfilePage() {
  // Mock data
  const mockUser = {
    fullName: 'CTV User 1',
    phone: '0901234567',
    email: 'user1@ctv.com',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    joinDate: '15/01/2024',
    level: 'Gold',
    totalDeals: 24,
    totalRevenue: 1250000000,
    avatar: null,
  };

  const menuSections = [
    {
      section: 'Tài khoản',
      items: [
        {
          label: 'Chỉnh sửa thông tin',
          icon: Edit3,
          action: () => alert('Tính năng đang phát triển'),
        },
        {
          label: 'Đổi mật khẩu',
          icon: Shield,
          action: () => alert('Tính năng đang phát triển'),
        },
        {
          label: 'Cài đặt thông báo',
          icon: Bell,
          action: () => alert('Tính năng đang phát triển'),
        },
      ],
    },
    {
      section: 'Hỗ trợ',
      items: [
        {
          label: 'Trung tâm trợ giúp',
          icon: HelpCircle,
          action: () => alert('Tính năng đang phát triển'),
        },
        {
          label: 'Liên hệ hỗ trợ',
          icon: Phone,
          action: () => alert('Tính năng đang phát triển'),
        },
        {
          label: 'Cài đặt ứng dụng',
          icon: Settings,
          action: () => alert('Tính năng đang phát triển'),
        },
      ],
    },
  ];

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      localStorage.removeItem('ctv_token');
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-6 py-8 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{mockUser.fullName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="gradient" size="sm" className="bg-gradient-to-r from-yellow-400 to-orange-500">
                  <Award className="w-3 h-3 mr-1" />
                  {mockUser.level}
                </Badge>
                <span className="text-white/80 text-sm">CTV từ {mockUser.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center">
              <p className="text-white/90 text-sm mb-1 font-medium">Tổng giao dịch</p>
              <p className="text-2xl font-bold text-white">{mockUser.totalDeals}</p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center">
              <p className="text-white/90 text-sm mb-1 font-medium">Tổng doanh số</p>
              <p className="text-lg font-bold text-white">{formatCurrency(mockUser.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Personal Info */}
        <Card variant="elevated" padding="md" className="animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Thông tin cá nhân</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Thông tin cơ bản của bạn</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-semibold text-gray-900">{mockUser.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{mockUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Địa chỉ</p>
                <p className="font-semibold text-gray-900">{mockUser.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Ngày tham gia</p>
                <p className="font-semibold text-gray-900">{mockUser.joinDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <Card 
            key={section.section} 
            variant="elevated" 
            padding="md" 
            className="animate-slide-up"
            style={{ animationDelay: `${0.1 + sectionIndex * 0.1}s` }}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-900">{section.section}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </div>
                    <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-sm">›</span>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        ))}

        {/* Logout Button */}
        <Button
          variant="error"
          fullWidth
          size="lg"
          onClick={handleLogout}
          className="animate-slide-up"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Đăng xuất
        </Button>

        {/* App Version */}
        <div className="text-center animate-slide-up">
          <p className="text-sm text-gray-500">
            CTV Portal v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
