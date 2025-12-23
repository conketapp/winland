import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp } from 'lucide-react';

interface ProjectPerformanceTableProps {
  data: Array<{
    rank: number;
    projectId: string;
    projectName: string;
    projectCode: string;
    metrics: {
      totalUnits: number;
      availableUnits: number;
      reservedUnits: number;
      depositedUnits: number;
      soldUnits: number;
      salesRate: number;
      totalRevenue: number;
      totalTransactions: number;
      averageSellingTime: number;
      priceAnalysis: {
        highest: number;
        lowest: number;
        average: number;
      };
    };
  }>;
  title?: string;
}

export const ProjectPerformanceTable: React.FC<ProjectPerformanceTableProps> = ({
  data,
  title = 'Hiệu suất dự án',
}) => {
  const getSalesRateColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 50) return 'bg-blue-100 text-blue-800';
    if (rate >= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase w-16">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Dự án
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                  Tổng căn
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                  Đã bán
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                  Tỷ lệ bán
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Doanh thu
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Giá TB
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                  Thời gian bán TB (ngày)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((project) => (
                <tr key={project.projectId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-500">
                        #{project.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {project.projectName}
                    </div>
                    <div className="text-xs text-gray-500">{project.projectCode}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline">{project.metrics.totalUnits}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">
                        {project.metrics.soldUnits}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={getSalesRateColor(project.metrics.salesRate)}>
                      {project.metrics.salesRate.toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(project.metrics.totalRevenue)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm text-gray-600">
                      {formatCurrency(project.metrics.priceAnalysis.average)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(project.metrics.priceAnalysis.lowest)} -{' '}
                      {formatCurrency(project.metrics.priceAnalysis.highest)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {project.metrics.averageSellingTime > 0
                      ? `${project.metrics.averageSellingTime.toFixed(0)} ngày`
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
