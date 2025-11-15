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
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from '@/lib/utils';
import { AnimatedBottomNavigation } from '@/components/AnimatedBottomNavigation';
import { useNavigation } from '@/hooks/useNavigation';
import { useTheme } from '@/hooks/useTheme';

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

    // Fetch all dashboard data
    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const userPhone = sessionStorage.getItem('login:userPhone');

                if (!userPhone) {
                    console.warn('No user phone found, redirecting to login');
                    router.push('/login');
                    return;
                }

                setIsLoading(true);

                // Fetch user data and all transactions in parallel
                const [userRes, reservationsRes, bookingsRes, depositsRes] = await Promise.all([
                    fetch('/api/user/me', { headers: { 'x-user-phone': userPhone } }),
                    fetch('/api/reservations', { headers: { 'x-user-phone': userPhone } }),
                    fetch('/api/bookings', { headers: { 'x-user-phone': userPhone } }),
                    fetch('/api/deposits', { headers: { 'x-user-phone': userPhone } })
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

                // Get recent bookings (last 4)
                const recent = bookings
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 4);

                setRecentBookings(recent);

                // Get recent deposits (last 4)
                const recentDeps = deposits
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 4);

                setRecentDeposits(recentDeps);

                // Set stats
                setStats({
                    reservations: reservations.filter((r: any) => r.status === 'ACTIVE').length,
                    bookings: bookings.filter((b: any) => b.status !== 'CANCELLED').length,
                    deposits: deposits.filter((d: any) => d.status !== 'CANCELLED').length
                });

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setIsLoading(false);
            }
        }
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

                    {/* Tổng số giao dịch */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`mt-6 rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center justify-between ${isDark ? "bg-[#1B2342]" : "bg-white"
                            }`}
                    >
                        <div>
                            <p className="text-slate-400 text-sm">Tổng số giao dịch đã thực hiện</p>
                            <h2 className="text-4xl font-bold mt-1">{stats.reservations + stats.bookings + stats.deposits}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center text-green-500 text-sm font-medium">
                                <ArrowUpRight className="w-5 h-5" />
                                +20%
                            </span>
                            <p className="text-xs text-slate-400">so với tháng trước</p>
                        </div>
                    </motion.section>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-2">

                        {/* Tổng số doanh số */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={`mt-6 rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center justify-between ${isDark ? "bg-[#1B2342]" : "bg-white"
                                }`}
                        >
                            <div>
                                <p className="text-slate-400 text-sm">Tổng số hoa hồng</p>
                                <h2 className="text-4xl font-bold mt-1">{formatCurrency(0)}</h2>
                                <p className="text-xs text-slate-400 mt-1">Đang cập nhật</p>
                            </div>
                        </motion.section>

                        {/* Tổng số booking */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={`mt-6 rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center justify-between ${isDark ? "bg-[#1B2342]" : "bg-white"
                                }`}
                        >
                            <div>
                                <p className="text-slate-400 text-sm">Tổng số booking</p>
                                <h2 className="text-4xl font-bold mt-1">{stats.bookings}</h2>
                            </div>
                        </motion.section>

                        {/* Tổng số giữ chỗ */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={`mt-6 rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center justify-between ${isDark ? "bg-[#1B2342]" : "bg-white"
                                }`}
                        >
                            <div>
                                <p className="text-slate-400 text-sm">Tổng số giữ chỗ</p>
                                <h2 className="text-4xl font-bold mt-1">{stats.reservations}</h2>
                            </div>
                        </motion.section>

                        {/* Tổng số đã cọc */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={`mt-6 rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center justify-between ${isDark ? "bg-[#1B2342]" : "bg-white"
                                }`}
                        >
                            <div>
                                <p className="text-slate-400 text-sm">Tổng số hợp đồng đã cọc</p>
                                <h2 className="text-4xl font-bold mt-1">{stats.deposits}</h2>
                            </div>
                        </motion.section>
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
                                    {recentBookings.map((booking: any, index: number) => (
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
                                                <p className="text-sm font-medium truncate">{booking.unit?.code || 'N/A'}</p>
                                                <p className="text-xs opacity-70 mt-1">{new Date(booking.createdAt).toLocaleDateString('vi-VN')}</p>
                                                <p className="text-xs opacity-70 mt-1">{booking.customerName}</p>
                                                <p className="text-xs opacity-70 mt-1">{formatCurrency(booking.bookingAmount)}</p>
                                            </div>
                                            <button className="text-[#1224c4] text-sm font-medium hover:underline">
                                                Xem chi tiết
                                            </button>
                                        </motion.div>
                                    ))}
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
                                                <p className="text-sm font-medium truncate">{deposit.unit?.code || 'N/A'}</p>
                                                <p className="text-xs opacity-70 mt-1">{new Date(deposit.depositDate).toLocaleDateString('vi-VN')}</p>
                                                <p className="text-xs opacity-70 mt-1">{deposit.customerName}</p>
                                                <p className="text-xs opacity-70 mt-1">{formatCurrency(deposit.depositAmount)}</p>
                                                <p className={`text-xs mt-1 font-medium ${deposit.status === 'CONFIRMED' ? 'text-green-600' :
                                                        deposit.status === 'PENDING_APPROVAL' ? 'text-yellow-600' :
                                                            deposit.status === 'CANCELLED' ? 'text-red-600' :
                                                                'text-blue-600'
                                                    }`}>
                                                    {deposit.status === 'CONFIRMED' ? 'Đã xác nhận' :
                                                        deposit.status === 'PENDING_APPROVAL' ? 'Chờ duyệt' :
                                                            deposit.status === 'CANCELLED' ? 'Đã hủy' :
                                                                deposit.status === 'OVERDUE' ? 'Quá hạn' :
                                                                    'Hoàn thành'}
                                                </p>
                                            </div>
                                            <button className="text-[#1224c4] text-sm font-medium hover:underline">
                                                Xem chi tiết
                                            </button>
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
        </div>
    );
}

