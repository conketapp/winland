/**
 * 🔑 PROFILE PAGE (CTV Portal)
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
    TrendingUp,
    AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from '@/lib/utils';
import { AnimatedBottomNavigation } from '@/components/AnimatedBottomNavigation';
import { useNavigation } from '@/hooks/useNavigation';

export default function DashboardScreen(): JSX.Element {
    const router = useRouter();
    const { activeNav, setActiveNav } = useNavigation();
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
                <div className="max-w-[1500px] mx-auto px-6 py-6 flex items-center justify-between">
                    {/* Left side - can add logo or title here */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold">Cộng Tác Viên Bất Động Sản Winland</h1>
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
                <h1>MY PROFILE</h1>
            </main>

            {/* 🔹 Footer */}
            <footer
                className={`text-center text-sm py-4 ${darkMode ? "bg-[#10182F] text-slate-400" : "bg-white text-slate-500 border-t"
                    }`}
            >
                © 2025 <span className="font-semibold">Bất Động Sản Winland</span>. Tất cả quyền được bảo lưu.
            </footer>

             {/* Bottom navigation */}
            <AnimatedBottomNavigation
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                darkMode={darkMode}
            />
        </div>
    );
}
