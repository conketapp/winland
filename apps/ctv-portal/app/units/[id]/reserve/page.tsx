'use client';

/**
 * ⏰ CREATE RESERVATION PAGE (CTV Portal)
 * Reserve unit for customer (24h hold)
 * 
 * @route /units/:id/reserve
 * @features Customer form, 24h countdown, Real API integration
 */

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '../../../../components/MobileLayout';
import LoadingState from '../../../../components/LoadingState';
import ErrorState from '../../../../components/ErrorState';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { apiClient } from '../../../../lib/api';
import { formatCurrency } from '../../../../lib/format';
import type { Unit } from '../../../../types';

interface ReservePageProps {
  params: Promise<{ id: string }>;
}

export default function ReservePage({ params }: ReservePageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerPhone) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin khách hàng!');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmReservation = async () => {
    try {
      setSubmitting(true);
      
      // API call: POST /reservations
      await apiClient.post('/reservations', {
        unitId: resolvedParams.id,
        ...formData,
      });

      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Failed to create reservation:', error);
      setShowConfirmDialog(false);
      setErrorMessage(error.response?.data?.message || 'Lỗi giữ chỗ! Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    router.push('/dashboard');
  };

  // Loading State
  if (loading) {
    return (
      <MobileLayout title="Giữ chỗ" showBackButton onBack={() => router.back()}>
        <LoadingState message="Đang tải thông tin..." type="page" />
      </MobileLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <MobileLayout title="Giữ chỗ" showBackButton onBack={() => router.back()}>
        <ErrorState 
          title="Không thể tải dữ liệu"
          message={error}
          onRetry={loadUnit}
        />
      </MobileLayout>
    );
  }

  if (!unit) {
    return (
      <MobileLayout title="Giữ chỗ" showBackButton onBack={() => router.back()}>
        <LoadingState message="Đang tải..." type="page" />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="Giữ chỗ căn hộ"
      showBackButton
      onBack={() => router.back()}
    >
      <form onSubmit={handleSubmit} className="pb-24 space-y-4">
        {/* Unit Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2">{unit.code}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Diện tích:</span>
                <span className="ml-2 font-medium">{unit.area}m²</span>
              </div>
              <div>
                <span className="text-gray-600">Giá:</span>
                <span className="ml-2 font-medium text-blue-600">
                  {formatCurrency(unit.price)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <span className="text-xl">⏰</span>
              <div className="text-sm">
                <p className="font-semibold text-yellow-800 mb-1">Lưu ý quan trọng</p>
                <p className="text-yellow-700">
                  Sau khi giữ chỗ, bạn có <strong>24 giờ</strong> để tạo Booking.
                  Hết thời gian, căn sẽ tự động được mở lại.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerName">
                Họ tên khách hàng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerName"
                placeholder="Nguyễn Văn A"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="customerPhone">
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="0912345678"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="email@example.com"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <textarea
                id="notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ghi chú thêm về khách hàng..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={submitting}
          >
            {submitting ? 'Đang xử lý...' : '🎯 Xác nhận giữ chỗ'}
          </Button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <ConfirmDialog
            open={!!errorMessage}
            onOpenChange={(open) => !open && setErrorMessage('')}
            title="Thông báo"
            description={errorMessage}
            onConfirm={() => setErrorMessage('')}
            confirmText="Đóng"
            variant="destructive"
          />
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          title="Xác nhận giữ chỗ"
          description={`Bạn có chắc chắn muốn giữ chỗ căn ${unit.code} cho khách hàng ${formData.customerName}?`}
          onConfirm={handleConfirmReservation}
          confirmText="Xác nhận"
          cancelText="Hủy"
          loading={submitting}
        />

        {/* Success Dialog */}
        <ConfirmDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          title="Giữ chỗ thành công! 🎉"
          description="Bạn có 24 giờ để tạo Booking. Vui lòng liên hệ khách hàng để hoàn tất thủ tục."
          onConfirm={handleSuccessClose}
          confirmText="Về Dashboard"
        />
      </form>
    </MobileLayout>
  );
}

