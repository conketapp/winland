/**
 * 🔑 PROJECT MANAGMENT PAGE (CTV Portal)
 *
 * @author Winland Team
 * @route /
 * @features Auto Dark Mode, JWT Auth (mock), Sales Chart, Responsive Full HD, Project Map
 * @date 29-10-2025
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Home,
    Sun,
    Moon,
    LogOut,
    Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedBottomNavigation } from "@/components/AnimatedBottomNavigation";
import { useNavigation } from "@/hooks/useNavigation";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";
import { useTheme } from "@/hooks/useTheme";
import UnitModal from "@/components/UnitModal";
import DepositModal from "@/components/DepositModal";
import ReservedModal from "@/components/ReservedModal";
import BookingModal from "@/components/BookingModal";
import { formatCurrency } from "@/lib/utils";
import { toastNotification } from '@/app/utils/toastNotification';
import { ToastContainer } from 'react-toastify';

/* ----------------------------- TYPES ----------------------------- */
type UnitStatus = "available" | "reserved" | "sold" | "booking" | "deposit";

type Unit = {
    id: string;
    projectId: string;
    projectName?: string;
    code: string;
    area: number;
    price: number;
    bedrooms: number | null;
    bathrooms: number | null;
    status: UnitStatus;
    commissionRate: number | null;
    floor: number;
    view: string | null;
    direction: string | null;
    images: string | null;
    description: string | null;
    unitNumber: string;
    buildingName?: string;
};

type Building = {
    id: string;
    name: string;
    code: string;
    units: Unit[];
};

type Project = {
    id: string;
    name: string;
    code: string;
    buildings: Building[];
};

// Map database status to display status
const mapDatabaseStatus = (dbStatus: string, hasActiveBooking: boolean, hasActiveReservation: boolean): UnitStatus => {
    switch (dbStatus) {
        case 'AVAILABLE':
            return 'available';
        case 'RESERVED_BOOKING':
            // If unit has active booking, show as booking
            if (hasActiveBooking) {
                return 'booking';
            }
            // If unit has active reservation, show as reserved
            if (hasActiveReservation) {
                return 'reserved';
            }
            // Default to reserved if status is RESERVED_BOOKING but no active records found
            return 'reserved';
        case 'DEPOSITED':
            return 'deposit';
        case 'SOLD':
            return 'sold';
        default:
            return 'available';
    }
};

// Helper to get floor number from unit
const getFloorNumber = (unitNumber: string): number => {
    // Extract floor from unit number (e.g., "0501" -> floor 5)
    const floorStr = unitNumber.substring(0, 2);
    return parseInt(floorStr) || 1;
};

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

