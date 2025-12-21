/**
 * Image Upload Component
 * Supports multiple images with preview, drag & drop, and URL input
 */

import React, { useState, useCallback } from 'react';
import { X, Upload, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface ImageUploadProps {
  value?: string[]; // Array of image URLs
  onChange: (images: string[]) => void;
  maxImages?: number;
  error?: string;
  helperText?: string;
}

export default function ImageUpload({
  value = [],
  onChange,
  maxImages = 10,
  error,
  helperText,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          // For now, convert to data URL (in production, upload to server)
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (value.length < maxImages) {
              onChange([...value, dataUrl]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [value, onChange, maxImages]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (value.length < maxImages) {
              onChange([...value, dataUrl]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [value, onChange, maxImages]
  );

  const handleAddUrl = useCallback(() => {
    if (urlInput.trim() && value.length < maxImages) {
      // Basic URL validation
      try {
        new URL(urlInput.trim());
        onChange([...value, urlInput.trim()]);
        setUrlInput('');
      } catch {
        // Invalid URL, could show error
      }
    }
  }, [urlInput, value, onChange, maxImages]);

  const handleRemove = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  const canAddMore = value.length < maxImages;

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">
        Hình ảnh dự án {value.length > 0 && `(${value.length}/${maxImages})`}
      </label>

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <img
                  src={imageUrl}
                  alt={`Project image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder on error
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : error
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }
          `}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Kéo thả hình ảnh vào đây hoặc
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                disabled={!canAddMore}
              />
              <Button type="button" variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Chọn từ máy tính
                </span>
              </Button>
            </label>
            <span className="text-sm text-gray-500">hoặc</span>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
                placeholder="Nhập URL hình ảnh"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddUrl}
                disabled={!urlInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Hỗ trợ: JPG, PNG, GIF (tối đa {maxImages} hình)
          </p>
        </div>
      )}

      {/* Helper Text / Error */}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
