'use client';

/**
 * 🔍 404 NOT FOUND PAGE (CTV Portal)
 * Custom 404 error page with theme support and interactive parallax numbers.
 * @author Winland Team
 * @route /404 (automatic)
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import Image from 'next/image';
import Background404 from '@/assets/images/404.png';
import Circle404 from '@/assets/images/404-circle-1.png';
import Circle404_3 from '@/assets/images/404-circle-3.png';
import Circle404_4 from '@/assets/images/404-circle-4.png';
import Rect404_3 from '@/assets/images/404-rect-3.png';
import Rect404_4 from '@/assets/images/404-rect-4.png';
import Rect404_5 from '@/assets/images/404-rect-5.png';

export default function NotFound() {
    const router = useRouter();
    const { isDark } = useTheme();

    // --- Framer Motion for Parallax Effect ---
    // Create motion values for mouse position
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Use spring physics for smooth animation
    const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 20 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Calculate mouse position relative to the center of the screen
            const { innerWidth, innerHeight } = window;
            const x = (event.clientX - innerWidth / 2) / innerWidth;
            const y = (event.clientY - innerHeight / 2) / innerHeight;

            // Update motion values
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [mouseX, mouseY]);

    // --- Transform functions for each number ---
    // The numbers move at different speeds and directions for a parallax effect
    const left4Transform = {
        x: useTransform(smoothMouseX, [-0.5, 0.5], [80, -80]), // Doubled movement range
        y: useTransform(smoothMouseY, [-0.5, 0.5], [60, -60]),
    };

    const zeroTransform = {
        x: useTransform(smoothMouseX, [-0.5, 0.5], [40, -40]),
        y: useTransform(smoothMouseY, [-0.5, 0.5], [-40, 40]), // Moves with mouse on Y-axis
    };

    const right4Transform = {
        x: useTransform(smoothMouseX, [-0.5, 0.5], [-80, 80]), // Doubled movement range
        y: useTransform(smoothMouseY, [-0.5, 0.5], [-60, 60]),
    };

    return (
        <div
            className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 overflow-hidden relative ${isDark ? 'bg-[#0C1125] text-white' : 'bg-gray-50 text-slate-900'
                }`}
        >
            {/* Background Image */}
            <div className="fixed inset-0 z-0">
                <Image
                    src={Background404}
                    alt="404 Background"
                    fill
                    className="object-cover"
                    priority
                    quality={100}
                />
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-blue-900/50 via-slate-900/40 to-slate-800/50' : 'bg-gradient-to-br from-blue-900/30 via-slate-900/25 to-slate-800/30'}`} />
            </div>
            <div className="flex-1 flex items-center justify-center w-full relative z-10">
                <div className="max-w-4xl w-full text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center"
                    >
                        {/* 404 Number with Parallax Effect - 28rem size */}
                        <div className="relative h-[28rem] mb-8 flex items-center justify-center w-full">
                            <motion.h1
                                className="absolute text-[28rem] leading-none font-bold"
                                style={{
                                    x: left4Transform.x,
                                    y: left4Transform.y,
                                    color: isDark ? '#3B82F6' : '#2563EB',
                                    left: '5%'
                                }}
                            >
                                4
                            </motion.h1>
                            <motion.h1
                                className="absolute text-[28rem] leading-none font-bold"
                                style={{
                                    x: zeroTransform.x,
                                    y: zeroTransform.y,
                                    color: isDark ? '#60A5FA' : '#3B82F6'
                                }}
                            >
                                0
                            </motion.h1>
                            <motion.h1
                                className="absolute text-[28rem] leading-none font-bold"
                                style={{
                                    x: right4Transform.x,
                                    y: right4Transform.y,
                                    color: isDark ? '#3B82F6' : '#2563EB',
                                    right: '5%'
                                }}
                            >
                                4
                            </motion.h1>
                        </div>

                        {/* Error Message */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h2 className="text-4xl font-semibold mb-6">
                                Không tìm thấy trang
                            </h2>
                            <p className={`text-xl mb-12 ${isDark ? 'text-slate-400' : 'text-slate-600'
                                }`}>
                                Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                            </p>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <Button
                                onClick={() => router.push('/dashboard')}
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg rounded-xl flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                Về trang chủ
                            </Button>

                            <Button
                                onClick={() => router.back()}
                                variant="outline"
                                className={`w-full sm:w-auto px-8 py-6 text-lg rounded-xl flex items-center justify-center gap-2 ${isDark
                                    ? 'border-slate-700 hover:bg-slate-800'
                                    : 'border-slate-300 hover:bg-slate-100'
                                    }`}
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Quay lại
                            </Button>
                        </motion.div>

                        {/* Decorative Icon */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="mt-16"
                        >
                            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'
                                }`}>
                                <Search className={`w-12 h-12 ${isDark ? 'text-blue-400' : 'text-blue-600'
                                    }`} />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Dropping Circle Animation with Bounce - Circle 1 */}
            <motion.div
                initial={{ y: -150, opacity: 1 }}
                animate={{
                    y: 'calc(100vh - 180px)',
                    opacity: 1
                }}
                transition={{
                    delay: 2,
                    duration: 1.2,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -100, 0, -50, 0, -20, 0]
                    }}
                    transition={{
                        delay: 3.2,
                        duration: 1.5,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Circle404}
                        alt="Dropping Circle"
                        width={200}
                        height={200}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Dropping Circle Animation with Bounce - Circle 3 */}
            <motion.div
                initial={{ y: -180, opacity: 1 }}
                animate={{
                    y: 'calc(100vh - 180px)',
                    opacity: 1
                }}
                transition={{
                    delay: 2.15,
                    duration: 1.25,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[70%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -95, 0, -48, 0, -19, 0]
                    }}
                    transition={{
                        delay: 3.35,
                        duration: 1.45,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Circle404_3}
                        alt="Dropping Circle 3"
                        width={200}
                        height={200}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Dropping Circle Animation with Bounce - Circle 4 */}
            <motion.div
                initial={{ y: -210, opacity: 1 }}
                animate={{
                    y: 'calc(100vh - 180px)',
                    opacity: 1
                }}
                transition={{
                    delay: 2.3,
                    duration: 1.3,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[30%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -90, 0, -45, 0, -18, 0]
                    }}
                    transition={{
                        delay: 3.5,
                        duration: 1.4,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Circle404_4}
                        alt="Dropping Circle 4"
                        width={200}
                        height={200}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Dropping Rectangle Animation - Rect 3 */}
            <motion.div
                initial={{ y: -200, opacity: 1, rotate: 0 }}
                animate={{
                    y: 'calc(100vh - 200px)',
                    opacity: 1,
                    rotate: 360
                }}
                transition={{
                    delay: 2.1,
                    duration: 1.4,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[20%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -80, 0, -40, 0, -15, 0]
                    }}
                    transition={{
                        delay: 3.4,
                        duration: 1.3,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Rect404_3}
                        alt="Dropping Rectangle 3"
                        width={200}
                        height={200}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Dropping Rectangle Animation - Rect 4 */}
            <motion.div
                initial={{ y: -170, opacity: 1, rotate: 0 }}
                animate={{
                    y: 'calc(100vh - 190px)',
                    opacity: 1,
                    rotate: -270
                }}
                transition={{
                    delay: 2.2,
                    duration: 1.35,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[80%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -85, 0, -42, 0, -16, 0]
                    }}
                    transition={{
                        delay: 3.45,
                        duration: 1.35,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Rect404_4}
                        alt="Dropping Rectangle 4"
                        width={200}
                        height={200}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Dropping Rectangle Animation - Rect 5 */}
            <motion.div
                initial={{ y: -190, opacity: 1, rotate: 0 }}
                animate={{
                    y: 'calc(100vh - 195px)',
                    opacity: 1,
                    rotate: 180
                }}
                transition={{
                    delay: 2.25,
                    duration: 1.28,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[60%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -88, 0, -44, 0, -17, 0]
                    }}
                    transition={{
                        delay: 3.48,
                        duration: 1.38,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Rect404_5}
                        alt="Dropping Rectangle 5"
                        width={200}
                        height={200}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>
            {/* Additional Circle 1 - Position 2 */}
            <motion.div
                initial={{ y: -160, opacity: 1 }}
                animate={{
                    y: 'calc(100vh - 180px)',
                    opacity: 1
                }}
                transition={{
                    delay: 2.4,
                    duration: 1.15,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[15%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -95, 0, -48, 0, -19, 0]
                    }}
                    transition={{
                        delay: 3.55,
                        duration: 1.45,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Circle404}
                        alt="Dropping Circle 1-2"
                        width={160}
                        height={160}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Additional Circle 1 - Position 3 */}
            <motion.div
                initial={{ y: -140, opacity: 1 }}
                animate={{
                    y: 'calc(100vh - 180px)',
                    opacity: 1
                }}
                transition={{
                    delay: 2.5,
                    duration: 1.1,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[85%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -85, 0, -42, 0, -16, 0]
                    }}
                    transition={{
                        delay: 3.6,
                        duration: 1.4,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Circle404}
                        alt="Dropping Circle 1-3"
                        width={140}
                        height={140}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Additional Circle 3 - Position 2 */}
            <motion.div
                initial={{ y: -195, opacity: 1 }}
                animate={{
                    y: 'calc(100vh - 180px)',
                    opacity: 1
                }}
                transition={{
                    delay: 2.35,
                    duration: 1.22,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[40%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -92, 0, -46, 0, -18, 0]
                    }}
                    transition={{
                        delay: 3.52,
                        duration: 1.42,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Circle404_3}
                        alt="Dropping Circle 3-2"
                        width={170}
                        height={170}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Additional Circle 4 - Position 2 */}
            <motion.div
                initial={{ y: -175, opacity: 1 }}
                animate={{
                    y: 'calc(100vh - 180px)',
                    opacity: 1
                }}
                transition={{
                    delay: 2.45,
                    duration: 1.18,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[55%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -88, 0, -44, 0, -17, 0]
                    }}
                    transition={{
                        delay: 3.58,
                        duration: 1.38,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Circle404_4}
                        alt="Dropping Circle 4-2"
                        width={155}
                        height={155}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Additional Rect 3 - Position 2 */}
            <motion.div
                initial={{ y: -185, opacity: 1, rotate: 0 }}
                animate={{
                    y: 'calc(100vh - 200px)',
                    opacity: 1,
                    rotate: -360
                }}
                transition={{
                    delay: 2.32,
                    duration: 1.26,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[45%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -82, 0, -41, 0, -16, 0]
                    }}
                    transition={{
                        delay: 3.54,
                        duration: 1.32,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Rect404_3}
                        alt="Dropping Rectangle 3-2"
                        width={165}
                        height={165}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Additional Rect 3 - Position 3 */}
            <motion.div
                initial={{ y: -165, opacity: 1, rotate: 0 }}
                animate={{
                    y: 'calc(100vh - 200px)',
                    opacity: 1,
                    rotate: 270
                }}
                transition={{
                    delay: 2.42,
                    duration: 1.24,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[75%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -86, 0, -43, 0, -17, 0]
                    }}
                    transition={{
                        delay: 3.62,
                        duration: 1.36,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Rect404_3}
                        alt="Dropping Rectangle 3-3"
                        width={150}
                        height={150}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Additional Rect 4 - Position 2 */}
            <motion.div
                initial={{ y: -155, opacity: 1, rotate: 0 }}
                animate={{
                    y: 'calc(100vh - 190px)',
                    opacity: 1,
                    rotate: 360
                }}
                transition={{
                    delay: 2.38,
                    duration: 1.32,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[10%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -90, 0, -45, 0, -18, 0]
                    }}
                    transition={{
                        delay: 3.66,
                        duration: 1.34,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Rect404_4}
                        alt="Dropping Rectangle 4-2"
                        width={145}
                        height={145}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Additional Rect 4 - Position 3 */}
            <motion.div
                initial={{ y: -205, opacity: 1, rotate: 0 }}
                animate={{
                    y: 'calc(100vh - 190px)',
                    opacity: 1,
                    rotate: -180
                }}
                transition={{
                    delay: 2.28,
                    duration: 1.38,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[65%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -84, 0, -42, 0, -16, 0]
                    }}
                    transition={{
                        delay: 3.64,
                        duration: 1.36,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Rect404_4}
                        alt="Dropping Rectangle 4-3"
                        width={175}
                        height={175}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Additional Rect 5 - Position 2 */}
            <motion.div
                initial={{ y: -220, opacity: 1, rotate: 0 }}
                animate={{
                    y: 'calc(100vh - 220px)',
                    opacity: 1,
                    rotate: 360
                }}
                transition={{
                    delay: 2.18,
                    duration: 1.42,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[25%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -100, 0, -50, 0, -20, 0]
                    }}
                    transition={{
                        delay: 3.58,
                        duration: 1.5,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Rect404_5}
                        alt="Dropping Rectangle 5-2"
                        width={280}
                        height={280}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Additional Rect 5 - Position 3 */}
            <motion.div
                initial={{ y: -200, opacity: 1, rotate: 0 }}
                animate={{
                    y: 'calc(100vh - 220px)',
                    opacity: 1,
                    rotate: -270
                }}
                transition={{
                    delay: 2.12,
                    duration: 1.38,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[50%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -95, 0, -48, 0, -19, 0]
                    }}
                    transition={{
                        delay: 3.48,
                        duration: 1.45,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Rect404_5}
                        alt="Dropping Rectangle 5-3"
                        width={280}
                        height={280}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Additional Rect 5 - Position 4 */}
            <motion.div
                initial={{ y: -180, opacity: 1, rotate: 0 }}
                animate={{
                    y: 'calc(100vh - 220px)',
                    opacity: 1,
                    rotate: 180
                }}
                transition={{
                    delay: 2.22,
                    duration: 1.35,
                    ease: [0.6, 0.01, 0.4, 1]
                }}
                className="fixed top-0 left-[90%] -translate-x-1/2 z-20 pointer-events-none"
            >
                <motion.div
                    animate={{
                        y: [0, -90, 0, -45, 0, -18, 0]
                    }}
                    transition={{
                        delay: 3.55,
                        duration: 1.42,
                        times: [0, 0.25, 0.5, 0.65, 0.8, 0.9, 1],
                        ease: "easeOut"
                    }}
                >
                    <Image
                        src={Rect404_5}
                        alt="Dropping Rectangle 5-4"
                        width={280}
                        height={280}
                        className="object-contain"
                    />
                </motion.div>
            </motion.div>

            {/* Footer */}
            <div className="w-full text-center py-6 relative z-10">
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                    © 2025 <span className="font-semibold">Bất Động Sản Winland</span>. Tất cả quyền được bảo lưu.
                </p>
            </div>
        </div>
    );
}
