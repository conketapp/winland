/**
 * Bulk Import Units Page
 * CRITICAL FEATURE - Import hàng trăm căn từ Excel/CSV
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { unitsApi } from '../../api/units.api';
import type { BulkUnitRow, BulkImportResult } from '../../types/unit.types';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PageHeader } from '../../components/ui/PageHeader';

const BulkImportPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [units, setUnits] = useState<BulkUnitRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);

  // Example data for demo
  const exampleData = `A1\t8\t01\t2PN\t75\t2\t2\t2500000000\tĐông Nam\tView công viên
A1\t8\t02\t2PN\t80\t2\t2\t2700000000\tNam\tView hồ
A1\t8\t03\t3PN\t95\t3\t2\t3200000000\tĐông\tView thành phố
A2\t10\t01\tPenthouse\t150\t4\t3\t5000000000\tNam\tView panorama`;

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    parseData(pastedText);
  };

  const parseData = (text: string) => {
    const lines = text.trim().split('\n');
    const parsed: BulkUnitRow[] = [];

    lines.forEach((line, index) => {
      const cols = line.split('\t');
      if (cols.length >= 8) {
        parsed.push({
          building: cols[0].trim(),
          floor: parseInt(cols[1]),
          unit: cols[2].trim(),
          type: cols[3]?.trim(),
          area: parseFloat(cols[4]),
          bedrooms: cols[5] ? parseInt(cols[5]) : undefined,
          bathrooms: cols[6] ? parseInt(cols[6]) : undefined,
          price: parseFloat(cols[7]),
          direction: cols[8]?.trim(),
          view: cols[9]?.trim(),
          commissionRate: cols[10] ? parseFloat(cols[10]) : undefined,
        });
      }
    });

    setUnits(parsed);
  };

  const handleImport = async () => {
    if (!projectId) {
      alert('Không tìm thấy projectId');
      return;
    }

    if (units.length === 0) {
      alert('Vui lòng paste dữ liệu trước khi import');
      return;
    }

    if (!confirm(`Bạn có chắc muốn import ${units.length} căn?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const importResult = await unitsApi.bulkImport({
        projectId,
        units,
      });
      setResult(importResult);
      
      if (importResult.summary.failed === 0) {
        alert(`✅ Import thành công ${importResult.summary.success} căn!`);
        navigate(`/projects/${projectId}/units`);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi import');
    } finally {
      setIsLoading(false);
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
        <CardContent className="pt-6">
          <label className="block text-sm font-medium mb-2">
            Paste dữ liệu (Tab-separated):
          </label>
          <textarea
          onPaste={handlePaste}
          onChange={(e) => parseData(e.target.value)}
          placeholder="Building	Floor	Unit	Type	Area	Bedrooms	Bathrooms	Price	Direction	View"
          className="w-full h-40 px-4 py-3 border border-input rounded-md font-mono text-sm"
        />
          <p className="text-xs text-muted-foreground mt-2">
            💡 Tip: Copy trực tiếp từ Excel/Google Sheets (giữ nguyên tab-separated)
          </p>
        </CardContent>
      </Card>

      {/* Preview */}
      {units.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Preview: {units.length} căn
            </CardTitle>
            <Button
              onClick={handleImport}
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? 'Đang import...' : '✅ Xác nhận Import'}
            </Button>
          </CardHeader>

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
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{code}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{unit.type || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{unit.area}m²</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{unit.bedrooms || '-'}PN</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {(unit.price / 1000000).toFixed(0)}tr
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

