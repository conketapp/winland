'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, FileText, DollarSign, User } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Trang chủ' },
  { href: '/units', icon: Search, label: 'Tìm căn' },
  { href: '/my-transactions', icon: FileText, label: 'Phiếu' },
  { href: '/commissions', icon: DollarSign, label: 'Hoa hồng' },
  { href: '/profile', icon: User, label: 'Cá nhân' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-screen-md mx-auto px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

