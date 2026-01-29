'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Header, Container } from '../components/layout';
import { Card } from '../components/ui';
import { PdfTextData } from '../types/pdfTypes';

// Dynamic imports for code splitting - NO SSR
const PdfUploader = dynamic(
    () => import('../components/upload/PdfUploader'),
    { ssr: false }
);

const PdfDataPreview = dynamic(
    () => import('../components/document/PdfDataPreview'),
    { ssr: false }
);

type PdfStep = 'upload' | 'processing' | 'preview';

export default function PdfPage() {
    const [step, setStep] = useState<PdfStep>('upload');
    const [pdfData, setPdfData] = useState<PdfTextData | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressMessage, setProgressMessage] = useState<string>('');
    const [progressPercent, setProgressPercent] = useState<number>(0);

    const handleFileSelect = useCallback(async (file: File) => {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            setError('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.');
            return;
        }

        setIsProcessing(true);
        setError(undefined);
        setStep('processing');
        setProgressMessage('Bắt đầu xử lý...');
        setProgressPercent(0);

        try {
            // Dynamic import the service only when needed (client-side only)
            const { extractTextFromPdf } = await import('../services/pdfTextExtractService');

            // Process PDF with progress tracking
            const result = await extractTextFromPdf(file, (msg, percent) => {
                setProgressMessage(msg);
                if (percent !== undefined) {
                    setProgressPercent(percent);
                }
            });

            if (!result.success || !result.data) {
                throw new Error(result.error || 'Lỗi xử lý PDF');
            }

            setPdfData(result.data);
            setStep('preview');
        } catch (err) {
            console.error('PDF processing error:', err);
            setError(err instanceof Error ? err.message : 'Lỗi không xác định');
            setStep('upload');
        } finally {
            setIsProcessing(false);
            setProgressMessage('');
            setProgressPercent(0);
        }
    }, []);

    const handleReset = useCallback(() => {
        setPdfData(null);
        setError(undefined);
        setStep('upload');
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <Container>
                <div className="page-content">
                    {/* Page Title */}
                    <div className="page-header">
                        <h1>PDF to Excel Converter</h1>
                        <p>Trích xuất văn bản từ file PDF và xuất ra Excel</p>
                    </div>

                    {/* Main Content */}
                    <Card>
                        {step === 'upload' ? (
                            <div className="upload-section">
                                <PdfUploader
                                    onFileSelect={handleFileSelect}
                                    isProcessing={isProcessing}
                                    error={error}
                                />
                            </div>
                        ) : null}

                        {step === 'processing' ? (
                            <div className="processing-section">
                                <div className="processing-content">
                                    <div className="spinner"></div>
                                    <p className="progress-message">{progressMessage || 'Đang xử lý...'}</p>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${progressPercent}%` }}
                                        ></div>
                                    </div>
                                    <p className="progress-percent">{progressPercent}%</p>
                                </div>
                            </div>
                        ) : null}

                        {step === 'preview' && pdfData ? (
                            <PdfDataPreview
                                data={pdfData}
                                onReset={handleReset}
                            />
                        ) : null}
                    </Card>

                    {/* Instructions */}
                    {step === 'upload' && (
                        <div className="instructions">
                            <h3>Hướng dẫn sử dụng</h3>
                            <ol>
                                <li>Upload file PDF bằng cách kéo thả hoặc click để chọn file</li>
                                <li>Hệ thống sẽ tự động trích xuất văn bản từ PDF</li>
                                <li>Xem trước và chỉnh sửa nội dung nếu cần</li>
                                <li>Bấm &quot;Xuất Excel&quot; để tải file Excel về máy</li>
                            </ol>
                        </div>
                    )}
                </div>
            </Container>

            <style jsx>{`
                .page-content {
                    padding: 40px 0;
                }

                .page-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .page-header h1 {
                    font-size: 32px;
                    font-weight: 700;
                    color: #1e40af;
                    margin: 0 0 8px;
                }

                .page-header p {
                    color: #6b7280;
                    font-size: 16px;
                    margin: 0;
                }

                .upload-section {
                    padding: 20px;
                }

                .processing-section {
                    padding: 60px 20px;
                }

                .processing-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }

                .spinner {
                    width: 48px;
                    height: 48px;
                    border: 4px solid #e5e7eb;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                .progress-message {
                    font-size: 16px;
                    color: #374151;
                    font-weight: 500;
                    margin: 0;
                }

                .progress-bar {
                    width: 100%;
                    max-width: 400px;
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #2563eb, #3b82f6);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                .progress-percent {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0;
                }

                .instructions {
                    margin-top: 32px;
                    padding: 24px;
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }

                .instructions h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0 0 16px;
                }

                .instructions ol {
                    margin: 0;
                    padding-left: 24px;
                    color: #4b5563;
                    line-height: 1.8;
                }

                .instructions li {
                    margin-bottom: 8px;
                }
            `}</style>
        </div>
    );
}
