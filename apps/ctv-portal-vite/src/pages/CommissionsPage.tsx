import { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CommissionsPage() {
  const [selectedTab, setSelectedTab] = useState('all');

  // Mock data
  const mockSummary = {
    totalEarned: 250000000,
    pending: 50000000,
    availableForWithdrawal: 200000000,
    thisMonth: 75000000,
  };

  const mockCommissions = [
    {
      id: 1,
      unitCode: 'LK1-1201',
      customerName: 'Nguyễn Văn A',
      amount: 25000000,
      status: 'APPROVED',
      date: '2024-01-15',
      type: 'BOOKING',
    },
    {
      id: 2,
      unitCode: 'LK1-1202',
      customerName: 'Trần Thị B',
      amount: 25000000,
      status: 'PENDING',
      date: '2024-01-14',
      type: 'RESERVATION',
    },
    {
      id: 3,
      unitCode: 'LK1-1203',
      customerName: 'Lê Văn C',
      amount: 25000000,
      status: 'PAID',
      date: '2024-01-13',
      type: 'BOOKING',
    },
    {
      id: 4,
      unitCode: 'LK1-1204',
      customerName: 'Phạm Thị D',
      amount: 25000000,
      status: 'REJECTED',
      date: '2024-01-12',
      type: 'RESERVATION',
    },
  ];

  const getStatusInfo = (status: string) => {
    const statusMap = {
      PENDING: { 
        label: 'Chờ duyệt', 
        color: 'from-amber-500 to-orange-600',
        icon: Clock
      },
      APPROVED: { 
        label: 'Đã duyệt', 
        color: 'from-blue-500 to-cyan-600',
        icon: CheckCircle
      },
      PAID: { 
        label: 'Đã chi trả', 
        color: 'from-emerald-500 to-green-600',
        icon: CheckCircle
      },
      REJECTED: { 
        label: 'Từ chối', 
        color: 'from-red-500 to-rose-600',
        icon: XCircle
      },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
  };

  const getTypeInfo = (type: string) => {
    const typeMap = {
      RESERVATION: { 
        label: 'Giữ chỗ', 
        color: 'from-emerald-500 to-green-600'
      },
      BOOKING: { 
        label: 'Booking', 
        color: 'from-purple-500 to-violet-600'
      },
    };
    return typeMap[type as keyof typeof typeMap] || typeMap.RESERVATION;
  };

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ duyệt' },
    { id: 'approved', label: 'Đã duyệt' },
    { id: 'paid', label: 'Đã chi trả' },
  ];

  const filteredCommissions = mockCommissions.filter(commission => {
    if (selectedTab === 'all') return true;
    return commission.status.toLowerCase() === selectedTab.toUpperCase();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-6 py-8 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hoa hồng</h1>
              <p className="text-white/80 text-sm">Quản lý thu nhập của bạn</p>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
            <div className="text-center mb-6">
              <p className="text-white/90 text-sm mb-2 font-medium">Tổng hoa hồng</p>
              <p className="text-4xl font-bold text-white">{formatCurrency(mockSummary.totalEarned)}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-white/90 text-xs font-medium">Chờ duyệt</p>
                <p className="text-lg font-bold text-white">{formatCurrency(mockSummary.pending)}</p>
              </div>
              <div className="text-center">
                <p className="text-white/90 text-xs font-medium">Có thể rút</p>
                <p className="text-lg font-bold text-white">{formatCurrency(mockSummary.availableForWithdrawal)}</p>
              </div>
              <div className="text-center">
                <p className="text-white/90 text-xs font-medium">Tháng này</p>
                <p className="text-lg font-bold text-white">{formatCurrency(mockSummary.thisMonth)}</p>
              </div>
            </div>

            <Button 
              variant="gradient" 
              fullWidth 
              size="lg" 
              className="bg-white text-green-600 hover:bg-white/90 font-bold"
              onClick={() => alert('Tính năng rút tiền đang phát triển')}
            >
              <ArrowUpRight className="w-5 h-5 mr-2" />
              Yêu cầu rút tiền
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Tabs */}
        <Card variant="elevated" padding="sm" className="animate-slide-up">
          <CardContent className="p-0">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                    selectedTab === tab.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Commissions List */}
        <div className="space-y-4">
          {filteredCommissions.map((commission, index) => {
            const statusInfo = getStatusInfo(commission.status);
            const typeInfo = getTypeInfo(commission.type);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card 
                key={commission.id} 
                variant="elevated" 
                padding="md" 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Type Icon */}
                      <div className={`w-12 h-12 bg-gradient-to-r ${typeInfo.color} rounded-2xl flex items-center justify-center`}>
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-gray-900">{commission.unitCode}</h3>
                        <p className="text-sm text-gray-600">{commission.customerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="gradient" 
                            size="sm" 
                            className={`bg-gradient-to-r ${typeInfo.color} text-white`}
                          >
                            {typeInfo.label}
                          </Badge>
                          <span className="text-xs text-gray-500">{formatDate(commission.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(commission.amount)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <StatusIcon className="w-4 h-4 text-gray-400" />
                        <Badge 
                          variant="gradient" 
                          size="sm" 
                          className={`bg-gradient-to-r ${statusInfo.color} text-white`}
                        >
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCommissions.length === 0 && (
          <Card variant="elevated" padding="lg" className="text-center animate-slide-up">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có hoa hồng</h3>
              <p className="text-gray-600 mb-4">Bạn chưa có giao dịch nào trong trạng thái này</p>
              <Button 
                variant="secondary" 
                onClick={() => setSelectedTab('all')}
              >
                Xem tất cả
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
