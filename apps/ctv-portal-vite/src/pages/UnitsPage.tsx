import React, { useState } from 'react';
import { 
  Home, 
  MapPin, 
  DollarSign,
  Calendar,
  Eye,
  Filter,
  Search,
  X,
  Maximize2,
  Bed,
  Bath,
  ArrowRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface Unit {
  id: number;
  code: string;
  block: string;
  floor: number;
  area: number;
  price: number;
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKING' | 'DEPOSITED' | 'SOLD';
  view: string;
  bedrooms: number;
  bathrooms: number;
  commission: number;
  direction?: string;
  customerName?: string;
  reservedUntil?: string;
}

export default function UnitsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('LK1');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Mock data - Sơ đồ căn hộ theo block
  const availableBlocks = ['LK1', 'LK2', 'LK3', 'LK4'];
  
  const mockUnits: Unit[] = [
    // LK1 - Tầng 12
    { id: 1, code: 'LK1-1201', block: 'LK1', floor: 12, area: 85, price: 2500000000, status: 'AVAILABLE', view: 'City View', bedrooms: 2, bathrooms: 2, commission: 25000000, direction: 'Đông Nam' },
    { id: 2, code: 'LK1-1202', block: 'LK1', floor: 12, area: 85, price: 2500000000, status: 'RESERVED', view: 'City View', bedrooms: 2, bathrooms: 2, commission: 25000000, direction: 'Đông Nam', customerName: 'Nguyễn Văn A', reservedUntil: '2 giờ' },
    { id: 3, code: 'LK1-1203', block: 'LK1', floor: 12, area: 95, price: 2800000000, status: 'BOOKING', view: 'River View', bedrooms: 3, bathrooms: 2, commission: 28000000, direction: 'Đông', customerName: 'Trần Thị B' },
    { id: 4, code: 'LK1-1204', block: 'LK1', floor: 12, area: 85, price: 2500000000, status: 'SOLD', view: 'City View', bedrooms: 2, bathrooms: 2, commission: 25000000, direction: 'Tây Nam' },
    
    // LK1 - Tầng 11
    { id: 5, code: 'LK1-1101', block: 'LK1', floor: 11, area: 85, price: 2450000000, status: 'AVAILABLE', view: 'City View', bedrooms: 2, bathrooms: 2, commission: 24500000, direction: 'Đông Nam' },
    { id: 6, code: 'LK1-1102', block: 'LK1', floor: 11, area: 85, price: 2450000000, status: 'AVAILABLE', view: 'City View', bedrooms: 2, bathrooms: 2, commission: 24500000, direction: 'Đông Nam' },
    { id: 7, code: 'LK1-1103', block: 'LK1', floor: 11, area: 95, price: 2750000000, status: 'DEPOSITED', view: 'River View', bedrooms: 3, bathrooms: 2, commission: 27500000, direction: 'Đông', customerName: 'Lê Văn C' },
    { id: 8, code: 'LK1-1104', block: 'LK1', floor: 11, area: 85, price: 2450000000, status: 'AVAILABLE', view: 'City View', bedrooms: 2, bathrooms: 2, commission: 24500000, direction: 'Tây Nam' },
    
    // LK1 - Tầng 10
    { id: 9, code: 'LK1-1001', block: 'LK1', floor: 10, area: 85, price: 2400000000, status: 'AVAILABLE', view: 'City View', bedrooms: 2, bathrooms: 2, commission: 24000000, direction: 'Đông Nam' },
    { id: 10, code: 'LK1-1002', block: 'LK1', floor: 10, area: 85, price: 2400000000, status: 'SOLD', view: 'City View', bedrooms: 2, bathrooms: 2, commission: 24000000, direction: 'Đông Nam' },
    { id: 11, code: 'LK1-1003', block: 'LK1', floor: 10, area: 95, price: 2700000000, status: 'AVAILABLE', view: 'River View', bedrooms: 3, bathrooms: 2, commission: 27000000, direction: 'Đông' },
    { id: 12, code: 'LK1-1004', block: 'LK1', floor: 10, area: 85, price: 2400000000, status: 'RESERVED', view: 'City View', bedrooms: 2, bathrooms: 2, commission: 24000000, direction: 'Tây Nam', customerName: 'Phạm Thị D', reservedUntil: '5 giờ' },
  ];

  const getStatusInfo = (status: string) => {
    const statusMap = {
      AVAILABLE: { 
        label: 'Có sẵn', 
        color: 'bg-green-500',
        textColor: 'text-white',
        borderColor: 'border-green-600',
        canAction: true,
        message: ''
      },
      RESERVED: { 
        label: 'Đã giữ', 
        color: 'bg-amber-500',
        textColor: 'text-white',
        borderColor: 'border-amber-600',
        canAction: false,
        message: '⚠️ Căn này đang có người giữ chỗ'
      },
      BOOKING: { 
        label: 'Booking', 
        color: 'bg-blue-500',
        textColor: 'text-white',
        borderColor: 'border-blue-600',
        canAction: false,
        message: '⚠️ Căn này đang trong quá trình booking'
      },
      DEPOSITED: { 
        label: 'Đã cọc', 
        color: 'bg-purple-500',
        textColor: 'text-white',
        borderColor: 'border-purple-600',
        canAction: false,
        message: '⚠️ Căn này đã được đặt cọc'
      },
      SOLD: { 
        label: 'Đã bán', 
        color: 'bg-gray-500',
        textColor: 'text-white',
        borderColor: 'border-gray-600',
        canAction: false,
        message: '❌ Căn này đã được bán'
      },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.AVAILABLE;
  };

  const filteredUnits = mockUnits.filter(unit => 
    unit.block === selectedBlock && 
    unit.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by floor
  const unitsByFloor = filteredUnits.reduce((acc, unit) => {
    if (!acc[unit.floor]) acc[unit.floor] = [];
    acc[unit.floor].push(unit);
    return acc;
  }, {} as Record<number, Unit[]>);

  const floors = Object.keys(unitsByFloor).map(Number).sort((a, b) => b - a);

  const handleUnitClick = (unit: Unit) => {
    const statusInfo = getStatusInfo(unit.status);
    
    // Nếu căn đã bán/đã giữ/booking/đã cọc → hiển thị cảnh báo
    if (!statusInfo.canAction) {
      alert(statusInfo.message);
      return;
    }
    
    // Nếu available → mở modal chi tiết
    setSelectedUnit(unit);
    setShowDetailModal(true);
  };

  const handleReservation = () => {
    if (!selectedUnit) return;
    alert(`Tính năng giữ chỗ cho căn ${selectedUnit.code} đang phát triển`);
    setShowDetailModal(false);
  };

  const handleBooking = () => {
    if (!selectedUnit) return;
    alert(`Tính năng booking cho căn ${selectedUnit.code} đang phát triển`);
    setShowDetailModal(false);
  };

  const handleDeposit = () => {
    if (!selectedUnit) return;
    alert(`Tính năng đặt cọc cho căn ${selectedUnit.code} đang phát triển`);
    setShowDetailModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-6 py-8 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sơ Đồ Căn Hộ</h1>
              <p className="text-white/80 text-sm">Chọn căn hộ để xem chi tiết và thực hiện giao dịch</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
            <Input
              placeholder="🔍 Tìm mã căn hộ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-5 h-5 text-white/80" />}
              className="bg-transparent border-0 text-white placeholder-white/60 focus:bg-white/10"
              variant="ghost"
            />
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Block Selection */}
        <Card variant="elevated" padding="md" className="animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Chọn Block / Khu</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Block hiện tại: {selectedBlock}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {availableBlocks.map((block) => (
                <button
                  key={block}
                  onClick={() => setSelectedBlock(block)}
                  className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                    selectedBlock === block
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {block}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Legend */}
        <Card variant="elevated" padding="md" className="animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Chú thích trạng thái</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Màu sắc biểu thị tình trạng bán hàng</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-lg"></div>
                <span className="text-sm text-gray-700 font-medium">Có sẵn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-500 rounded-lg"></div>
                <span className="text-sm text-gray-700 font-medium">Đã giữ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-lg"></div>
                <span className="text-sm text-gray-700 font-medium">Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-500 rounded-lg"></div>
                <span className="text-sm text-gray-700 font-medium">Đã cọc</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-500 rounded-lg"></div>
                <span className="text-sm text-gray-700 font-medium">Đã bán</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floor by Floor - Sơ đồ căn hộ */}
        <div className="space-y-4">
          {floors.map((floor, floorIndex) => (
            <Card 
              key={floor} 
              variant="elevated" 
              padding="md" 
              className="animate-slide-up"
              style={{ animationDelay: `${floorIndex * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-900">Tầng {floor}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {unitsByFloor[floor].filter(u => u.status === 'AVAILABLE').length} căn có sẵn
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Tổng căn</p>
                    <p className="text-lg font-bold text-gray-900">{unitsByFloor[floor].length}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {unitsByFloor[floor].map((unit) => {
                    const statusInfo = getStatusInfo(unit.status);
                    return (
                      <button
                        key={unit.id}
                        onClick={() => handleUnitClick(unit)}
                        className={`${statusInfo.color} ${statusInfo.textColor} rounded-xl p-4 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg relative overflow-hidden`}
                      >
                        {/* Background pattern */}
                        <div className="absolute inset-0 bg-black/5"></div>
                        
                        <div className="relative z-10">
                          {/* Unit Code */}
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-lg">{unit.code}</p>
                            {unit.status === 'AVAILABLE' && (
                              <CheckCircle className="w-5 h-5" />
                            )}
                          </div>
                          
                          {/* Unit Info */}
                          <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
                            <Bed className="w-4 h-4" />
                            <span>{unit.bedrooms}PN</span>
                            <Bath className="w-4 h-4 ml-1" />
                            <span>{unit.bathrooms}WC</span>
                          </div>
                          
                          {/* Price */}
                          <p className="text-base font-bold">{formatCurrency(unit.price)}</p>
                          <p className="text-xs opacity-80 mt-1">{unit.area}m²</p>
                          
                          {/* Status Badge */}
                          <div className="mt-2 pt-2 border-t border-white/20">
                            <p className="text-xs font-medium opacity-90">{statusInfo.label}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredUnits.length === 0 && (
          <Card variant="elevated" padding="lg" className="text-center animate-slide-up">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy căn hộ</h3>
              <p className="text-gray-600 mb-4">Hãy thử tìm kiếm với từ khóa khác hoặc chọn block khác</p>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBlock('LK1');
                }}
              >
                Đặt lại bộ lọc
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Unit Detail Modal */}
      {showDetailModal && selectedUnit && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in"
          onClick={() => setShowDetailModal(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-6 rounded-t-3xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{selectedUnit.code}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="gradient" size="sm" className={`${getStatusInfo(selectedUnit.status).color} text-white`}>
                  {getStatusInfo(selectedUnit.status).label}
                </Badge>
                <span className="text-white/80 text-sm">Block {selectedUnit.block} • Tầng {selectedUnit.floor}</span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Bed className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Phòng ngủ</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedUnit.bedrooms}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <Bath className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Phòng tắm</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedUnit.bathrooms}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Maximize2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Diện tích</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedUnit.area}m²</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <MapPin className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Hướng</p>
                  <p className="text-base font-bold text-gray-900">{selectedUnit.direction}</p>
                </div>
              </div>

              {/* View Info */}
              <Card variant="default" padding="md" className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tầm nhìn</p>
                      <p className="font-bold text-gray-900">{selectedUnit.view}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Card */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Giá bán</p>
                </div>
                <p className="text-3xl font-bold mb-1">{formatCurrency(selectedUnit.price)}</p>
                <p className="text-sm opacity-80">≈ {formatCurrency(selectedUnit.price / selectedUnit.area)}/m²</p>
              </div>

              {/* Commission Card */}
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Hoa hồng CTV</p>
                </div>
                <p className="text-3xl font-bold mb-1">{formatCurrency(selectedUnit.commission)}</p>
                <p className="text-sm opacity-80">≈ {((selectedUnit.commission / selectedUnit.price) * 100).toFixed(2)}% giá bán</p>
              </div>

              {/* Actions - Chỉ hiển thị nếu status = AVAILABLE */}
              {selectedUnit.status === 'AVAILABLE' && (
                <div className="space-y-3">
                  <Button 
                    variant="success" 
                    fullWidth 
                    size="lg"
                    onClick={handleReservation}
                    leftIcon={<Calendar className="w-5 h-5" />}
                  >
                    Giữ chỗ
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="primary" 
                      fullWidth
                      onClick={handleBooking}
                    >
                      Booking
                    </Button>
                    <Button 
                      variant="warning" 
                      fullWidth
                      onClick={handleDeposit}
                    >
                      Đặt cọc
                    </Button>
                  </div>
                </div>
              )}

              {/* Warning for non-available units */}
              {selectedUnit.status !== 'AVAILABLE' && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-red-900 mb-1">Không thể thực hiện giao dịch</p>
                      <p className="text-sm text-red-700">{getStatusInfo(selectedUnit.status).message}</p>
                      {selectedUnit.customerName && (
                        <p className="text-sm text-red-700 mt-2">
                          <strong>Khách hàng:</strong> {selectedUnit.customerName}
                        </p>
                      )}
                      {selectedUnit.reservedUntil && (
                        <p className="text-sm text-red-700">
                          <strong>Còn lại:</strong> {selectedUnit.reservedUntil}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}