import { useEffect, useState } from 'react';
import { getDocumentsByEntity, deleteDocument, type Document } from '../../api/documents.api';
// Button removed - not used
import LoadingState from '../ui/LoadingState';
import EmptyState from '../ui/EmptyState';

interface DocumentListProps {
  entityType: string;
  entityId: string;
  onDocumentClick?: (document: Document) => void;
  onDocumentDeleted?: () => void;
  showActions?: boolean;
  className?: string;
}

const DOCUMENT_TYPES: Record<string, string> = {
  CMND_FRONT: 'CMND/CCCD mặt trước',
  CMND_BACK: 'CMND/CCCD mặt sau',
  PASSPORT: 'Hộ chiếu',
  MARRIAGE_CERT: 'Giấy chứng nhận đăng ký kết hôn',
  AUTHORIZATION: 'Giấy ủy quyền',
  CONTRACT_SIGNED: 'Bản sao hợp đồng đã ký',
  PAYMENT_PROOF: 'Chứng từ thanh toán',
  HANDOVER_REPORT: 'Biên bản nghiệm thu',
  UNIT_IMAGE: 'Ảnh căn hộ',
  OTHER: 'Khác',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  FINAL: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
};

export function DocumentList({
  entityType,
  entityId,
  onDocumentClick,
  onDocumentDeleted,
  showActions = true,
  className,
}: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [entityType, entityId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const result = await getDocumentsByEntity(entityType, entityId);
      setDocuments(result.documents);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;

    try {
      setDeleting(id);
      await deleteDocument(id);
      await loadDocuments();
      onDocumentDeleted?.();
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Xóa tài liệu thất bại');
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (size: string | number): string => {
    const bytes = typeof size === 'string' ? parseInt(size, 10) : size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    return '📎';
  };

  if (loading) {
    return <LoadingState message="Đang tải tài liệu..." />;
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        message="Chưa có tài liệu nào"
        description="Tải lên tài liệu để bắt đầu"
      />
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div
              className="flex-1 flex items-center gap-3 cursor-pointer"
              onClick={() => onDocumentClick?.(doc)}
            >
              <span className="text-2xl">{getFileIcon(doc.mimeType)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{doc.fileName}</p>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[doc.status] || STATUS_COLORS.DRAFT}`}
                  >
                    {doc.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                  <span>
                    {DOCUMENT_TYPES[doc.documentType] || doc.documentType}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span>•</span>
                  <span>
                    {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                {doc.description && (
                  <p className="mt-1 text-sm text-gray-600">{doc.description}</p>
                )}
              </div>
            </div>
            {showActions && (
              <div className="flex items-center gap-2">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Xem
                </a>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc.id);
                  }}
                  disabled={deleting === doc.id}
                  className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                >
                  {deleting === doc.id ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
