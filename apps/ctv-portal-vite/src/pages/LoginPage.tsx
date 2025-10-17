import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - save token and redirect
    localStorage.setItem('ctv_token', 'mock_token_123');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CTV Portal</h1>
          <p className="text-white/80 text-lg">Đăng nhập để tiếp tục</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <div className="text-center pb-6">
            <h2 className="text-2xl font-bold text-white">Chào mừng trở lại</h2>
            <p className="text-white/80 mt-2">Nhập thông tin để đăng nhập</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-white/90 text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  leftIcon={<Mail className="w-5 h-5" />}
                  className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:bg-white/30 focus:border-white/50"
                  variant="ghost"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-white/90 text-sm font-medium">Mật khẩu</label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white/60 hover:text-white/80 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  }
                  className="bg-white/20 border-white/30 text-white placeholder-white/60 focus:bg-white/30 focus:border-white/50"
                  variant="ghost"
                  required
                />
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/30 bg-white/20" />
                  Ghi nhớ đăng nhập
                </label>
                <button type="button" className="text-white/80 hover:text-white transition-colors">
                  Quên mật khẩu?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                variant="gradient"
                fullWidth
                size="lg"
                className="bg-gradient-to-r from-white to-white/90 text-purple-600 hover:from-white/90 hover:to-white font-bold"
              >
                Đăng nhập
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            {/* Demo Login */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-white/80 text-sm text-center mb-4">Hoặc đăng nhập nhanh:</p>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  setFormData({ email: 'demo@ctv.com', password: '123456' });
                }}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Dùng tài khoản demo
              </Button>
            </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            © 2024 CTV Portal. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </div>
  );
}