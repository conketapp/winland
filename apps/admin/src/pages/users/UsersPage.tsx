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
import { Badge } from '../../components/ui/badge';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { apiRequest } from '../../api/client';
import { API_ENDPOINTS } from '../../constants/api';
import { Plus, Edit, Ban, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  email?: string | null;
  phone?: string | null;
  fullName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CTV' | 'USER';
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
  });

  // Toggle status confirmation
  const [toggleDialog, setToggleDialog] = useState({
    open: false,
    userId: '',
    userName: '',
    currentStatus: false,
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filters.role !== 'all') {
        params.role = filters.role;
      }
      if (filters.status === 'active') {
        params.isActive = true;
      } else if (filters.status === 'inactive') {
        params.isActive = false;
      }

      const data = await apiRequest<User[]>({
        method: 'GET',
        url: API_ENDPOINTS.USERS.BASE,
        params,
      });
      setUsers(data);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      alert(error.message || 'Lỗi tải danh sách users!');
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
      alert(`✅ ${toggleDialog.currentStatus ? 'Vô hiệu hóa' : 'Kích hoạt'} user thành công!`);
      loadUsers();
    } catch (error: any) {
      console.error('Failed to toggle user status:', error);
      alert(error.message || 'Lỗi cập nhật trạng thái!');
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

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
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
      <div className="grid grid-cols-4 gap-4">
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
                      Email / Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vai trò
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
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
                        {user.email || user.phone || '-'}
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
    </div>
  );
}





