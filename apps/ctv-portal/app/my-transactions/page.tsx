/**
 * 🔑 MY TRANSACTIONS PAGE (CTV Portal)
 *
 * @author Winland Team
 * @route /my-transactions
 * @features Transaction History, Commission Tracking, Financial Overview
 * @date 17-11-2025
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import {
    LogOut,
    Sun,
    Moon,
    TrendingUp,
    DollarSign,
    Calendar,
    Clock,
    Filter,
    Search,
    Download,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from '@/lib/utils';
import { AnimatedBottomNavigation } from '@/components/AnimatedBottomNavigation';
import { useNavigation } from '@/hooks/useNavigation';

type TransactionType = 'all' | 'reservation' | 'booking' | 'deposit' | 'commission';

interface Transaction {
    id: string;
    type: 'reservation' | 'booking' | 'deposit' | 'commission';
    code: string;
    unitCode: string;
    projectName?: string;
    buildingName?: string;
    customerName: string;
    amount: number;
    commission?: number;
    status: string;
    createdAt: string;
}

export default function MyTransactionsPage(): JSX.Element {
    const router = useRouter();
    const { activeNav, setActiveNav } = useNavigation();
    const [darkMode, setDarkMode] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filter, setFilter] = useState<TransactionType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalTransactions: 0,
        totalCommission: 0,
        pendingCommission: 0,
        paidCommission: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    useEffect(() => {
        const userPhone = sessionStorage.getItem('login:userPhone');
        if (!userPhone) {
            router.push('/login');
            return;
        }
        fetchTransactions();
    }, [router]);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            const userPhone = sessionStorage.getItem('login:userPhone');

            // Check and update expired bookings first
            try {
                await fetch('/api/bookings/check-expired', { method: 'POST' });
            } catch (error) {
                console.error('Error checking expired bookings:', error);
            }

            // Check and update expired reservations first
            try {
                await fetch('/api/reservations/check-expired', { method: 'POST' });
            } catch (error) {
                console.error('Error checking expired reservations:', error);
            }

            const [reservationsRes, bookingsRes, depositsRes] = await Promise.all([
                fetch('/api/reservations', {
                    headers: { 'x-user-phone': userPhone || '' },
                    cache: 'no-store'
                }),
                fetch('/api/bookings', {
                    headers: { 'x-user-phone': userPhone || '' },
                    cache: 'no-store'
                }),
                fetch('/api/deposits', {
                    headers: { 'x-user-phone': userPhone || '' },
                    cache: 'no-store'
                })
            ]);

            const reservations = reservationsRes.ok ? await reservationsRes.json() : [];
            const bookings = bookingsRes.ok ? await bookingsRes.json() : [];
            const deposits = depositsRes.ok ? await depositsRes.json() : [];

            // Combine all transactions
            const allTransactions: Transaction[] = [
                ...reservations.map((r: any) => ({
                    id: r.id,
                    type: 'reservation' as const,
                    code: r.code,
                    unitCode: r.unit?.code || 'N/A',
                    projectName: r.unit?.project?.name || 'N/A',
                    buildingName: r.unit?.building?.name || 'N/A',
                    customerName: r.customerName,
                    amount: 50000000, // Default reservation amount
                    status: r.status,
                    createdAt: r.createdAt
                })),
                ...bookings.map((b: any) => ({
                    id: b.id,
                    type: 'booking' as const,
                    code: b.code,
                    unitCode: b.unit?.code || 'N/A',
                    projectName: b.unit?.project?.name || 'N/A',
                    buildingName: b.unit?.building?.name || 'N/A',
                    customerName: b.customerName,
                    amount: 0,
                    status: b.status,
                    createdAt: b.createdAt
                })),
                ...deposits.map((d: any) => ({
                    id: d.id,
                    type: 'deposit' as const,
                    code: d.code,
                    unitCode: d.unit?.code || 'N/A',
                    projectName: d.unit?.project?.name || 'N/A',
                    buildingName: d.unit?.building?.name || 'N/A',
                    customerName: d.customerName,
                    amount: d.depositAmount,
                    commission: d.commissions?.amount || (d.depositAmount * 0.02), // Use actual commission or fallback to 2%
                    status: d.status,
                    createdAt: d.createdAt
                }))
            ];

            // Sort by date
            allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setTransactions(allTransactions);

            // Calculate stats
            const totalCommission = deposits
                .filter((d: any) => d.status === 'CONFIRMED' || d.status === 'COMPLETED')
                .reduce((sum: number, d: any) => sum + (d.commissions?.amount || (d.depositAmount * 0.02)), 0);

            const pendingCommission = deposits
                .filter((d: any) => d.status === 'PENDING_APPROVAL')
                .reduce((sum: number, d: any) => sum + (d.commissions?.amount || (d.depositAmount * 0.02)), 0);

            setStats({
                totalTransactions: allTransactions.length,
                totalCommission,
                pendingCommission,
                paidCommission: totalCommission // Simplified for now
            });

        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesFilter = filter === 'all' || t.type === filter;
        const matchesSearch = t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    // Reset to page 1 when filter or search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm]);

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'reservation': return 'Giữ chỗ';
            case 'booking': return 'Booking';
            case 'deposit': return 'Đặt cọc';
            case 'commission': return 'Hoa hồng';
            default: return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'reservation': return 'bg-purple-100 text-purple-700';
            case 'booking': return 'bg-blue-100 text-blue-700';
            case 'deposit': return 'bg-green-100 text-green-700';
            case 'commission': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusColor = (status: string, type?: string) => {
        if (status === 'COMPLETED') {
            return 'bg-green-100 text-green-700 border-green-300';
        } else if (status === 'CONFIRMED') {
            return 'bg-blue-100 text-blue-700 border-blue-300';
        } else if (status === 'ACTIVE') {
            return 'bg-green-100 text-green-700 border-green-300';
        } else if (status.includes('PENDING')) {
            return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        } else if (status === 'EXPIRED') {
            return 'bg-gray-100 text-gray-700 border-gray-300';
        } else if (status.includes('CANCELLED')) {
            return 'bg-red-100 text-red-700 border-red-300';
        }
        return 'bg-gray-100 text-gray-700 border-gray-300';
    };

    const getStatusText = (status: string, type?: string) => {
        switch (status) {
            case 'COMPLETED':
                return type === 'deposit' ? 'Hoàn thành - Đã bán' : 'Hoàn thành';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'PENDING_APPROVAL':
                return 'Chờ duyệt';
            case 'PENDING_PAYMENT':
                return 'Chờ thanh toán';
            case 'EXPIRED':
                return 'Hết hạn';
            case 'CANCELLED':
                return 'Đã hủy';
            case 'ACTIVE':
                return 'Đang hoạt động';
            default:
                return status;
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("login:userPhone");
        router.push("/login");
    };

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? "bg-[#0C1125] text-white" : "bg-gray-50 text-slate-900"}`}>
            {/* Header */}
            <header className={`rounded-b-3xl shadow-md ${darkMode ? "bg-[#10182F]" : "bg-[#041b40] text-white"}`}>
                <div className="max-w-[1500px] mx-auto px-6 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Giao dịch của tôi</h1>
                        <p className="text-sm opacity-80 mt-1">Theo dõi lịch sử giao dịch và hoa hồng</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-[1500px] mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl p-6 shadow-md ${darkMode ? "bg-[#1B2342]" : "bg-white"}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-70">Tổng giao dịch</p>
                                <p className="text-3xl font-bold mt-2">{stats.totalTransactions}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-100">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`rounded-2xl p-6 shadow-md ${darkMode ? "bg-[#1B2342]" : "bg-white"}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-70">Tổng hoa hồng</p>
                                <p className="text-2xl font-bold mt-2 text-green-600">{formatCurrency(stats.totalCommission)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-green-100">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`rounded-2xl p-6 shadow-md ${darkMode ? "bg-[#1B2342]" : "bg-white"}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-70">Chờ duyệt</p>
                                <p className="text-2xl font-bold mt-2 text-yellow-600">{formatCurrency(stats.pendingCommission)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-yellow-100">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`rounded-2xl p-6 shadow-md ${darkMode ? "bg-[#1B2342]" : "bg-white"}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-70">Đã nhận</p>
                                <p className="text-2xl font-bold mt-2 text-blue-600">{formatCurrency(stats.paidCommission)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-100">
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Filters and Search */}
                <div className={`rounded-2xl p-6 shadow-md mb-6 ${darkMode ? "bg-[#1B2342]" : "bg-white"}`}>
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Filter Tabs */}
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { key: 'all', label: 'Tất cả', count: transactions.length },
                                { key: 'reservation', label: 'Giữ chỗ', count: transactions.filter(t => t.type === 'reservation').length },
                                { key: 'booking', label: 'Booking', count: transactions.filter(t => t.type === 'booking').length },
                                { key: 'deposit', label: 'Đặt cọc', count: transactions.filter(t => t.type === 'deposit').length }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key as TransactionType)}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === tab.key
                                        ? 'bg-blue-600 text-white'
                                        : darkMode
                                            ? 'bg-[#10182F] text-slate-300 hover:bg-[#1B2342]'
                                            : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo mã, căn hộ, khách hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode
                                    ? 'bg-[#10182F] border-gray-700 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-[#1B2342]' : 'bg-white'}`}>
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg text-gray-500">Không có giao dịch nào</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {paginatedTransactions.map((transaction, index) => (
                            <motion.div
                                key={transaction.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`rounded-2xl p-6 shadow-md hover:shadow-lg transition ${darkMode ? 'bg-[#10182F]' : 'bg-white'}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-3 rounded-xl ${transaction.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                                            transaction.type === 'deposit' ? 'bg-green-100 text-green-600' :
                                                transaction.type === 'reservation' ?'bg-yellow-100 text-yellow-600' : 'bg-black-100 text-black-600'
                                            }`}>
                                            {transaction.type === 'booking' ? <Calendar className="w-6 h-6" /> :
                                                transaction.type === 'deposit' ? <DollarSign className="w-6 h-6" /> :
                                                    <Clock className="w-6 h-6" />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold text-lg">{getTypeLabel(transaction.type)}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status, transaction.type)}`}>
                                                    {getStatusText(transaction.status, transaction.type)}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-medium">Mã:</span>
                                                    <span className="font-mono">{transaction.code}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-medium">Khách hàng:</span>
                                                    <span>{transaction.customerName}</span>
                                                </div>
                                                {transaction.projectName && transaction.buildingName ? (
                                                    <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                                                        <span className="font-semibold text-blue-700 dark:text-blue-400">
                                                            Dự án: {transaction.projectName}
                                                        </span>
                                                        <span className="text-gray-500 mx-2">-</span>
                                                        <span className="font-semibold text-blue-700 dark:text-blue-400">
                                                            Block: {transaction.buildingName}
                                                        </span>
                                                        <span className="text-gray-500 mx-2">-</span>
                                                        <span className="font-bold text-blue-600 dark:text-blue-300">
                                                            Căn hộ: {transaction.unitCode}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="font-medium">Căn hộ:</span>
                                                        <span className="font-semibold text-blue-600">{transaction.unitCode}</span>
                                                    </div>
                                                )}
                                                {transaction.amount > 0 && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <DollarSign className="w-4 h-4" />
                                                        <span className="font-semibold text-green-600">{formatCurrency(transaction.amount)}</span>
                                                    </div>
                                                )}
                                                {transaction.commission && (
                                                    <div className="flex items-center gap-2 text-sm bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                                                        <TrendingUp className="w-4 h-4 text-orange-600" />
                                                        <span className="font-medium text-orange-700 dark:text-orange-400">
                                                            Hoa hồng: {formatCurrency(transaction.commission)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{new Date(transaction.createdAt).toLocaleString('vi-VN')}</span>
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
                {!isLoading && filteredTransactions.length > itemsPerPage && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg font-medium transition ${currentPage === 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : darkMode
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
                                        : darkMode
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
                                : darkMode
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
            <footer className={`text-center text-sm py-4 ${darkMode ? "bg-[#10182F] text-slate-400" : "bg-white text-slate-500 border-t"}`}>
                © 2025 <span className="font-semibold">Bất Động Sản Winland</span>. Tất cả quyền được bảo lưu.
            </footer>

            {/* Bottom Navigation */}
            <AnimatedBottomNavigation
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                darkMode={darkMode}
            />
        </div>
    );
}
