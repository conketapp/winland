import React, { useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle,
  Calendar,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function TransactionsPage() {
  const [selectedTab, setSelectedTab] = useState('all');

  // Mock data
  const mockSummary = {
    totalTransactions: 24,
    totalAmount: 1250000000,
    thisMonth: 5,
    thisMonthAmount: 250000000,
  };

  const mockTransactions = [
    {
      id: 1,
      type: 'RESERVATION',
      unitCode: 'LK1-1201',
      customerName: 'Nguyễn Văn A',
      amount: 50000000,
      status: 'ACTIVE',
      date: '2024-01-15T10:30:00',
      commission: 25000000,
    },
    {
      id: 2,
      type: 'BOOKING',
      unitCode: 'LK1-1202',
      customerName: 'Trần Thị B',
      amount: 2500000000,
      status: 'APPROVED',
      date: '2024-01-14T14:20:00',
      commission: 25000000,
    },
    {
      id: 3,
      type: 'DEPOSIT',
      unitCode: 'LK1-1203',
      customerName: 'Lê Văn C',
      amount: 500000000,
      status: 'PENDING',
      date: '2024-01-13T09:15:00',
      commission: 25000000,
    },
    {
      id: 4,
      type: 'RESERVATION',
      unitCode: 'LK1-1204',
      customerName: 'Phạm Thị D',
      amount: 50000000,
      status: 'EXPIRED',
      date: '2024-01-12T16:45:00',
      commission: 25000000,
    },
  ];

  const getTypeInfo = (type: string) => {
    const typeMap = {
      RESERVATION: { 
        label: 'Giữ chỗ', 
        color: 'from-emerald-500 to-green-600',
        icon: Clock
      },
      BOOKING: { 
        label: 'Booking', 
        color: 'from-violet-500 to-purple-600',
        icon: FileText
      },
      DEPOSIT: { 
        label: 'Đặt cọc', 
        color: 'from-amber-500 to-orange-600',
        icon: TrendingUp
      },
    };
    return typeMap[type as keyof typeof typeMap] || typeMap.RESERVATION;
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      ACTIVE: { 
        label: 'Đang hoạt động', 
        color: 'from-emerald-500 to-green-600',
        icon: CheckCircle
      },
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
      REJECTED: { 
        label: 'Từ chối', 
        color: 'from-red-500 to-rose-600',
        icon: XCircle
      },
      EXPIRED: { 
        label: 'Hết hạn', 
        color: 'from-gray-500 to-gray-600',
        icon: XCircle
      },
      CANCELLED: { 
        label: 'Đã hủy', 
        color: 'from-gray-500 to-gray-600',
        icon: XCircle
      },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
  };

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'reservation', label: 'Giữ chỗ' },
    { id: 'booking', label: 'Booking' },
    { id: 'deposit', label: 'Đặt cọc' },
  ];

  const filteredTransactions = mockTransactions.filter(transaction => {
    if (selectedTab === 'all') return true;
    return transaction.type.toLowerCase() === selectedTab.toUpperCase();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-6 py-8 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Giao dịch</h1>
              <p className="text-white/80 text-sm">Lịch sử giao dịch của bạn</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center">
              <p className="text-white/90 text-sm mb-1 font-medium">Tổng giao dịch</p>
              <p className="text-2xl font-bold text-white">{mockSummary.totalTransactions}</p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center">
              <p className="text-white/90 text-sm mb-1 font-medium">Tổng giá trị</p>
              <p className="text-lg font-bold text-white">{formatCurrency(mockSummary.totalAmount)}</p>
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm font-medium">Tháng này</p>
                <p className="text-xl font-bold text-white">{mockSummary.thisMonth} giao dịch</p>
              </div>
              <div className="text-right">
                <p className="text-white/90 text-sm font-medium">Tổng giá trị</p>
                <p className="text-lg font-bold text-white">{formatCurrency(mockSummary.thisMonthAmount)}</p>
              </div>
            </div>
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
                      ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.map((transaction, index) => {
            const typeInfo = getTypeInfo(transaction.type);
            const statusInfo = getStatusInfo(transaction.status);
            const TypeIcon = typeInfo.icon;
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card 
                key={transaction.id} 
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
                        <TypeIcon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-gray-900">{transaction.unitCode}</h3>
                        <p className="text-sm text-gray-600">{transaction.customerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="gradient" 
                            size="sm" 
                            className={`bg-gradient-to-r ${typeInfo.color} text-white`}
                          >
                            {typeInfo.label}
                          </Badge>
                          <span className="text-xs text-gray-500">{formatDateTime(transaction.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(transaction.amount)}</p>
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
                      <p className="text-xs text-purple-600 mt-1 font-medium">
                        HH: {formatCurrency(transaction.commission)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <Card variant="elevated" padding="lg" className="text-center animate-slide-up">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có giao dịch</h3>
              <p className="text-gray-600 mb-4">Bạn chưa có giao dịch nào trong loại này</p>
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
