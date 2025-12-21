/**
 * Bulk Import Units Page
 * CRITICAL FEATURE - Import hàng trăm căn từ Excel/CSV
 */

import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { unitsApi } from '../../api/units.api';
import type { BulkUnitRow, BulkImportResult } from '../../types/unit.types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { PageHeader } from '../../components/ui/PageHeader';
import { useToast } from '../../components/ui/toast';
import { formatCurrency } from '../../lib/utils';
import { Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

// Error types for better type safety
interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
}

interface ValidationError {
  row: number;
  errors: string[];
}


const BulkImportPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { error: toastError, success: toastSuccess } = useToast();
  
  const [units, setUnits] = useState<BulkUnitRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Example data for demo
  const exampleData = `A1\t8\t01\t2PN\t75\t2\t2\t2500000000\tĐông Nam\tView công viên
A1\t8\t02\t2PN\t80\t2\t2\t2700000000\tNam\tView hồ
A1\t8\t03\t3PN\t95\t3\t2\t3200000000\tĐông\tView thành phố
A2\t10\t01\tPenthouse\t150\t4\t3\t5000000000\tNam\tView panorama`;

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    parseData(pastedText);
  };

  // Improved parser that handles both tab and comma separated
  const parseData = (text: string) => {
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    const parsed: BulkUnitRow[] = [];
    const errors: ValidationError[] = [];

    lines.forEach((line, index) => {
      const rowNum = index + 1;
      const rowErrors: string[] = [];

      // Try to detect delimiter (tab or comma)
      const hasTabs = line.includes('\t');
      const hasCommas = line.includes(',');
      const delimiter = hasTabs ? '\t' : (hasCommas ? ',' : '\t'); // Default to tab

      // Handle CSV quoted fields
      const cols: string[] = [];
      if (delimiter === ',') {
        // Parse CSV with quoted fields
        const regex = /(".*?"|[^,]+)(?=\s*,|\s*$)/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
          let field = match[1].trim();
          // Remove quotes if present
          if (field.startsWith('"') && field.endsWith('"')) {
            field = field.slice(1, -1).replace(/""/g, '"');
          }
          cols.push(field);
        }
      } else {
        cols.push(...line.split(delimiter));
      }

      // Validate and parse
      if (cols.length < 4) {
        rowErrors.push(`Không đủ cột (cần ít nhất 4: Building, Floor, Unit, Area)`);
        errors.push({ row: rowNum, errors: rowErrors });
        return;
      }

      const building = cols[0]?.trim();
      const floorStr = cols[1]?.trim();
      const unit = cols[2]?.trim();
      const type = cols[3]?.trim();
      const areaStr = cols[4]?.trim();
      const bedroomsStr = cols[5]?.trim();
      const bathroomsStr = cols[6]?.trim();
      const priceStr = cols[7]?.trim();
      const direction = cols[8]?.trim();
      const view = cols[9]?.trim();
      const commissionRateStr = cols[10]?.trim();

      // Validation
      if (!building) rowErrors.push('Building không được để trống');
      if (!floorStr || isNaN(parseInt(floorStr)) || parseInt(floorStr) < 1) {
        rowErrors.push('Floor phải là số >= 1');
      }
      if (!unit) rowErrors.push('Unit không được để trống');
      if (!areaStr || isNaN(parseFloat(areaStr)) || parseFloat(areaStr) <= 0) {
        rowErrors.push('Area phải là số > 0');
      }
      if (bedroomsStr && (isNaN(parseInt(bedroomsStr)) || parseInt(bedroomsStr) < 0)) {
        rowErrors.push('Bedrooms phải là số >= 0');
      }
      if (bathroomsStr && (isNaN(parseInt(bathroomsStr)) || parseInt(bathroomsStr) < 0)) {
        rowErrors.push('Bathrooms phải là số >= 0');
      }
      if (!priceStr || isNaN(parseFloat(priceStr)) || parseFloat(priceStr) <= 0) {
        rowErrors.push('Price phải là số > 0');
      }
      if (commissionRateStr && (isNaN(parseFloat(commissionRateStr)) || parseFloat(commissionRateStr) < 0 || parseFloat(commissionRateStr) > 100)) {
        rowErrors.push('CommissionRate phải từ 0-100%');
      }

      if (rowErrors.length > 0) {
        errors.push({ row: rowNum, errors: rowErrors });
        return; // Skip invalid rows
      }

      // Parse valid row
      parsed.push({
        building: building!,
        floor: parseInt(floorStr!),
        unit: unit!,
        type: type || undefined,
        area: parseFloat(areaStr!),
        bedrooms: bedroomsStr ? parseInt(bedroomsStr) : undefined,
        bathrooms: bathroomsStr ? parseInt(bathroomsStr) : undefined,
        price: parseFloat(priceStr!),
        direction: direction || undefined,
        view: view || undefined,
        commissionRate: commissionRateStr ? parseFloat(commissionRateStr) : undefined,
      });
    });

    setUnits(parsed);
    setValidationErrors(errors);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.csv', '.txt'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!validExtensions.includes(fileExtension)) {
      toastError(`File không hợp lệ. Chỉ chấp nhận: ${validExtensions.join(', ')}`);
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toastError('File quá lớn. Kích thước tối đa: 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text === 'string') {
          parseData(text);
          toastSuccess(`Đã đọc file: ${file.name}`);
        } else {
          toastError('Không thể đọc nội dung file');
        }
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Lỗi xử lý file. Vui lòng kiểm tra format.';
        console.error('Error parsing file:', error);
        toastError(errorMessage);
      }
    };
    reader.onerror = () => {
      toastError('Lỗi đọc file. Vui lòng thử lại.');
    };
    reader.onabort = () => {
      toastError('Đã hủy đọc file');
    };
    reader.readAsText(file, 'UTF-8');

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateUnits = (): boolean => {
    // Validation already done in parseData, just check if there are errors
    const hasErrors = validationErrors.length > 0;
    return !hasErrors && units.length > 0;
  };

  const handleImport = async () => {
    if (!projectId) {
      toastError('Không tìm thấy projectId');
      return;
    }

    if (units.length === 0) {
      toastError('Vui lòng upload/paste dữ liệu trước khi import');
      return;
    }

    // Validate before import
    if (!validateUnits()) {
      if (validationErrors.length > 0) {
        toastError(`Có ${validationErrors.length} dòng lỗi. Vui lòng sửa trước khi import.`);
      } else {
        toastError('Dữ liệu không hợp lệ');
      }
      return;
    }

    if (!confirm(`Bạn có chắc muốn import ${units.length} căn?`)) {
      return;
    }

    try {
      setIsLoading(true);
      setImportProgress({ current: 0, total: units.length });
      setResult(null);

      // Simulate progress (actual progress would come from backend if supported)
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (!prev) return null;
          // Estimate progress (backend doesn't send progress events yet)
          const estimated = Math.min(prev.current + Math.ceil(prev.total / 10), prev.total * 0.9);
          return { ...prev, current: estimated };
        });
      }, 200);

      const importResult = await unitsApi.bulkImport({
        projectId,
        units,
      });

      clearInterval(progressInterval);
      setImportProgress({ current: units.length, total: units.length });
      setResult(importResult);
      
      if (importResult.summary.failed === 0) {
        toastSuccess(`✅ Import thành công ${importResult.summary.success} căn!`);
        setTimeout(() => {
          navigate(`/units`);
        }, 2000);
      } else {
        toastError(`Import hoàn tất với ${importResult.summary.failed} lỗi`);
      }
    } catch (error) {
      // Handle different error types
      let errorMessage = 'Lỗi khi import';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as Partial<ApiError>;
        errorMessage = apiError.message || errorMessage;
        
        // Handle specific error codes
        if (apiError.code === 'RATE_LIMIT_EXCEEDED') {
          errorMessage = 'Bạn đã import quá nhiều trong thời gian ngắn. Vui lòng đợi một chút.';
        } else if (apiError.statusCode === 413) {
          errorMessage = 'Dữ liệu quá lớn. Vui lòng chia nhỏ hoặc liên hệ admin.';
        } else if (apiError.statusCode === 400) {
          errorMessage = apiError.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (apiError.statusCode === 500) {
          errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
        }
      }
      
      console.error('Import error:', error);
      toastError(errorMessage);
      setImportProgress(null);
    } finally {
      setIsLoading(false);
      // Clear progress on error
      if (!result) {
        setImportProgress(null);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Bulk Import Căn Hộ"
        description="Import hàng trăm căn từ Excel/Google Sheets"
      />

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📋 Hướng dẫn</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Copy dữ liệu từ Excel (Building, Floor, Unit, Type, Area, Bedrooms, Bathrooms, Price, Direction, View)</li>
            <li>Paste vào ô bên dưới (Ctrl+V)</li>
            <li>Preview và xác nhận import</li>
          </ol>
        
        <details className="mt-3">
          <summary className="cursor-pointer font-medium text-blue-900 hover:text-blue-700">
            Xem dữ liệu mẫu
          </summary>
          <pre className="mt-2 text-xs bg-white p-3 rounded border border-blue-200 overflow-x-auto">
{exampleData}
          </pre>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => parseData(exampleData)}
            className="mt-2"
          >
            Load dữ liệu mẫu
          </Button>
        </details>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardHeader>
          <CardTitle>Nhập dữ liệu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload file CSV:
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
              >
                <Upload className="w-4 h-4" />
                Chọn file CSV
              </label>
              <span className="text-sm text-gray-500">hoặc paste bên dưới</span>
            </div>
          </div>

          {/* Text Paste */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Hoặc paste dữ liệu (Tab/Comma separated):
            </label>
            <textarea
              onPaste={handlePaste}
              onChange={(e) => parseData(e.target.value)}
              placeholder="Building,Floor,Unit,Type,Area,Bedrooms,Bathrooms,Price,Direction,View"
              className="w-full h-40 px-4 py-3 border border-input rounded-md font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              💡 Hỗ trợ cả CSV (comma) và TSV (tab). Tự động detect delimiter.
            </p>
          </div>

          {/* Validation Summary */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-900 font-medium mb-2">
                <AlertCircle className="w-5 h-5" />
                Có {validationErrors.length} dòng lỗi:
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {validationErrors.slice(0, 10).map((err) => (
                  <div key={err.row} className="text-sm text-red-700">
                    <span className="font-medium">Dòng {err.row}:</span> {err.errors.join(', ')}
                  </div>
                ))}
                {validationErrors.length > 10 && (
                  <div className="text-sm text-red-600">... và {validationErrors.length - 10} dòng nữa</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {units.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Preview: {units.length} căn hợp lệ
                {validationErrors.length > 0 && (
                  <span className="text-sm font-normal text-red-600 ml-2">
                    ({validationErrors.length} dòng lỗi đã bị loại bỏ)
                  </span>
                )}
              </CardTitle>
              {validationErrors.length === 0 && units.length > 0 && (
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Tất cả dòng đều hợp lệ
                </p>
              )}
            </div>
            <Button
              onClick={handleImport}
              disabled={isLoading || validationErrors.length > 0}
              size="lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang import...
                </span>
              ) : (
                '✅ Xác nhận Import'
              )}
            </Button>
          </CardHeader>

          {/* Progress Indicator */}
          {importProgress && (
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Đang import...</span>
                <span>{importProgress.current} / {importProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <CardContent>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Mã căn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">DT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">PN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Giá</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hướng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {units.slice(0, 50).map((unit, index) => {
                  const code = `${unit.building}-${unit.floor.toString().padStart(2, '0')}-${unit.unit.padStart(2, '0')}`;
                  return (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{code}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{unit.type || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{unit.area}m²</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{unit.bedrooms || '-'}PN</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatCurrency(unit.price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{unit.direction || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {units.length > 50 && (
              <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
                ... và {units.length - 50} căn nữa
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      )}

      {/* Import Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Kết quả Import</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{result.summary.success}</div>
              <div className="text-sm text-green-800">Thành công</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{result.summary.failed}</div>
              <div className="text-sm text-red-800">Lỗi</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{result.summary.total}</div>
              <div className="text-sm text-blue-800">Tổng cộng</div>
            </div>
          </div>

          {/* Errors */}
          {result.details.errors.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-900 mb-2">⚠️ Lỗi ({result.details.errors.length}):</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {result.details.errors.map((err, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                    <div className="font-medium text-red-900">Row {err.row}: {err.error}</div>
                    <div className="text-red-700 mt-1 text-xs">
                      {JSON.stringify(err.data)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkImportPage;

