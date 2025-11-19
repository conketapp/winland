/**
 * 🔑 DASHBOARD PAGE (CTV Portal)
 *
 * @author Winland Team
 * @route /
 * @features Auto Dark Mode, JWT Auth (mock), Sales Chart, Responsive Full HD
 * @date 28-10-2025
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import {
    User,
    Calendar,
    ArrowUpRight,
    LogOut,
    Sun,
    Moon,
    AlertTriangle,
    FileText,
    Trash2,
    TrendingUp,
    DollarSign,
    CheckCircle,
    Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from '@/lib/utils';
import { AnimatedBottomNavigation } from '@/components/AnimatedBottomNavigation';
import { useNavigation } from '@/hooks/useNavigation';
import { useTheme } from '@/hooks/useTheme';
import BookingDetailModal from '@/components/BookingDetailModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toastNotification } from '@/app/utils/toastNotification';

export default function DashboardScreen(): JSX.Element {
    const { activeNav, setActiveNav } = useNavigation();
    const router = useRouter();
    const { isDark, toggleTheme } = useTheme();
    const [userData, setUserData] = useState<any>(null);
    const [urgentReservations, setUrgentReservations] = useState<any[]>([]);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [recentDeposits, setRecentDeposits] = useState<any[]>([]);
    const [stats, setStats] = useState({ reservations: 0, bookings: 0, deposits: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [greeting, setGreeting] = useState<string>("Chào buổi");
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch all dashboard data
    const fetchDashboardData = async () => {
        try {
            const userPhone = sessionStorage.getItem('login:userPhone');

            if (!userPhone) {
                console.warn('No user phone found, redirecting to login');
                router.push('/login');
                return;
            }

            setIsLoading(true);

            // Check and update expired bookings first
            try {
                await fetch('/api/bookings/check-expired', { method: 'POST' });
            } catch (error) {
                console.error('Error checking expired bookings:', error);
            }

            // Fetch user data and all transactions in parallel with cache-busting
            const [userRes, reservationsRes, bookingsRes, depositsRes] = await Promise.all([
                fetch('/api/user/me', {
                    headers: { 'x-user-phone': userPhone },
                    cache: 'no-store'
                }),
                fetch('/api/reservations', {
                    headers: { 'x-user-phone': userPhone },
                    cache: 'no-store'
                }),
                fetch('/api/bookings', {
                    headers: { 'x-user-phone': userPhone },
                    cache: 'no-store'
                }),
                fetch('/api/deposits', {
                    headers: { 'x-user-phone': userPhone },
                    cache: 'no-store'
                })
            ]);

            // Parse responses
            const user = userRes.ok ? await userRes.json() : null;
            const reservations = reservationsRes.ok ? await reservationsRes.json() : [];
            const bookings = bookingsRes.ok ? await bookingsRes.json() : [];
            const deposits = depositsRes.ok ? await depositsRes.json() : [];

            if (user && !user.error) {
                setUserData(user);
            } else {
                router.push('/login');
                return;
            }

            // Filter urgent reservations (expiring within 24 hours)
            const now = new Date();
            const urgent = reservations
                .filter((r: any) => {
                    const expiryDate = new Date(r.reservedUntil);
                    const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24 && r.status === 'ACTIVE';
                })
                .sort((a: any, b: any) => new Date(a.reservedUntil).getTime() - new Date(b.reservedUntil).getTime())
                .slice(0, 4);

            setUrgentReservations(urgent);

            // Get recent bookings (last 4) - exclude hidden ones
            const recent = bookings
                .filter((b: any) => !b.notes?.includes('[HIDDEN_FROM_DASHBOARD]'))
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 4);

            setRecentBookings(recent);

            // Get recent deposits (last 4)
            const recentDeps = deposits
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 4);

            setRecentDeposits(recentDeps);

            // Set stats - exclude hidden bookings
            setStats({
                reservations: reservations.filter((r: any) => r.status === 'ACTIVE').length,
                bookings: bookings.filter((b: any) =>
                    b.status !== 'CANCELLED' && !b.notes?.includes('[HIDDEN_FROM_DASHBOARD]')
                ).length,
                deposits: deposits.filter((d: any) => d.status !== 'CANCELLED').length
            });

        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [router]);

    // Set greeting on client side only to avoid hydration mismatch
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting("Chào buổi sáng");
        } else if (hour < 18) {
            setGreeting("Chào buổi chiều");
        } else {
            setGreeting("Chào buổi tối");
        }
    }, []);

    // Show delete confirmation dialog
    const handleDeleteClick = (bookingId: string) => {
        setBookingToDelete(bookingId);
        setShowDeleteDialog(true);
    };

    // Delete completed booking
    const confirmDeleteBooking = async () => {
        if (!bookingToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/bookings/${bookingToDelete}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove from local state (hidden from dashboard)
                setRecentBookings(prev => prev.filter(b => b.id !== bookingToDelete));
                toastNotification.success('Đã ẩn booking khỏi dashboard!');
                setShowDeleteDialog(false);
                setBookingToDelete(null);
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

    // Helper function to calculate time until expiry
    const getTimeUntilExpiry = (expiryDate: string) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diffMs = expiry.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHours > 0) {
            return `${diffHours} giờ ${diffMinutes} phút`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} phút`;
        } else {
            return 'Đã hết hạn';
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("login:userPhone");
        router.push("/login");
    };

    return (
        <div
            className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? "bg-[#0C1125] text-white" : "bg-gray-50 text-slate-900"
                }`}
        >
            {/* 🔹 Header */}
            <header
                className={`rounded-b-3xl shadow-md ${isDark ? "bg-[#10182F]" : "bg-[#041b40] text-white"
                    }`}
            >
                <div className="max-w-[1500px] mx-auto px-6 py-6 flex items-center justify-between">
                    {/* Left side - can add logo or title here */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold">Cộng Tác Viên Bất Động Sản Winland</h1>
                    </div>

                    {/* Right side - Toggle Dark Mode & Logout */}
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
            <main className="flex-1 w-full">
                <div className="max-w-[1500px] mx-auto px-6 py-5">
                    {/* User header */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={`rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center justify-between ${isDark ? "bg-[#1B2342]" : "bg-white"
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#C6A052]/80 to-[#C6A052]/50 flex items-center justify-center">
                                {userData?.avatar ? (
                                    <img
                                        src={userData.avatar}
                                        alt="User Avatar"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <User className={`w-6 h-6 text-white ${userData?.avatar ? 'hidden' : ''}`} />
                            </div>
                            <div>
                                <p className="text-sm opacity-70 mb-1">{greeting}</p>
                                <p className="text-lg font-semibold">{userData?.fullName || 'Đang tải...'}</p>
                                <p className="text-sm opacity-80">{userData?.role || 'CTV'}</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={`rounded-2xl p-5 shadow-md hover:shadow-lg transition ${isDark ? "bg-[#1B2342]" : "bg-white"}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs opacity-70 mb-1">Đang hoạt động</p>
                                    <p className="text-2xl font-bold">{stats.reservations + stats.bookings + stats.deposits}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${isDark ? "bg-blue-900/30" : "bg-blue-100"}`}>
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                            className={`rounded-2xl p-5 shadow-md hover:shadow-lg transition ${isDark ? "bg-[#1B2342]" : "bg-white"}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs opacity-70 mb-1">Giữ chỗ</p>
                                    <p className="text-2xl font-bold">{stats.reservations}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${isDark ? "bg-purple-900/30" : "bg-purple-100"}`}>
                                    <Clock className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className={`rounded-2xl p-5 shadow-md hover:shadow-lg transition ${isDark ? "bg-[#1B2342]" : "bg-white"}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs opacity-70 mb-1">Booking</p>
                                    <p className="text-2xl font-bold">{stats.bookings}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${isDark ? "bg-green-900/30" : "bg-green-100"}`}>
                                    <Calendar className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.35 }}
                            className={`rounded-2xl p-5 shadow-md hover:shadow-lg transition ${isDark ? "bg-[#1B2342]" : "bg-white"}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs opacity-70 mb-1">Đặt cọc</p>
                                    <p className="text-2xl font-bold">{stats.deposits}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${isDark ? "bg-orange-900/30" : "bg-orange-100"}`}>
                                    <DollarSign className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Emergency list */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-10"
                    >
                        <div className={`rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 ${isDark ? "bg-[#1B2342]" : "bg-white"}`}>
                            <h3 className="text-lg font-semibold mb-2">Giữ chỗ sắp hết hạn</h3>
                            <p className="text-slate-400 text-sm mb-4">Cần xử lý gấp</p>
                            {isLoading ? (
                                <div className="text-center py-8 text-slate-400">Đang tải...</div>
                            ) : urgentReservations.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">Không có giữ chỗ nào sắp hết hạn</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {urgentReservations.map((reservation: any, index: number) => (
                                        <motion.div
                                            key={reservation.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                                            className={`rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition ${isDark ? "bg-[#1B2342]" : "bg-white"
                                                }`}
                                        >
                                            <div
                                                className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDark ? "bg-red-900/30" : "bg-red-50"
                                                    }`}
                                            >
                                                <AlertTriangle className="w-6 h-6 text-red-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{reservation.unit?.code || 'N/A'}</p>
                                                <p className="text-xs opacity-70 mt-1">Còn {getTimeUntilExpiry(reservation.reservedUntil)}</p>
                                                <p className="text-xs opacity-70 mt-1">{reservation.customerName}</p>
                                                <p className="text-xs opacity-70 mt-1">{reservation.customerPhone}</p>
                                            </div>
                                            <button className="text-[#cc1427] text-sm font-medium hover:underline">
                                                Xem chi tiết
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* Booking list */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-10"
                    >
                        <div className={`rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 ${isDark ? "bg-[#1B2342]" : "bg-white"}`}>
                            <h3 className="text-lg font-semibold mb-2">Danh sách Booking</h3>
                            <p className="text-slate-400 text-sm mb-4">Các booking gần đây</p>
                            {isLoading ? (
                                <div className="text-center py-8 text-slate-400">Đang tải...</div>
                            ) : recentBookings.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">Chưa có booking nào</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {recentBookings.map((booking: any, index: number) => {
                                        // Extract schedule from notes if fields are null (backward compatibility)
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

                                        return (
                                            <motion.div
                                                key={booking.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                                                className={`rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition ${isDark ? "bg-[#1B2342]" : "bg-white"
                                                    }`}
                                            >
                                                <div
                                                    className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDark ? "bg-green-900/30" : "bg-green-50"
                                                        }`}
                                                >
                                                    <Calendar className="w-6 h-6 text-green-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-sm font-medium truncate">{booking.unit?.code || 'N/A'}</p>
                                                        {booking.status === 'COMPLETED' && (
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                                                ✓ Hoàn thành
                                                            </span>
                                                        )}
                                                        {booking.status === 'EXPIRED' && (
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                                                                ⏱ Hết hạn
                                                            </span>
                                                        )}
                                                        {booking.status === 'CONFIRMED' && (
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                                                                Đã xác nhận
                                                            </span>
                                                        )}
                                                        {booking.status === 'PENDING_APPROVAL' && (
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                Chờ duyệt
                                                            </span>
                                                        )}
                                                        {booking.status === 'CANCELLED' && (
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'}`}>
                                                                Đã hủy
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs opacity-70 mt-1">{booking.customerName}</p>
                                                    {visitDate && visitStartTime && visitEndTime && (
                                                        <p className="text-xs text-blue-600 font-medium mt-1">
                                                            {visitDate} • {visitStartTime}-{visitEndTime}
                                                        </p>
                                                    )}
                                                    <p className="text-xs opacity-70 mt-1">Tạo lúc: {new Date(booking.createdAt).toLocaleDateString('vi-VN')}</p>
                                                    <div className="mt-2 flex items-center justify-between gap-2">
                                                        <button
                                                            onClick={() => setSelectedBooking(booking)}
                                                            className="text-[#1224c4] text-sm font-medium hover:underline"
                                                        >
                                                            Xem chi tiết
                                                        </button>
                                                        {(booking.status === 'COMPLETED' || booking.status === 'EXPIRED' || booking.status === 'CANCELLED') && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteClick(booking.id);
                                                                }}
                                                                className={`p-2 rounded-lg transition-colors ${isDark
                                                                    ? 'hover:bg-red-900/30 text-red-400'
                                                                    : 'hover:bg-red-50 text-red-600'
                                                                    }`}
                                                                title="Xóa booking"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* Deposit list */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-10"
                    >
                        <div className={`rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 ${isDark ? "bg-[#1B2342]" : "bg-white"}`}>
                            <h3 className="text-lg font-semibold mb-2">Danh sách hợp đồng đang trong quá trình đặt cọc</h3>
                            <p className="text-slate-400 text-sm mb-4">Các hợp đồng đặt cọc gần đây</p>
                            {isLoading ? (
                                <div className="text-center py-8 text-slate-400">Đang tải...</div>
                            ) : recentDeposits.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">Chưa có hợp đồng đặt cọc nào</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {recentDeposits.map((deposit: any, index: number) => (
                                        <motion.div
                                            key={deposit.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                                            className={`rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition ${isDark ? "bg-[#1B2342]" : "bg-white"
                                                }`}
                                        >
                                            <div
                                                className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDark ? "bg-blue-900/30" : "bg-blue-50"
                                                    }`}
                                            >
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-medium truncate">{deposit.unit?.code || 'N/A'}</p>
                                                    {deposit.status === 'CONFIRMED' && (
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                                            Đã xác nhận
                                                        </span>
                                                    )}
                                                    {deposit.status === 'PENDING_APPROVAL' && (
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            Chờ duyệt
                                                        </span>
                                                    )}
                                                    {deposit.status === 'CANCELLED' && (
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'}`}>
                                                            Đã hủy
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs opacity-70 mt-1">{deposit.customerName}</p>
                                                <p className="text-xs font-semibold text-green-600 mt-1">{formatCurrency(deposit.depositAmount)}</p>
                                                <p className="text-xs opacity-70 mt-1">Ngày cọc: {new Date(deposit.depositDate).toLocaleDateString('vi-VN')}</p>
                                                <div className="mt-2 text-right">
                                                    <button className="text-[#1224c4] text-sm font-medium hover:underline">
                                                        Xem chi tiết
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.section>
                </div>
            </main>

            {/* 🔹 Footer */}
            <footer
                className={`text-center text-sm py-4 ${isDark ? "bg-[#10182F] text-slate-400" : "bg-white text-slate-500 border-t"
                    }`}
            >
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
                        fetchDashboardData();
                    }}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Ẩn booking khỏi dashboard"
                message="Bạn có chắc chắn muốn ẩn booking này khỏi dashboard? Booking vẫn sẽ được lưu trong lịch sử giao dịch."
                confirmText={isDeleting ? "Đang ẩn..." : "Ẩn"}
                cancelText="Hủy"
                type="warning"
                onConfirm={confirmDeleteBooking}
                onCancel={() => {
                    setShowDeleteDialog(false);
                    setBookingToDelete(null);
                }}
            />
        </div>
    );
}