function LegendItem({ color, label, isDark }: { color: string; label: string; isDark: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full ${color}`} aria-hidden />
            <span className={`text-sm ${isDark ? "text-white" : "text-slate-700"}`}>{label}</span>
        </div>
    );
}

/* ----------------------------- COMPONENT ----------------------------- */
export default function DashboardScreen(): JSX.Element {
    const router = useRouter();
    const { activeNav, setActiveNav } = useNavigation();
    const deviceInfo = useDeviceDetect();
    const { isDark, toggleTheme } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUnit, setSelectedUnit] = useState<any>(null);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showReservedModal, setShowReservedModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    const fetchProjects = useCallback(async (silent: boolean = false) => {
        try {
            if (!silent) {
                setIsLoading(true);
            }
            const response = await fetch('/api/projects');

            if (response.ok) {
                const data = await response.json();

                // Transform database data to match component structure
                const transformedProjects: Project[] = data.map((project: any) => ({
                    id: project.id,
                    name: project.name,
                    code: project.code,
                    buildings: project.buildings.map((building: any) => ({
                        id: building.id,
                        name: building.name,
                        code: building.code,
                        units: building.units.map((unit: any) => {
                            const hasActiveBooking = unit.bookings && unit.bookings.length > 0;
                            const hasActiveReservation = unit.reservations && unit.reservations.length > 0;

                            return {
                                id: unit.id,
                                projectId: project.id,
                                projectName: project.name,
                                code: unit.code,
                                area: unit.area,
                                price: unit.price,
                                bedrooms: unit.bedrooms,
                                bathrooms: unit.bathrooms,
                                status: mapDatabaseStatus(unit.status, hasActiveBooking, hasActiveReservation),
                                commissionRate: unit.commissionRate,
                                floor: getFloorNumber(unit.unitNumber),
                                view: unit.view,
                                direction: unit.direction,
                                images: unit.images,
                                description: unit.description,
                                unitNumber: unit.unitNumber,
                                buildingName: building.name
                            };
                        })
                    }))
                }));

                setProjects(transformedProjects);
                setLastUpdate(new Date());
            } else {
                if (!silent) {
                    toastNotification.error('Không thể tải danh sách dự án');
                }
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            if (!silent) {
                toastNotification.error('Đã xảy ra lỗi khi tải dữ liệu');
            }
        } finally {
            if (!silent) {
                setIsLoading(false);
            }
        }
    }, []);

    // Fetch projects from database on mount
    useEffect(() => {
        const userPhone = sessionStorage.getItem('login:userPhone');
        if (!userPhone) {
            router.push('/login');
            return;
        }
        fetchProjects();
    }, [router, fetchProjects]);

    // Set first project as default when projects load
    useEffect(() => {
        if (!selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    // Auto-refresh every 10 seconds
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchProjects(true); // Silent refresh (no loading state)
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [autoRefresh, fetchProjects]);

    // Filter projects based on selection - only show selected project
    const filteredProjects = projects.filter(project =>
        project.id === selectedProjectId
    );

    // Combine all units from filtered projects and buildings
    const allUnits = filteredProjects.flatMap(project =>
        project.buildings.flatMap(building => building.units)
    );

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
        sessionStorage.removeItem("login:userPhone");
        router.push("/login");
    };

    // Helper function to handle unit click based on status
    const handleUnitClick = (unit: Unit) => {
        if (unit.status === "available") {
            setSelectedUnit(unit);
        } else if (unit.status === "booking") {
            toastNotification.info("Căn này đang trong quá trình booking");
        } else if (unit.status === "deposit") {
            toastNotification.warning("Căn này đã được đặt cọc");
        } else if (unit.status === "reserved") {
            toastNotification.warning("Căn này đang có người giữ chỗ");
        } else if (unit.status === "sold") {
            toastNotification.error("Căn này đã được bán");
        }
    };

    // Helper function to get responsive classes based on device type
    const getResponsiveClasses = () => {
        if (deviceInfo.isMobile) {
            return {
                headerPadding: "px-4 py-4",
                titleSize: "text-lg",
                gridCols: "grid-cols-2",
                cardPadding: "p-3",
                cardShape: "aspect-square", // Square cards for mobile
                legendFlex: "flex-wrap",
            };
        } else if (deviceInfo.isTablet) {
            return {
                headerPadding: "px-6 py-5",
                titleSize: "text-xl",
                gridCols: "grid-cols-3",
                cardPadding: "p-4",
                cardShape: "", // Regular cards for tablet
                legendFlex: "flex-wrap",
            };
        } else {
            return {
                headerPadding: "px-6 py-6",
                titleSize: "text-xl",
                gridCols: "grid-cols-4 xl:grid-cols-5",
                cardPadding: "p-3",
                cardShape: "", // Regular cards for desktop
                legendFlex: "flex-wrap",
            };
        }
    };

    const responsiveClasses = getResponsiveClasses();

    return (
        <div
            className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? "bg-[#0C1125] text-white" : "bg-gray-50 text-slate-900"
                }`}
        >
            {/* 🔹 HEADER */}
            <header
                className={`rounded-b-3xl shadow-md ${isDark ? "bg-[#10182F]" : "bg-[#041b40] text-white"
                    }`}
            >
                <div className={`max-w-[1500px] mx-auto ${responsiveClasses.headerPadding} flex items-center justify-between`}>
                    <div className="flex flex-col">
                        <h1 className={`${responsiveClasses.titleSize} font-semibold ${deviceInfo.isMobile ? "text-center" : ""}`}>
                            {deviceInfo.isMobile ? "CTV Winland" : "Cộng Tác Viên Bất Động Sản Winland"}
                        </h1>
                        {!deviceInfo.isMobile && (
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`flex items-center gap-1 text-xs ${autoRefresh ? 'text-green-400' : 'text-gray-400'}`}>
                                    <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span>{autoRefresh ? 'Tự động cập nhật' : 'Đã tắt tự động cập nhật'}</span>
                                </div>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">
                                    Cập nhật lúc: {lastUpdate.toLocaleTimeString('vi-VN')}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md border transition ${autoRefresh
                                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                                : 'border-white/10 hover:bg-white/10'
                                }`}
                            title={autoRefresh ? 'Tắt tự động cập nhật' : 'Bật tự động cập nhật'}
                        >
                            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                            {!deviceInfo.isMobile && <span className="text-sm">Auto</span>}
                        </button>
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

            {/* 🔹 MAIN */}
            <main className="flex-1 w-full">
                <div className="max-w-[1500px] mx-auto px-6 py-5 space-y-8">
                    {/* Greeting Section with Project Filter */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={`rounded-3xl ${responsiveClasses.cardPadding} shadow-md hover:shadow-xl transition ${isDark ? "bg-[#1B2342]" : "bg-white"
                            }`}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`${deviceInfo.isMobile ? "w-8 h-8" : "w-12 h-12"} rounded-full overflow-hidden bg-gradient-to-br from-[#1436cc]/80 to-[#142985]/50 flex items-center justify-center`}>
                                    <Home className={`${deviceInfo.isMobile ? "w-4 h-4" : "w-6 h-6"} text-white`} />
                                </div>
                                <div>
                                    <p className="text-sm opacity-70 mb-1">{getGreeting()}</p>
                                    <p className="text-lg font-semibold">Danh sách căn hộ</p>
                                    <p className="text-sm opacity-80">Chọn căn hộ để xem chi tiết và thực hiện giao dịch</p>
                                </div>
                            </div>
                            {!deviceInfo.isMobile && (
                                <div className="flex items-center gap-2">
                                    <label className="text-sm opacity-70">Dự án:</label>
                                    <select
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                        className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                                            ? "bg-[#0C1125] border-gray-600 text-white"
                                            : "bg-white border-gray-300 text-slate-900"
                                            }`}
                                    >
                                        {projects.map((project) => (
                                            <option key={project.id} value={project.id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        {deviceInfo.isMobile && (
                            <div className="mt-4 flex items-center gap-2">
                                <label className="text-sm opacity-70">Dự án:</label>
                                <select
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                                        ? "bg-[#0C1125] border-gray-600 text-white"
                                        : "bg-white border-gray-300 text-slate-900"
                                        }`}
                                >
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </motion.section>

                    {/* 🔍 Search Bar */}
                    <div className="relative">
                        <div
                            className={`flex items-center gap-2 border rounded-xl px-4 py-2 shadow-sm ${isDark
                                ? "bg-[#1B2342] border-gray-600 text-white"
                                : "bg-white border-gray-200"
                                }`}
                        >
                            <Search size={18} className={`${isDark ? "text-gray-300" : "text-gray-500"}`} />
                            <input
                                type="text"
                                placeholder="Nhập mã căn hộ"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full focus:outline-none bg-transparent ${isDark
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
                                className={`absolute top-[110%] left-0 w-full rounded-xl border mt-1 shadow-lg overflow-hidden z-50 ${isDark ? "bg-[#1B2342] border-gray-700" : "bg-white border-gray-200"
                                    }`}
                            >
                                {filteredUnits.length > 0 ? (
                                    <div className="max-h-80 overflow-y-auto">
                                        {filteredUnits.map((unit) => {
                                            const status = statusProperty[unit.status];
                                            return (
                                                <div
                                                    key={unit.id}
                                                    onClick={() => handleUnitClick(unit)}
                                                    className={`flex justify-between items-center px-4 py-2 ${unit.status === "available" ? "cursor-pointer" : "cursor-not-allowed opacity-75"} border-b last:border-0 ${isDark
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
                                        })}
                                        {filteredUnits.length > 10 && (
                                            <div className={`px-4 py-2 text-xs text-center ${isDark ? "text-gray-400" : "text-gray-500"} border-t`}>
                                                {filteredUnits.length} kết quả tìm thấy. Cuộn để xem thêm.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className={`px-4 py-2 text-sm ${isDark ? "text-gray-300" : "text-gray-500"}`}>Không tìm thấy căn hộ</div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Project Map */}
                    <section>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className={isDark ? "text-slate-300" : "text-slate-600"}>Đang tải dữ liệu...</p>
                                </div>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className={`rounded-3xl ${responsiveClasses.cardPadding} shadow-md text-center py-12 ${isDark ? "bg-[#1B2342]" : "bg-white"}`}>
                                <p className="text-lg mb-2">Chưa có dự án nào</p>
                                <p className="text-sm opacity-70">Vui lòng liên hệ quản trị viên để thêm dự án</p>
                            </div>
                        ) : (
                            <>
                                {filteredProjects.map((project) => (
                                    <div key={project.id} className="mb-12">
                                        <motion.section
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.1 }}
                                            className={`rounded-3xl ${responsiveClasses.cardPadding} shadow-md hover:shadow-xl transition ${isDark ? "bg-[#1B2342]" : "bg-white"
                                                }`}
                                        >
                                            <div>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div>
                                                        <p className="text-lg font-semibold mb-1">Dự Án: {project.name}</p>
                                                        <p className="text-sm opacity-80 mb-2">
                                                            {project.buildings.flatMap(b => b.units).length} căn hộ • {project.buildings.length} tòa
                                                        </p>
                                                        <p className="text-sm opacity-80">
                                                            Danh sách các tòa: {project.buildings.map(b => b.name).join(', ')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`flex ${responsiveClasses.legendFlex} items-center gap-4 text-sm`}>
                                                    <LegendItem color="bg-green-600" label="Đang mở bán" isDark={isDark} />
                                                    <LegendItem color="bg-yellow-600" label="Đang có đặt chỗ" isDark={isDark} />
                                                    <LegendItem color="bg-blue-600" label="Đang có booking" isDark={isDark} />
                                                    <LegendItem color="bg-purple-600" label="Đã cọc tiền" isDark={isDark} />
                                                    <LegendItem color="bg-red-600" label="Đã bán" isDark={isDark} />
                                                </div>
                                            </div>
                                        </motion.section>

                                        <AnimatePresence>
                                            {project.buildings.map((building) => (
                                                <section key={building.id} className="space-y-4 mb-7 mt-8">
                                                    <div className="w-full flex justify-center">
                                                        <div
                                                            className={`${isDark ? "bg-[#1B2342]" : "bg-white/70"
                                                                } ${deviceInfo.isMobile ? "text-lg" : "text-2xl"} backdrop-blur-sm rounded-xl px-40 py-3 text-center font-medium shadow-sm max-w-[1000px]`}
                                                        >
                                                            {building.name}
                                                        </div>
                                                    </div>

                                                    <motion.div
                                                        initial="hidden"
                                                        animate="visible"
                                                        variants={containerVariants}
                                                        className={`grid ${responsiveClasses.gridCols} gap-4`}
                                                    >
                                                        {building.units.map((unit) => {
                                                            const status = statusProperty[unit.status];
                                                            return (
                                                                <motion.article
                                                                    key={unit.id}
                                                                    className="relative"
                                                                    variants={cardVariants}
                                                                    initial="hidden"
                                                                    animate="visible"
                                                                    whileHover="hover"
                                                                    onClick={() => handleUnitClick(unit)}
                                                                >
                                                                    <div
                                                                        className={`${deviceInfo.isMobile ? "w-50%" : "w-auto"} rounded-xl shadow-sm text-white ${responsiveClasses.cardPadding} ${responsiveClasses.cardShape} flex flex-col items-center justify-center gap-2 min-h-[88px] ${status.bgClass} cursor-pointer`}
                                                                    >
                                                                        <div className={`${deviceInfo.isMobile ? "text-lg" : "text-2xl"} font-semibold`}>{unit.code}</div>
                                                                        <div className="w-full flex justify-center">
                                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-sm`}>
                                                                                {status.label}
                                                                            </span>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-1 w-full text-center">
                                                                            <div className={` ${deviceInfo.isMobile ? "text-xs" : "text-lg"} opacity-90`}>{unit.area}m²</div>
                                                                            <div className={` ${deviceInfo.isMobile ? "text-xs" : "text-lg"} opacity-90`}>{formatCurrency(unit.price)}</div>
                                                                            <div className={` ${deviceInfo.isMobile ? "text-xs" : "text-lg"} opacity-90`}>PN: {unit.bedrooms || 0}</div>
                                                                            <div className={` ${deviceInfo.isMobile ? "text-xs" : "text-lg"} opacity-90`}>WC: {unit.bathrooms || 0}</div>
                                                                        </div>
                                                                    </div>
                                                                </motion.article>
                                                            );
                                                        })}
                                                    </motion.div>
                                                </section>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </>
                        )}
                    </section>
                </div>
            </main>

            {/* 🔹 FOOTER */}
            <footer
                className={`text-center text-sm py-4 ${isDark
                    ? "bg-[#10182F] text-slate-400"
                    : "bg-white text-slate-500 border-t"
                    }`}
            >
                © 2025 <span className="font-semibold">Bất Động Sản Winland</span>. Tất cả quyền được bảo lưu.
            </footer>

            <AnimatedBottomNavigation
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                darkMode={isDark}
            />
            {selectedUnit && !showDepositModal && !showReservedModal && !showBookingModal && (
                <UnitModal
                    unit={selectedUnit}
                    onClose={() => setSelectedUnit(null)}
                    onDeposit={() => {
                        setShowDepositModal(true);
                    }}
                    onReserved={() => {
                        setShowReservedModal(true);
                    }}
                    onBooking={() => {
                        setShowBookingModal(true);
                    }}
                />
            )}
            {selectedUnit && showDepositModal && (
                <DepositModal
                    unit={selectedUnit}
                    onClose={() => {
                        setSelectedUnit(null);
                        setShowDepositModal(false);
                    }}
                    onBack={() => {
                        setShowDepositModal(false);
                        // This will show the UnitModal again since showDepositModal becomes false
                    }}
                />
            )}
            {selectedUnit && showReservedModal && (
                <ReservedModal
                    unit={selectedUnit}
                    onClose={() => {
                        setSelectedUnit(null);
                        setShowReservedModal(false);
                    }}
                    onBack={() => {
                        setShowReservedModal(false);
                        // This will show the UnitModal again since showReservedModal becomes false
                    }}
                />
            )}
            {selectedUnit && showBookingModal && (
                <BookingModal
                    unit={selectedUnit}
                    onClose={() => {
                        setSelectedUnit(null);
                        setShowBookingModal(false);
                    }}
                    onBack={() => {
                        setShowBookingModal(false);
                        // This will show the UnitModal again since showBookingModal becomes false
                    }}
                />
            )}
            <ToastContainer />
        </div>
    );
}