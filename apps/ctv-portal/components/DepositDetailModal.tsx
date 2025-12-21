"use client";

import { useState } from "react";
import { X, User, Phone, Mail, Calendar, FileText, CheckCircle, DollarSign, CreditCard, MapPin, IdCard, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";
import { getModalResponsiveClasses } from "@/app/utils/responsive";
import { toastNotification } from '@/app/utils/toastNotification';
import ConfirmDialog from '@/components/ConfirmDialog';

import type { Deposit } from '@/lib/types/api.types';

type DepositDetailModalProps = {
    deposit: Deposit;
    onClose: () => void;
    onComplete?: () => void;
    readOnly?: boolean;
};

export default function DepositDetailModal({ deposit, onClose, onComplete, readOnly = false }: DepositDetailModalProps) {
    const deviceInfo = useDeviceDetect();
    const responsive = getModalResponsiveClasses(deviceInfo);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    if (!deposit) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'PENDING_APPROVAL':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'COMPLETED':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'OVERDUE':
                return 'bg-orange-100 text-orange-700 border-orange-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'PENDING_APPROVAL':
                return 'Chờ duyệt';
            case 'CANCELLED':
                return 'Đã hủy';
            case 'COMPLETED':
                return 'Hoàn thành - Đã bán';
            case 'OVERDUE':
                return 'Quá hạn';
            default:
                return status;
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/deposits/${deposit.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toastNotification.success('Đã ẩn đặt cọc khỏi dashboard!');
                setShowDeleteDialog(false);
                onClose();
                if (onComplete) {
                    onComplete();
                } else {
                    window.location.reload();
                }
            } else {
                const data = await response.json();
                toastNotification.error(data.error || 'Không thể ẩn đặt cọc');
            }
        } catch (error) {
            console.error('Delete deposit error:', error);
            toastNotification.error('Đã xảy ra lỗi khi xóa đặt cọc');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`bg-white w-full ${responsive.containerMaxWidth} ${responsive.containerMaxHeight} rounded-3xl shadow-2xl overflow-hidden flex flex-col`}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`font-bold ${responsive.titleSize}`}>Chi tiết Đặt cọc</h3>
                            <p className="text-sm opacity-90 mt-1">Mã: {deposit.code}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStatusColor(deposit.status)}`}>
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-semibold text-sm">{getStatusText(deposit.status)}</span>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="space-y-4">
                        {/* Unit Information */}
                        {deposit.unit && (
                            <div className="bg-white rounded-2xl shadow-md p-5">
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-orange-600" />
                                    Thông tin căn hộ
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Dự án:</span>
                                        <span className="font-semibold">{deposit.unit.project?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Mã căn hộ:</span>
                                        <span className="font-semibold text-orange-600">{deposit.unit.code}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Tòa nhà:</span>
                                        <span className="font-medium">{deposit.unit.building?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Tầng:</span>
                                        <span className="font-medium">{deposit.unit.floor?.number || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Diện tích:</span>
                                        <span className="font-medium">{deposit.unit.area}m²</span>
                                    </div>
                                    {deposit.unit.price && (
                                        <div className="flex justify-between items-center pt-2 border-t">
                                            <span className="text-sm text-gray-600">Giá bán:</span>
                                            <span className="font-bold text-green-600 text-lg">{formatCurrency(deposit.unit.price)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CTV Information */}
                        {deposit.ctv && (
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-md p-5 border-2 border-indigo-200">
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-700">
                                    <User className="w-5 h-5" />
                                    Cộng tác viên
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <User className="w-4 h-4 text-indigo-600 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs text-indigo-600">Họ và tên</p>
                                            <p className="font-semibold text-indigo-800">{deposit.ctv.fullName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-4 h-4 text-indigo-600 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs text-indigo-600">Số điện thoại</p>
                                            <p className="font-medium text-indigo-800">{deposit.ctv.phone}</p>
                                        </div>
                                    </div>
                                    {deposit.ctv.email && (
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-4 h-4 text-indigo-600 mt-1" />
                                            <div className="flex-1">
                                                <p className="text-xs text-indigo-600">Email</p>
                                                <p className="font-medium text-indigo-800">{deposit.ctv.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Customer Information */}
                        <div className="bg-white rounded-2xl shadow-md p-5">
                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-600" />
                                Thông tin khách hàng
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <User className="w-4 h-4 text-gray-400 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Họ và tên</p>
                                        <p className="font-medium">{deposit.customerName}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-gray-400 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Số điện thoại</p>
                                        <p className="font-medium">{deposit.customerPhone}</p>
                                    </div>
                                </div>
                                {deposit.customerEmail && (
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-4 h-4 text-gray-400 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium">{deposit.customerEmail}</p>
                                        </div>
                                    </div>
                                )}
                                {deposit.customerIdCard && (
                                    <div className="flex items-start gap-3">
                                        <IdCard className="w-4 h-4 text-gray-400 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Số CCCD</p>
                                            <p className="font-medium">{deposit.customerIdCard}</p>
                                        </div>
                                    </div>
                                )}
                                {deposit.customerAddress && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Địa chỉ</p>
                                            <p className="font-medium">{deposit.customerAddress}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Deposit Information */}
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl shadow-md p-5 border-2 border-orange-200">
                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-700">
                                <DollarSign className="w-5 h-5" />
                                Thông tin đặt cọc
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="w-4 h-4 text-orange-600" />
                                    <div>
                                        <p className="text-xs text-orange-600">Số tiền đặt cọc</p>
                                        <p className="font-bold text-orange-700 text-xl">{formatCurrency(deposit.depositAmount)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-xs text-orange-600">Tỷ lệ đặt cọc</p>
                                        <p className="font-semibold text-orange-700">{deposit.depositPercentage}%</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-orange-600" />
                                    <div>
                                        <p className="text-xs text-orange-600">Ngày đặt cọc</p>
                                        <p className="font-semibold text-orange-700">{new Date(deposit.depositDate).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-4 h-4 text-orange-600" />
                                    <div>
                                        <p className="text-xs text-orange-600">Phương thức thanh toán</p>
                                        <p className="font-semibold text-orange-700">
                                            {deposit.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : deposit.paymentMethod}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-white rounded-2xl shadow-md p-5">
                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-600" />
                                Thông tin bổ sung
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Ngày tạo:</span>
                                    <span className="font-medium">{new Date(deposit.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                                {deposit.approvedAt && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Ngày duyệt:</span>
                                        <span className="font-medium text-green-600">{new Date(deposit.approvedAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                )}
                                {deposit.approver && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Người duyệt:</span>
                                        <span className="font-medium">{deposit.approver.fullName}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes - Filter out hidden marker */}
                        {(() => {
                            const cleanNotes = deposit.notes?.replace(/\[HIDDEN_FROM_DASHBOARD\]/g, '').replace(/\n+/g, '\n').trim();
                            return cleanNotes && (
                                <div className="bg-yellow-50 rounded-2xl shadow-md p-5 border border-yellow-200">
                                    <h4 className="text-lg font-semibold mb-2 text-yellow-800">Ghi chú</h4>
                                    <p className="text-sm text-gray-700">{cleanNotes}</p>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-white border-t space-y-3">
                    {/* Action Buttons - Only show for PENDING_APPROVAL or CONFIRMED deposits and not in readOnly mode */}
                    {!readOnly && (deposit.status === 'PENDING_APPROVAL' || deposit.status === 'CONFIRMED') && (
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={() => setShowCancelDialog(true)}
                                disabled={isCancelling || isCompleting}
                                className="py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCancelling ? 'Đang hủy...' : 'Hủy đặt cọc'}
                            </Button>
                            <Button
                                onClick={() => setShowCompleteDialog(true)}
                                disabled={isCompleting || isCancelling}
                                className="py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCompleting ? 'Đang xử lý...' : '✓ Hoàn thành đặt cọc'}
                            </Button>
                        </div>
                    )}

                    {/* Delete Button - Only show for COMPLETED, CANCELLED */}
                    {!readOnly && ['COMPLETED', 'CANCELLED'].includes(deposit.status) && (
                        <Button
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isDeleting}
                            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="w-4 h-4 inline mr-2" />
                            {isDeleting ? 'Đang xóa...' : 'Xóa đặt cọc'}
                        </Button>
                    )}

                    <Button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all"
                    >
                        Đóng
                    </Button>
                </div>

                {/* Cancel Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showCancelDialog}
                    title="Xác nhận hủy đặt cọc"
                    message="Bạn có chắc chắn muốn hủy đặt cọc này? Căn hộ sẽ trở về trạng thái có sẵn."
                    confirmText="Hủy đặt cọc"
                    cancelText="Quay lại"
                    type="danger"
                    onConfirm={async () => {
                        setShowCancelDialog(false);
                        setIsCancelling(true);
                        try {
                            const response = await fetch('/api/deposits/cancel', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    depositId: deposit.id
                                }),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                toastNotification.success('Đã hủy đặt cọc thành công!');
                                onClose();
                                if (onComplete) {
                                    onComplete();
                                } else {
                                    window.location.reload();
                                }
                            } else {
                                toastNotification.error(data.error || 'Đã xảy ra lỗi');
                            }
                        } catch (error) {
                            toastNotification.error('Đã xảy ra lỗi khi hủy đặt cọc');
                        } finally {
                            setIsCancelling(false);
                        }
                    }}
                    onCancel={() => setShowCancelDialog(false)}
                />

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showDeleteDialog}
                    title="Xác nhận xóa đặt cọc"
                    message="Bạn có chắc chắn muốn ẩn đặt cọc này khỏi dashboard? Đặt cọc vẫn sẽ được lưu trong lịch sử giao dịch."
                    confirmText={isDeleting ? "Đang xóa..." : "Xóa"}
                    cancelText="Hủy"
                    type="danger"
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteDialog(false)}
                />

                {/* Complete Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showCompleteDialog}
                    title="Xác nhận hoàn thành đặt cọc"
                    message="Bạn có chắc chắn muốn hoàn thành đặt cọc này? Căn hộ sẽ chuyển sang trạng thái ĐÃ BÁN và bạn sẽ nhận được hoa hồng."
                    confirmText="Hoàn thành"
                    cancelText="Quay lại"
                    type="success"
                    onConfirm={async () => {
                        setShowCompleteDialog(false);
                        setIsCompleting(true);
                        try {
                            const response = await fetch('/api/deposits/complete', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    depositId: deposit.id
                                }),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                toastNotification.success('Đã hoàn thành đặt cọc! Căn hộ đã được bán và hoa hồng đã được ghi nhận.');
                                onClose();
                                if (onComplete) {
                                    onComplete();
                                } else {
                                    window.location.reload();
                                }
                            } else {
                                toastNotification.error(data.error || 'Đã xảy ra lỗi');
                            }
                        } catch (error) {
                            toastNotification.error('Đã xảy ra lỗi khi hoàn thành đặt cọc');
                        } finally {
                            setIsCompleting(false);
                        }
                    }}
                    onCancel={() => setShowCompleteDialog(false)}
                />
            </motion.div>
        </div>
    );
}
