import { apiRequest } from './client';
import { API_BASE_URL } from '../constants/api';

export interface Document {
  id: string;
  entityType: string;
  entityId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: string | number;
  mimeType: string;
  version: number;
  status: 'DRAFT' | 'FINAL' | 'ARCHIVED';
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  metadata?: Record<string, unknown>;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  uploader?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface CreateDocumentDto {
  entityType: string;
  entityId: string;
  documentType: string;
  description?: string;
}

export interface UpdateDocumentDto {
  status?: 'DRAFT' | 'FINAL' | 'ARCHIVED';
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface QueryDocumentDto {
  entityType?: string;
  entityId?: string;
  documentType?: string;
  status?: string;
  uploadedBy?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedDocuments {
  items: Document[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Upload single document
 */
export async function uploadDocument(
  dto: CreateDocumentDto,
  file: File,
): Promise<{ document: Document; message: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', dto.entityType);
  formData.append('entityId', dto.entityId);
  formData.append('documentType', dto.documentType);
  if (dto.description) {
    formData.append('description', dto.description);
  }

  const token = localStorage.getItem('admin_token');
  
  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // Don't set Content-Type, browser will set it with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

/**
 * Upload multiple documents
 */
export async function uploadDocuments(
  entityType: string,
  entityId: string,
  documentType: string,
  files: File[],
  description?: string,
): Promise<{ documents: Document[]; count: number; message: string }> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('entityType', entityType);
  formData.append('entityId', entityId);
  formData.append('documentType', documentType);
  if (description) {
    formData.append('description', description);
  }

  const token = localStorage.getItem('admin_token');
  
  const response = await fetch(`${API_BASE_URL}/documents/bulk`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

/**
 * Get all documents with filters
 */
export async function getDocuments(
  query: QueryDocumentDto = {},
): Promise<PaginatedDocuments> {
  const params = new URLSearchParams();
  if (query.entityType) params.append('entityType', query.entityType);
  if (query.entityId) params.append('entityId', query.entityId);
  if (query.documentType) params.append('documentType', query.documentType);
  if (query.status) params.append('status', query.status);
  if (query.uploadedBy) params.append('uploadedBy', query.uploadedBy);
  if (query.page) params.append('page', query.page.toString());
  if (query.pageSize) params.append('pageSize', query.pageSize.toString());

  const queryString = params.toString();
  return apiRequest<PaginatedDocuments>({
    method: 'GET',
    url: queryString ? `/documents?${queryString}` : '/documents',
  });
}

/**
 * Get documents by entity
 */
export async function getDocumentsByEntity(
  entityType: string,
  entityId: string,
): Promise<{ documents: Document[]; count: number }> {
  return apiRequest<{ documents: Document[]; count: number }>({
    method: 'GET',
    url: `/documents/entity/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
  });
}

/**
 * Get document by ID
 */
export async function getDocument(id: string): Promise<Document> {
  return apiRequest<Document>({
    method: 'GET',
    url: `/documents/${id}`,
  });
}

/**
 * Get document versions
 */
export async function getDocumentVersions(
  entityType: string,
  entityId: string,
  documentType: string,
): Promise<{ versions: Document[]; count: number }> {
  return apiRequest<{ versions: Document[]; count: number }>({
    method: 'GET',
    url: `/documents/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}/${encodeURIComponent(documentType)}/versions`,
  });
}

/**
 * Update document
 */
export async function updateDocument(
  id: string,
  dto: UpdateDocumentDto,
): Promise<Document> {
  return apiRequest<Document>({
    method: 'PUT',
    url: `/documents/${id}`,
    data: dto,
  });
}

/**
 * Delete document
 */
export async function deleteDocument(
  id: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>({
    method: 'DELETE',
    url: `/documents/${id}`,
  });
}
