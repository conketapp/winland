/**
 * 🔑 PROJECT MANAGMENT PAGE (CTV Portal)
 *
 * @author Winland Team
 * @route /
 * @features Auto Dark Mode, JWT Auth (mock), Sales Chart, Responsive Full HD, Project Map
 * @date 29-10-2025
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Home,
    Sun,
    Moon,
    LogOut,
    LandPlot,
    Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedBottomNavigation } from "@/components/AnimatedBottomNavigation";
import { useNavigation } from "@/hooks/useNavigation";
import UnitModal from "@/components/UnitModal";
import { formatCurrency } from "@/lib/utils";


/* ----------------------------- TYPES ----------------------------- */
type UnitStatus = "available" | "reserved" | "sold" | "booking" | "deposit";
const statuses: UnitStatus[] = ["available", "reserved", "sold", "booking", "deposit"];
type Unit = {
    id: string;
    code: string;
    area: string;
    price: number;
    numRoom: number;
    numWC: number;
    status: UnitStatus;
    commission: number;
    view: string;
    direction?: string;
    customerName?: string;
    reservedUntil?: string;
    image: string;
};

type Block = {
    id: string;
    name: string;
    units: Unit[];
};

// Price and area templates
const areas = ["120m2", "150m2", "185m2", "210m2"];
const direction = ["Đông", "Tây", "Nam", "Bắc", "Đông Nam", "Tây Nam", "Đông Bắc", "Tây Bắc"];
const view = ["City view", "River view", "Park view", "Pool view", "Lake view", "Golf view","Skyline view",];
const prices = [6200000000, 7850000000, 8532000000, 9100000000, 10250000000, 5500000000];
const numRooms = [2, 3, 4, 5];
const numWCs = [1, 2, 3];
const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate apartment images
const generateUnitImage = (index: number): string => {
    const apartmentImages = [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Modern living room
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Luxury apartment
        "https://images.unsplash.com/photo-1560448075-bb485b067938?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Contemporary interior
        "https://images.unsplash.com/photo-1560449752-c4b8b5c6b9c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Modern kitchen
        "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Elegant bedroom
        "https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Spacious living area
        "https://images.unsplash.com/photo-1560449752-c4b8b5c6b9c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Modern bathroom
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Cozy apartment
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Premium unit
        "https://images.unsplash.com/photo-1560448075-bb485b067938?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Designer interior
    ];

    return apartmentImages[index % apartmentImages.length];
};

/* ----------------------------- MOCK DATA ----------------------------- */
// Generate mock data
export const blocks: Block[] = Array.from({ length: 10 }, (_, i) => {
    const blockName = `LK${i + 1}`;
    const numUnits = Math.floor(Math.random() * 4) + 9; // 9–12 units

    const units: Unit[] = Array.from({ length: numUnits }, (_, j) => {
        const id = `${blockName.toLowerCase()}-${String(j + 1).padStart(2, "0")}`;
        return {
            id,
            code: `${blockName}-${String(j + 1).padStart(2, "0")}`,
            area: getRandom(areas),
            price: getRandom(prices),
            numRoom: getRandom(numRooms),
            numWC: getRandom(numWCs),
            status: getRandom(statuses),
            commission: Math.floor(Math.random() * 50000000) + 25000000,
            direction: getRandom(direction),
            view: getRandom(view),
            image: generateUnitImage(j)
        };
    });

    return {
        id: blockName.toLowerCase(),
        name: blockName,
        units,
    };
});

const statusProperty: Record<UnitStatus, { dotColor: string; bgClass: string; label: string }> = {
    available: { dotColor: "bg-green-600", bgClass: "bg-green-600", label: "Đang mở bán" },
    reserved: { dotColor: "bg-yellow-600", bgClass: "bg-yellow-600", label: "Đang có đặt chỗ" },
    booking: { dotColor: "bg-blue-600", bgClass: "bg-blue-600", label: "Đang có booking" },
    deposit: { dotColor: "bg-purple-600", bgClass: "bg-purple-600", label: "Đã cọc tiền" },
    sold: { dotColor: "bg-red-600", bgClass: "bg-red-600", label: "Đã bán" },
};

/* Motion variants */
const cardVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1 },
    hover: { scale: 1.03 },
};
const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.03 } },
};

