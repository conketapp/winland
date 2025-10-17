import { Building2 } from 'lucide-react';

export function FeaturedProperties() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Bất động sản nổi bật</h2>
          <p className="mt-2 text-gray-600">Khám phá những bất động sản được quan tâm nhiều nhất</p>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Building2 className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Chưa có bất động sản nào</h3>
            <p className="mt-2 text-sm text-gray-600">Danh sách bất động sản sẽ hiển thị tại đây</p>
          </div>
        </div>
      </div>
    </section>
  );
}

