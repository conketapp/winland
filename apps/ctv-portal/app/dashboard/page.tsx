/**
 * 🔑 DASHBOARD PAGE (CTV Portal)
 *
 * @author Windland Team
 * @route /
 * @features Auto Dark Mode, JWT Auth (mock), Sales Chart, Responsive Full HD
 * @date 28-10-2025
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import {
    Home,
    ShoppingCart,
    Map,
    Bell,
    User,
    Calendar,
    ArrowUpRight,
    LogOut,
    Sun,
    Moon,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

export default function DashboardScreen(): JSX.Element {
    const router = useRouter();
    const [activeNav, setActiveNav] = useState("home");
    const [darkMode, setDarkMode] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>(null);

    // Detect system theme
    useEffect(() => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setDarkMode(prefersDark);
    }, []);

    // Mock JWT login
    useEffect(() => {
        async function mockLogin() {
            try {
                const res = await fetch("/api/mock-login");
                const data = await res.json();
                setToken(data.token);
                setUserData(data.user);
            } catch (err) {
                console.error("JWT Mock Login Failed:", err);
            }
        }
        mockLogin();
    }, []);

    // Get greeting based on current time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) {
            return "Chào buổi sáng";
        } else if (hour < 18) {
            return "Chào buổi chiều";
        } else {
            return "Chào buổi tối";
        }
    };

    const chartData = [
        { name: "1", sales: 5 },
        { name: "2", sales: 8 },
        { name: "3", sales: 4 },
        { name: "4", sales: 10 },
        { name: "5", sales: 7 },
        { name: "6", sales: 12 },
        { name: "7", sales: 9 },
    ];

    const bookings = [
        { id: 1, title: "Booking căn hộ LK1-01", time: "06:00 – 07:00 Thứ 2 12/02/2024" },
        { id: 2, title: "Booking căn hộ LK1-02", time: "08:00 – 09:00 Thứ 3 13/02/2024" },
        { id: 3, title: "Booking căn hộ LK1-03", time: "10:00 – 11:00 Thứ 4 14/02/2024" },
        { id: 4, title: "Booking căn hộ LK1-04", time: "10:00 – 11:00 Thứ 4 14/02/2024" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("jwt_token");
        setToken(null);
        setUserData(null);
        router.push("/login");
    };

    return (
        <div
            className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? "bg-[#0C1125] text-white" : "bg-gray-50 text-slate-900"
                }`}
        >
            {/* 🔹 Header */}
            <header
                className={`rounded-b-3xl shadow-md ${darkMode ? "bg-[#10182F]" : "bg-[#041b40] text-white"
                    }`}
            >
                <div className="max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
                    {/* Left side - can add logo or title here */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold">Cộng Tác Viên Bất Động Sản Windland</h1>
                    </div>

                    {/* Right side - Toggle Dark Mode & Logout */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/10 hover:bg-white/10 transition"
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
                <div className="max-w-[1200px] mx-auto px-6 py-5">
                    {/* User header */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={`rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center justify-between ${darkMode ? "bg-[#1B2342]" : "bg-white"
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#C6A052]/80 to-[#C6A052]/50 flex items-center justify-center">
                                <img
                                    src={userData?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback to User icon if image fails to load
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                                <User className="w-6 h-6 text-white hidden" />
                            </div>
                            <div>
                                <p className="text-sm opacity-70 mb-1">{getGreeting()}</p>
                                <p className="text-lg font-semibold">{userData?.name || "Trần Quang A"}</p>
                                <p className="text-sm opacity-80">{userData?.role || "Sales Manager"}</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Tổng số cọc */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`mt-6 rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center justify-between ${darkMode ? "bg-[#1B2342]" : "bg-white"
                            }`}
                    >
                        <div>
                            <p className="text-slate-400 text-sm">Tổng số căn hộ đã thực hiện cọc</p>
                            <h2 className="text-4xl font-bold mt-1">10</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center text-green-500 text-sm font-medium">
                                <ArrowUpRight className="w-5 h-5" />
                                +20%
                            </span>
                            <p className="text-xs text-slate-400">so với tháng trước</p>
                        </div>
                    </motion.section>

                    {/* Booking list */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-10">
                        <h3 className="text-lg font-semibold mb-4">Danh sách Booking</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {bookings.map((b, index) => (
                                <motion.div
                                    key={b.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                                    className={`rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition ${darkMode ? "bg-[#1B2342]" : "bg-white"
                                        }`}
                                >
                                    <div
                                        className={`w-14 h-14 rounded-xl flex items-center justify-center ${darkMode ? "bg-green-900/30" : "bg-green-50"
                                            }`}
                                    >
                                        <Calendar className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{b.title}</p>
                                        <p className="text-xs opacity-70 mt-1">{b.time}</p>
                                    </div>
                                    <button className="text-[#1224c4] text-sm font-medium hover:underline">
                                        Xem chi tiết
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Biểu đồ doanh số */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-10">
                        <h3 className="text-lg font-semibold mb-4">Doanh số theo tháng</h3>
                        <div
                            className={`rounded-3xl p-6 shadow-md ${darkMode ? "bg-[#1B2342]" : "bg-white"
                                }`}
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#2C3559" : "#eee"} />
                                    <XAxis dataKey="name" stroke={darkMode ? "#ddd" : "#555"} />
                                    <YAxis stroke={darkMode ? "#ddd" : "#555"} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: darkMode ? "#1B2342" : "#fff",
                                            color: darkMode ? "#fff" : "#000",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#1224c4"
                                        strokeWidth={3}
                                        dot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.section>
                </div>
            </main>

            {/* 🔹 Footer */}
            <footer
                className={`text-center text-sm py-4 ${darkMode ? "bg-[#10182F] text-slate-400" : "bg-white text-slate-500 border-t"
                    }`}
            >
                © 2025 <span className="font-semibold">Bất Động Sản Windland</span>. Tất cả quyền được bảo lưu.
            </footer>

            {/* 🔹 Bottom navigation */}
            <nav className={`${darkMode ? "bg-[#10182F]" : "bg-white border-t"} sticky bottom-0`}>
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="grid grid-cols-5 py-3">
                        {[
                            { id: "home", label: "Trang chủ", icon: Home },
                            { id: "cart", label: "Giỏ hàng", icon: ShoppingCart },
                            { id: "map", label: "Quy hoạch", icon: Map },
                            { id: "notif", label: "Thông báo", icon: Bell },
                            { id: "user", label: "Cá nhân", icon: User },
                        ].map((item) => {
                            const active = activeNav === item.id;
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveNav(item.id)}
                                    className="flex flex-col items-center justify-center gap-1"
                                >
                                    <Icon
                                        className={`w-6 h-6 ${active ? "text-[#1224c4]" : darkMode ? "text-slate-400" : "text-slate-500"
                                            }`}
                                    />
                                    <span
                                        className={`text-[13px] ${active ? "text-[#1224c4] font-medium" : "opacity-70"
                                            }`}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
}
