import { Building, Home, Hotel, Store } from 'lucide-react';

const categories = [
  { name: 'Căn hộ/Chung cư', icon: Building, count: 0, color: 'bg-blue-500' },
  { name: 'Nhà riêng', icon: Home, count: 0, color: 'bg-green-500' },
  { name: 'Văn phòng', icon: Hotel, count: 0, color: 'bg-purple-500' },
  { name: 'Mặt bằng kinh doanh', icon: Store, count: 0, color: 'bg-orange-500' },
];

export function CategoriesSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Danh mục bất động sản</h2>
          <p className="mt-2 text-gray-600">Tìm kiếm theo loại hình bất động sản</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(category => (
            <button
              key={category.name}
              className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-lg"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${category.color} text-white`}>
                <category.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{category.count} tin đăng</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

