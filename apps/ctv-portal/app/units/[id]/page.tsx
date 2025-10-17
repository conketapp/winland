'use client';

/**
 * 🏠 UNIT DETAIL PAGE (CTV Portal)
 * Full unit information with action buttons
 * 
 * @route /units/:id
 * @features Unit specs, Images, Price, Commission, Reserve/Booking/Deposit actions
 */

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '../../../components/MobileLayout';
import LoadingState from '../../../components/LoadingState';
import ErrorState from '../../../components/ErrorState';
import EmptyState from '../../../components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ArrowLeft, Home, Bed, Bath, Maximize, Navigation, Eye, DollarSign } from 'lucide-react';
import { apiClient } from '../../../lib/api';
import { formatCurrency } from '../../../lib/format';
import type { Unit } from '../../../types';

interface UnitDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UnitDetailPage({ params }: UnitDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUnit();
  }, [resolvedParams.id]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get(`/units/${resolvedParams.id}`);
      setUnit(data);
    } catch (error: any) {
      console.error('Failed to load unit:', error);
      setError(error.message || 'Không thể tải thông tin căn hộ');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'RESERVED_BOOKING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DEPOSITED':
        return 'bg-blue-100 text-blue-800';
      case 'SOLD':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Còn trống';
      case 'RESERVED_BOOKING':
        return 'Đã booking';
      case 'DEPOSITED':
        return 'Đã cọc';
      case 'SOLD':
        return 'Đã bán';
      default:
        return status;
    }
  };

  // Loading State
  if (loading) {
    return (
      <MobileLayout title="Chi tiết căn hộ" showBackButton onBack={() => router.back()}>
        <LoadingState message="Đang tải thông tin căn hộ..." type="page" />
      </MobileLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <MobileLayout title="Chi tiết căn hộ" showBackButton onBack={() => router.back()}>
        <ErrorState 
          title="Không thể tải dữ liệu"
          message={error}
          onRetry={loadUnit}
        />
      </MobileLayout>
    );
  }

  // Empty State
  if (!unit) {
    return (
      <MobileLayout title="Chi tiết căn hộ" showBackButton onBack={() => router.back()}>
        <EmptyState 
          title="Không tìm thấy căn hộ"
          description="Căn hộ này có thể đã bị xóa hoặc không tồn tại"
          icon={<Home className="w-16 h-16 text-gray-400" />}
          action={
            <Button onClick={() => router.back()} variant="outline">
              Quay lại
            </Button>
          }
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="Chi tiết căn hộ"
      showBackButton
      onBack={() => router.back()}
    >
      <div className="pb-24 space-y-4">
        {/* Hero Image */}
        {false ? (
          <div className="relative h-64 bg-gray-200">
            <img
              src=""
              alt={unit?.code || 'Unit'}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="relative h-64 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
            <Home className="w-20 h-20 text-blue-400" />
          </div>
        )}

        {/* Main Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{unit.code}</CardTitle>
                <p className="text-gray-600 mt-1">{unit.unitNumber}</p>
              </div>
              <Badge className={getStatusColor(unit.status)}>
                {getStatusLabel(unit.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Price */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Giá bán</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(unit.price)}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Maximize className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <p className="text-sm text-gray-600">Diện tích</p>
                <p className="font-bold">{unit.area}m²</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Bed className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <p className="text-sm text-gray-600">Phòng ngủ</p>
                <p className="font-bold">{unit.bedrooms || 0}PN</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Bath className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <p className="text-sm text-gray-600">WC</p>
                <p className="font-bold">{unit.bathrooms || 0}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
              {unit.direction && (
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Hướng:</span>
                  <span className="text-sm font-medium">{unit.direction}</span>
                </div>
              )}
              {unit.direction && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Hướng:</span>
                  <span className="text-sm font-medium">{unit.direction}</span>
                </div>
              )}
              {unit.commissionRate && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Hoa hồng:</span>
                  <span className="text-sm font-medium text-green-600">
                    {unit.commissionRate}% = {formatCurrency(unit.price * unit.commissionRate / 100)}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {false && (
              <div>
                <h3 className="font-semibold mb-2">Mô tả</h3>
                <p className="text-sm text-gray-600">Mô tả căn hộ</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {unit.status === 'AVAILABLE' && (
          <Card>
            <CardHeader>
              <CardTitle>Thao tác</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push(`/units/${unit.id}/reserve`)}
              >
                🎯 Giữ chỗ ngay
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => router.push(`/units/${unit.id}/booking`)}
              >
                📝 Tạo Booking
              </Button>
            </CardContent>
          </Card>
        )}

        {unit.status === 'RESERVED_BOOKING' && (
          <Card>
            <CardHeader>
              <CardTitle>Thao tác</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push(`/units/${unit.id}/deposit`)}
              >
                💰 Tạo Cọc
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}

