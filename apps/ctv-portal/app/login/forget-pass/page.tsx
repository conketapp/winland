'use client';

/**
 * 🔑 FORGET PASS PAGE (CTV Portal)
 * CTV authentication with userPhone/userPassword
 * @author Winland Team
 * @route /
 * @features Auto-fill credentials, JWT auth, Real API integration
 * @data 21-10-2025
 */

import { useEffect, useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import Image from 'next/image'
import LoginCTVPortalImage from "@/assets/images/login_ctvportal.png"
import LoginCTVPortalBackground from "@/assets/images/login_ctvportal_background.jpg"
import { toastNotification } from '@/app/utils/toastNotification';

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

export default function OTPPage() {
    const router = useRouter();
    const [userPhone, setUserPhone] = useState('');
    const { isMobile, isTablet, isDesktop } = useDeviceDetect();
    const [isLoading, setIsLoading] = useState(false);
    // Create a ref for each input box
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    // Read credentials saved temporarily by /login/page.tsx
    useEffect(() => {
        try {
            const phone = sessionStorage.getItem('login:userPhone');
            if (phone) {
                setUserPhone(phone);
            }
            // Log retrieved credentials
            if ((phone && phone !== '')) {
                try {
                    console.log('Received credentials on OTP page:', { userPhone: phone});
                } catch (logErr) {
                    console.warn('Failed to log credentials on OTP page', logErr);
                }
            }
            // Clear temporary storage to avoid leaking credentials
            sessionStorage.removeItem('login:userPhone');
        } catch (err) {
            console.warn('Unable to read credentials from sessionStorage', err);
        }
    }, [userPhone]);


    // OTP Input Handlers
    const handleVerify = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        console.log('Login with:', { userPhone });
        if (userPhone === '0912345673') {
            console.log('Reset password successful');
            try {
                sessionStorage.setItem('login:userPhone', userPhone);
            } catch (err) {
                console.warn('Unable to write credentials to sessionStorage', err);
            }
            setIsLoading(false);
            router.push('/login/reset-password');
        } else {
            setIsLoading(false);
            toastNotification.error('Xác thực thất bại! Vui lòng kiểm tra lại thông tin.');
        }
    };

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
                                <div className={`w-full ${isMobile ? 'px-6 py-8' : isTablet ? 'w-3/5 px-8 py-10' : isDesktop ? 'lg:w-1/2 lg:px-10 lg:py-20' : 'lg:w-1/2 lg:px-10 lg:py-20'}`}>
                                    {/* Header - Adjusted for different devices */}
                                    <Card className={`p-4 sm:p-6 rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 w-full bg-white dark:bg-white hover:bg-white/95`}>
                                        <CardContent className="pt-4 sm:pt-8 space-y-4 w-full transition-all duration-300 bg-white dark:bg-white hover:bg-white/95">
                                            {/* Header */}
                                            <div className="text-center space-y-2 sm:space-y-1 mb-2">
                                                <h1 className={`${isMobile ? 'text-sm' : isTablet ? 'text-xl' : isDesktop ? 'text-lg lg:text-2xl' : 'text-xl lg:text-2xl'}
                                                                font-bold tracking-tighter transition-colors duration-300 text-blue-900`}>
                                                    Cộng Tác Viên Bất Động Sản Winland
                                                </h1>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h1 className={`${isMobile ? 'text-3xl' : isTablet ? 'text-3xl' : isDesktop ? 'text-2xl sm:text-3xl' : 'text-2xl sm:text-3xl'}
                                        font-bold tracking-tighter transition-colors duration-300 text-blue-900`}>
                                                    Quên mật khẩu
                                                </h1>
                                            </div>
                                            {/* Divider */}
                                                <div className="relative my-5">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-slate-200"></div>
                                                    </div>
                                                    <div className="relative flex justify-center items-center">
                                                        <span className="px-2 bg-white text-slate-500">
                                                            Nhập số điện thoại đã đăng ký của bạn để nhận OTP.
                                                        </span>
                                                    </div>
                                                </div>
                                            <form onSubmit={handleVerify} className="space-y-4 sm:space-y-5 w-full">
                                                {/* Phone number Input */}
                                                <div className="space-y-2">
                                                    <label htmlFor="userPhone" className={`block text-sm font-semibold transition-colors duration-300 text-gray-700`}>
                                                        Số điện thoại
                                                    </label>
                                                    <div className="relative">
                                                        <Smartphone className={`absolute ${isMobile ? 'left-3' : 'left-4'} top-1/2 transform -translate-y-1/2
                                                                text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                                                        <Input
                                                            id="userPhone"
                                                            type="tel"
                                                            value={userPhone}
                                                            onChange={(e) => setUserPhone(e.target.value)}
                                                            placeholder="Nhập số điện thoại"
                                                            className={`${isMobile ? 'pl-10' : 'pl-14'} py-3 ${isMobile ? 'text-base' : 'text-lg'} rounded-xl pr-11 h-12
                                                            border-slate-200  bg-slate-50/50 hover:bg-slate-50 text-black`}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                {/* Confirm Button */}
                                                <Button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                                                            text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300
                                                                hover:scale-[1.02] active:scale-[0.98] py-3 text-base sm:text-lg flex items-center justify-center"
                                                    size="lg"
                                                >
                                                    {isLoading ? (
                                                        'Đang gửi mã OTP...'
                                                    ) : (
                                                        <>
                                                            <span>Tiếp tục</span>
                                                            <ArrowRight className="ml-3 w-4 h-4" />
                                                        </>
                                                    )}
                                                </Button>
                                                {/* Come back login page */}
                                                <div className="text-center">
                                                    <a
                                                        href="#"
                                                        className="font-bold text-gray-600 hover:text-black-700 transition-colors duration-200 hover:underline inline-flex items-center justify-center py-3"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            try {
                                                                router.replace('/login');
                                                            } catch (navErr) {
                                                                console.warn('Failed to navigate to /login', navErr);
                                                            }
                                                        }}
                                                    >
                                                        <ArrowLeft className="inline-block mr-2 w-4 h-4" />
                                                        Quay về trang đăng nhập 
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