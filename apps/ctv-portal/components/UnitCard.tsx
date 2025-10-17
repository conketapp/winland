/**
 * Reusable Unit Card Component
 */

import { MapPin, Maximize2, Compass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatArea, formatBedrooms } from '@/lib/format';
import { UNIT_STATUS_LABELS } from '@/constants';
import type { Unit } from '@/types';

interface UnitCardProps {
  unit: Unit;
  onView?: (unit: Unit) => void;
  onReserve?: (unit: Unit) => void;
}

export default function UnitCard({ unit, onView, onReserve }: UnitCardProps) {
  const isAvailable = unit.status === 'AVAILABLE';
  const commission = unit.price * (unit.commissionRate || 2) / 100;

  return (
    <Card>
      {/* Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        <span className="text-6xl">🏠</span>
      </div>

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg">{unit.code}</h3>
            <p className="text-sm text-muted-foreground">
              {unit.project?.name || 'Loading...'}
            </p>
          </div>
          <Badge variant={isAvailable ? 'default' : 'secondary'}>
            {isAvailable ? '🟢' : '🟡'} {UNIT_STATUS_LABELS[unit.status]}
          </Badge>
        </div>

        {/* Unit Details */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Maximize2 className="w-4 h-4 mr-1" />
            {formatArea(unit.area)}
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {formatBedrooms(unit.bedrooms)}
          </div>
          {unit.direction && (
            <div className="flex items-center">
              <Compass className="w-4 h-4 mr-1" />
              {unit.direction}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(unit.price)}
          </p>
          <p className="text-sm text-green-600 font-medium">
            💰 Hoa hồng: {formatCurrency(commission)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onView?.(unit)}
          >
            👁️ Xem
          </Button>
          {isAvailable && onReserve && (
            <Button
              className="flex-1"
              onClick={() => onReserve(unit)}
            >
              🔖 Giữ chỗ
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

