'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { navigationItems, NavItem } from '@/app/config/navigation';

interface AnimatedBottomNavigationProps {
    activeNav: string;
    setActiveNav: (id: string) => void;
    darkMode?: boolean;
    className?: string;
}

export function AnimatedBottomNavigation({
    activeNav,
    setActiveNav,
    darkMode = false,
    className = "",
}: AnimatedBottomNavigationProps) {
    const router = useRouter();

    const handleNavigation = (item: NavItem) => {
        setActiveNav(item.id);
        router.push(item.path);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                staggerChildren: 0.05,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.nav
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
                darkMode ? "bg-[#10182F]" : "bg-white border-t",
                "sticky bottom-0 z-50 transition-colors duration-200",
                className
            )}
        >
            <div className="max-w-[1300px] mx-auto px-6">
                <div className="grid grid-cols-6 py-3">
                    {navigationItems.map((item) => {
                        const isActive = activeNav === item.id;
                        const Icon = item.icon;

                        return (
                            <motion.button
                                key={item.id}
                                variants={itemVariants}
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => handleNavigation(item)}
                                disabled={item.disabled}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-200",
                                    "hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2",
                                    isActive
                                        ? "text-[#1224c4] focus:ring-[#1224c4]"
                                        : darkMode
                                            ? "text-slate-400 hover:text-slate-300 focus:ring-slate-400"
                                            : "text-slate-500 hover:text-slate-600 focus:ring-slate-500",
                                    item.disabled && "opacity-50 cursor-not-allowed"
                                )}
                                aria-label={item.label}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <div className="relative">
                                    <motion.div
                                        animate={{
                                            scale: isActive ? [1, 1.2, 1] : 1,
                                        }}
                                        transition={{
                                            duration: 0.3,
                                            repeat: isActive ? Infinity : 0,
                                            repeatDelay: 2,
                                        }}
                                    >
                                        <Icon
                                            className={cn(
                                                "w-4 h-4 sm:w-7 sm:h-7 transition-transform duration-200"
                                            )}
                                        />
                                    </motion.div>
                                    {item.badge && item.badge > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                                        >
                                            {item.badge > 9 ? "9+" : item.badge}
                                        </motion.span>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-[11px] sm:text-[13px] transition-all duration-200",
                                        isActive ? "text-[#1224c4] font-medium" : "opacity-70"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </motion.nav>
    );
}