function LegendItem({ color, label, darkMode }: { color: string; label: string; darkMode: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full ${color}`} aria-hidden />
            <span className={`text-sm ${darkMode ? "text-white" : "text-slate-700"}`}>{label}</span>
        </div>
    );
}

/* ----------------------------- COMPONENT ----------------------------- */
export default function DashboardScreen(): JSX.Element {
    const router = useRouter();
    const { activeNav, setActiveNav } = useNavigation();
    const [darkMode, setDarkMode] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUnit, setSelectedUnit] = useState<any>(null);

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


    // Combine all units into one array
    const allUnits = blocks.flatMap((block) => block.units);

    // Filter by search input
    const filteredUnits = allUnits.filter((unit) =>
        unit.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Greeting by time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Chào buổi sáng";
        if (hour < 18) return "Chào buổi chiều";
        return "Chào buổi tối";
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
            {/* 🔹 HEADER */}
            <header
                className={`rounded-b-3xl shadow-md ${darkMode ? "bg-[#10182F]" : "bg-[#041b40] text-white"
                    }`}
            >
                <div className="max-w-[1500px] mx-auto px-6 py-6 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">
                        Cộng Tác Viên Bất Động Sản Winland
                    </h1>
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

            {/* 🔹 MAIN */}
            <main className="flex-1 w-full">
                <div className="max-w-[1500px] mx-auto px-6 py-5 space-y-8">
                    {/* Greeting Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={`rounded-3xl p-6 shadow-md hover:shadow-xl transition ${darkMode ? "bg-[#1B2342]" : "bg-white"
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#1436cc]/80 to-[#142985]/50 flex items-center justify-center">
                                <Home className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm opacity-70 mb-1">{getGreeting()}</p>
                                <p className="text-lg font-semibold">Danh sách căn hộ</p>
                                <p className="text-sm opacity-80">Chọn căn hộ để xem chi tiết và thực hiện giao dịch</p>
                            </div>
                        </div>
                    </motion.section>
                    {/* 🔍 Search Bar */}
                    <div className="relative">
                        <div
                            className={`flex items-center gap-2 border rounded-xl px-4 py-2 shadow-sm ${darkMode
                                ? "bg-[#1B2342] border-gray-600 text-white"
                                : "bg-white border-gray-200"
                                }`}
                        >
                            <Search size={18} className={`${darkMode ? "text-gray-300" : "text-gray-500"}`} />
                            <input
                                type="text"
                                placeholder="Nhập mã căn hộ"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full focus:outline-none bg-transparent ${darkMode
                                    ? "text-white placeholder-gray-400"
                                    : "text-slate-800 placeholder-gray-500"
                                    }`}
                            />
                        </div>

                        {/* Search Results Dropdown */}
                        {searchTerm && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`absolute top-[110%] left-0 w-full rounded-xl border mt-1 shadow-lg overflow-hidden z-50 ${darkMode ? "bg-[#1B2342] border-gray-700" : "bg-white border-gray-200"
                                    }`}
                            >
                                {filteredUnits.length > 0 ? (
                                    filteredUnits.map((unit) => {
                                        const status = statusProperty[unit.status];
                                        return (
                                            <div
                                                key={unit.id}
                                                className={`flex justify-between items-center px-4 py-2 cursor-pointer border-b last:border-0 ${darkMode
                                                    ? "hover:bg-gray-700 border-gray-600 text-white"
                                                    : "hover:bg-gray-50 border-gray-200 text-slate-800"
                                                    }`}
                                            >
                                                <span>{unit.code}</span>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full border text-white ${status.dotColor}`}
                                                >
                                                    {status.label}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className={`px-4 py-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>Không tìm thấy căn hộ</div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Project Map */}
                    <section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className={`rounded-3xl p-6 shadow-md hover:shadow-xl transition ${darkMode ? "bg-[#1B2342]" : "bg-white"
                                }`}
                        >
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div>
                                        <p className="text-lg font-semibold mb-1">Dự Án: Lê Văn Thiêm Luxury</p>
                                        <p className="text-sm opacity-80">Danh sách các block: {blocks.map(block => block.name).join(', ')}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                    <LegendItem color="bg-green-600" label="Đang mở bán" darkMode={darkMode} />
                                    <LegendItem color="bg-yellow-600" label="Đang có đặt chỗ" darkMode={darkMode} />
                                    <LegendItem color="bg-blue-600" label="Đang có booking" darkMode={darkMode} />
                                    <LegendItem color="bg-purple-600" label="Đã cọc tiền" darkMode={darkMode} />
                                    <LegendItem color="bg-red-600" label="Đã bán" darkMode={darkMode} />
                                </div>
                            </div>
                        </motion.section>

                        <AnimatePresence>
                            {blocks.map((block) => (
                                <section key={block.id} className="space-y-4 mb-7 mt-8">
                                    <div className="w-full flex justify-center">
                                        <div
                                            className={`${darkMode ? "bg-[#1B2342]" : "bg-white/70"
                                                } backdrop-blur-sm rounded-xl px-40 py-3 text-center font-medium shadow-sm max-w-[1000px]`}
                                        >
                                            {block.name}
                                        </div>
                                    </div>

                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        variants={containerVariants}
                                        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                                    >
                                        {block.units.map((unit) => {
                                            const status = statusProperty[unit.status];
                                            return (
                                                <motion.article
                                                    key={unit.id}
                                                    className="relative"
                                                    variants={cardVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    whileHover="hover"
                                                    onClick={() => unit.status === "available" && setSelectedUnit(unit)}
                                                >
                                                    <div
                                                        className={`rounded-xl shadow-sm text-white p-3 flex flex-col items-center justify-center gap-2 min-h-[88px] ${status.bgClass}`}
                                                    >
                                                        <div className="text-sm font-semibold">{unit.code}</div>
                                                        <div className="grid grid-cols-2 gap-1 w-full text-center">
                                                            <div className="text-xs opacity-90">{unit.area}</div>
                                                            <div className="text-xs opacity-90">{formatCurrency(unit.price)}</div>
                                                            <div className="text-xs opacity-90">PN: {unit.numRoom}</div>
                                                            <div className="text-xs opacity-90">WC: {unit.numWC}</div>
                                                        </div>
                                                        {/* 🔹 Badge hiển thị trạng thái */}
                                                        <div className="absolute top-2 right-2">
                                                            <span
                                                                className={`text-[10px] px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-sm`}
                                                            >
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.article>
                                            );
                                        })}
                                    </motion.div>
                                </section>
                            ))}
                        </AnimatePresence>
                    </section>
                </div>
            </main>

            {/* 🔹 FOOTER */}
            <footer
                className={`text-center text-sm py-4 ${darkMode
                    ? "bg-[#10182F] text-slate-400"
                    : "bg-white text-slate-500 border-t"
                    }`}
            >
                © 2025 <span className="font-semibold">Bất Động Sản Winland</span>. Tất cả quyền được bảo lưu.
            </footer>

            <AnimatedBottomNavigation
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                darkMode={darkMode}
            />
            {selectedUnit && (
                <UnitModal
                    unit={selectedUnit}
                    onClose={() => setSelectedUnit(null)}
                />
            )}
        </div>
    );
}