"use client";

import { useState } from "react";
import { X, User, Phone, Mail, Calendar, Clock, FileText, CheckCircle, Bed, Bath, Maximize2, Compass, Eye, ChevronLeft, ChevronRight, Building2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";
import { getModalResponsiveClasses } from "@/app/utils/responsive";
import { toastNotification } from '@/app/utils/toastNotification';
import ConfirmDialog from '@/components/ConfirmDialog';

import type { Booking } from '@/lib/types/api.types';

type BookingWithExtraFields = Booking & {
    visitDate?: string | null;
    visitStartTime?: string | null;
    visitEndTime?: string | null;
};

type BookingDetailModalProps = {
    booking: BookingWithExtraFields;
    onClose: () => void;
    onComplete?: () => void;
    readOnly?: boolean;
};

export default function BookingDetailModal({ booking: bookingProp, onClose, onComplete, readOnly = false }: BookingDetailModalProps) {
    const booking = bookingProp as BookingWithExtraFields;
    const deviceInfo = useDeviceDetect();
    const responsive = getModalResponsiveClasses(deviceInfo);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!booking) return null;

    // Parse images from database
    const defaultImages = [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ];

    let unitImages = defaultImages;
    if (booking.unit?.images) {
        try {
            if (typeof booking.unit.images === 'string') {
                unitImages = JSON.parse(booking.unit.images);
            } else if (Array.isArray(booking.unit.images)) {
                unitImages = booking.unit.images;
            }
        } catch (e) {
            console.error('Error parsing unit images:', e);
        }
    }

    // Calculate actual expiry time: visitEndTime + 30 minutes
    const getActualExpiryTime = () => {
        if (!booking.visitDate || !booking.visitEndTime) return null;
        const visitDateTime = new Date(`${booking.visitDate}T${booking.visitEndTime}`);
        visitDateTime.setMinutes(visitDateTime.getMinutes() + 30);
        return visitDateTime;
    };

    const actualExpiryTime = getActualExpiryTime();

    // Extract schedule from notes if fields are null
    let visitDate = booking.visitDate;
    let visitStartTime = booking.visitStartTime;
    let visitEndTime = booking.visitEndTime;

    if (!visitDate && booking.notes) {
        const match = booking.notes.match(/Lịch xem nhà: (\S+) từ (\S+) đến (\S+)/);
        if (match) {
            visitDate = match[1];
            visitStartTime = match[2];
            visitEndTime = match[3];
        }
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % unitImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + unitImages.length) % unitImages.length);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'PENDING_APPROVAL':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'EXPIRED':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            default:
                return 'bg-blue-100 text-blue-700 border-blue-300';
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
            case 'EXPIRED':
                return 'Hết hạn';
            default:
                return status;
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/bookings/${booking.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toastNotification.success('Đã ẩn booking khỏi dashboard!');
                setShowDeleteDialog(false);
                onClose();
                if (onComplete) {
                    onComplete();
                } else {
                    window.location.reload();
                }
            } else {
                const data = await response.json();
                toastNotification.error(data.error || 'Không thể ẩn booking');
            }
        } catch (error) {
            console.error('Delete booking error:', error);
            toastNotification.error('Đã xảy ra lỗi khi xóa booking');
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
                <div className="relative bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`font-bold ${responsive.titleSize}`}>Chi tiết Booking</h3>
                            <p className="text-sm opacity-90 mt-1">Mã: {booking.code}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStatusColor(booking.status)}`}>
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-semibold text-sm">{getStatusText(booking.status)}</span>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="space-y-4">
                        {/* Unit Images */}
                        {booking.unit && (
                            <div className="relative bg-white rounded-2xl shadow-md overflow-hidden">
                                <img
                                    src={unitImages[currentImageIndex]}
                                    alt={`${booking.unit.code} - Image ${currentImageIndex + 1}`}
                                    className="w-full h-64 object-cover"
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center px-3">
                                    <button
                                        onClick={prevImage}
                                        className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white shadow-lg transition-all"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                </div>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3">
                                    <button
                                        onClick={nextImage}
                                        className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white shadow-lg transition-all"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                                {/* Image indicators */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                    {unitImages.map((_: string, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Unit Information */}
                        {booking.unit && (
                            <div className="bg-white rounded-2xl shadow-md p-5">
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                    Thông tin căn hộ
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Dự án:</span>
                                        <span className="font-semibold">{booking.unit.project?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Mã căn hộ:</span>
                                        <span className="font-semibold text-blue-600">{booking.unit.code}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Tòa nhà:</span>
                                        <span className="font-medium">{booking.unit.building?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Tầng:</span>
                                        <span className="font-medium">{booking.unit.floor?.number || 'N/A'}</span>
                                    </div>
                                    {booking.unit.price && (
                                        <div className="flex justify-between items-center pt-2 border-t">
                                            <span className="text-sm text-gray-600">Giá bán:</span>
                                            <span className="font-bold text-green-600 text-lg">{formatCurrency(booking.unit.price)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Unit Details Grid */}
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    {booking.unit.bedrooms !== null && booking.unit.bedrooms !== undefined && (
                                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                                            <Bed className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                                            <p className="text-xs text-gray-600">Phòng ngủ</p>
                                            <p className="font-semibold text-blue-700">{booking.unit.bedrooms}</p>
                                        </div>
                                    )}
                                    {booking.unit.bathrooms !== null && booking.unit.bathrooms !== undefined && (
                                        <div className="bg-purple-50 rounded-xl p-3 text-center">
                                            <Bath className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                                            <p className="text-xs text-gray-600">Phòng tắm</p>
                                            <p className="font-semibold text-purple-700">{booking.unit.bathrooms}</p>
                                        </div>
                                    )}
                                    {booking.unit.area && (
                                        <div className="bg-green-50 rounded-xl p-3 text-center">
                                            <Maximize2 className="w-5 h-5 mx-auto text-green-600 mb-1" />
                                            <p className="text-xs text-gray-600">Diện tích</p>
                                            <p className="font-semibold text-green-700">{booking.unit.area}m²</p>
                                        </div>
                                    )}
                                    {booking.unit.direction && (
                                        <div className="bg-yellow-50 rounded-xl p-3 text-center">
                                            <Compass className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                                            <p className="text-xs text-gray-600">Hướng</p>
                                            <p className="font-semibold text-yellow-700">{booking.unit.direction}</p>
                                        </div>
                                    )}
                                </div>

                                {/* View */}
                                {booking.unit.view && (
                                    <div className="mt-3 bg-indigo-50 rounded-xl p-3 text-center">
                                        <Eye className="w-5 h-5 mx-auto text-indigo-600 mb-1" />
                                        <p className="text-xs text-gray-600">Tầm nhìn</p>
                                        <p className="font-semibold text-indigo-700">{booking.unit.view}</p>
                                    </div>
                                )}

                                {/* Description */}
                                {booking.unit.description && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Mô tả:</p>
                                        <p className="text-sm text-gray-600">{booking.unit.description}</p>
                                    </div>
                                )}

                                {/* House Certificate */}
                                {booking.unit && 'houseCertificate' in booking.unit && (booking.unit as { houseCertificate?: string }).houseCertificate && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Chứng từ:</p>
                                        <p className="text-sm text-blue-600 font-medium">{(booking.unit as { houseCertificate?: string }).houseCertificate}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CTV Information */}
                        {booking.ctv && (
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
                                            <p className="font-semibold text-indigo-800">{booking.ctv.fullName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-4 h-4 text-indigo-600 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs text-indigo-600">Số điện thoại</p>
                                            <p className="font-medium text-indigo-800">{booking.ctv.phone}</p>
                                        </div>
                                    </div>
                                    {booking.ctv.email && (
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-4 h-4 text-indigo-600 mt-1" />
                                            <div className="flex-1">
                                                <p className="text-xs text-indigo-600">Email</p>
                                                <p className="font-medium text-indigo-800">{booking.ctv.email}</p>
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
                                        <p className="font-medium">{booking.customerName}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-gray-400 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Số điện thoại</p>
                                        <p className="font-medium">{booking.customerPhone}</p>
                                    </div>
                                </div>
                                {booking.customerEmail && (
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-4 h-4 text-gray-400 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium">{booking.customerEmail}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Visit Schedule */}
                        {visitDate && visitStartTime && visitEndTime && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md p-5 border-2 border-blue-200">
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-700">
                                    <Calendar className="w-5 h-5" />
                                    Lịch xem nhà
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        <div>
                                            <p className="text-xs text-blue-600">Ngày xem</p>
                                            <p className="font-semibold text-blue-700">{visitDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <div>
                                            <p className="text-xs text-blue-600">Thời gian</p>
                                            <p className="font-semibold text-blue-700">{visitStartTime} - {visitEndTime}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Information */}
                        <div className="bg-white rounded-2xl shadow-md p-5">
                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-600" />
                                Thông tin bổ sung
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Ngày tạo:</span>
                                    <span className="font-medium">{new Date(booking.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                                {actualExpiryTime && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Hết hạn:</span>
                                        <span className="font-medium text-orange-600">{actualExpiryTime.toLocaleString('vi-VN')}</span>
                                    </div>
                                )}
                                {booking.approvedAt && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Ngày duyệt:</span>
                                        <span className="font-medium text-green-600">{new Date(booking.approvedAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes - Filter out hidden marker */}
                        {(() => {
                            const cleanNotes = booking.notes?.replace(/\[HIDDEN_FROM_DASHBOARD\]/g, '').replace(/\n+/g, '\n').trim();
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
                    {/* Action Buttons - Only show for CONFIRMED bookings and not in readOnly mode */}
                    {!readOnly && booking.status === 'CONFIRMED' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={() => setShowCancelDialog(true)}
                                disabled={isCancelling || isCompleting}
                                className="py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCancelling ? 'Đang hủy...' : 'Hủy Booking'}
                            </Button>
                            <Button
                                onClick={() => setShowConfirmDialog(true)}
                                disabled={isCompleting || isCancelling}
                                className="py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCompleting ? 'Đang xử lý...' : '✓ Kết thúc booking'}
                            </Button>
                        </div>
                    )}

                    {/* Delete Button - Only show for COMPLETED, EXPIRED, CANCELLED */}
                    {!readOnly && ['COMPLETED', 'EXPIRED', 'CANCELLED'].includes(booking.status) && (
                        <Button
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isDeleting}
                            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="w-4 h-4 inline mr-2" />
                            {isDeleting ? 'Đang xóa...' : 'Xóa Booking'}
                        </Button>
                    )}

                    <Button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all"
                    >
                        Đóng
                    </Button>
                </div>

                {/* Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showConfirmDialog}
                    title="Xác nhận kết thúc"
                    message="Bạn có chắc chắn muốn kết thúc booking này? Căn hộ sẽ trở về trạng thái có sẵn."
                    confirmText="Kết thúc"
                    cancelText="Hủy"
                    type="warning"
                    onConfirm={async () => {
                        setShowConfirmDialog(false);
                        setIsCompleting(true);
                        try {
                            const response = await fetch('/api/bookings/complete', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    bookingId: booking.id
                                }),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                toastNotification.success('Đã kết thúc booking thành công!');
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
                            toastNotification.error('Đã xảy ra lỗi khi kết thúc booking');
                        } finally {
                            setIsCompleting(false);
                        }
                    }}
                    onCancel={() => setShowConfirmDialog(false)}
                />

                {/* Cancel Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showCancelDialog}
                    title="Xác nhận hủy booking"
                    message="Bạn có chắc chắn muốn hủy booking này? Căn hộ sẽ trở về trạng thái có sẵn."
                    confirmText="Hủy booking"
                    cancelText="Quay lại"
                    type="danger"
                    onConfirm={async () => {
                        setShowCancelDialog(false);
                        setIsCancelling(true);
                        try {
                            const response = await fetch('/api/bookings/cancel', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    bookingId: booking.id
                                }),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                toastNotification.success('Đã hủy booking thành công!');
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
                            toastNotification.error('Đã xảy ra lỗi khi hủy booking');
                        } finally {
                            setIsCancelling(false);
                        }
                    }}
                    onCancel={() => setShowCancelDialog(false)}
                />

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showDeleteDialog}
                    title="Xác nhận xóa booking"
                    message="Bạn có chắc chắn muốn ẩn booking này khỏi dashboard? Booking vẫn sẽ được lưu trong lịch sử giao dịch."
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
