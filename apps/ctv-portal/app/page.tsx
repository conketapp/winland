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
import { Phone, LockKeyhole, ScanBarcode, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import Image from 'next/image'
import LoginCTVPortalImage from "../assets/images/login_ctvportal.png"
import LoginCTVPortalBackground from "../assets/images/login_ctvportal_background.jpg"

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

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState(''); //0912345671
  const [password, setPassword] = useState(''); //ctv123
  const [otpCode, setOtpCode] = useState(''); //123456
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isMobile, isTablet, isDesktop } = useDeviceDetect();

  const handleButtonLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call real API
      console.log('Login with:', { phone, password, otpCode });
      const response = await apiClient.post('/auth/login-ctv', {
        phone,
        password,
        otpCode,
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4 sm:p-6">
      <ToastContainer />
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 -z-20">
        <Image
          src={LoginCTVPortalBackground}
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      {/* Gradient Overlay */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-blue-900/95 via-slate-900/90 to-slate-800/95" />

      <div className="flex flex-col justify-center items-center w-full max-w-6xl">
        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full flex justify-center items-center relative overflow-hidden"
        >
          <div className="bg-slate-50 dark:bg-gray-800 form-container rounded-2xl shadow-blue-500/50 w-full overflow-hidden">
            {/* Responsive Layout: Different for mobile, tablet, and desktop */}
            <div className="flex flex-col md:flex-row md:justify-between">
              {/* Form Section - Different widths for different devices */}
              <div className={`w-full ${isMobile ? 'px-6 py-8' : isTablet ? 'w-3/5 px-8 py-10' : isDesktop ? 'lg:w-1/2 lg:px-10 lg:py-20' : 'lg:w-1/2 lg:px-10 lg:py-20'}`}>
                {/* Header - Adjusted for different devices */}
                <div className="text-center space-y-3 sm:space-y-5 mb-5">
                  <h1 className={`${isMobile ? 'text-xl' : isTablet ? 'text-2xl' : isDesktop ? 'text-2xl lg:text-3xl' : 'text-2xl lg:text-3xl'}
                                  font-bold tracking-tighter text-blue-900 dark:text-blue-400`}>
                    Cộng Tác Viên Bất Động Sản Windland
                  </h1>
                </div>
                <Card className='bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300 w-full'>
                  <CardContent className="pt-4 sm:pt-8 space-y-4 w-full">
                    {/* Header */}
                    <div className="text-center space-y-2">
                      <h1 className={`${isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : isDesktop ? 'text-2xl sm:text-3xl' : 'text-2xl sm:text-3xl'} font-bold tracking-tighter text-blue-900 dark:text-blue-400`}>
                        Đăng nhập CTV Portal
                      </h1>
                    </div>
                    <form onSubmit={handleButtonLogin} className="space-y-4 sm:space-y-5 w-full">
                      {/* Phone Input */}
                      <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                          Số điện thoại
                        </label>
                        <div className="relative">
                          <Phone className={`absolute ${isMobile ? 'left-3' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0912345671"
                            className={`${isMobile ? 'pl-10' : 'pl-14'} py-3 ${isMobile ? 'text-base' : 'text-lg'}`}
                            required
                          />
                        </div>
                      </div>
                      {/* Password Input */}
                      <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                          Mật khẩu
                        </label>
                        <div className="relative">
                          <LockKeyhole className={`absolute ${isMobile ? 'left-3' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`${isMobile ? 'pl-10 pr-10' : 'pl-14 pr-12'} py-3 ${isMobile ? 'text-base' : 'text-lg'}`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute ${isMobile ? 'right-3' : 'right-4'} top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}
                          >
                            {showPassword ? <EyeOff size={isMobile ? 16 : 20} /> : <Eye size={isMobile ? 16 : 20} />}
                          </button>
                        </div>
                      </div>
                      {/* OTP Input */}
                      <div className="space-y-2">
                        <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
                          Mã OTP
                        </label>
                        <div className="relative">
                          <ScanBarcode className={`absolute ${isMobile ? 'left-3' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                          <div className="flex items-center">
                            <Input
                              id="otp"
                              type="text"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              placeholder="123456"
                              maxLength={6}
                              className={`${isMobile ? 'pl-10' : 'pl-14'} py-3 ${isMobile ? 'text-base' : 'text-lg'} flex-1`}
                              required
                            />
                            <Button
                              type="button"
                              size="sm"
                              className={`ml-2 sm:ml-3 h-10 px-2 sm:px-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700
                                        hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                                        transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isMobile ? 'text-xs' : 'text-sm'}`}
                            >
                              Lấy OTP
                            </Button>
                          </div>
                        </div>
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
                    </form>
                    {/* Demo Credentials */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-800 text-center">
                        <strong>Demo:</strong> 0912345671 / ctv123 / 123456
                      </p>
                    </div>
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
          <p className="text-center text-gray-300 text-xs sm:text-sm">
            © 2025 Bất Động Sản Windland. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}