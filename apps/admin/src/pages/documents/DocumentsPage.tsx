/**
 * Documents Management Page
 * Quản lý tất cả tài liệu, hợp đồng trong hệ thống
 */

import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/shared/StatusBadge';
import { getDocuments, type Document, type QueryDocumentDto } from '../../api/documents.api';
import { formatDate } from '../../lib/utils';
import { Eye, Download, FileText } from 'lucide-react';

const ENTITY_TYPES = [
  { value: '', label: 'Tất cả' },
  { value: 'deposit', label: 'Phiếu cọc' },
  { value: 'booking', label: 'Phiếu đặt chỗ' },
  { value: 'reservation', label: 'Phiếu giữ chỗ' },
  { value: 'unit', label: 'Căn hộ' },
  { value: 'transaction', label: 'Giao dịch' },
  { value: 'user', label: 'Người dùng' },
];

const DOCUMENT_TYPES = [
  { value: '', label: 'Tất cả' },
  { value: 'CMND_FRONT', label: 'CMND/CCCD mặt trước' },
  { value: 'CMND_BACK', label: 'CMND/CCCD mặt sau' },
  { value: 'PASSPORT', label: 'Hộ chiếu' },
  { value: 'MARRIAGE_CERT', label: 'Giấy chứng nhận đăng ký kết hôn' },
  { value: 'AUTHORIZATION', label: 'Giấy ủy quyền' },
  { value: 'CONTRACT_SIGNED', label: 'Bản sao hợp đồng đã ký' },
  { value: 'PAYMENT_PROOF', label: 'Chứng từ thanh toán' },
  { value: 'HANDOVER_REPORT', label: 'Biên bản nghiệm thu' },
  { value: 'UNIT_IMAGE', label: 'Ảnh căn hộ' },
  { value: 'OTHER', label: 'Khác' },
];

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'FINAL', label: 'Chính thức' },
  { value: 'ARCHIVED', label: 'Đã lưu trữ' },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [entityType, setEntityType] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    loadDocuments();
  }, [page, entityType, documentType, status]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const query: QueryDocumentDto = {
        page,
        pageSize,
      };
      if (entityType) query.entityType = entityType;
      if (documentType) query.documentType = documentType;
      if (status) query.status = status;

      const result = await getDocuments(query);
      setDocuments(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error: unknown) {
      console.error('Failed to load documents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Tải danh sách tài liệu thất bại';
      const errorDetail = typeof error === 'object' && error !== null && 'statusCode' in error
        ? ` (Status: ${error.statusCode})`
        : '';
      alert(`Tải danh sách tài liệu thất bại: ${errorMessage}${errorDetail}`);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (size: string | number): string => {
    const bytes = typeof size === 'string' ? parseInt(size, 10) : size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    return '📎';
  };

  const getDocumentTypeLabel = (type: string): string => {
    const found = DOCUMENT_TYPES.find((t) => t.value === type);
    return found?.label || type;
  };

  const getEntityTypeLabel = (type: string): string => {
    const found = ENTITY_TYPES.find((t) => t.value === type);
    return found?.label || type;
  };

  const handleView = (document: Document) => {
    window.open(document.fileUrl, '_blank');
  };

  const handleDownload = (doc: Document) => {
    const link = window.document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.fileName;
    link.target = '_blank';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  if (loading && documents.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <PageHeader
          title="Quản lý Tài liệu & Hợp đồng"
          description="Quản lý tất cả tài liệu, hợp đồng trong hệ thống"
        />
        <LoadingState message="Đang tải danh sách tài liệu..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        title="Quản lý Tài liệu & Hợp đồng"
        description="Quản lý tất cả tài liệu, hợp đồng trong hệ thống"
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3 md:gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Loại Entity
              </label>
              <select
                value={entityType}
                onChange={(e) => {
                  setEntityType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ENTITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Loại Tài liệu
              </label>
              <select
                value={documentType}
                onChange={(e) => {
                  setDocumentType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 mb-1 truncate">Tổng số tài liệu</p>
                <p className="text-xl md:text-2xl font-semibold text-gray-900 break-words">
                  {total.toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="flex-shrink-0 ml-2">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List - Mobile Card View */}
      {documents.length === 0 ? (
        <EmptyState
          message="Chưa có tài liệu nào"
          description="Tài liệu sẽ được hiển thị ở đây khi có"
        />
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl flex-shrink-0">{getFileIcon(doc.mimeType)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-gray-900 break-words">
                          {doc.fileName}
                        </p>
                        <StatusBadge status={doc.status} />
                      </div>
                      <div className="mt-1 space-y-1 text-xs text-gray-500">
                        <div>
                          {getDocumentTypeLabel(doc.documentType)} • {getEntityTypeLabel(doc.entityType)}
                        </div>
                        <div>
                          {formatFileSize(doc.fileSize)} • {formatDate(doc.uploadedAt)}
                        </div>
                        {doc.uploader && (
                          <div>Người tải: {doc.uploader.fullName}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(doc)}
                      className="flex-1 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Xem
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="flex-1 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Tải
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tài liệu
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Loại
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Entity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Kích thước
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ngày tải
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getFileIcon(doc.mimeType)}</span>
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">
                                {doc.fileName}
                              </p>
                              {doc.uploader && (
                                <p className="text-xs text-gray-500 truncate">
                                  {doc.uploader.fullName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {getDocumentTypeLabel(doc.documentType)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {getEntityTypeLabel(doc.entityType)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatFileSize(doc.fileSize)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(doc.uploadedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(doc)}
                              className="h-8"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Xem
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(doc)}
                              className="h-8"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Tải
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {documents.length} / {total} tài liệu
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trước
            </Button>
            <span className="px-3 py-1 text-sm text-gray-700 flex items-center">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}