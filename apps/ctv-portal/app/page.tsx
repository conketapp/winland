"use client";
import { SessionProvider } from "next-auth/react"
import { Button } from '@/components/ui/button';
import Link from "next/link";
import LoginCTVPortalBackground from "@/assets/images/login_ctvportal_background.jpg"

const Home = () => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4 sm:p-6
                        transition-colors duration-300`}>
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 -z-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${LoginCTVPortalBackground.src})` }}
        />
      </div>
      {/* Gradient Overlay - Different for dark/light mode */}
      <div className={`fixed inset-0 -z-20 transition-colors duration-300 bg-gradient-to-br from-blue-900/95 via-slate-900/90 to-slate-800/95`} />
      <SessionProvider>
        <div className="flex justify-end p-4 gap-4">
          <Button>
            <Link href="login">Đăng Nhập</Link>
          </Button>
        </div>
        <div className="flex justify-end p-4 gap-4">
          <Button>
            <Link href="login">Đăng Ký</Link>
          </Button>
        </div>
      </SessionProvider>
      {/* Centered footer under the login form */}
      <div className="w-full flex justify-center mt-4 sm:mt-6">
        <p className={`text-center text-xs sm:text-sm transition-colors duration-300 text-gray-300`}>
          © 2025 <span className="font-semibold">Bất Động Sản Winland</span>. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </div>
  );
};

export default Home;