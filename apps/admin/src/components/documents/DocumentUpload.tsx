import { useState } from 'react';
import { Button } from '../ui/button';
import { uploadDocument, uploadDocuments, type Document } from '../../api/documents.api';

interface DocumentUploadProps {
  entityType: string;
  entityId: string;
  documentType: string;
  description?: string;
  multiple?: boolean;
  onSuccess?: (documents: Document[]) => void;
  onError?: (error: Error) => void;
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

export function DocumentUpload({
  entityType,
  entityId,
  documentType,
  description,
  multiple = false,
  onSuccess,
  onError,
  className,
}: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadDescription, setUploadDescription] = useState(description || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      let documents: Document[];

      if (multiple && files.length > 1) {
        const result = await uploadDocuments(
          entityType,
          entityId,
          documentType,
          files,
          uploadDescription,
        );
        documents = result.documents;
      } else {
        const result = await uploadDocument(
          {
            entityType,
            entityId,
            documentType,
            description: uploadDescription,
          },
          files[0],
        );
        documents = [result.document];
      }

      setFiles([]);
      setUploadDescription(description || '');
      onSuccess?.(documents);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Upload failed');
      onError?.(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Loại tài liệu: {DOCUMENT_TYPES[documentType] || documentType}
          </label>
          <input
            type="file"
            multiple={multiple}
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={uploading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Chấp nhận: JPEG, PNG, WebP, PDF (tối đa 10MB mỗi file)
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Mô tả (tùy chọn)</label>
            <textarea
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Nhập mô tả tài liệu..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              disabled={uploading}
            />
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Files đã chọn:</p>
            <ul className="space-y-1">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-700">
                    {file.name} ({formatFileSize(file.size)})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    disabled={uploading}
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="w-full"
        >
          {uploading ? 'Đang tải lên...' : 'Tải lên'}
        </Button>
      </div>
    </div>
  );
}
