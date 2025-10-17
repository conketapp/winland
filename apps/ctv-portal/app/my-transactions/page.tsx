'use client';

/**
 * 📋 MY TRANSACTIONS PAGE (CTV Portal)
 * View all transaction history
 * 
 * @route /my-transactions
 * @features Filter by type (Reservation/Booking/Deposit), Status badges, Stats
 */

import { useState, useEffect } from 'react';
import MobileLayout from '../../components/MobileLayout';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { formatCurrency, formatDate } from '../../lib/format';
import { apiClient } from '../../lib/api';
import { FileText, Calendar, DollarSign } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'RESERVATION' | 'BOOKING' | 'DEPOSIT';
  unitCode: string;
  customerName: string;
  amount?: number;
  status: string;
  createdAt: string;
}

export default function MyTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'RESERVATION' | 'BOOKING' | 'DEPOSIT'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      // API call: GET /transactions/me
      // const data = await apiClient.get('/transactions/me');
      // setTransactions(data);
      
      // Mock data for now
      setTransactions([]);
    } catch (error: any) {
      console.error('Failed to load transactions:', error);
      setError(error.message || 'Không thể tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RESERVATION':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'BOOKING':
        return <FileText className="w-5 h-5 text-yellow-600" />;
      case 'DEPOSIT':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RESERVATION':
        return 'bg-blue-100 text-blue-800';
      case 'BOOKING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DEPOSIT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'bg-orange-100 text-orange-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'Chờ duyệt';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Bị từ chối';
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'EXPIRED':
        return 'Hết hạn';
      default:
        return status;
    }
  };

  const filteredTransactions =
    filter === 'all'
      ? transactions
      : transactions.filter((t) => t.type === filter);

  // Loading State
  if (loading) {
    return (
      <MobileLayout>
        <LoadingState message="Đang tải lịch sử giao dịch..." type="page" />
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
          onRetry={loadTransactions}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="pb-24 space-y-4">
        {/* Header */}
        <div className="bg-white p-4 border-b">
          <h1 className="text-2xl font-bold">Lịch sử giao dịch</h1>
          <p className="text-gray-600 text-sm">Quản lý Giữ chỗ, Booking, Cọc</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 px-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('RESERVATION')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === 'RESERVATION'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Giữ chỗ
          </button>
          <button
            onClick={() => setFilter('BOOKING')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === 'BOOKING'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Booking
          </button>
          <button
            onClick={() => setFilter('DEPOSIT')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === 'DEPOSIT'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Cọc
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-4">
          <Card className="p-4">
            <div className="text-xs text-gray-600 mb-1">Giữ chỗ</div>
            <div className="text-xl font-bold">
              {transactions.filter((t) => t.type === 'RESERVATION').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-gray-600 mb-1">Booking</div>
            <div className="text-xl font-bold">
              {transactions.filter((t) => t.type === 'BOOKING').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-gray-600 mb-1">Cọc</div>
            <div className="text-xl font-bold">
              {transactions.filter((t) => t.type === 'DEPOSIT').length}
            </div>
          </Card>
        </div>

        {/* Transactions List */}
        <div className="px-4">
          {filteredTransactions.length === 0 ? (
            <EmptyState 
              title="Chưa có giao dịch nào"
              description={filter === 'all' ? 'Bạn chưa thực hiện giao dịch nào' : 'Không có giao dịch thuộc loại này'}
              icon={<FileText className="w-16 h-16 text-gray-400" />}
            />
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <Badge className={getTypeColor(transaction.type)}>
                          {transaction.type === 'RESERVATION'
                            ? 'Giữ chỗ'
                            : transaction.type === 'BOOKING'
                            ? 'Booking'
                            : 'Cọc'}
                        </Badge>
                      </div>
                      <Badge className={getStatusColor(transaction.status)}>
                        {getStatusLabel(transaction.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="font-semibold text-lg">{transaction.unitCode}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.customerName}
                        </p>
                      </div>

                      {transaction.amount && (
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(transaction.amount)}
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
