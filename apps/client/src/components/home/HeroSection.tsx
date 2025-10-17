'use client';

import { Search } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Tìm kiếm bất động sản
            <span className="block text-primary">mơ ước của bạn</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Khám phá hàng ngàn tin đăng bất động sản từ khắp cả nước. Mua bán, cho thuê nhà đất, căn hộ, chung cư một cách dễ dàng.
          </p>

          {/* Search Bar */}
          <div className="mt-10">
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl sm:flex-row">
              <input
                type="text"
                placeholder="Nhập địa điểm, dự án, hoặc từ khoá..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-white hover:bg-primary/90 transition-colors">
                <Search className="h-5 w-5" />
                Tìm kiếm
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="text-sm text-gray-600">Tìm kiếm phổ biến:</span>
            {['Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Căn hộ', 'Nhà phố'].map(keyword => (
              <button
                key={keyword}
                className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

