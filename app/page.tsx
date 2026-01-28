'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Header, Container } from './components/layout';
import { Card, LoadingSpinner } from './components/ui';
import { analyzeImage } from './services/imageAnalysisService';
import { exportToPDF, printDocument } from './services/pdfExportService';
import { baseDocumentData } from './data/fakeData';
import type { PersonInfo, UploadedImage, AppStep, ResidenceDocument } from './types/residence';

// Dynamic imports for code splitting
const ImageUploader = dynamic(
  () => import('./components/upload/ImageUploader'),
  { loading: () => <LoadingSpinner text="Đang tải..." /> }
);

const ImagePreview = dynamic(
  () => import('./components/upload/ImagePreview'),
  { loading: () => <LoadingSpinner text="Đang tải..." /> }
);

const DocumentPreview = dynamic(
  () => import('./components/document/DocumentPreview'),
  { loading: () => <LoadingSpinner text="Đang tải..." /> }
);

const ExportButtons = dynamic(
  () => import('./components/document/ExportButtons'),
  { loading: () => <LoadingSpinner text="Đang tải..." /> }
);

const ResidenceReportTemplate = dynamic(
  () => import('./components/document/ResidenceReportTemplate'),
  { loading: () => <LoadingSpinner text="Đang tải..." /> }
);

