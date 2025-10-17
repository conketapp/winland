'use client';

/**
 * 💵 COMMISSIONS PAGE (CTV Portal)
 * Track commission earnings and request withdrawal
 * 
 * @route /commissions
 * @features Total earned, Pending, Paid, Withdrawal request form
 */

import MobileLayout from '@/components/MobileLayout';
import { DollarSign, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function CommissionsPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const commissions = [
    {
      id: '1',
      unitCode: 'A1-08-05',
      amount: 50000000,
      status: 'PAID',
      date: '2025-03-15',
    },
    {
      id: '2',
      unitCode: 'B2-10-12',
      amount: 64000000,
      status: 'PENDING',
      date: '2025-03-20',
    },
  ];

  const summary = {
    total: 114000000,
    pending: 64000000,
    paid: 50000000,
  };

  return (
    <MobileLayout>
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 sticky top-0 z-40">
        <div className="max-w-screen-md mx-auto">
          <h1 className="text-xl font-bold mb-1">Hoa hồng của tôi</h1>
          <p className="text-sm text-green-100">Quản lý thu nhập</p>
        </div>
      </header>

      <div className="max-w-screen-md mx-auto p-4 space-y-6">
        {/* Summary Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center mb-4">
            <DollarSign className="w-8 h-8 mr-2" />
            <div>
              <p className="text-sm opacity-90">Tổng hoa hồng</p>
              <p className="text-3xl font-bold">{formatCurrency(summary.total)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-sm opacity-90">Chờ thanh toán</p>
              <p className="text-xl font-bold">{formatCurrency(summary.pending)}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-sm opacity-90">Đã nhận</p>
              <p className="text-xl font-bold">{formatCurrency(summary.paid)}</p>
            </div>
          </div>

          <button className="w-full mt-4 bg-white text-green-600 font-semibold py-3 px-4 rounded-lg hover:bg-green-50 transition-colors">
            💸 Yêu cầu thanh toán
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">2</div>
            <div className="text-xs text-gray-600">Căn bán</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">1</div>
            <div className="text-xs text-gray-600">Đang xử lý</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">1</div>
            <div className="text-xs text-gray-600">Đã nhận</div>
          </div>
        </div>

        {/* Commissions List */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Lịch sử hoa hồng
          </h2>

          <div className="space-y-3">
            {commissions.map((commission) => (
              <div
                key={commission.id}
                className="bg-white rounded-xl shadow p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      🏠 Căn {commission.unitCode}
                    </h3>
                    <p className="text-sm text-gray-600">{commission.date}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      commission.status === 'PAID'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {commission.status === 'PAID' ? '✅ Đã nhận' : '⏱️ Chờ'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(commission.amount)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Lưu ý:</strong> Hoa hồng sẽ được thanh toán sau khi khách hàng
            hoàn tất thanh toán 100% giá trị căn hộ.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}

