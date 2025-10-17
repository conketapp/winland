import { Building2, Users, FileCheck, TrendingUp } from 'lucide-react';

const stats = [
  { name: 'Bất động sản', value: '0+', icon: Building2 },
  { name: 'Người dùng', value: '0+', icon: Users },
  { name: 'Giao dịch thành công', value: '0+', icon: FileCheck },
  { name: 'Đối tác', value: '0+', icon: TrendingUp },
];

export function StatsSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map(stat => (
            <div key={stat.name} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="mt-1 text-sm text-gray-600">{stat.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

