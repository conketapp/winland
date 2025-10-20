'use client';

/**
 * 🔑 LOGIN PAGE (CTV Portal)
 * CTV authentication with phone/password
 * @author Windland Team
 * @route /
 * @features Auto-fill credentials, JWT auth, Real API integration
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, LockKeyhole, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import Image from 'next/image'
import LoginCTVPortalImage from "@/assets/images/login_ctvportal.png"
import LoginCTVPortalBackground from "@/assets/images/login_ctvportal_background.jpg"

// Device detection hook
const useDeviceDetect = () => {
    const [deviceInfo, setDeviceInfo] = useState({
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        width: 1024,
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setDeviceInfo({
                isMobile: width < 768,
                isTablet: width >= 768 && width < 1024,
                isDesktop: width >= 1024,
                width,
            });
        };

        // Initial check
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return deviceInfo;
};

// Theme hook for dark/light mode
const useTheme = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Check system preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            setTheme(mediaQuery.matches ? 'dark' : 'light');
        }

        // Listen for system theme changes
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'dark');
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'light' : 'dark');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return { theme, systemTheme, toggleTheme, isDark: theme === 'dark' };
};

export default function LoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState(''); //0912345671
    const [password, setPassword] = useState(''); //ctv123
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { isMobile, isTablet, isDesktop } = useDeviceDetect();
    const { theme, toggleTheme, isDark } = useTheme();

    // Update theme-color meta tag
    useEffect(() => {
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            // Set status bar color based on theme and device
            if (isMobile) {
                themeColorMeta.setAttribute('content', isDark ? '#0f172a' : '#3b82f6');
            } else {
                themeColorMeta.setAttribute('content', isDark ? '#1e293b' : '#3b82f6');
            }
        }

        // Update body class for dark mode
        if (isDark) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [theme, isMobile, isDark]);

    const handleButtonLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Call real API
            console.log('Login with:', { phone, password });
            const response = await apiClient.post('/auth/login-ctv', {
                phone,
                password,
            });

            // Store token and user data
            localStorage.setItem('ctv_token', response.accessToken);
            localStorage.setItem('ctv_user', JSON.stringify(response.user));

            console.log('Login successful');
            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error: unknown) {
            const original = error;
            // Try to extract HTTP info if this is an axios-like error
            try {
                const ae = original as Record<string, unknown>;
                const resp = ae && (ae['response'] as Record<string, unknown> | undefined);
                const cfg = ae && (ae['config'] as Record<string, unknown> | undefined);
                if (resp && cfg) {
                    const method = ((cfg['method'] as string) || 'POST').toString().toUpperCase();
                    // full URL if present else fallback
                    const url = (cfg['url'] as string) || ((cfg['baseURL'] as string) ? (cfg['baseURL'] as string) + (cfg['url'] as string) : '/auth/login-ctv');
                    const status = resp['status'] as number;
                    const statusText = (resp['statusText'] as string) || '';
                    console.log(`${method} ${url} ${status} (${statusText})`);
                } else {
                    console.error('Login failed:', original);
                }
            } catch (e) {
                console.error('Login failed (could not parse error):', original);
            }
        } finally {
            setLoading(false);
            toast.error('Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.', {
                position: "top-center",
                closeOnClick: true,
                toastId: 'login-error',
                style: {
                    width: '100%',
                    maxWidth: '420px',
                    textAlign: 'center',
                },
            });
        }
    };

    return (
        <>

            <div className={`min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4 sm:p-6
                        transition-colors duration-300`}>
                <ToastContainer
                    theme={isDark ? 'dark' : 'light'}
                />
                {/* Background Image with Overlay */}
                <div className="fixed inset-0 -z-20">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${LoginCTVPortalBackground.src})` }}
                    />
                </div>
                {/* Gradient Overlay - Different for dark/light mode */}
                <div className={`fixed inset-0 -z-20 transition-colors duration-300 bg-gradient-to-br from-blue-900/95 via-slate-900/90 to-slate-800/95`} />
                {/* Theme Toggle Button - Only visible on mobile */}
                {isMobile && (
                    <button
                        onClick={toggleTheme}
                        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg
                        transition-all duration-300 hover:bg-white/20 hover:scale-110"
                        aria-label="Toggle theme"
                    >
                        {isDark ? (
                            <Sun className="w-5 h-5 text-yellow-300" />
                        ) : (
                            <Moon className="w-5 h-5 text-white" />
                        )}
                    </button>
                )}
                <div className="flex flex-col justify-center items-center w-full max-w-6xl">
                    {/* Login Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full flex justify-center items-center relative overflow-hidden"
                    >
                        <div className={`form-container rounded-2xl shadow-2xl w-full overflow-hidden transition-colors duration-300
                            bg-slate-50/90 backdrop-blur-sm shadow-blue-500/50`}>
                            {/* Responsive Layout: Different for mobile, tablet, and desktop */}
                            <div className="flex flex-col md:flex-row md:justify-between">
                                {/* Form Section - Different widths for different devices */}
                                <div className={`w-full ${isMobile ? 'px-6 py-8' : isTablet ? 'w-3/5 px-8 py-10' : isDesktop ? 'lg:w-1/2 lg:px-10 lg:py-20' : 'lg:w-1/2 lg:px-10 lg:py-20'}`}>
                                    {/* Header - Adjusted for different devices */}
                                    <Card className={`p-4 sm:p-6 rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 w-full bg-white dark:bg-white hover:bg-white/95`}>
                                        <CardContent className="pt-4 sm:pt-8 space-y-4 w-full transition-all duration-300 bg-white dark:bg-white hover:bg-white/95">
                                            {/* Header */}
                                            <div className="text-center space-y-2 sm:space-y-1 mb-2">
                                                <h1 className={`${isMobile ? 'text-sm' : isTablet ? 'text-xl' : isDesktop ? 'text-lg lg:text-2xl' : 'text-xl lg:text-2xl'}
                                      font-bold tracking-tighter transition-colors duration-300 text-blue-900
                                      `}>
                                                    Cộng Tác Viên Bất Động Sản Windland
                                                </h1>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h1 className={`${isMobile ? 'text-3xl' : isTablet ? 'text-3xl' : isDesktop ? 'text-2xl sm:text-3xl' : 'text-2xl sm:text-3xl'}
                                        font-bold tracking-tighter transition-colors duration-300 text-blue-900
                                      `}>
                                                    Đăng Nhập
                                                </h1>
                                            </div>
                                            <form onSubmit={handleButtonLogin} className="space-y-4 sm:space-y-5 w-full">
                                                {/* Smartphone Input */}
                                                <div className="space-y-2">
                                                    <label htmlFor="phone" className={`block text-sm font-semibold transition-colors duration-300 text-gray-700
                                                          `}>
                                                        Số điện thoại
                                                    </label>
                                                    <div className="relative">
                                                        <Smartphone className={`absolute ${isMobile ? 'left-3' : 'left-4'} top-1/2 transform -translate-y-1/2
                              text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                                                        <Input
                                                            id="phone"
                                                            type="tel"
                                                            value={phone}
                                                            onChange={(e) => setPhone(e.target.value)}
                                                            placeholder="Nhập số điện thoại"
                                                            className={`${isMobile ? 'pl-10' : 'pl-14'} py-3 ${isMobile ? 'text-base' : 'text-lg'} rounded-xl
                                        border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-slate-50/50 hover:bg-slate-50
                                        `}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                {/* Password Input */}
                                                <div className="space-y-2">
                                                    <label htmlFor="password" className={`block text-sm font-semibold transition-colors duration-300 text-gray-700
                            }`}>
                                                        Mật khẩu
                                                    </label>
                                                    <div className="relative">
                                                        <LockKeyhole className={`absolute ${isMobile ? 'left-3' : 'left-4'} top-1/2 transform -translate-y-1/2
                                                    text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                                                        <Input
                                                            id="password"
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            placeholder="Nhập mật khẩu"
                                                            className={`${isMobile ? 'pl-10 pr-10' : 'pl-14 pr-12'} py-3 ${isMobile ? 'text-base' : 'text-lg'} rounded-xl
                                        border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-slate-50/50 hover:bg-slate-50`}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className={`absolute ${isMobile ? 'right-3' : 'right-4'} top-1/2 transform -translate-y-1/2
                                          transition-colors duration-300 text-gray-400 hover:text-gray-600 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}
                                                        >
                                                            {showPassword ? <EyeOff size={isMobile ? 16 : 20} /> : <Eye size={isMobile ? 16 : 20} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Remember Me & Forgot Password */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="remember"
                                                            checked={rememberMe}
                                                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                                            className="rounded border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                        />
                                                        <Label
                                                            htmlFor="remember"
                                                            className="text-slate-600 cursor-pointer select-none"
                                                        >
                                                            Ghi nhớ đăng nhập
                                                        </Label>
                                                    </div>
                                                    <a
                                                        href="#"
                                                        className="text-blue-900 hover:text-blue-700 transition-colors duration-200 hover:underline"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            console.log("Forgot password clicked");
                                                        }}
                                                    >
                                                        Quên mật khẩu?
                                                    </a>
                                                </div>
                                                {/* Login Button */}
                                                <Button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                                      text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300
                                      hover:scale-[1.02] active:scale-[0.98] py-3 text-base sm:text-lg"
                                                    size="lg"
                                                >
                                                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                                </Button>
                                                {/* Divider */}
                                                <div className="relative my-8">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-slate-200"></div>
                                                    </div>
                                                    <div className="relative flex justify-center">
                                                        <span className="px-4 bg-white text-slate-500">
                                                            Chưa có tài khoản?
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Sign Up Link */}
                                                <div className="text-center">
                                                    <a
                                                        href="#"
                                                        className="text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            console.log("Sign up clicked");
                                                        }}
                                                    >
                                                        Đăng ký tài khoản
                                                    </a>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </div>
                                {/* Image Section - Different display for different devices */}
                                <div className={`${isMobile ? 'hidden' : isTablet ? 'w-2/5 flex items-center justify-center p-6' : isDesktop ? 'hidden lg:block lg:w-1/2' : 'hidden lg:block lg:w-1/2'}`}>
                                    <div className={`illu-wrap ${isTablet ? 'py-6' : 'py-12 lg:py-20'} px-4 h-full flex items-center justify-center`}>
                                        <Image
                                            src={LoginCTVPortalImage}
                                            alt="Login CTV Portal Image"
                                            width={isTablet ? 400 : 600}
                                            height={isTablet ? 400 : 600}
                                            className="max-w-full h-auto object-contain"
                                            blurDataURL="data:..."
                                            placeholder="blur"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    {/* Centered footer under the login form */}
                    <div className="w-full flex justify-center mt-4 sm:mt-6">
                        <p className={`text-center text-xs sm:text-sm transition-colors duration-300 text-gray-300`}>
                            © 2025 Bất Động Sản Windland. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}