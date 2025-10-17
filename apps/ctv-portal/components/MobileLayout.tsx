'use client';

import { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content area with padding for bottom nav */}
      <main className={showNav ? 'pb-20' : ''}>
        {children}
      </main>

      {/* Bottom navigation */}
      {showNav && <BottomNav />}
    </div>
  );
}

