'use client';

import Link from 'next/link';
import { Building2, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Mua bán', href: '/properties?type=SALE' },
  { name: 'Cho thuê', href: '/properties?type=RENT' },
  { name: 'Tin tức', href: '/news' },
  { name: 'Liên hệ', href: '/contact' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Batdongsan</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-8">
          {navigation.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex md:items-center md:space-x-4">
          <button className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-primary"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Đăng ký
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden',
          mobileMenuOpen ? 'block' : 'hidden',
        )}
      >
        <div className="space-y-1 border-t px-4 pb-3 pt-2">
          {navigation.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/login"
            className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="block rounded-lg px-3 py-2 text-base font-medium text-primary hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  );
}

