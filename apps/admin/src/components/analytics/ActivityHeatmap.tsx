import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ActivityHeatmapProps {
  data: Array<{
    day: number;
    dayName: string;
    count: number;
  }>;
  title?: string;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data,
  title = 'Hoạt động theo ngày trong tuần',
}) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getIntensity = (count: number) => {
    const percentage = (count / maxCount) * 100;
    if (percentage >= 80) return 'bg-blue-600';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-blue-400';
    if (percentage >= 20) return 'bg-blue-300';
    if (percentage > 0) return 'bg-blue-200';
    return 'bg-gray-100';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-64">
          {data.map((item) => (
            <div key={item.day} className="flex flex-col items-center flex-1 gap-2">
              <div className="text-sm font-medium text-gray-700">{item.dayName}</div>
              <div
                className={`w-full rounded-t ${getIntensity(item.count)} transition-all hover:opacity-80 cursor-pointer`}
                style={{ height: `${Math.max((item.count / maxCount) * 240, 8)}px` }}
                title={`${item.dayName}: ${item.count} hoạt động`}
              />
              <div className="text-xs font-medium text-gray-600">{item.count}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span>Ít</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-300 rounded"></div>
            <span>Trung bình</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Nhiều</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
