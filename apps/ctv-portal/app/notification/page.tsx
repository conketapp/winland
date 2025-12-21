/**
 * �  NOTIFICATION PAGE (CTV Portal)
 *
 * @author Winland Team
 * @route /notification
 * @features Display Bookings, Deposits, Reservations from database
 * @date 15-11-2025
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import {
    LogOut,
    Sun,
    Moon,
    Bell,
    Calendar,
    DollarSign,
    Clock,
    Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedBottomNavigation } from '@/components/AnimatedBottomNavigation';
import { useNavigation } from '@/hooks/useNavigation';
import { useTheme } from '@/hooks/useTheme';
import BookingDetailModal from '@/components/BookingDetailModal';
import ReservationDetailModal from '@/components/ReservationDetailModal';
import DepositDetailModal from '@/components/DepositDetailModal';
import type { Booking, Reservation, Deposit } from '@/lib/types/api.types';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    entityType?: string | null;
    entityId?: string | null;
    metadata?: Record<string, unknown> | null;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationPage(): JSX.Element {
    const router = useRouter();
    const { activeNav, setActiveNav } = useNavigation();
    const { isDark, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'booking' | 'deposit' | 'reservation'>('all');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
    const [currentUserPhone, setCurrentUserPhone] = useState<string>('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    useEffect(() => {
        const userPhone = sessionStorage.getItem('login:userPhone');
        if (!userPhone) {
            router.push('/login');
            return;
        }
        setCurrentUserPhone(userPhone);
        fetchNotifications();
    }, [router]);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const userPhone = sessionStorage.getItem('login:userPhone');

            const res = await fetch('/api/notifications/my?unreadOnly=false', {
                headers: { 'x-user-phone': userPhone || '' },
                cache: 'no-store'
            });

            const data = res.ok ? await res.json() : [];

            type ApiNotification = {
                id: string;
                type: string;
                title: string;
                message: string;
                entityType: string;
                entityId: string;
                metadata?: string | null;
                isRead: boolean;
                createdAt: string;
            };
            const mapped: Notification[] = (data as ApiNotification[]).map((n) => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                entityType: n.entityType,
                entityId: n.entityId,
                metadata: n.metadata ? JSON.parse(n.metadata) : undefined,
                isRead: n.isRead,
                createdAt: n.createdAt
            }));

            // Sort by creation date (newest first)
            mapped.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setNotifications(mapped);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("login:userPhone");
        router.push("/login");
    };

    const getTypeIcon = (type: string) => {
        if (type.includes('RESERVATION')) return <Clock className="w-5 h-5" />;
        if (type.includes('BOOKING')) return <Calendar className="w-5 h-5" />;
        if (type.includes('DEPOSIT') || type.includes('COMMISSION') || type.includes('PAYMENT')) return <DollarSign className="w-5 h-5" />;
        return <Bell className="w-5 h-5" />;
    };

    const getTypeLabel = (type: string) => {
        if (type.startsWith('RESERVATION_')) return 'Giữ chỗ';
        if (type.startsWith('BOOKING_')) return 'Booking';
        if (type.startsWith('DEPOSIT_')) return 'Cọc';
        if (type.startsWith('COMMISSION_')) return 'Hoa hồng';
        if (type.startsWith('PAYMENT_REQUEST_')) return 'Yêu cầu thanh toán';
        if (type.startsWith('PAYMENT_')) return 'Thanh toán';
        return type;
    };

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => {
            if (filter === 'booking') return n.type.startsWith('BOOKING_');
            if (filter === 'deposit') return n.type.startsWith('DEPOSIT_') || n.type.startsWith('COMMISSION_') || n.type.startsWith('PAYMENT_');
            if (filter === 'reservation') return n.type.startsWith('RESERVATION_');
            return true;
        });

    // Pagination
    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 when filter changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? "bg-[#0C1125] text-white" : "bg-gray-50 text-slate-900"}`}>
            {/* Header */}
            <header className={`rounded-b-3xl shadow-md ${isDark ? "bg-[#10182F]" : "bg-[#041b40] text-white"}`}>
                <div className="max-w-[1500px] mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <Bell className="w-6 h-6" />
                            <h1 className="text-xl font-semibold">Thông Báo</h1>
                        </div>
                        {lastUpdated && (
                            <p className="text-xs opacity-70 mt-1 ml-9">
                                Cập nhật lúc: {lastUpdated.toLocaleTimeString('vi-VN')}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/10 hover:bg-white/10 transition"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/10 hover:bg-white/10 transition"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 w-full max-w-[1500px] mx-auto px-6 py-8">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    {[
                        { key: 'all', label: 'Tất cả', count: notifications.length },
                        { key: 'booking', label: 'Booking', count: notifications.filter(n => n.type === 'booking').length },
                        { key: 'deposit', label: 'Cọc', count: notifications.filter(n => n.type === 'deposit').length },
                        { key: 'reservation', label: 'Giữ chỗ', count: notifications.filter(n => n.type === 'reservation').length }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key as 'all' | 'booking' | 'deposit' | 'reservation')}
                            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${filter === tab.key
                                ? 'bg-blue-600 text-white'
                                : isDark
                                    ? 'bg-[#10182F] text-slate-300 hover:bg-[#1B2342]'
                                    : 'bg-white text-slate-700 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-[#10182F]' : 'bg-white'}`}>
                        <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg text-gray-500">Không có thông báo nào</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {paginatedNotifications.map((notification, index) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`rounded-2xl p-6 shadow-md hover:shadow-lg transition ${isDark ? 'bg-[#10182F]' : 'bg-white'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-3 rounded-xl ${notification.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                                            notification.type === 'deposit' ? 'bg-green-100 text-green-600' : notification.type === 'reservation' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-purple-100 text-purple-600'
                                            }`}>
                                            {getTypeIcon(notification.type)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold text-lg">{getTypeLabel(notification.type)}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${notification.isRead ? 'text-gray-600 bg-gray-100' : 'text-blue-700 bg-blue-50'}`}>
                                                    {notification.isRead ? 'Đã đọc' : 'Mới'}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-800 whitespace-pre-line">
                                                    {notification.message}
                                                </div>
                                                <div className="flex items-center justify-between gap-2 text-sm text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        <span>Tạo lúc: {new Date(notification.createdAt).toLocaleString('vi-VN')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {!isLoading && filteredNotifications.length > itemsPerPage && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg font-medium transition ${currentPage === 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : isDark
                                    ? 'bg-[#1B2342] text-white hover:bg-[#2A3454]'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                                }`}
                        >
                            ← Trước
                        </button>

                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-lg font-medium transition ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : isDark
                                            ? 'bg-[#1B2342] text-white hover:bg-[#2A3454]'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-lg font-medium transition ${currentPage === totalPages
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : isDark
                                    ? 'bg-[#1B2342] text-white hover:bg-[#2A3454]'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                                }`}
                        >
                            Sau →
                        </button>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className={`text-center text-sm py-4 ${isDark ? "bg-[#10182F] text-slate-400" : "bg-white text-slate-500 border-t"}`}>
                © 2025 <span className="font-semibold">Bất Động Sản Winland</span>. Tất cả quyền được bảo lưu.
            </footer>

            {/* Bottom navigation */}
            <AnimatedBottomNavigation
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                darkMode={isDark}
            />

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onComplete={() => {
                        setSelectedBooking(null);
                        fetchNotifications();
                    }}
                    readOnly={selectedBooking.ctv?.phone !== currentUserPhone}
                />
            )}

            {/* Reservation Detail Modal */}
            {selectedReservation && (
                <ReservationDetailModal
                    reservation={selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                    onComplete={() => {
                        setSelectedReservation(null);
                        fetchNotifications();
                    }}
                    readOnly={selectedReservation.ctv?.phone !== currentUserPhone}
                />
            )}

            {/* Deposit Detail Modal */}
            {selectedDeposit && (
                <DepositDetailModal
                    deposit={selectedDeposit}
                    onClose={() => setSelectedDeposit(null)}
                    onComplete={() => {
                        setSelectedDeposit(null);
                        fetchNotifications();
                    }}
                    readOnly={selectedDeposit.ctv?.phone !== currentUserPhone}
                />
            )}
        </div>
    );
}
