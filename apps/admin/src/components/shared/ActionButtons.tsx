/**
 * Shared ActionButtons Component
 * Consistent action buttons (Edit, Delete, View, etc.)
 */

import React from 'react';
import { Button } from '../ui/button';
import { Eye, Edit, Trash2, Check, X, FileText } from 'lucide-react';

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDownload?: () => void;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  approveLabel?: string;
  rejectLabel?: string;
  downloadLabel?: string;
  className?: string;
}

export default function ActionButtons({
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onDownload,
  viewLabel = 'Xem',
  editLabel = 'Sửa',
  deleteLabel = 'Xóa',
  approveLabel = 'Duyệt',
  rejectLabel = 'Từ chối',
  downloadLabel = 'Tải',
  className = '',
}: ActionButtonsProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {onView && (
        <Button variant="outline" size="sm" onClick={onView}>
          <Eye className="w-4 h-4 mr-1" />
          {viewLabel}
        </Button>
      )}
      
      {onEdit && (
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-1" />
          {editLabel}
        </Button>
      )}
      
      {onDelete && (
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-1" />
          {deleteLabel}
        </Button>
      )}
      
      {onApprove && (
        <Button variant="default" size="sm" onClick={onApprove}>
          <Check className="w-4 h-4 mr-1" />
          {approveLabel}
        </Button>
      )}
      
      {onReject && (
        <Button variant="destructive" size="sm" onClick={onReject}>
          <X className="w-4 h-4 mr-1" />
          {rejectLabel}
        </Button>
      )}
      
      {onDownload && (
        <Button variant="outline" size="sm" onClick={onDownload}>
          <FileText className="w-4 h-4 mr-1" />
          {downloadLabel}
        </Button>
      )}
    </div>
  );
}

