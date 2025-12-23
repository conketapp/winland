import React, { useEffect, useState } from 'react';
import {
  reportsApi,
  type SalesReportResponse,
  type SalesGroupBy,
  type CommissionReportResponse,
  type TransactionReportResponse,
  type InventoryReportResponse,
} from '../../api/reports.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import LoadingState from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp, DollarSign, Receipt, Package, RefreshCw } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'commission' | 'transaction' | 'inventory'>('sales');
  const [groupBy, setGroupBy] = useState<SalesGroupBy>('project');

  // Sales Report
  const [salesData, setSalesData] = useState<SalesReportResponse | null>(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState<string | null>(null);

  // Commission Report
  const [commissionData, setCommissionData] = useState<CommissionReportResponse | null>(null);
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [commissionError, setCommissionError] = useState<string | null>(null);

  // Transaction Report
  const [transactionData, setTransactionData] = useState<TransactionReportResponse | null>(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Inventory Report
  const [inventoryData, setInventoryData] = useState<InventoryReportResponse | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'sales') {
      void loadSalesReport();
    } else if (activeTab === 'commission') {
      void loadCommissionReport();
    } else if (activeTab === 'transaction') {
      void loadTransactionReport();
    } else if (activeTab === 'inventory') {
      void loadInventoryReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, groupBy]);

  const loadSalesReport = async () => {
    try {
      setSalesLoading(true);
      setSalesError(null);
      const res = await reportsApi.getSalesReport({
        groupBy,
      });
      setSalesData(res);
    } catch (err: unknown) {
      console.error('Error loading sales report:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Không thể tải báo cáo bán hàng';
      setSalesError(errorMessage);
    } finally {
      setSalesLoading(false);
    }
  };

  const loadCommissionReport = async () => {
    try {
      setCommissionLoading(true);
      setCommissionError(null);
      const res = await reportsApi.getCommissionReport({ groupBy: 'CTV' });
      setCommissionData(res);
    } catch (err: unknown) {
      console.error('Error loading commission report:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Không thể tải báo cáo hoa hồng';
      setCommissionError(errorMessage);
    } finally {
      setCommissionLoading(false);
    }
  };

  const loadTransactionReport = async () => {
    try {
      setTransactionLoading(true);
      setTransactionError(null);
      const res = await reportsApi.getTransactionReport();
      setTransactionData(res);
    } catch (err: unknown) {
      console.error('Error loading transaction report:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Không thể tải báo cáo giao dịch';
      setTransactionError(errorMessage);
    } finally {
      setTransactionLoading(false);
    }
  };

  const loadInventoryReport = async () => {
    try {
      setInventoryLoading(true);
      setInventoryError(null);
      const res = await reportsApi.getInventoryReport();
      setInventoryData(res);
    } catch (err: unknown) {
      console.error('Error loading inventory report:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Không thể tải báo cáo tồn kho';
      setInventoryError(errorMessage);
    } finally {
      setInventoryLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        title="Báo cáo chi tiết"
        description="Xem báo cáo bán hàng, hoa hồng, giao dịch và tồn kho"
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 h-auto">
          <TabsTrigger value="sales" className="flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5">
            <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Bán hàng</span>
            <span className="sm:hidden">Bán</span>
          </TabsTrigger>
          <TabsTrigger value="commission" className="flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5">
            <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Hoa hồng</span>
            <span className="sm:hidden">HH</span>
          </TabsTrigger>
          <TabsTrigger value="transaction" className="flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5">
            <Receipt className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Giao dịch</span>
            <span className="sm:hidden">GD</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5">
            <Package className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Tồn kho</span>
            <span className="sm:hidden">TK</span>
          </TabsTrigger>
        </TabsList>

        {/* Sales Report Tab */}
        <TabsContent value="sales" className="space-y-6 mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4 flex flex-wrap items-center gap-4">
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600 uppercase">Nhóm theo</div>
                <Select
                  value={groupBy}
                  onValueChange={(value) => setGroupBy(value as SalesGroupBy)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Dự án</SelectItem>
                    <SelectItem value="ctv">CTV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1" />
              <Button variant="outline" size="sm" onClick={() => void loadSalesReport()}>
                Làm mới
              </Button>
            </CardContent>
          </Card>

          {salesLoading ? (
            <LoadingState message="Đang tải báo cáo bán hàng..." />
          ) : salesError ? (
            <ErrorState
              title="Lỗi tải báo cáo bán hàng"
              description={salesError}
              onRetry={loadSalesReport}
            />
          ) : salesData ? (
            <>
              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Tổng số deal</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-xl md:text-2xl font-bold text-gray-900">
                      {salesData.summary.totalDeals}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Tổng doanh thu</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-xl md:text-2xl font-bold text-gray-900 break-words">
                      {formatCurrency(salesData.summary.totalRevenue)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="sm:col-span-2 lg:col-span-1">
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Khoảng thời gian</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-xs md:text-sm text-gray-900">
                      {new Date(salesData.summary.from).toLocaleDateString('vi-VN')} -{' '}
                      {new Date(salesData.summary.to).toLocaleDateString('vi-VN')}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Table - Desktop, Cards - Mobile */}
              <Card>
                <CardHeader className="px-4 pt-4 pb-3">
                  <CardTitle className="text-sm md:text-base">{groupBy === 'project' ? 'Theo dự án' : 'Theo CTV'}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {salesData.items.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <div className="text-xs text-gray-500">
                          Không có dữ liệu trong khoảng thời gian này.
                        </div>
                      </div>
                    ) : (
                      salesData.items.map((item) => (
                        <div key={item.key} className="px-4 py-3 hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-gray-900 flex-1">{item.label}</div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Số deal:</span>
                            <span className="font-medium text-gray-900">{item.deals}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-gray-600">Doanh thu:</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(item.revenue)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                            {groupBy === 'project' ? 'Dự án' : 'CTV'}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                            Số deal
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                            Doanh thu
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {salesData.items.map((item) => (
                          <tr key={item.key} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {item.label}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-900">{item.deals}</td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              {formatCurrency(item.revenue)}
                            </td>
                          </tr>
                        ))}
                        {salesData.items.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center">
                              <div className="text-sm text-gray-500">
                                Không có dữ liệu trong khoảng thời gian này.
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* Commission Report Tab */}
        <TabsContent value="commission" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-3 md:p-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadCommissionReport()}
                disabled={commissionLoading}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${commissionLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </CardContent>
          </Card>

          {commissionLoading ? (
            <LoadingState message="Đang tải báo cáo hoa hồng..." />
          ) : commissionError ? (
            <ErrorState
              title="Lỗi tải báo cáo hoa hồng"
              description={commissionError}
              onRetry={loadCommissionReport}
            />
          ) : commissionData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Tổng hoa hồng</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-lg md:text-2xl font-bold text-gray-900 break-words">
                      {formatCurrency(commissionData.summary.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {commissionData.summary.totalCount} commission
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Pending</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-base md:text-xl font-semibold text-yellow-600 break-words">
                      {formatCurrency(commissionData.summary.byStatus.PENDING)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Approved</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-base md:text-xl font-semibold text-blue-600 break-words">
                      {formatCurrency(commissionData.summary.byStatus.APPROVED)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Paid</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-base md:text-xl font-semibold text-green-600 break-words">
                      {formatCurrency(commissionData.summary.byStatus.PAID)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top CTV Table - Desktop, Cards - Mobile */}
              <Card>
                <CardHeader className="px-4 pt-4 pb-3">
                  <CardTitle className="text-sm md:text-base">Top CTV theo hoa hồng</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {commissionData.rankings.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <div className="text-xs text-gray-500">Chưa có dữ liệu hoa hồng.</div>
                      </div>
                    ) : (
                      commissionData.rankings.map((row, index) => (
                        <div key={row.key} className="px-4 py-3 hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                              <div className="text-sm font-medium text-gray-900">{row.label}</div>
                            </div>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Tổng hoa hồng:</span>
                              <span className="font-semibold text-gray-900">{formatCurrency(row.amount)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Số commission:</span>
                              <span className="text-gray-900">{row.count}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Pending:</span>
                              <span className="text-yellow-600">{formatCurrency(row.pending)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Approved:</span>
                              <span className="text-blue-600">{formatCurrency(row.approved)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Paid:</span>
                              <span className="text-green-600">{formatCurrency(row.paid)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase w-16">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                            CTV
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                            Tổng hoa hồng
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                            Số commission
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                            Pending
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                            Approved
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                            Paid
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {commissionData.rankings.map((row, index) => (
                          <tr key={row.key} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.label}</td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              {formatCurrency(row.amount)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-900">{row.count}</td>
                            <td className="px-4 py-3 text-right text-sm text-yellow-600">
                              {formatCurrency(row.pending)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-blue-600">
                              {formatCurrency(row.approved)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-green-600">
                              {formatCurrency(row.paid)}
                            </td>
                          </tr>
                        ))}
                        {commissionData.rankings.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-6 text-center">
                              <div className="text-sm text-gray-500">Chưa có dữ liệu hoa hồng.</div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* Transaction Report Tab */}
        <TabsContent value="transaction" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-3 md:p-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadTransactionReport()}
                disabled={transactionLoading}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${transactionLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </CardContent>
          </Card>

          {transactionLoading ? (
            <LoadingState message="Đang tải báo cáo giao dịch..." />
          ) : transactionError ? (
            <ErrorState
              title="Lỗi tải báo cáo giao dịch"
              description={transactionError}
              onRetry={loadTransactionReport}
            />
          ) : transactionData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Tổng thu</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-lg md:text-2xl font-bold text-gray-900 break-words">
                      {formatCurrency(transactionData.summary.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {transactionData.summary.totalCount} giao dịch
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Đã xác nhận</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-base md:text-xl font-semibold text-green-600 break-words">
                      {formatCurrency(transactionData.summary.byStatus.CONFIRMED)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Đang chờ</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-base md:text-xl font-semibold text-yellow-600 break-words">
                      {formatCurrency(transactionData.summary.byStatus.PENDING_CONFIRMATION)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Đã hủy</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-base md:text-xl font-semibold text-red-600 break-words">
                      {formatCurrency(transactionData.summary.byStatus.CANCELLED)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cash Flow Table - Desktop, Cards - Mobile */}
              <Card>
                <CardHeader className="px-4 pt-4 pb-3">
                  <CardTitle className="text-sm md:text-base">Cash Flow theo ngày</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {transactionData.cashFlow.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <div className="text-xs text-gray-500">
                          Chưa có giao dịch trong khoảng thời gian đã chọn.
                        </div>
                      </div>
                    ) : (
                      transactionData.cashFlow.map((cf) => (
                        <div key={cf.date} className="px-4 py-3 hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(cf.date).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Số giao dịch:</span>
                            <span className="text-gray-900">{cf.count}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-gray-600">Tổng tiền:</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(cf.total)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                            Ngày
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                            Số giao dịch
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                            Tổng tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transactionData.cashFlow.map((cf) => (
                          <tr key={cf.date} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(cf.date).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-900">{cf.count}</td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              {formatCurrency(cf.total)}
                            </td>
                          </tr>
                        ))}
                        {transactionData.cashFlow.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center">
                              <div className="text-sm text-gray-500">
                                Chưa có giao dịch trong khoảng thời gian đã chọn.
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* Inventory Report Tab */}
        <TabsContent value="inventory" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-3 md:p-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadInventoryReport()}
                disabled={inventoryLoading}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${inventoryLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </CardContent>
          </Card>

          {inventoryLoading ? (
            <LoadingState message="Đang tải báo cáo tồn kho..." />
          ) : inventoryError ? (
            <ErrorState
              title="Lỗi tải báo cáo tồn kho"
              description={inventoryError}
              onRetry={loadInventoryReport}
            />
          ) : inventoryData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Tổng số căn</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-lg md:text-2xl font-bold text-gray-900">
                      {inventoryData.summary.totalUnits}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Đang mở bán</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-base md:text-xl font-semibold text-green-600">
                      {inventoryData.summary.statusCounts.AVAILABLE}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                      <span className="hidden md:inline">Đang giữ chỗ / booking</span>
                      <span className="md:hidden">Giữ chỗ</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-base md:text-xl font-semibold text-yellow-600">
                      {inventoryData.summary.statusCounts.RESERVED_BOOKING}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Đã cọc</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-base md:text-xl font-semibold text-blue-600">
                      {inventoryData.summary.statusCounts.DEPOSITED}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Projects Table - Desktop, Cards - Mobile */}
              <Card>
                <CardHeader className="px-4 pt-4 pb-3">
                  <CardTitle className="text-sm md:text-base">Tồn kho theo dự án</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {inventoryData.projects.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <div className="text-xs text-gray-500">Chưa có dữ liệu tồn kho.</div>
                      </div>
                    ) : (
                      inventoryData.projects.map((p) => (
                        <div key={p.projectId} className="px-4 py-3 hover:bg-gray-50">
                          <div className="mb-2">
                            <div className="text-sm font-medium text-gray-900">{p.projectName}</div>
                            <div className="text-xs text-gray-500">{p.projectCode}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Tổng căn:</span>
                              <span className="font-medium text-gray-900">{p.total}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Đã bán:</span>
                              <span className="font-medium text-gray-900">{p.sold}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Mở bán:</span>
                              <span className="text-green-600">{p.available}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Giữ chỗ:</span>
                              <span className="text-yellow-600">{p.reserved}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Đã cọc:</span>
                              <span className="text-blue-600">{p.deposited}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                            Dự án
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                            Tổng căn
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                            Đang mở bán
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                            Giữ chỗ
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                            Đã cọc
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                            Đã bán
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {inventoryData.projects.map((p) => (
                          <tr key={p.projectId} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{p.projectName}</div>
                              <div className="text-xs text-gray-500">{p.projectCode}</div>
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-900">{p.total}</td>
                            <td className="px-4 py-3 text-right text-sm text-green-600">{p.available}</td>
                            <td className="px-4 py-3 text-right text-sm text-yellow-600">{p.reserved}</td>
                            <td className="px-4 py-3 text-right text-sm text-blue-600">{p.deposited}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-900">{p.sold}</td>
                          </tr>
                        ))}
                        {inventoryData.projects.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center">
                              <div className="text-sm text-gray-500">Chưa có dữ liệu tồn kho.</div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
