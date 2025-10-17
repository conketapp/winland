/**
 * Shared DetailRow Component
 * Consistent detail display across modals
 */

import React, { ReactNode } from 'react';

interface DetailRowProps {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}

export default function DetailRow({ label, value, fullWidth = false }: DetailRowProps) {
  if (fullWidth) {
    return (
      <div className="col-span-2 space-y-1">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="text-sm">{value}</dd>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

