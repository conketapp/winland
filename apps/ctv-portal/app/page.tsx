'use client';

/**
 * 🔑 LOGIN PAGE (CTV Portal)
 * CTV authentication with phone/password
 * 
 * @route /
 * @features Auto-fill credentials, JWT auth, Real API integration
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('0912345671');
  const [password, setPassword] = useState('ctv123');
  const [otpCode, setOtpCode] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call real API
      const response = await apiClient.post('/auth/login-ctv', {
        phone,
        password,
        otpCode,
      });

      // Store token and user data
      localStorage.setItem('ctv_token', response.accessToken);
      localStorage.setItem('ctv_user', JSON.stringify(response.user));
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(error.message || 'Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full mb-4">
            <span className="text-4xl">🏠</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CTV Portal</h1>
          <p className="text-blue-100">Cộng tác viên Bất động sản</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Phone Input */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345671"
                    className="pl-12"
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
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              {/* OTP Input */}
              <div className="space-y-2">
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
                  Mã OTP
                </label>
                <Input
                  id="otp"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
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

        {/* Footer */}
        <p className="text-center text-blue-100 text-sm mt-6">
          © 2025 Batdongsan Platform
        </p>
      </div>
    </div>
  );
}
