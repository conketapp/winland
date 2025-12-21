/**
 * Users Management Page (Admin)
 * Manage all users (Admins, CTVs, Customers)
 */

import { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { apiRequest } from '../../api/client';
import { API_ENDPOINTS } from '../../constants/api';
import { Plus, Edit, Ban, CheckCircle, Search, X } from 'lucide-react';
import { useToast } from '../../components/ui/ToastProvider';

interface User {
  id: string;
  email?: string | null;
  phone?: string | null;
  fullName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CTV' | 'USER';
  isActive: boolean;
  totalDeals?: number | null;
  createdAt: string;
}

interface PaginatedUsersResponse {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState({
    role: 'CTV', // default focus on CTVs as primary audience
    status: 'all',
  });

  // Toggle status confirmation
  const [toggleDialog, setToggleDialog] = useState({
    open: false,
    userId: '',
    userName: '',
    currentStatus: false,
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, pagination.pageSize, searchQuery]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [filters.role, filters.status, searchQuery, pagination.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // If search query exists, use search endpoint
      if (searchQuery.trim()) {
        const data = await apiRequest<User[]>({
          method: 'GET',
          url: `${API_ENDPOINTS.USERS.BASE}/search`,
          params: {
            q: searchQuery,
            ...(filters.status !== 'all' ? { status: filters.status } : {}),
            ...(filters.role !== 'all' ? { role: filters.role } : {}),
          },
        });
        setUsers(data);
        // Search results are limited to 50, so set pagination accordingly
        setPagination({
          page: 1,
          pageSize: 20,
          total: data.length,
          totalPages: Math.ceil(data.length / 20),
          hasNext: data.length > 20,
          hasPrev: false,
        });
      } else {
        // Use paginated endpoint
        const data = await apiRequest<PaginatedUsersResponse>({
          method: 'GET',
          url: API_ENDPOINTS.USERS.BASE,
          params: {
            // Backend expects `status` as 'active' | 'inactive' | 'all'
            ...(filters.status !== 'all' ? { status: filters.status } : {}),
            ...(filters.role !== 'all' ? { role: filters.role } : {}),
            page: pagination.page,
            limit: pagination.pageSize,
          },
        });
        
        // Handle both paginated response and array response
        if (Array.isArray(data)) {
          setUsers(data);
          setPagination({
            page: 1,
            pageSize: 20,
            total: data.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          });
        } else {
          setUsers(data.items || []);
          setPagination({
            page: data.page || 1,
            pageSize: data.pageSize || 20,
            total: data.total || 0,
            totalPages: data.totalPages || 1,
            hasNext: data.hasNext || false,
            hasPrev: data.hasPrev || false,
          });
        }
      }
    } catch (error: unknown) {
      console.error('Failed to load users:', error);
      showError((error as Error)?.message || 'Lỗi tải danh sách users!');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await apiRequest({
        method: 'PATCH',
        url: API_ENDPOINTS.USERS.BY_ID(toggleDialog.userId),
        data: { isActive: !toggleDialog.currentStatus },
      });

      setToggleDialog({ open: false, userId: '', userName: '', currentStatus: false });
      showSuccess(`${toggleDialog.currentStatus ? 'Vô hiệu hóa' : 'Kích hoạt'} user thành công!`);
      loadUsers();
    } catch (error: unknown) {
      console.error('Failed to toggle user status:', error);
      showError((error as Error)?.message || 'Lỗi cập nhật trạng thái!');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'destructive';
      case 'ADMIN':
        return 'default';
      case 'CTV':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'ADMIN':
        return 'Admin';
      case 'CTV':
        return 'CTV';
      case 'USER':
        return 'User';
      default:
        return role;
    }
  };

  if (loading && users.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Toggle Status Dialog */}
      <ConfirmDialog
        open={toggleDialog.open}
        onOpenChange={(open) => setToggleDialog({ ...toggleDialog, open })}
        title={toggleDialog.currentStatus ? 'Vô hiệu hóa user' : 'Kích hoạt user'}
        description={`Bạn có chắc muốn ${toggleDialog.currentStatus ? 'vô hiệu hóa' : 'kích hoạt'} user ${toggleDialog.userName}?`}
        onConfirm={handleToggleStatus}
        confirmText="Xác nhận"
        variant={toggleDialog.currentStatus ? 'destructive' : 'default'}
      />

      {/* Page Header */}
      <PageHeader
        title="Quản lý Users"
        description="Quản lý tài khoản Admin và CTV"
        action={{
          label: 'Tạo User',
          onClick: () => alert('Tính năng đang phát triển'),
          icon: <Plus className="w-5 h-5" />
        }}
      />

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tìm kiếm:
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm theo tên, email, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Vai trò:
            </label>
            <Select
              value={filters.role}
              onValueChange={(value) => setFilters({ ...filters, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="CTV">CTV</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Trạng thái:
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Đã vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Tổng users</div>
          <div className="text-2xl font-bold">{users.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Admin</div>
          <div className="text-2xl font-bold text-blue-600">
            {users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">CTV</div>
          <div className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.role === 'CTV').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Đang hoạt động</div>
          <div className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.isActive).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Tổng deal (CTV)</div>
          <div className="text-2xl font-bold text-purple-600">
            {users
              .filter((u) => u.role === 'CTV')
              .reduce((sum, u) => sum + (u.totalDeals || 0), 0)}
          </div>
        </Card>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <EmptyState message="Chưa có user nào" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Họ tên
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Số điện thoại
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vai trò
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tổng deal (CTV)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{user.fullName}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.email || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {user.phone || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {user.isActive ? (
                          <Badge variant="default">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Ban className="w-3 h-3 mr-1" />
                            Vô hiệu hóa
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {user.role === 'CTV' ? user.totalDeals || 0 : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => alert('Edit user - Tính năng đang phát triển')}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setToggleDialog({
                                open: true,
                                userId: user.id,
                                userName: user.fullName,
                                currentStatus: user.isActive,
                              })
                            }
                          >
                            {user.isActive ? (
                              <Ban className="w-4 h-4 text-red-600" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!searchQuery && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {(pagination.page - 1) * pagination.pageSize + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} / {pagination.total.toLocaleString('vi-VN')} users
            {pagination.totalPages > 1 && ` - Trang ${pagination.page} / ${pagination.totalPages}`}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasPrev || loading}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Trước
            </Button>
            <span className="text-sm text-gray-600 px-2">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasNext || loading}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Search results info */}
      {searchQuery && users.length > 0 && (
        <div className="text-sm text-gray-600">
          Tìm thấy {users.length} kết quả cho "{searchQuery}"
        </div>
      )}
    </div>
  );
}





