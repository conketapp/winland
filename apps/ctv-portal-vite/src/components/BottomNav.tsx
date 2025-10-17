import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  DollarSign, 
  TrendingUp, 
  User 
} from 'lucide-react';

const navItems = [
  {
    path: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    path: '/units',
    icon: Home,
    label: 'Căn hộ',
    color: 'from-purple-500 to-violet-600'
  },
  {
    path: '/commissions',
    icon: DollarSign,
    label: 'Hoa hồng',
    color: 'from-emerald-500 to-green-600'
  },
  {
    path: '/my-transactions',
    icon: TrendingUp,
    label: 'Giao dịch',
    color: 'from-amber-500 to-orange-600'
  },
  {
    path: '/profile',
    icon: User,
    label: 'Profile',
    color: 'from-pink-500 to-rose-600'
  }
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Glassmorphism background */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50">
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white shadow-lg scale-110' 
                    : 'hover:bg-gray-100/50 hover:scale-105'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-r ${item.color}` 
                    : 'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <span className={`text-xs font-medium ${
                  isActive ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}