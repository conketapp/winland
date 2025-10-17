'use client';

/**
 * 🏘️ UNITS LISTING PAGE (CTV Portal)
 * Browse and search available units
 * 
 * @route /units
 * @features Filter by project/status, Search, Unit cards with details
 */

import { useState, useEffect } from 'react';
import MobileLayout from '@/components/MobileLayout';
import UnitCard from '@/components/UnitCard';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { Search, Filter, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import type { Unit } from '@/types';

export default function UnitsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUnits();
  }, [activeFilter]);

  const loadUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      
      if (activeFilter !== 'all') {
        params.status = activeFilter;
      }
      
      const data = await apiClient.get('/units');
      setUnits(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to load units:', error);
      setError(error.message || 'Không thể tải danh sách căn hộ');
    } finally {
      setLoading(false);
    }
  };

  // Filter units by search query
  const filteredUnits = units.filter((unit) => {
    // Search filter
    if (searchQuery && !unit.code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Bedroom filter
    if (activeFilter === '2br' && unit.bedrooms !== 2) return false;
    if (activeFilter === '3br' && unit.bedrooms !== 3) return false;

    return true;
  });

  const handleViewUnit = (unit: Unit) => {
    console.log('View unit:', unit.code);
    // TODO: Navigate to unit detail page
  };

  const handleReserveUnit = (unit: Unit) => {
    console.log('Reserve unit:', unit.code);
    // TODO: Open reservation form
  };

  const filters = [
    { id: 'all', label: 'Tất cả' },
    { id: '2br', label: '2PN' },
    { id: '3br', label: '3PN' },
  ];

  // Loading State
  if (loading) {
    return (
      <MobileLayout>
        <LoadingState message="Đang tải danh sách căn hộ..." type="page" />
      </MobileLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <MobileLayout>
        <ErrorState 
          title="Không thể tải dữ liệu"
          message={error}
          onRetry={loadUnits}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-screen-md mx-auto p-4">
          <h1 className="text-xl font-bold mb-3">Tìm căn hộ</h1>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Tìm theo mã căn..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <Filter className="w-4 h-4 mr-1" />
              Lọc
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-md mx-auto p-4">
        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          {filteredUnits.length} căn phù hợp
        </p>

        {/* Units List */}
        {filteredUnits.length > 0 ? (
          <div className="space-y-4">
            {filteredUnits.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                onView={handleViewUnit}
                onReserve={handleReserveUnit}
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="Không tìm thấy căn hộ phù hợp"
            description="Thử thay đổi bộ lọc hoặc tìm kiếm khác"
            icon={<Home className="w-16 h-16 text-gray-400" />}
          />
        )}
      </div>
    </MobileLayout>
  );
}
