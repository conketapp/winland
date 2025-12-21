"use client";

import { useState } from "react";
import { X, User, Phone, Mail, Calendar, Clock, FileText, CheckCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";
import { getModalResponsiveClasses } from "@/app/utils/responsive";
import { toastNotification } from '@/app/utils/toastNotification';
import ConfirmDialog from '@/components/ConfirmDialog';

import type { Reservation } from '@/lib/types/api.types';

type ReservationDetailModalProps = {
    reservation: Reservation;
    onClose: () => void;
    onComplete?: () => void;
    readOnly?: boolean;
};

export default function ReservationDetailModal({ reservation, onClose, onComplete, readOnly = false }: ReservationDetailModalProps) {
    const deviceInfo = useDeviceDetect();
    const responsive = getModalResponsiveClasses(deviceInfo);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!reservation) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'YOUR_TURN':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'EXPIRED':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            case 'MISSED':
                return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'COMPLETED':
                return 'bg-green-100 text-green-700 border-green-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'Đang hoạt động';
            case 'YOUR_TURN':
                return 'Đến lượt bạn';
            case 'EXPIRED':
                return 'Hết hạn';
            case 'MISSED':
                return 'Đã bỏ lỡ';
            case 'CANCELLED':
                return 'Đã hủy';
            case 'COMPLETED':
                return 'Hoàn thành';
            default:
                return status;
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/reservations/${reservation.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toastNotification.success('Đã ẩn giữ chỗ khỏi dashboard!');
                setShowDeleteDialog(false);
                onClose();
                if (onComplete) {
                    onComplete();
                } else {
                    window.location.reload();
                }
            } else {
                const data = await response.json();
                toastNotification.error(data.error || 'Không thể ẩn giữ chỗ');
            }
        } catch (error) {
            console.error('Delete reservation error:', error);
            toastNotification.error('Đã xảy ra lỗi khi xóa giữ chỗ');
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
                <div className="relative bg-gradient-to-r from-yellow-500 to-yellow-700 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`font-bold ${responsive.titleSize}`}>Chi tiết Giữ chỗ</h3>
                            <p className="text-sm opacity-90 mt-1">Mã: {reservation.code}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStatusColor(reservation.status)}`}>
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-semibold text-sm">{getStatusText(reservation.status)}</span>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="space-y-4">
                        {/* Unit Information */}
                        {reservation.unit && (
                            <div className="bg-white rounded-2xl shadow-md p-5">
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-yellow-600" />
                                    Thông tin căn hộ
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Mã căn hộ:</span>
                                        <span className="font-semibold text-yellow-600">{reservation.unit.code}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CTV Information */}
                        {reservation.ctv && (
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
                                            <p className="font-semibold text-indigo-800">{reservation.ctv.fullName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-4 h-4 text-indigo-600 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs text-indigo-600">Số điện thoại</p>
                                            <p className="font-medium text-indigo-800">{reservation.ctv.phone}</p>
                                        </div>
                                    </div>
                                    {reservation.ctv.email && (
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-4 h-4 text-indigo-600 mt-1" />
                                            <div className="flex-1">
                                                <p className="text-xs text-indigo-600">Email</p>
                                                <p className="font-medium text-indigo-800">{reservation.ctv.email}</p>
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
                                        <p className="font-medium">{reservation.customerName}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-gray-400 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Số điện thoại</p>
                                        <p className="font-medium">{reservation.customerPhone}</p>
                                    </div>
                                </div>
                                {reservation.customerEmail && (
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-4 h-4 text-gray-400 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium">{reservation.customerEmail}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reservation Schedule */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-md p-5 border-2 border-yellow-200">
                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-700">
                                <Calendar className="w-5 h-5" />
                                Thời gian giữ chỗ
                            </h4>
                            <div className="space-y-3">
                                {/* Queue Position - Highlighted */}
                                {reservation.priority !== undefined && ['ACTIVE', 'YOUR_TURN'].includes(reservation.status) && (
                                    <div className="bg-yellow-200 rounded-lg p-3 border-2 border-yellow-400">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-yellow-700 font-medium">Vị trí trong hàng chờ</p>
                                                <p className="text-2xl font-bold text-yellow-800 mt-1">#{reservation.priority}</p>
                                            </div>
                                            {reservation.status === 'YOUR_TURN' && (
                                                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                                    ĐẾN LƯỢT BẠN
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-yellow-600" />
                                    <div>
                                        <p className="text-xs text-yellow-600">Hết hạn giữ chỗ</p>
                                        <p className="font-semibold text-yellow-700">{new Date(reservation.reservedUntil).toLocaleString('vi-VN')}</p>
                                    </div>
                                </div>
                                {reservation.status === 'YOUR_TURN' && reservation.depositDeadline && (
                                    <div className="bg-red-50 rounded-lg p-3 border-2 border-red-300">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-red-600" />
                                            <div>
                                                <p className="text-xs text-red-600 font-medium">⚠️ Hạn nộp cọc</p>
                                                <p className="font-bold text-red-700">{new Date(reservation.depositDeadline).toLocaleString('vi-VN')}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                    <span className="font-medium">{new Date(reservation.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                                {reservation.extendCount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Số lần gia hạn:</span>
                                        <span className="font-medium text-blue-600">{reservation.extendCount}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        {(() => {
                            const cleanNotes = reservation.notes?.replace(/\[HIDDEN_FROM_DASHBOARD\]/g, '').replace(/\n+/g, '\n').trim();
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
                    {/* Action Buttons - Only show for ACTIVE reservations and not in readOnly mode */}
                    {!readOnly && reservation.status === 'ACTIVE' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={() => setShowCancelDialog(true)}
                                disabled={isCancelling || isCompleting}
                                className="py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCancelling ? 'Đang hủy...' : 'Hủy giữ chỗ'}
                            </Button>
                            <Button
                                onClick={() => setShowConfirmDialog(true)}
                                disabled={isCompleting || isCancelling}
                                className="py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCompleting ? 'Đang xử lý...' : '✓ Kết thúc giữ chỗ'}
                            </Button>
                        </div>
                    )}

                    {/* Delete Button - Only show for COMPLETED, EXPIRED, MISSED, CANCELLED */}
                    {!readOnly && ['COMPLETED', 'EXPIRED', 'MISSED', 'CANCELLED'].includes(reservation.status) && (
                        <Button
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isDeleting}
                            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="w-4 h-4 inline mr-2" />
                            {isDeleting ? 'Đang xóa...' : 'Xóa giữ chỗ'}
                        </Button>
                    )}

                    <Button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 transition-all"
                    >
                        Đóng
                    </Button>
                </div>

                {/* Complete Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showConfirmDialog}
                    title="Xác nhận kết thúc"
                    message="Bạn có chắc chắn muốn kết thúc giữ chỗ này? Căn hộ sẽ trở về trạng thái có sẵn."
                    confirmText="Kết thúc"
                    cancelText="Hủy"
                    type="warning"
                    onConfirm={async () => {
                        setShowConfirmDialog(false);
                        setIsCompleting(true);
                        try {
                            const response = await fetch('/api/reservations/complete', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    reservationId: reservation.id
                                }),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                toastNotification.success('Đã kết thúc giữ chỗ thành công!');
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
                            toastNotification.error('Đã xảy ra lỗi khi kết thúc giữ chỗ');
                        } finally {
                            setIsCompleting(false);
                        }
                    }}
                    onCancel={() => setShowConfirmDialog(false)}
                />

                {/* Cancel Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showCancelDialog}
                    title="Xác nhận hủy giữ chỗ"
                    message="Bạn có chắc chắn muốn hủy giữ chỗ này? Căn hộ sẽ trở về trạng thái có sẵn."
                    confirmText="Hủy giữ chỗ"
                    cancelText="Quay lại"
                    type="danger"
                    onConfirm={async () => {
                        setShowCancelDialog(false);
                        setIsCancelling(true);
                        try {
                            const response = await fetch('/api/reservations/cancel', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    reservationId: reservation.id
                                }),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                toastNotification.success('Đã hủy giữ chỗ thành công!');
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
                            toastNotification.error('Đã xảy ra lỗi khi hủy giữ chỗ');
                        } finally {
                            setIsCancelling(false);
                        }
                    }}
                    onCancel={() => setShowCancelDialog(false)}
                />

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showDeleteDialog}
                    title="Xác nhận xóa giữ chỗ"
                    message="Bạn có chắc chắn muốn ẩn giữ chỗ này khỏi dashboard? Giữ chỗ vẫn sẽ được lưu trong lịch sử giao dịch."
                    confirmText={isDeleting ? "Đang xóa..." : "Xóa"}
                    cancelText="Hủy"
                    type="danger"
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteDialog(false)}
                />
            </motion.div>
        </div>
    );
}
