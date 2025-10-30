'use client';

/**
 * 🔑 SIGN-UP PAGE (CTV Portal)
 * CTV authentication with userPhone/userPassword
 * @author Winland Team
 * @route /
 * @features Auto-fill credentials, JWT auth, Real API integration
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, LockKeyhole, Eye, EyeOff, ArrowRight, UserRound, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import { toastNotification } from '@/app/utils/toastNotification';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';
import { useTheme } from '@/hooks/useTheme';
import { getResponsiveClasses } from '@/app/utils/responsive';
import Image from 'next/image'
import LoginCTVPortalImage from "@/assets/images/login_ctvportal.png"
import LoginCTVPortalBackground from "@/assets/images/login_ctvportal_background.jpg"

export default function SignUpPage() {
    const router = useRouter();
    const [userName, setUserName] = useState(''); //Nguyen Van A
    const [userEmail, setUserEmail] = useState(''); //
    const [userPhone, setUserPhone] = useState(''); //0912345671
    const [userPassword, setUserPassword] = useState(''); //ctv123
    const [loading, setLoading] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const deviceInfo = useDeviceDetect();
    const { isDark } = useTheme();
    const responsive = getResponsiveClasses(deviceInfo);

    // Update theme-color meta tag
    useEffect(() => {
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            // Set status bar color based on theme and device
            if (deviceInfo.isMobile) {
                themeColorMeta.setAttribute('content', isDark ? '#0f172a' : '#3b82f6');
            } else {
                themeColorMeta.setAttribute('content', isDark ? '#1e293b' : '#3b82f6');
            }
        }


    }, [isDark, deviceInfo.isMobile]);

    const handleButtonSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        console.log('Login with:', { userPhone, userPassword });
        if (userPhone === '0912345673' && userPassword === 'ctv456') {
            console.log('Login successful');
            try {
                sessionStorage.setItem('login:userPhone', userPhone);
                sessionStorage.setItem('login:userPassword', userPassword);
            } catch (err) {
                console.warn('Unable to write credentials to sessionStorage', err);
            }
            setLoading(false);
            router.push('/login/authentication');
        } else {
            setLoading(false);
            toastNotification.error('Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.');
        }
    }

    // Render UI
    return (
        <>
            <div className={`min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4 sm:p-6
                        transition-colors duration-300`}>
                <ToastContainer
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
                                <div className={`w-full ${responsive.containerPadding}`}>
                                    {/* Header - Adjusted for different devices */}
                                    <Card className={`p-4 sm:p-6 rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 w-full bg-white dark:bg-white hover:bg-white/95`}>
                                        <CardContent className="pt-4 sm:pt-8 space-y-4 w-full transition-all duration-300 bg-white dark:bg-white hover:bg-white/95">
                                            {/* Header */}
                                            <div className="text-center space-y-2 sm:space-y-1 mb-2">
                                                <h1 className={`${responsive.subtitleSize}
                                                                font-bold tracking-tighter transition-colors duration-300 text-blue-900`}>
                                                    Cộng Tác Viên Bất Động Sản Winland
                                                </h1>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h1 className={`${responsive.titleSize}
                                        font-bold tracking-tighter transition-colors duration-300 text-blue-900`}>
                                                    Đăng Ký Tài Khoản
                                                </h1>
                                            </div>
                                            <form onSubmit={handleButtonSignUp} className="space-y-4 sm:space-y-5 w-full">
                                                {/* Smartphone Input */}
                                                <div className="space-y-2">
                                                    <label htmlFor="userPhone" className={`block text-sm font-semibold transition-colors duration-300 text-gray-700`}>
                                                        Số điện thoại
                                                    </label>
                                                    <div className="relative">
                                                        <Smartphone className={`absolute left-3 top-1/2 transform -translate-y-1/2
                                                                text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200 ${responsive.iconSize}`} />
                                                        <Input
                                                            id="userPhone"
                                                            type="tel"
                                                            value={userPhone}
                                                            onChange={(e) => setUserPhone(e.target.value)}
                                                            placeholder="Nhập số điện thoại"
                                                            className={`${responsive.inputPadding} text-base rounded-xl pr-11 h-12
                                                            border-slate-200  bg-slate-50/50 hover:bg-slate-50 text-black`}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                {/* Fullname Input */}
                                                <div className="space-y-2">
                                                    <label htmlFor="userName" className={`block text-sm font-semibold transition-colors duration-300 text-gray-700`}>
                                                        Họ và tên
                                                    </label>
                                                    <div className="relative">
                                                        <UserRound className={`absolute left-3 top-1/2 transform -translate-y-1/2
                                                                text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200 ${responsive.iconSize}`} />
                                                        <Input
                                                            id="userName"
                                                            type="text"
                                                            value={userName}
                                                            onChange={(e) => setUserName(e.target.value)}
                                                            placeholder="Nhập họ và tên"
                                                            className={`${responsive.inputPadding} text-base rounded-xl pr-11 h-12
                                                            border-slate-200  bg-slate-50/50 hover:bg-slate-50 text-black`}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                {/* Email Input */}
                                                <div className="space-y-2">
                                                    <label htmlFor="userEmail" className={`block text-sm font-semibold transition-colors duration-300 text-gray-700`}>
                                                        Email
                                                    </label>
                                                    <div className="relative">
                                                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2
                                                                text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200 ${responsive.iconSize}`} />
                                                        <Input
                                                            id="userEmail"
                                                            type="text"
                                                            value={userEmail}
                                                            onChange={(e) => setUserEmail(e.target.value)}
                                                            placeholder="Nhập email"
                                                            className={`${responsive.inputPadding} text-base rounded-xl pr-11 h-12
                                                            border-slate-200  bg-slate-50/50 hover:bg-slate-50 text-black`}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                {/* Password Input */}
                                                <div className="space-y-2">
                                                    <label htmlFor="userPassword" className={`block text-sm font-semibold transition-colors duration-300 text-gray-700`}>
                                                        Mật khẩu
                                                    </label>
                                                    <div className="relative">
                                                        <LockKeyhole className={`absolute left-3 top-1/2 transform -translate-y-1/2
                                                    text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200 ${responsive.iconSize}`} />
                                                        <Input
                                                            id="userPassword"
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={userPassword}
                                                            onChange={(e) => setUserPassword(e.target.value)}
                                                            placeholder="Nhập mật khẩu"
                                                            className={`${responsive.inputPadding} pr-12 text-base rounded-xl h-12
                                                            border-slate-200  bg-slate-50/50 hover:bg-slate-50 text-black`}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className={`absolute right-3 top-1/2 transform -translate-y-1/2
                                                                    transition-colors duration-300 text-gray-400 hover:text-gray-600 ${responsive.iconSize}`}
                                                        >
                                                            {showPassword ? <EyeOff size={responsive.eyeIconSize} /> : <Eye size={responsive.eyeIconSize} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Rule setting password */}
                                                <div className="text-sm text-gray-500">
                                                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường.
                                                </div>
                                                {/* Confirm Password Input */}
                                                <div className="space-y-2">
                                                    <label htmlFor="userPassword" className={`block text-sm font-semibold transition-colors duration-300 text-gray-700`}>
                                                        Nhập lại mật khẩu
                                                    </label>
                                                    <div className="relative">
                                                        <LockKeyhole className={`absolute left-3 top-1/2 transform -translate-y-1/2
                                                    text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200 ${responsive.iconSize}`} />
                                                        <Input
                                                            id="confirmPassword"
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            placeholder="Nhập lại mật khẩu"
                                                            className={`${responsive.inputPadding} pr-12 text-base rounded-xl h-12
                                                            border-slate-200  bg-slate-50/50 hover:bg-slate-50 text-black`}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className={`absolute right-3 top-1/2 transform -translate-y-1/2
                                                                    transition-colors duration-300 text-gray-400 hover:text-gray-600 ${responsive.iconSize}`}
                                                        >
                                                            {showPassword ? <EyeOff size={responsive.eyeIconSize} /> : <Eye size={responsive.eyeIconSize} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Sign-up Button */}
                                                <Button
                                                    type="submit"
                                                    disabled={loading}
                                                    className={`w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                                                            text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300
                                                                hover:scale-[1.02] active:scale-[0.98] ${responsive.buttonPadding} text-base sm:text-lg flex items-center justify-center`}
                                                    size="lg"
                                                >
                                                    {loading ? (
                                                        'Đang đăng ký...'
                                                    ) : (
                                                        <>
                                                            <span>Đăng ký</span>
                                                            <ArrowRight className={`ml-3 ${responsive.buttonIconSize}`} />
                                                        </>
                                                    )}
                                                </Button>
                                                {/* Divider */}
                                                <div className="relative my-8">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-slate-200"></div>
                                                    </div>
                                                    <div className="relative flex justify-center">
                                                        <span className="px-4 bg-white text-slate-500">
                                                            Đã có tài khoản?
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
                                                            router.replace('/login');
                                                            console.log("Sign up clicked");
                                                        }}
                                                    >
                                                        Đăng nhập tại đây
                                                    </a>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </div>
                                {/* Image Section - Different display for different devices */}
                                <div className={`${deviceInfo.isMobile ? 'hidden' : deviceInfo.isTablet ? 'w-2/5 flex items-center justify-center p-6' : 'hidden lg:block lg:w-1/2'}`}>
                                    <div className={`illu-wrap ${deviceInfo.isTablet ? 'py-6' : 'py-12 lg:py-20'} px-4 h-full flex items-center justify-center`}>
                                        <Image
                                            src={LoginCTVPortalImage}
                                            alt="Login CTV Portal Image"
                                            width={responsive.imageWidth}
                                            height={responsive.imageHeight}
                                            className="max-w-full h-auto object-contain"
                                            blurDataURL="data:..."
                                            placeholder="blur"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Background Image */}
                    </motion.div>
                    {/* Centered footer under the login form */}
                    <div className="w-full flex justify-center mt-4 sm:mt-6">
                        <p className={`text-center text-xs sm:text-sm transition-colors duration-300 text-gray-300`}>
                            © 2025 <span className="font-semibold">Bất Động Sản Winland</span>. Tất cả quyền được bảo lưu.
                        </p>
                    </div>
                </div>
            </div >
        </>
    );
}