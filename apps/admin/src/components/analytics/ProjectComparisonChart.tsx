import React, { ReactNode } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ProjectComparisonChartProps {
  data: Array<{
    projectId: string;
    projectName: string;
    revenue: number;
    transactions: number;
    percentage: number;
  }>;
  title?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ProjectComparisonChart: React.FC<ProjectComparisonChartProps> = ({
  data,
  title = 'So sánh doanh thu theo dự án',
}) => {
  // Format revenue for display
  const formatRevenue = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} tỷ`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)} triệu`;
    }
    return value.toLocaleString('vi-VN');
  };

  // Limit to top 10 projects for readability
  const displayData = data.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={displayData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={formatRevenue}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="projectName"
              tick={{ fontSize: 12 }}
              width={150}
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
            <Bar dataKey="revenue" name="Doanh thu (VNĐ)" fill="#3b82f6">
              {displayData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
