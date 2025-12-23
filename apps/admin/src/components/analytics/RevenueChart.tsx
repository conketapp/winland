import React, { ReactNode } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface RevenueChartProps {
  data: Array<{
    period: string;
    revenue: number;
    transactions: number;
    projects?: number;
  }>;
  type?: 'line' | 'bar';
  title?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  type = 'line',
  title = 'Doanh thu theo thời gian',
}) => {
  // Format revenue for display (billions VND)
  const formatRevenue = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} tỷ`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)} triệu`;
    }
    return value.toLocaleString('vi-VN');
  };

  const ChartComponent = type === 'line' ? LineChart : BarChart;
  const DataComponent = type === 'line' ? Line : Bar;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickFormatter={formatRevenue}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: unknown): ReactNode => {
                if (typeof value === 'number') {
                  return `${formatRevenue(value)} VNĐ`;
                }
                return String(value);
              }}
              labelStyle={{ color: '#000' }}
            />
            <Legend />
            <DataComponent
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fill="#3b82f6"
              name="Doanh thu (VNĐ)"
            />
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
