import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { unitsApi } from '../../api/units.api';
import type { Unit } from '../../types/unit.types';
import LoadingState from '../../components/ui/LoadingState';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Edit, Trash2, MapPin, Home, DollarSign, Calendar } from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DetailRow from '../../components/shared/DetailRow';
import StatusBadge from '../../components/shared/StatusBadge';

export default function UnitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUnitDetail();
  }, [id]);

  const loadUnitDetail = async () => {
    try {
      setLoading(true);
      const data = await unitsApi.getById(id!);
      setUnit(data);
    } catch (error) {
      console.error('Failed to load unit:', error);
      alert('Không thể tải thông tin căn hộ');
      navigate('/units');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await unitsApi.delete(id!);
      alert('Xóa căn hộ thành công!');
      navigate('/units');
    } catch (error) {
      console.error('Failed to delete unit:', error);
      alert('Không thể xóa căn hộ');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState />
      </div>
    );
  }

  if (!unit) {
    return null;
  }

  const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    AVAILABLE: 'default',
    RESERVED: 'secondary',
    BOOKED: 'secondary',
    DEPOSITED: 'secondary',
    SOLD: 'destructive',
  };

  const statusLabels: Record<string, string> = {
    AVAILABLE: 'Còn trống',
    RESERVED: 'Đang giữ chỗ',
    BOOKED: 'Đã booking',
    DEPOSITED: 'Đã cọc',
    SOLD: 'Đã bán',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/units')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết căn hộ</h1>
            <p className="text-muted-foreground">
              {unit.project?.name} - {unit.building?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/units/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      {/* Unit Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Thông tin căn hộ
            </CardTitle>
            <StatusBadge status={unit.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Mã căn" value={unit.code} />
            <DetailRow label="Tầng" value={typeof unit.floor === 'object' ? (unit.floor as any).name || 'N/A' : unit.floor.toString()} />
            <DetailRow 
              label="Diện tích" 
              value={`${unit.area} m²`} 
            />
            <DetailRow 
              label="Số phòng ngủ" 
              value={unit.bedrooms.toString()} 
            />
            <DetailRow 
              label="Số phòng tắm" 
              value={unit.bathrooms.toString()} 
            />
            <DetailRow 
              label="Hướng" 
              value={unit.direction || 'Chưa xác định'} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Thông tin giá
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailRow 
              label="Giá niêm yết" 
              value={new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(unit.price || 0)}
            />
            <DetailRow 
              label="Giá bán thực tế" 
              value={unit.actualPrice ? new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(unit.actualPrice) : 'Chưa có'}
            />
            <DetailRow 
              label="Giá/m²" 
              value={new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(Math.round((unit.price || 0) / unit.area))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Project Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Thông tin dự án
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailRow 
              label="Dự án" 
              value={unit.project?.name || 'N/A'} 
            />
            <DetailRow 
              label="Tòa nhà" 
              value={unit.building?.name || 'N/A'} 
            />
            <DetailRow 
              label="Địa chỉ" 
              value={unit.project?.address || 'N/A'} 
            />
            <DetailRow 
              label="Tỉnh/Thành phố" 
              value={unit.project?.city || 'N/A'} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Metadata Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Thông tin khác
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailRow 
              label="Ngày tạo" 
              value={new Date(unit.createdAt).toLocaleDateString('vi-VN')} 
            />
            <DetailRow 
              label="Cập nhật lần cuối" 
              value={new Date(unit.updatedAt).toLocaleDateString('vi-VN')} 
            />
            {unit.reservedAt && (
              <DetailRow 
                label="Ngày giữ chỗ" 
                value={new Date(unit.reservedAt).toLocaleString('vi-VN')} 
              />
            )}
            {unit.bookedAt && (
              <DetailRow 
                label="Ngày booking" 
                value={new Date(unit.bookedAt).toLocaleString('vi-VN')} 
              />
            )}
            {unit.depositedAt && (
              <DetailRow 
                label="Ngày cọc" 
                value={new Date(unit.depositedAt).toLocaleString('vi-VN')} 
              />
            )}
            {unit.soldAt && (
              <DetailRow 
                label="Ngày bán" 
                value={new Date(unit.soldAt).toLocaleString('vi-VN')} 
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes Card */}
      {unit.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Ghi chú</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {unit.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa căn hộ "${unit.code}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

