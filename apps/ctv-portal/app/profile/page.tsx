'use client';

/**
 * 👤 PROFILE PAGE (CTV Portal)
 * CTV profile information and settings
 * 
 * @route /profile
 * @features User info, Bank details, Logout, Edit profile
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import { User, Phone, Mail, LogOut, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('ctv_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ctv_token');
    localStorage.removeItem('ctv_user');
    router.push('/');
  };

  return (
    <MobileLayout>
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 pb-12">
        <div className="max-w-screen-md mx-auto">
          <h1 className="text-xl font-bold">Tài khoản</h1>
        </div>
      </header>

      <div className="max-w-screen-md mx-auto px-4 -mt-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
              {user?.fullName?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user?.fullName || 'CTV User'}
              </h2>
              <p className="text-sm text-gray-600">Cộng tác viên</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <Phone className="w-5 h-5 mr-3 text-gray-400" />
              <span>{user?.phone || '---'}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Mail className="w-5 h-5 mr-3 text-gray-400" />
              <span>{user?.email || 'chưa cập nhật'}</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow overflow-hidden mb-6">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-3 text-gray-600" />
              <span className="font-medium text-gray-900">Thông tin cá nhân</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <span className="text-xl mr-3">🔔</span>
              <span className="font-medium text-gray-900">Thông báo</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Đăng xuất
        </button>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6 mb-8">
          © 2025 Batdongsan Platform v1.0.0
        </p>
      </div>
    </MobileLayout>
  );
}