// Generate unique ID
const generateId = (): string => {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default function Home() {
  // State - Multi-image support
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);
  const [accumulatedPersons, setAccumulatedPersons] = useState<PersonInfo[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Combined document data
  const documentData: ResidenceDocument = {
    ...baseDocumentData,
    danhSachNhanKhau: accumulatedPersons,
  };

  // Handlers
  const handleImageSelect = useCallback((file: File, preview: string) => {
    setCurrentFile(file);
    setCurrentPreview(preview);
    setError(null);
  }, []);

  const handleRemoveCurrentImage = useCallback(() => {
    setCurrentFile(null);
    setCurrentPreview(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!currentFile || !currentPreview) return;

    setCurrentStep('analyzing');
    setError(null);

    try {
      const uploadIndex = uploadedImages.length;
      const result = await analyzeImage(currentFile, uploadIndex);

      if (result.success && result.data) {
        // Create new uploaded image entry
        const newUploadedImage: UploadedImage = {
          id: generateId(),
          file: currentFile,
          preview: currentPreview,
          extractedData: result.data,
        };

        // Update STT for new data based on existing count
        const updatedData = result.data.map((person, idx) => ({
          ...person,
          stt: accumulatedPersons.length + idx + 1,
        }));

        // Add to accumulated data
        setUploadedImages((prev) => [...prev, newUploadedImage]);
        setAccumulatedPersons((prev) => [...prev, ...updatedData]);

        // Clear current upload state
        setCurrentFile(null);
        setCurrentPreview(null);

        // Move to preview
        setCurrentStep('preview');
      } else {
        setError(result.error || 'Có lỗi xảy ra khi phân tích ảnh');
        setCurrentStep('upload');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      setCurrentStep('upload');
    }
  }, [currentFile, currentPreview, uploadedImages.length, accumulatedPersons.length]);

  const handleContinueUpload = useCallback(() => {
    setCurrentStep('upload');
  }, []);

  const handleExportPDF = useCallback(async () => {
    if (isExporting) return; // Prevent multiple clicks

    setIsExporting(true);
    try {
      await exportToPDF('document-preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi xuất PDF');
    } finally {
      // Add small delay before allowing another export
      setTimeout(() => {
        setIsExporting(false);
      }, 500);
    }
  }, [isExporting]);

  const handlePrint = useCallback(() => {
    try {
      printDocument('document-preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi in');
    }
  }, []);

  const handleReset = useCallback(() => {
    setUploadedImages([]);
    setAccumulatedPersons([]);
    setCurrentFile(null);
    setCurrentPreview(null);
    setCurrentStep('upload');
    setError(null);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header - Compact */}
      <Header />

      {/* Main Content - Fixed height with overflow */}
      <main className="flex-1 overflow-hidden py-3 sm:py-4">
        <Container className="h-full flex flex-col">
          {/* Step Indicators - Compact */}
          <div className="flex items-center justify-center gap-2 mb-3 flex-shrink-0">
            {[
              { step: 'upload', label: 'Upload', icon: '📤' },
              { step: 'analyzing', label: 'Phân tích', icon: '🔍' },
              { step: 'preview', label: 'Xem biên bản', icon: '📄' },
            ].map(({ step, label, icon }, idx) => (
              <React.Fragment key={step}>
                <div
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                    transition-all duration-300
                    ${currentStep === step
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : (currentStep === 'preview' && step !== 'preview') ||
                        (currentStep === 'analyzing' && step === 'upload')
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }
                  `}
                >
                  <span>{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {idx < 2 && (
                  <div
                    className={`w-6 sm:w-12 h-0.5 transition-colors duration-300 ${(currentStep === 'analyzing' && idx === 0) ||
                      (currentStep === 'preview' && idx <= 1)
                      ? 'bg-green-400'
                      : 'bg-gray-200'
                      }`}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Upload count badge */}
            {uploadedImages.length > 0 && (
              <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {uploadedImages.length} ảnh • {accumulatedPersons.length} người
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm flex-shrink-0">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Main Content Area - Flex grow with overflow */}
          <Card variant="elevated" padding="md" className="flex-1 overflow-hidden flex flex-col">
            {/* Upload Step */}
            {currentStep === 'upload' && !currentPreview && (
              <div className="flex-1 overflow-auto">
                <ImageUploader onImageSelect={handleImageSelect} />
              </div>
            )}

            {/* Image Selected - Show Preview and Analyze Button */}
            {(currentStep === 'upload' || currentStep === 'analyzing') && currentPreview && (
              <div className="flex-1 overflow-auto flex flex-col gap-4">
                <ImagePreview
                  src={currentPreview}
                  fileName={currentFile?.name}
                  onRemove={handleRemoveCurrentImage}
                  isProcessing={currentStep === 'analyzing'}
                />

                {currentStep === 'upload' && (
                  <div className="flex justify-center flex-shrink-0">
                    <button
                      onClick={handleAnalyze}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Phân tích ảnh
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Analyzing Step - Loading (when no preview) */}
            {currentStep === 'analyzing' && !currentPreview && (
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner size="xl" text="Đang phân tích ảnh..." />
              </div>
            )}

            {/* Preview Step - Show Document */}
            {currentStep === 'preview' && accumulatedPersons.length > 0 && (
              <div className="flex-1 overflow-hidden flex flex-col gap-3">
                {/* Two column layout */}
                <div className="flex-1 overflow-hidden grid grid-cols-1 xl:grid-cols-4 gap-3">
                  {/* Uploaded Images List - Compact sidebar */}
                  <div className="xl:col-span-1 overflow-auto">
                    <h3 className="text-sm font-semibold mb-2 text-gray-700 sticky top-0 bg-white py-1">
                      Ảnh đã upload ({uploadedImages.length})
                    </h3>
                    <div className="grid grid-cols-3 xl:grid-cols-1 gap-2">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={img.id}
                          className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                        >
                          <img
                            src={img.preview}
                            alt={`Upload ${idx + 1}`}
                            className="w-full h-16 xl:h-20 object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                            {img.extractedData.length} người
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document Preview - Main area */}
                  <div className="xl:col-span-3 overflow-hidden flex flex-col">
                    <h3 className="text-sm font-semibold mb-2 text-gray-700 flex-shrink-0">
                      Biên bản kiểm tra cư trú
                    </h3>
                    <div className="flex-1 overflow-hidden">
                      <DocumentPreview data={documentData} accumulatedPersons={accumulatedPersons} />
                    </div>
                  </div>
                </div>

                {/* Export Buttons - Fixed at bottom */}
                <div className="flex-shrink-0">
                  <ExportButtons
                    onExportPDF={handleExportPDF}
                    onPrint={handlePrint}
                    isExporting={isExporting}
                    onContinueUpload={handleContinueUpload}
                    uploadCount={uploadedImages.length}
                  />
                </div>
              </div>
            )}
          </Card>
        </Container>
      </main>

      {/* Hidden document for PDF/Print export */}
      {accumulatedPersons.length > 0 && (
        <div className="hidden print:block">
          <ResidenceReportTemplate data={documentData} accumulatedPersons={accumulatedPersons} />
        </div>
      )}
    </div>
  );
}
