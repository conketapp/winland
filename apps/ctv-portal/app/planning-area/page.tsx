/**
 * 🔑 DASHBOARD PAGE (CTV Portal)
 *
 * @author Winland Team
 * @route /
 * @features Auto Dark Mode, JWT Auth (mock), Sales Chart, Responsive Full HD
 * @date 28-10-2025
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import {
    LogOut,
    Sun,
    Moon,
    Map,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedBottomNavigation } from '@/components/AnimatedBottomNavigation';
import { useNavigation } from '@/hooks/useNavigation';
import { useTheme } from '@/hooks/useTheme';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';

type Project = {
    id: string;
    name: string;
    code: string;
    developer: string;
    location: string;
    address: string;
    totalArea: number | null;
    totalBuildings: number | null;
    totalUnits: number | null;
    priceFrom: number | null;
    priceTo: number | null;
    description: string | null;
    images: string | null;
};

export default function PlanningAreaScreen(): JSX.Element {
    const router = useRouter();
    const { activeNav, setActiveNav } = useNavigation();
    const { isDark, toggleTheme } = useTheme();
    const deviceInfo = useDeviceDetect();
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [imageList, setImageList] = useState<string[]>([]);
    const [greeting, setGreeting] = useState<string>("Chào buổi");

    // Fetch projects
    const fetchProjects = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/projects');

            if (response.ok) {
                const data = await response.json();
                setProjects(data);

                // Set first project as default
                if (!selectedProjectId && data.length > 0) {
                    setSelectedProjectId(data[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedProjectId]);

    useEffect(() => {
        const userPhone = sessionStorage.getItem('login:userPhone');
        if (!userPhone) {
            router.push('/login');
            return;
        }
        fetchProjects();
    }, [router, fetchProjects]);

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

    const handleLogout = () => {
        sessionStorage.removeItem("login:userPhone");
        router.push("/login");
    };

    // Fullscreen image viewer functions
    const openFullscreen = (imageUrl: string, images: string[]) => {
        const index = images.indexOf(imageUrl);
        setImageList(images);
        setCurrentImageIndex(index);
        setFullscreenImage(imageUrl);
    };

    const closeFullscreen = () => {
        setFullscreenImage(null);
    };

    const nextImage = () => {
        if (currentImageIndex < imageList.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
            setFullscreenImage(imageList[currentImageIndex + 1]);
        }
    };

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
            setFullscreenImage(imageList[currentImageIndex - 1]);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!fullscreenImage) return;

            if (e.key === 'Escape') closeFullscreen();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [fullscreenImage, currentImageIndex, imageList]);

    // Filter projects by search term
    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get selected project
    const selectedProject = projects.find(p => p.id === selectedProjectId);

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-500 bg-gray-50 text-slate-900">
            {/* Header */}
            <header className="rounded-b-3xl shadow-md bg-[#041b40] text-white">
                <div className="max-w-[1500px] mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold">Cộng Tác Viên Bất Động Sản Winland</h1>
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
            <main className="flex-1 w-full">
                <div className="max-w-[1500px] mx-auto px-6 py-5">
                    {/* Greeting Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 bg-white"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`${deviceInfo.isMobile ? "w-8 h-8" : "w-12 h-12"} rounded-full overflow-hidden bg-gradient-to-br from-[#1436cc]/80 to-[#142985]/50 flex items-center justify-center`}>
                                    <Map className={`${deviceInfo.isMobile ? "w-4 h-4" : "w-6 h-6"} text-white`} />
                                </div>
                                <div>
                                    <p className="text-sm opacity-70 mb-1">{greeting}</p>
                                    <p className="text-lg font-semibold">Quy hoạch dự án</p>
                                    <p className="text-sm opacity-80">Chọn dự án để xem chi tiết</p>
                                </div>
                            </div>
                            {!deviceInfo.isMobile && (
                                <div className="flex items-center gap-2">
                                    <label className="text-sm opacity-70">Dự án:</label>
                                    <select
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                        className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300 text-slate-900"
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
                                    className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300 text-slate-900"
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

                    {/* Search Bar */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-6"
                    >
                        <div className="relative">
                            <div className="flex items-center gap-2 border rounded-xl px-4 py-2 shadow-sm bg-white border-gray-200">
                                <Search size={18} className="text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm dự án..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full focus:outline-none bg-transparent text-slate-800 placeholder-gray-500"
                                />
                            </div>

                            {/* Search Results Dropdown */}
                            {searchTerm && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-[110%] left-0 w-full rounded-xl border mt-1 shadow-lg overflow-hidden z-50 bg-white border-gray-200"
                                >
                                    {filteredProjects.length > 0 ? (
                                        <div className="max-h-80 overflow-y-auto">
                                            {filteredProjects.map((project) => (
                                                <div
                                                    key={project.id}
                                                    onClick={() => {
                                                        setSelectedProjectId(project.id);
                                                        setSearchTerm("");
                                                    }}
                                                    className="flex justify-between items-center px-4 py-3 cursor-pointer border-b last:border-0 hover:bg-gray-50 border-gray-200 text-slate-800"
                                                >
                                                    <div>
                                                        <p className="font-medium">{project.name}</p>
                                                        <p className="text-xs text-gray-500">{project.location}</p>
                                                    </div>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                                        {project.code}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-gray-500">Không tìm thấy dự án</div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </motion.section>

                    {/* Project Details */}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64 mt-6">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-slate-600">Đang tải dữ liệu...</p>
                            </div>
                        </div>
                    ) : selectedProject ? (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mt-6 rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 bg-white"
                        >
                            <h2 className="text-2xl font-bold mb-4">{selectedProject.name}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Mã dự án</p>
                                    <p className="font-medium">{selectedProject.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Chủ đầu tư</p>
                                    <p className="font-medium">{selectedProject.developer}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Vị trí</p>
                                    <p className="font-medium">{selectedProject.location}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Địa chỉ</p>
                                    <p className="font-medium">{selectedProject.address}</p>
                                </div>
                                {selectedProject.totalArea && (
                                    <div>
                                        <p className="text-sm text-gray-500">Diện tích</p>
                                        <p className="font-medium">{(selectedProject.totalArea / 10000).toFixed(2)} ha</p>
                                    </div>
                                )}
                                {selectedProject.totalBuildings && (
                                    <div>
                                        <p className="text-sm text-gray-500">Số tòa</p>
                                        <p className="font-medium">{selectedProject.totalBuildings} tòa</p>
                                    </div>
                                )}
                                {selectedProject.totalUnits && (
                                    <div>
                                        <p className="text-sm text-gray-500">Số căn hộ</p>
                                        <p className="font-medium">{selectedProject.totalUnits} căn</p>
                                    </div>
                                )}
                            </div>
                            {selectedProject.description && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 mb-2">Mô tả</p>
                                    <p className="text-sm whitespace-pre-line">{selectedProject.description}</p>
                                </div>
                            )}

                            {/* Project Images */}
                            <div className="mt-6">
                                <p className="text-sm text-gray-500 mb-3">Hình ảnh dự án</p>
                                {selectedProject.images ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
                                        {selectedProject.images.split(',').map((imageUrl, index) => {
                                            const images = selectedProject.images!.split(',').map(url => url.trim());
                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                    className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
                                                    style={{ width: '480px', height: '320px' }}
                                                    onClick={() => openFullscreen(imageUrl.trim(), images)}
                                                >
                                                    <img
                                                        src={imageUrl.trim()}
                                                        alt={`${selectedProject.name} - Hình ${index + 1}`}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        onError={(e) => {
                                                            // Fallback to placeholder if image fails to load
                                                            e.currentTarget.src = `https://placehold.co/480x320/1436cc/white?text=${selectedProject.name}+${index + 1}`;
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                                        <p className="text-white text-sm font-medium">Hình {index + 1} - Click để xem toàn màn hình</p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                        <div className="text-center">
                                            <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600 font-medium mb-2">Chưa có hình ảnh</p>
                                            <p className="text-sm text-gray-500">Dự án này chưa có hình ảnh để hiển thị</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    ) : (
                        <div className="mt-6 rounded-3xl p-6 shadow-md text-center bg-white">
                            <p className="text-gray-500">Chưa có dự án nào</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center text-sm py-4 bg-white text-slate-500 border-t">
                © 2025 <span className="font-semibold">Bất Động Sản Winland</span>. Tất cả quyền được bảo lưu.
            </footer>

            {/* Bottom navigation */}
            <AnimatedBottomNavigation
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                darkMode={isDark}
            />

            {/* Fullscreen Image Viewer */}
            <AnimatePresence>
                {fullscreenImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                        onClick={closeFullscreen}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeFullscreen}
                            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute top-4 left-4 z-50 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
                            {currentImageIndex + 1} / {imageList.length}
                        </div>

                        {/* Previous Button */}
                        {currentImageIndex > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    prevImage();
                                }}
                                className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                            >
                                <ChevronLeft className="w-8 h-8 text-white" />
                            </button>
                        )}

                        {/* Next Button */}
                        {currentImageIndex < imageList.length - 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    nextImage();
                                }}
                                className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                            >
                                <ChevronRight className="w-8 h-8 text-white" />
                            </button>
                        )}

                        {/* Image */}
                        <motion.img
                            key={fullscreenImage}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={fullscreenImage}
                            alt="Fullscreen view"
                            className="max-w-[90vw] max-h-[90vh] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* Instructions */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-white/10 px-4 py-2 rounded-full">
                            Nhấn ESC hoặc click bên ngoài để đóng • ← → để chuyển ảnh
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
