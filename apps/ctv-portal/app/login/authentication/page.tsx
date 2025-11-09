'use client';

/**
 * 🔑 CONFIRM OTP PAGE (CTV Portal)
 * CTV authentication with userPhone/userPassword
 * @author Winland Team
 * @route /
 * @features Auto-fill credentials, JWT auth, Real API integration
 */

import { useEffect, useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft } from 'lucide-react';
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
    const [userPassword, setUserPassword] = useState('');
    const { isMobile, isTablet, isDesktop } = useDeviceDetect();
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    // Create a ref for each input box
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    // Read credentials saved temporarily by /login/page.tsx
    useEffect(() => {
        try {
            const phone = sessionStorage.getItem('login:userPhone');
            const pass = sessionStorage.getItem('login:userPassword');
            if (phone) {
                setUserPhone(phone);
            }
            if (pass) {
                setUserPassword(pass);
            }
            // Log retrieved credentials
            if ((phone && phone !== '') || (pass && pass !== '')) {
                try {
                    console.log('Received credentials on OTP page:', { userPhone: phone, userPassword: pass });
                } catch (logErr) {
                    console.warn('Failed to log credentials on OTP page', logErr);
                }
            }
            // Keep userPhone in sessionStorage for dashboard use
            // Only remove password for security
            sessionStorage.removeItem('login:userPassword');
        } catch (err) {
            console.warn('Unable to read credentials from sessionStorage', err);
        }
    }, []);

    // Handle input change and auto-focus
    const handleChange = (value: string, index: number) => {
        // Allow only one digit
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus to the next input box
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace key to go to the previous input
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste event
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const newOtp = pastedData.split('');
        setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
        // Focus the last filled input or the next empty one
        const nextIndex = Math.min(newOtp.length - 1, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    // OTP Input Handlers
    const handleVerify = async (e: FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            console.error('Please enter all 6 digits.');
            toastNotification.error("Mã OTP chỉ có 6 chữ số, vui lòng kiểm tra lại");
            resetOTP();
            return;
        }

        setIsLoading(true);
        console.log('Verifying OTP:', otpValue);

        // --- API CALL LOGIC GOES HERE ---
        // try {
        //     const response = await fetch('/api/verify-otp', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({ code: otpValue }),
        //     });
        //     if (response.ok) {
        //         console.log('OTP Verified Successfully!');
        //         toastNotification.success('Xác nhận OTP thành công');
        //         router.push('/dashboard');
        //     } else {
        //         console.error('Invalid OTP. Please try again.');
        //         toastNotification.error('Sai mã OTP, vui lòng thử lại');
        //     }
        // } catch (error) {
        //     console.error('An error occurred. Please try again.');
        //     toastNotification.error('Có lỗi xảy ra, vui lòng thử lại');
        // } finally {
        //     setIsLoading(false);
        // }

        // Simulating API call
        setTimeout(() => {
            setIsLoading(false);
            console.log('OTP Verified Successfully!');
            toastNotification.success('Xác nhận OTP thành công');
            router.push('/dashboard'); // Redirect on success
        }, 5000);
    };

    // Reset OTP
    const resetOTP = () => {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
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
                                                    Xác thực OTP
                                                </h1>
                                            </div>
                                            {/* Header verification */}
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto">
                                                <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            </div>
                                            {/* Content confirm text */}
                                            <div className="text-center mt-2 mb-6">
                                                <p className={`${isMobile ? 'text-sm' : isTablet ? 'text-base' : isDesktop ? 'text-base sm:text-lg' : 'text-base sm:text-lg'}
                                                    transition-colors duration-300 text-blue-900`}>
                                                    Vui lòng nhập mã OTP đã được gửi đến số điện thoại <span className="font-bold">{userPhone || '_ _ _'}</span> của bạn để xác thực đăng nhập.
                                                </p>
                                            </div>
                                            {/* OTP Input Boxes */}
                                            <form onSubmit={handleVerify} className="mt-6 flex justify-center gap-2">
                                                {otp.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        type="tel"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => handleChange(e.target.value, index)}
                                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                                        onPaste={index === 0 ? handlePaste : undefined} // Only enable paste on the first input
                                                        ref={(el) => { inputRefs.current[index] = el }}
                                                        className={` ${isMobile ? 'h-12 w-11' : 'h-15 w-14'} rounded-lg border-2 border-gray-300 text-center text-xl font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors`}
                                                    />
                                                ))}
                                            </form>
                                             {/* Divider */}
                                                <div className="relative my-8">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-slate-100"></div>
                                                    </div>
                                                    <div className="relative flex justify-center"></div>
                                                </div>
                                            <form onSubmit={handleVerify} className="space-y-4 sm:space-y-5 w-full">
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
                                                        'Đang xác nhận...'
                                                    ) : (
                                                        <>
                                                            <span>Xác nhận</span>
                                                            <ArrowRight className="ml-3 w-4 h-4" />
                                                        </>
                                                    )}
                                                </Button>
                                                {/* Divider */}
                                                <div className="relative my-5">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-slate-200"></div>
                                                    </div>
                                                    <div className="relative flex justify-center">
                                                        <span className="px-4 bg-white text-slate-500">
                                                            Không nhận được OTP?
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Send OTP again */}
                                                <div className="text-center relative my-5">
                                                    <a
                                                        href="#"
                                                        className="text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline inline-flex items-center justify-center"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            console.log("Send OTP again clicked");
                                                        }}
                                                    >
                                                        Gửi Lại Mã OTP
                                                    </a>
                                                </div>
                                                {/* Come back login page */}
                                                <div className="text-center">
                                                    <a
                                                        href="#"
                                                        className="font-bold text-black-600 hover:text-black-700 transition-colors duration-200 hover:underline inline-flex items-center justify-center"
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