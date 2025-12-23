import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../lib/utils';
import { Trophy, TrendingUp, DollarSign, Target } from 'lucide-react';

export interface CtvRankingRow {
  rank: number;
  ctvId: string;
  ctvName: string;
  phone?: string | null;
  metrics: {
    reservations: number;
    bookings: number;
    deposits: number;
    sold: number;
    totalRevenue: number;
    totalCommission: number;
    conversionRates: {
      reservationToBooking: number;
      bookingToDeposit: number;
      reservationToSold: number;
    };
    averageDealTime: number;
  };
}

interface CtvRankingTableProps {
  rankings: CtvRankingRow[];
  sortBy: 'deals' | 'revenue' | 'commission' | 'conversion';
  title?: string;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Trophy className="w-5 h-5 text-orange-500" />;
  return <span className="text-gray-500 font-bold">{rank}</span>;
};

const getSortLabel = (sortBy: string) => {
  switch (sortBy) {
    case 'deals':
      return 'Số deal';
    case 'revenue':
      return 'Doanh thu';
    case 'commission':
      return 'Hoa hồng';
    case 'conversion':
      return 'Tỷ lệ chuyển đổi';
    default:
      return '';
  }
};

export const CtvRankingTable: React.FC<CtvRankingTableProps> = ({
  rankings,
  sortBy,
  title,
}) => {
  const getDisplayValue = (ctv: CtvRankingRow) => {
    switch (sortBy) {
      case 'deals':
        return ctv.metrics.sold;
      case 'revenue':
        return ctv.metrics.totalRevenue;
      case 'commission':
        return ctv.metrics.totalCommission;
      case 'conversion':
        return ctv.metrics.conversionRates.reservationToSold;
      default:
        return 0;
    }
  };

  const getIcon = () => {
    switch (sortBy) {
      case 'revenue':
        return <DollarSign className="w-4 h-4" />;
      case 'commission':
        return <DollarSign className="w-4 h-4" />;
      case 'conversion':
        return <Target className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || `Top CTV - ${getSortLabel(sortBy)}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase w-16">
                  Hạng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  CTV
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  {getSortLabel(sortBy)}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Deal bán
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Doanh thu
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Hoa hồng
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Tỷ lệ chuyển đổi
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Thời gian TB (ngày)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rankings.slice(0, 20).map((ctv) => (
                <tr key={ctv.ctvId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      {getRankIcon(ctv.rank)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{ctv.ctvName}</div>
                    {ctv.phone && (
                      <div className="text-xs text-gray-500">{ctv.phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 text-sm font-semibold text-blue-600">
                      {getIcon()}
                      {sortBy === 'revenue' || sortBy === 'commission'
                        ? formatCurrency(getDisplayValue(ctv) as number)
                        : sortBy === 'conversion'
                        ? `${(getDisplayValue(ctv) as number).toFixed(1)}%`
                        : getDisplayValue(ctv)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant="outline">{ctv.metrics.sold}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {formatCurrency(ctv.metrics.totalRevenue)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                    {formatCurrency(ctv.metrics.totalCommission)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant="secondary">
                      {ctv.metrics.conversionRates.reservationToSold.toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {ctv.metrics.averageDealTime > 0
                      ? `${ctv.metrics.averageDealTime.toFixed(0)} ngày`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
