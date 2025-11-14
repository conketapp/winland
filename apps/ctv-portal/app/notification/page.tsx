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
    User,
    Loader2,
    CheckCircle,
    XCircle,
    AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from '@/lib/utils';
import { AnimatedBottomNavigation } from '@/components/AnimatedBottomNavigation';
import { useNavigation } from '@/hooks/useNavigation';
import { useTheme } from '@/hooks/useTheme';

interface Notification {
    id: string;
    type: 'booking' | 'deposit' | 'reservation';
    code: string;
    customerName: string;
    customerPhone: string;
    unitCode: string;
    amount?: number;
    status: string;
    createdAt: string;
    expiresAt?: string;
}

export default function NotificationPage(): JSX.Element {
    const router = useRouter();
    const { activeNav, setActiveNav } = useNavigation();
    const { isDark, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'booking' | 'deposit' | 'reservation'>('all');

    useEffect(() => {
        const userPhone = sessionStorage.getItem('login:userPhone');
        if (!userPhone) {
            router.push('/login');
            return;
        }
        fetchNotifications();
    }, [router]);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const userPhone = sessionStorage.getItem('login:userPhone');

            // Fetch all notifications
            const [bookingsRes, depositsRes, reservationsRes] = await Promise.all([
                fetch('/api/bookings', {
                    headers: { 'x-user-phone': userPhone || '' }
                }),
                fetch('/api/deposits', {
                    headers: { 'x-user-phone': userPhone || '' }
                }),
                fetch('/api/reservations', {
                    headers: { 'x-user-phone': userPhone || '' }
                })
            ]);

            const bookings = bookingsRes.ok ? await bookingsRes.json() : [];
            const deposits = depositsRes.ok ? await depositsRes.json() : [];
            const reservations = reservationsRes.ok ? await reservationsRes.json() : [];

            // Combine and format notifications
            const allNotifications: Notification[] = [
                ...bookings.map((b: any) => ({
                    id: b.id,
                    type: 'booking' as const,
                    code: b.code,
                    customerName: b.customerName,
                    customerPhone: b.customerPhone,
                    unitCode: b.unit?.code || 'N/A',
                    amount: b.bookingAmount,
                    status: b.status,
                    createdAt: b.createdAt,
                    expiresAt: b.expiresAt
                })),
                ...deposits.map((d: any) => ({
                    id: d.id,
                    type: 'deposit' as const,
                    code: d.code,
                    customerName: d.customerName,
                    customerPhone: d.customerPhone,
                    unitCode: d.unit?.code || 'N/A',
                    amount: d.depositAmount,
                    status: d.status,
                    createdAt: d.createdAt
                })),
                ...reservations.map((r: any) => ({
                    id: r.id,
                    type: 'reservation' as const,
                    code: r.code,
                    customerName: r.customerName,
                    customerPhone: r.customerPhone,
                    unitCode: r.unit?.code || 'N/A',
                    status: r.status,
                    createdAt: r.createdAt,
                    expiresAt: r.reservedUntil
                }))
            ];

            // Sort by creation date (newest first)
            allNotifications.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setNotifications(allNotifications);
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

    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('confirmed') || statusLower.includes('active')) return 'text-green-600 bg-green-50';
        if (statusLower.includes('pending')) return 'text-yellow-600 bg-yellow-50';
        if (statusLower.includes('cancelled') || statusLower.includes('expired')) return 'text-red-600 bg-red-50';
        return 'text-gray-600 bg-gray-50';
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'booking': return <Calendar className="w-5 h-5" />;
            case 'deposit': return <DollarSign className="w-5 h-5" />;
            case 'reservation': return <Clock className="w-5 h-5" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'booking': return 'Booking';
            case 'deposit': return 'Cọc';
            case 'reservation': return 'Giữ chỗ';
            default: return type;
        }
    };

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => n.type === filter);

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? "bg-[#0C1125] text-white" : "bg-gray-50 text-slate-900"}`}>
            {/* Header */}
            <header className={`rounded-b-3xl shadow-md ${isDark ? "bg-[#10182F]" : "bg-[#041b40] text-white"}`}>
                <div className="max-w-[1500px] mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bell className="w-6 h-6" />
                        <h1 className="text-xl font-semibold">Thông Báo</h1>
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
                            onClick={() => setFilter(tab.key as any)}
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
                        {filteredNotifications.map((notification, index) => (
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
                                                notification.type === 'deposit' ? 'bg-green-100 text-green-600' :
                                                    'bg-purple-100 text-purple-600'
                                            }`}>
                                            {getTypeIcon(notification.type)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold text-lg">{getTypeLabel(notification.type)}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                                                    {notification.status}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-medium">Mã:</span>
                                                    <span className="font-mono">{notification.code}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="w-4 h-4" />
                                                    <span>{notification.customerName}</span>
                                                    <span className="text-gray-500">•</span>
                                                    <span>{notification.customerPhone}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-medium">Căn hộ:</span>
                                                    <span className="font-semibold text-blue-600">{notification.unitCode}</span>
                                                </div>
                                                {notification.amount && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <DollarSign className="w-4 h-4" />
                                                        <span className="font-semibold text-green-600">
                                                            {formatCurrency(notification.amount)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{new Date(notification.createdAt).toLocaleString('vi-VN')}</span>
                                                </div>
                                                {notification.expiresAt && (
                                                    <div className="flex items-center gap-2 text-sm text-orange-600">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <span>Hết hạn: {new Date(notification.expiresAt).toLocaleString('vi-VN')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
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
        </div>
    );
}
