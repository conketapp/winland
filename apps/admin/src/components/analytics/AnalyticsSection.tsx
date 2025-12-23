import React, { useState, useEffect } from 'react';
import {
  dashboardApi,
  AnalyticsPeriod,
  AnalyticsTimeRange,
  type RevenueAnalytics,
  type CtvPerformanceAnalytics,
  type ProjectPerformanceAnalytics,
} from '../../api/dashboard.api';
import {
  RevenueChart,
  ProjectComparisonChart,
  CtvRankingTable,
  ActivityHeatmap,
  ProjectPerformanceTable,
  type CtvRankingRow,
} from './index';
import LoadingState from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { TrendingUp, Users, Building2 } from 'lucide-react';

export const AnalyticsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'ctv' | 'projects'>('revenue');
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>(AnalyticsTimeRange.LAST_30_DAYS);
  const [period, setPeriod] = useState<AnalyticsPeriod>(AnalyticsPeriod.MONTH);

  // Revenue Analytics
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  // CTV Performance
  const [ctvData, setCtvData] = useState<CtvPerformanceAnalytics | null>(null);
  const [ctvLoading, setCtvLoading] = useState(false);
  const [ctvError, setCtvError] = useState<string | null>(null);

  // Project Performance
  const [projectData, setProjectData] = useState<ProjectPerformanceAnalytics | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  useEffect(() => {
    loadRevenueAnalytics();
  }, [timeRange, period]);

  useEffect(() => {
    if (activeTab === 'ctv') {
      loadCtvPerformance();
    } else if (activeTab === 'projects') {
      loadProjectPerformance();
    }
  }, [activeTab, timeRange]);

  const loadRevenueAnalytics = async () => {
    try {
      setRevenueLoading(true);
      setRevenueError(null);
      const data = await dashboardApi.getRevenueAnalytics({
        timeRange,
        period,
      });
      setRevenueData(data);
    } catch (err: unknown) {
      console.error('Error loading revenue analytics:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu doanh thu';
      setRevenueError(errorMessage);
    } finally {
      setRevenueLoading(false);
    }
  };

  const loadCtvPerformance = async () => {
    try {
      setCtvLoading(true);
      setCtvError(null);
      const data = await dashboardApi.getCtvPerformanceAnalytics({
        timeRange,
      });
      setCtvData(data);
    } catch (err: unknown) {
      console.error('Error loading CTV performance:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu CTV';
      setCtvError(errorMessage);
    } finally {
      setCtvLoading(false);
    }
  };

  const loadProjectPerformance = async () => {
    try {
      setProjectLoading(true);
      setProjectError(null);
      const data = await dashboardApi.getProjectPerformanceAnalytics({
        timeRange,
      });
      setProjectData(data);
    } catch (err: unknown) {
      console.error('Error loading project performance:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu dự án';
      setProjectError(errorMessage);
    } finally {
      setProjectLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Khoảng thời gian:</label>
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as AnalyticsTimeRange)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AnalyticsTimeRange.LAST_7_DAYS}>7 ngày qua</SelectItem>
                <SelectItem value={AnalyticsTimeRange.LAST_30_DAYS}>30 ngày qua</SelectItem>
                <SelectItem value={AnalyticsTimeRange.LAST_90_DAYS}>90 ngày qua</SelectItem>
                <SelectItem value={AnalyticsTimeRange.LAST_6_MONTHS}>6 tháng qua</SelectItem>
                <SelectItem value={AnalyticsTimeRange.LAST_YEAR}>1 năm qua</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {activeTab === 'revenue' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Nhóm theo:</label>
              <Select value={period} onValueChange={(value) => setPeriod(value as AnalyticsPeriod)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AnalyticsPeriod.DAY}>Ngày</SelectItem>
                  <SelectItem value={AnalyticsPeriod.WEEK}>Tuần</SelectItem>
                  <SelectItem value={AnalyticsPeriod.MONTH}>Tháng</SelectItem>
                  <SelectItem value={AnalyticsPeriod.QUARTER}>Quý</SelectItem>
                  <SelectItem value={AnalyticsPeriod.YEAR}>Năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Doanh thu
          </TabsTrigger>
          <TabsTrigger value="ctv" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            CTV
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Dự án
          </TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6 mt-6">
          {revenueLoading ? (
            <LoadingState message="Đang tải dữ liệu doanh thu..." />
          ) : revenueError ? (
            <ErrorState
              title="Lỗi tải dữ liệu doanh thu"
              description={revenueError}
              onRetry={loadRevenueAnalytics}
            />
          ) : revenueData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">Tổng doanh thu</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {revenueData.summary.totalRevenue.toLocaleString('vi-VN')} VNĐ
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">Tổng giao dịch</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {revenueData.summary.totalTransactions}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">Giá trị TB/giao dịch</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {revenueData.summary.averageTransactionValue.toLocaleString('vi-VN')} VNĐ
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">Số dự án</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {revenueData.projectComparison.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Trend Chart */}
              <RevenueChart data={revenueData.trend} title="Xu hướng doanh thu" />

              {/* Project Comparison */}
              {revenueData.projectComparison.length > 0 && (
                <ProjectComparisonChart
                  data={revenueData.projectComparison}
                  title="So sánh doanh thu theo dự án"
                />
              )}
            </>
          ) : null}
        </TabsContent>

        {/* CTV Performance Tab */}
        <TabsContent value="ctv" className="space-y-6 mt-6">
          {ctvLoading ? (
            <LoadingState message="Đang tải dữ liệu CTV..." />
          ) : ctvError ? (
            <ErrorState
              title="Lỗi tải dữ liệu CTV"
              description={ctvError}
              onRetry={loadCtvPerformance}
            />
          ) : ctvData ? (
            <>
              {/* Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">Tổng số CTV</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {ctvData.summary.totalCtv}
                  </div>
                </CardContent>
              </Card>

              {/* Rankings */}
              <div className="space-y-6">
                <CtvRankingTable
                  rankings={ctvData.rankings.byDeals as CtvRankingRow[]}
                  sortBy="deals"
                  title="Top CTV - Số deal bán"
                />
                <CtvRankingTable
                  rankings={ctvData.rankings.byRevenue as CtvRankingRow[]}
                  sortBy="revenue"
                  title="Top CTV - Doanh thu"
                />
                <CtvRankingTable
                  rankings={ctvData.rankings.byCommission as CtvRankingRow[]}
                  sortBy="commission"
                  title="Top CTV - Hoa hồng"
                />
                <CtvRankingTable
                  rankings={ctvData.rankings.byConversion as CtvRankingRow[]}
                  sortBy="conversion"
                  title="Top CTV - Tỷ lệ chuyển đổi"
                />
              </div>

              {/* Activity Heatmap */}
              <ActivityHeatmap data={ctvData.activityHeatmap} />
            </>
          ) : null}
        </TabsContent>

        {/* Project Performance Tab */}
        <TabsContent value="projects" className="space-y-6 mt-6">
          {projectLoading ? (
            <LoadingState message="Đang tải dữ liệu dự án..." />
          ) : projectError ? (
            <ErrorState
              title="Lỗi tải dữ liệu dự án"
              description={projectError}
              onRetry={loadProjectPerformance}
            />
          ) : projectData ? (
            <>
              {/* Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">Tổng số dự án</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {projectData.summary.totalProjects}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Table */}
              <ProjectPerformanceTable data={projectData.sortedBySalesRate} />
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};
