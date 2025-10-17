'use client';

/**
 * 📝 CREATE BOOKING PAGE (CTV Portal)
 * Booking form with payment proof upload
 * 
 * @route /units/:id/booking
 * @features Customer info, Booking amount, Image upload, Real API
 */

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '../../../../components/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Upload, X } from 'lucide-react';
import { apiClient } from '../../../../lib/api';
import { formatCurrency } from '../../../../lib/format';
import type { Unit } from '../../../../types';

interface BookingPageProps {
  params: Promise<{ id: string }>;
}

export default function BookingPage({ params }: BookingPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    bookingAmount: '',
    bookingDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadUnit();
  }, [resolvedParams.id]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/units/${resolvedParams.id}`);
      setUnit(data);
      
      // Set default booking amount (10% of price)
      setFormData((prev) => ({
        ...prev,
        bookingAmount: (data.price * 0.1).toString(),
      }));
    } catch (error) {
      console.error('Failed to load unit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProof(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setPaymentProof(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerPhone || !formData.bookingAmount) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (!paymentProof) {
      alert('Vui lòng upload chứng từ thanh toán!');
      return;
    }

    try {
      setSubmitting(true);
      
      // In real app, upload file first, then create booking
      // const uploadRes = await apiClient.upload('/upload', paymentProof);
      
      // API call: POST /bookings
      await apiClient.post('/bookings', {
        unitId: resolvedParams.id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        bookingAmount: parseFloat(formData.bookingAmount),
        bookingDate: formData.bookingDate,
        paymentProof: 'uploaded_file_url', // Replace with actual URL
        notes: formData.notes || undefined,
      });

      alert('✅ Tạo Booking thành công! Chờ admin duyệt.');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      alert(error.response?.data?.message || 'Lỗi tạo booking!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !unit) {
    return (
      <MobileLayout title="Tạo Booking" showBackButton onBack={() => router.back()}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="Tạo Booking"
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

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerName">
                Họ tên <span className="text-red-500">*</span>
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
          </CardContent>
        </Card>

        {/* Booking Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bookingAmount">
                Số tiền booking (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bookingAmount"
                type="number"
                placeholder="10000000"
                value={formData.bookingAmount}
                onChange={(e) =>
                  setFormData({ ...formData, bookingAmount: e.target.value })
                }
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Khuyến nghị: {formatCurrency(unit.price * 0.1)} (10%)
              </p>
            </div>

            <div>
              <Label htmlFor="bookingDate">
                Ngày booking <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bookingDate"
                type="date"
                value={formData.bookingDate}
                onChange={(e) =>
                  setFormData({ ...formData, bookingDate: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <textarea
                id="notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ghi chú thêm..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Proof Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Chứng từ thanh toán <span className="text-red-500">*</span></CardTitle>
          </CardHeader>
          <CardContent>
            {!paymentProof ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Tải ảnh chuyển khoản</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG (Max 5MB)</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl || ''}
                  alt="Payment proof"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
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
            {submitting ? 'Đang xử lý...' : '📝 Tạo Booking'}
          </Button>
        </div>
      </form>
    </MobileLayout>
  );
}

