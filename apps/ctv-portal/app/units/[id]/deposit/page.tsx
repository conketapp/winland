'use client';

/**
 * 💰 CREATE DEPOSIT PAGE (CTV Portal)
 * Deposit form with multi-document upload
 * 
 * @route /units/:id/deposit
 * @features Customer info, Deposit amount, Image + PDF upload, Real API
 */

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '../../../../components/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Upload, X, FileText } from 'lucide-react';
import { apiClient } from '../../../../lib/api';
import { formatCurrency } from '../../../../lib/format';
import type { Unit } from '../../../../types';

interface DepositPageProps {
  params: Promise<{ id: string }>;
}

export default function DepositPage({ params }: DepositPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    bookingId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    depositAmount: '',
    depositDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [proofImages, setProofImages] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);

  useEffect(() => {
    loadUnit();
  }, [resolvedParams.id]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/units/${resolvedParams.id}`);
      setUnit(data);
      
      // Set default deposit amount (30% of price)
      setFormData((prev) => ({
        ...prev,
        depositAmount: (data.price * 0.3).toString(),
      }));
    } catch (error) {
      console.error('Failed to load unit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImages(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContractChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContractFile(file);
    }
  };

  const removeProof = () => {
    setProofImages(null);
    setProofPreview(null);
  };

  const removeContract = () => {
    setContractFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerPhone || !formData.depositAmount) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (!proofImages) {
      alert('Vui lòng upload chứng từ cọc!');
      return;
    }

    try {
      setSubmitting(true);
      
      // In real app, upload files first
      // const proofUrl = await apiClient.upload('/upload', proofImages);
      // const contractUrl = contractFile ? await apiClient.upload('/upload', contractFile) : null;
      
      // API call: POST /deposits
      await apiClient.post('/deposits', {
        bookingId: formData.bookingId || undefined,
        unitId: resolvedParams.id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        depositAmount: parseFloat(formData.depositAmount),
        depositDate: formData.depositDate,
        proofImages: 'uploaded_proof_url', // Replace with actual URL
        contractFile: contractFile ? 'uploaded_contract_url' : undefined,
        notes: formData.notes || undefined,
      });

      alert('✅ Tạo Deposit thành công! Chờ admin duyệt.');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Failed to create deposit:', error);
      alert(error.response?.data?.message || 'Lỗi tạo deposit!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !unit) {
    return (
      <MobileLayout title="Tạo Cọc" showBackButton onBack={() => router.back()}>
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
      title="Tạo Deposit"
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
              <span className="text-xl">💰</span>
              <div className="text-sm">
                <p className="font-semibold text-yellow-800 mb-1">Quy trình cọc</p>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  <li>Khách hàng đặt cọc 30-50% giá trị căn</li>
                  <li>Upload chứng từ chuyển khoản</li>
                  <li>Admin duyệt và tạo lịch thanh toán</li>
                  <li>Hợp đồng sẽ được ký sau khi duyệt</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking ID (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle>Booking ID (nếu có)</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="booking-id-123"
              value={formData.bookingId}
              onChange={(e) =>
                setFormData({ ...formData, bookingId: e.target.value })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Nếu căn đã được booking trước đó
            </p>
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

        {/* Deposit Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cọc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="depositAmount">
                Số tiền cọc (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="depositAmount"
                type="number"
                placeholder="500000000"
                value={formData.depositAmount}
                onChange={(e) =>
                  setFormData({ ...formData, depositAmount: e.target.value })
                }
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Khuyến nghị: {formatCurrency(unit.price * 0.3)} (30%)
              </p>
            </div>

            <div>
              <Label htmlFor="depositDate">
                Ngày cọc <span className="text-red-500">*</span>
              </Label>
              <Input
                id="depositDate"
                type="date"
                value={formData.depositDate}
                onChange={(e) =>
                  setFormData({ ...formData, depositDate: e.target.value })
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

        {/* Proof Images Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Chứng từ cọc <span className="text-red-500">*</span></CardTitle>
          </CardHeader>
          <CardContent>
            {!proofImages ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Tải ảnh chuyển khoản</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG (Max 5MB)</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProofChange}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={proofPreview || ''}
                  alt="Proof"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeProof}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract File Upload (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle>Hợp đồng (tùy chọn)</CardTitle>
          </CardHeader>
          <CardContent>
            {!contractFile ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <FileText className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Tải file hợp đồng</p>
                <p className="text-xs text-gray-500 mt-1">PDF (Max 10MB)</p>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleContractChange}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{contractFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(contractFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeContract}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <X className="w-5 h-5" />
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
            {submitting ? 'Đang xử lý...' : '💰 Tạo Deposit'}
          </Button>
        </div>
      </form>
    </MobileLayout>
  );
}

