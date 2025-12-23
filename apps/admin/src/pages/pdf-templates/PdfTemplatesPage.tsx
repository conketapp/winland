/**
 * PDF Templates Management Page
 * Quản lý và chỉnh sửa các template PDF (hợp đồng, phiếu cọc, booking, ...)
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import { useToast } from '../../components/ui/ToastProvider';
import { pdfTemplatesApi, type TemplateInfo, type TemplateContent } from '../../api/pdf-templates.api';
import { Save, Eye, FileText, RefreshCw } from 'lucide-react';
import Editor from '@monaco-editor/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export default function PdfTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(null);
  const [templateContent, setTemplateContent] = useState<TemplateContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [content, setContent] = useState('');
  const { showSuccess: toastSuccess, showError: toastError } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await pdfTemplatesApi.list();
      setTemplates(data);
      if (data.length > 0 && !selectedTemplate) {
        setSelectedTemplate(data[0]);
        await loadTemplateContent(data[0].name);
      }
    } catch (error: unknown) {
      console.error('Failed to load templates:', error);
      const errorMessage = error instanceof Error ? error.message : 'Tải danh sách template thất bại';
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateContent = async (templateName: string) => {
    try {
      setLoading(true);
      const data = await pdfTemplatesApi.get(templateName);
      setTemplateContent(data);
      setContent(data.content);
      setPreviewHtml(null);
    } catch (error: unknown) {
      console.error('Failed to load template content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Tải nội dung template thất bại';
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = async (templateName: string) => {
    const template = templates.find((t) => t.name === templateName);
    if (template) {
      setSelectedTemplate(template);
      await loadTemplateContent(templateName);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate || !content.trim()) {
      toastError('Vui lòng chọn template và nhập nội dung');
      return;
    }

    try {
      setSaving(true);
      await pdfTemplatesApi.update(selectedTemplate.name, content);
      toastSuccess('✅ Lưu template thành công!');
      // Reload template content to get updated version
      await loadTemplateContent(selectedTemplate.name);
    } catch (error: unknown) {
      console.error('Failed to save template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lưu template thất bại';
      toastError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!selectedTemplate) return;

    try {
      setPreviewLoading(true);
      const result = await pdfTemplatesApi.preview(selectedTemplate.name);
      setPreviewHtml(result.html);
    } catch (error: unknown) {
      console.error('Failed to preview template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Preview template thất bại';
      toastError(errorMessage);
    } finally {
      setPreviewLoading(false);
    }
  };

  const hasChanges = templateContent && content !== templateContent.content;

  if (loading && templates.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <PageHeader
          title="Quản lý Template PDF"
          description="Chỉnh sửa template cho hợp đồng, phiếu cọc, booking, ..."
        />
        <LoadingState message="Đang tải danh sách templates..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        title="Quản lý Template PDF"
        description="Chỉnh sửa template cho hợp đồng, phiếu cọc, booking, và các giấy tờ khác"
      />

      {/* Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Chọn Template</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-sm text-gray-500 py-4">
              Không có template nào được tìm thấy.
            </div>
          ) : (
            <Select
              value={selectedTemplate?.name || ''}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Chọn template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.name} value={template.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{template.displayName}</span>
                      <span className="text-xs text-gray-500">{template.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedTemplate && (
        <>
          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">{selectedTemplate.displayName}</CardTitle>
              <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="flex-1 sm:flex-initial"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <Button
                  onClick={handlePreview}
                  disabled={previewLoading}
                  variant="outline"
                  className="flex-1 sm:flex-initial"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {previewLoading ? 'Đang tải...' : 'Preview'}
                </Button>
                <Button
                  onClick={() => loadTemplateContent(selectedTemplate.name)}
                  variant="outline"
                  className="flex-1 sm:flex-initial"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Làm mới
                </Button>
              </div>
              {hasChanges && (
                <div className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  ⚠️ Có thay đổi chưa lưu
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editor and Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Code Editor */}
            <Card className="flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Editor (Handlebars)
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0 p-0">
                <div className="h-[500px] border-t border-gray-200">
                  <Editor
                    height="100%"
                    language="html"
                    value={content}
                    onChange={(value) => setContent(value || '')}
                    theme="vs-light"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      readOnly: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      formatOnPaste: false,
                      formatOnType: false,
                      autoIndent: 'full',
                      bracketPairColorization: { enabled: true },
                      colorDecorators: true,
                      suggest: {
                        snippetsPreventQuickSuggestions: false,
                      },
                      quickSuggestions: {
                        other: true,
                        comments: false,
                        strings: true,
                      },
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
                      cursorBlinking: 'smooth',
                      cursorSmoothCaretAnimation: 'on',
                      folding: true,
                      showFoldingControls: 'always',
                      matchBrackets: 'always',
                    }}
                    loading={
                      <div className="flex items-center justify-center h-full">
                        <div className="text-sm text-gray-500">Đang tải editor...</div>
                      </div>
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-sm sm:text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-auto">
                {previewLoading ? (
                  <div className="flex items-center justify-center h-[500px]">
                    <div className="text-sm text-gray-500">Đang tải preview...</div>
                  </div>
                ) : previewHtml ? (
                  <div
                    className="bg-white"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[500px] text-sm text-gray-500">
                    Nhấn "Preview" để xem kết quả
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Template Help */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Hướng dẫn sử dụng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                <div>
                  <strong>Handlebars Helpers có sẵn:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 ml-2">
                    <li><code>{'{{formatCurrency amount}}'}</code> - Format tiền VND</li>
                    <li><code>{'{{formatCurrencyText amount}}'}</code> - Số tiền bằng chữ</li>
                    <li><code>{'{{formatDate date}}'}</code> - Format ngày (DD/MM/YYYY)</li>
                    <li><code>{'{{formatDateFull date}}'}</code> - Format ngày đầy đủ</li>
                    <li><code>{'{{#if condition}}...{{/if}}'}</code> - Điều kiện</li>
                    <li><code>{'{{#each items}}...{{/each}}'}</code> - Lặp qua mảng</li>
                  </ul>
                </div>
                <div className="mt-3">
                  <strong>Lưu ý:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 ml-2">
                    <li>Template sử dụng Handlebars syntax</li>
                    <li>Style được định nghĩa trong phần &lt;style&gt; của template</li>
                    <li>Sau khi lưu, template sẽ được cache và áp dụng cho các PDF mới</li>
                    <li>Nên test kỹ trước khi lưu vào production</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}