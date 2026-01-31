'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Header, Container } from '../components/layout';
import { Card } from '../components/ui';
import { CT3ARecord, PdfExtractionResult } from '../types/pdfTypes';

// Dynamic imports for code splitting - NO SSR
const PdfUploader = dynamic(
    () => import('../components/upload/PdfUploader'),
    { ssr: false }
);

const CT3ADataPreview = dynamic(
    () => import('../components/document/PdfDataPreview'),
    { ssr: false }
);

type PdfStep = 'upload' | 'processing' | 'preview';

interface ProgressState {
    message: string;
    percent: number;
    currentPage: number;
    totalPages: number;
    recordsFound: number;
}

export default function PdfPage() {
    const [step, setStep] = useState<PdfStep>('upload');
    const [records, setRecords] = useState<CT3ARecord[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [totalPages, setTotalPages] = useState<number>(0);
    const [error, setError] = useState<string | undefined>();
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<ProgressState>({
        message: '',
        percent: 0,
        currentPage: 0,
        totalPages: 0,
        recordsFound: 0,
    });

    const handleFileSelect = useCallback(async (file: File) => {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
            return;
        }

        setIsProcessing(true);
        setError(undefined);
        setStep('processing');
        setProgress({
            message: 'Đang upload file PDF...',
            percent: 2,
            currentPage: 0,
            totalPages: 0,
            recordsFound: 0,
        });

        try {
            const formData = new FormData();
            formData.append('pdf', file);

            // Use fetch with streaming
            const response = await fetch('/api/pdf-ocr', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok || !response.body) {
                throw new Error('Failed to process PDF');
            }

            // Read SSE stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Process complete SSE messages
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || ''; // Keep incomplete message in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            switch (data.type) {
                                case 'progress':
                                    setProgress(prev => ({
                                        ...prev,
                                        message: data.message,
                                        percent: data.progress,
                                        currentPage: data.currentPage || prev.currentPage,
                                        totalPages: data.totalPages || prev.totalPages,
                                    }));
                                    break;

                                case 'page_complete':
                                    setProgress(prev => ({
                                        ...prev,
                                        recordsFound: data.totalRecordsSoFar,
                                    }));
                                    break;

                                case 'complete':
                                    const result: PdfExtractionResult = data;
                                    setRecords(result.allRecords);
                                    setFileName(result.fileName);
                                    setTotalPages(result.totalPages);
                                    setStep('preview');
                                    break;

                                case 'error':
                                    throw new Error(data.error);
                            }
                        } catch (parseError) {
                            console.error('Failed to parse SSE:', parseError);
                        }
                    }
                }
            }

        } catch (err) {
            console.error('PDF processing error:', err);
            setError(err instanceof Error ? err.message : 'Lỗi không xác định');
            setStep('upload');
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const handleReset = useCallback(() => {
        setRecords([]);
        setFileName('');
        setTotalPages(0);
        setError(undefined);
        setStep('upload');
        setProgress({
            message: '',
            percent: 0,
            currentPage: 0,
            totalPages: 0,
            recordsFound: 0,
        });
    }, []);

    // Estimate remaining time (1 minute per page)
    const getEstimatedTime = () => {
        if (progress.totalPages === 0) return '';
        const remaining = progress.totalPages - progress.currentPage;
        const minutes = remaining; // 1 minute per page
        if (minutes <= 0) return '';
        if (minutes === 1) return '~1 phút';
        return `~${minutes} phút`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <Container>
                <div className="page-content">
                    {/* Page Title */}
                    <div className="page-header">
                        <h1>PDF to Excel Converter</h1>
                        <p>Trích xuất bảng dữ liệu CT3A từ file PDF và xuất ra Excel</p>
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
                                    <div className="spinner-container">
                                        <div className="spinner"></div>
                                        {progress.totalPages > 0 && (
                                            <div className="page-counter">
                                                {progress.currentPage}/{progress.totalPages}
                                            </div>
                                        )}
                                    </div>

                                    <p className="progress-message">{progress.message || 'Đang xử lý...'}</p>

                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${progress.percent}%` }}
                                        ></div>
                                    </div>

                                    <div className="progress-stats">
                                        <span className="progress-percent">{progress.percent}%</span>
                                        {progress.recordsFound > 0 && (
                                            <span className="records-found">
                                                Đã tìm thấy: <strong>{progress.recordsFound}</strong> bản ghi
                                            </span>
                                        )}
                                    </div>

                                    {progress.totalPages > 0 && progress.currentPage < progress.totalPages && (
                                        <p className="time-estimate">
                                            Thời gian còn lại: {getEstimatedTime()}
                                        </p>
                                    )}

                                    <div className="warning-note">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                        </svg>
                                        <span>
                                            Quá trình có thể mất <strong>3-5 phút</strong> tùy thuộc vào số trang PDF.
                                            <br />Vui lòng không đóng trang này.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {step === 'preview' ? (
                            <CT3ADataPreview
                                records={records}
                                fileName={fileName}
                                totalPages={totalPages}
                                onReset={handleReset}
                            />
                        ) : null}
                    </Card>

                    {/* Instructions */}
                    {step === 'upload' && (
                        <div className="instructions">
                            <h3>Hướng dẫn sử dụng</h3>
                            <ol>
                                <li>Upload file PDF chứa bảng dữ liệu CT3A (tối đa 5MB)</li>
                                <li>Hệ thống sẽ tự động chuyển đổi từng trang PDF thành ảnh</li>
                                <li>AI sẽ đọc và trích xuất dữ liệu từ các bảng</li>
                                <li>Xem trước dữ liệu và bấm &quot;Xuất Excel&quot; để tải file</li>
                            </ol>
                            <div className="note">
                                <strong>⏱️ Thời gian xử lý:</strong> Khoảng 3-5 phút cho file có nhiều trang.
                                <br />
                                <strong>📄 Giới hạn:</strong> File PDF tối đa 5MB.
                            </div>
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
                    max-width: 500px;
                    margin: 0 auto;
                }

                .spinner-container {
                    position: relative;
                    width: 80px;
                    height: 80px;
                }

                .spinner {
                    width: 80px;
                    height: 80px;
                    border: 4px solid #e5e7eb;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .page-counter {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 14px;
                    font-weight: 600;
                    color: #2563eb;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                .progress-message {
                    font-size: 18px;
                    color: #1f2937;
                    font-weight: 600;
                    margin: 0;
                    text-align: center;
                }

                .progress-bar {
                    width: 100%;
                    height: 12px;
                    background: #e5e7eb;
                    border-radius: 6px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #2563eb, #3b82f6);
                    border-radius: 6px;
                    transition: width 0.3s ease;
                }

                .progress-stats {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    font-size: 14px;
                }

                .progress-percent {
                    color: #2563eb;
                    font-weight: 600;
                }

                .records-found {
                    color: #059669;
                }

                .time-estimate {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0;
                }

                .warning-note {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 16px;
                    background: #fef3c7;
                    border-radius: 8px;
                    color: #92400e;
                    font-size: 13px;
                    line-height: 1.5;
                    margin-top: 8px;
                }

                .warning-note svg {
                    flex-shrink: 0;
                    margin-top: 2px;
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
                    margin: 0 0 16px;
                    padding-left: 24px;
                    color: #4b5563;
                    line-height: 1.8;
                }

                .instructions li {
                    margin-bottom: 8px;
                }

                .note {
                    padding: 12px 16px;
                    background: #eff6ff;
                    border-radius: 8px;
                    font-size: 14px;
                    color: #1e40af;
                    line-height: 1.6;
                }

                .back-link {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    text-align: center;
                }

                .back-link p {
                    color: #6b7280;
                    font-size: 14px;
                    margin: 0 0 12px;
                }

                .back-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    font-weight: 500;
                    border-radius: 10px;
                    text-decoration: none;
                    transition: all 0.2s;
                    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
                }

                .back-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
                }
            `}</style>
        </div>
    );
}
