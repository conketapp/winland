"use client";
import { Button } from '@/components/ui/button';
import Link from "next/link";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4 sm:p-6">
      {/* Gradient Overlay */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-blue-900/95 via-slate-900/90 to-slate-800/95" />
      
      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-bold text-white mb-8">CTV Portal</h1>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/login">Đăng Nhập</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/signup">Đăng Ký</Link>
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 w-full flex justify-center">
        <p className="text-center text-xs sm:text-sm text-gray-300">
          © 2025 <span className="font-semibold">Bất Động Sản Winland</span>. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </div>
  );
};

export default Home;