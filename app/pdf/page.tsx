'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Header, Container } from '../components/layout';
import { Card, LoadingSpinner } from '../components/ui';
import { CT3ARecord, PdfExtractionResult } from '../types/pdfTypes';
import { saveCT3AData } from '../services/ct3aDataSaveService';
import { STORAGE_KEYS } from '../lib/storageKeys';

// Dynamic imports for code splitting - NO SSR
const PdfUploader = dynamic(
    () => import('../components/upload/PdfUploader'),
    { ssr: false }
);

const CT3ADataPreview = dynamic(
    () => import('../components/document/PdfDataPreview'),
    { ssr: false }
);

const CT3ADataReviewTable = dynamic(
    () => import('../components/editing/CT3ADataReviewTable'),
    { ssr: false, loading: () => <LoadingSpinner text="Đang tải..." /> }
);

type PdfStep = 'upload' | 'processing' | 'editing' | 'preview';

interface ProgressState {
    message: string;
    percent: number;
    currentPage: number;
    totalPages: number;
    recordsFound: number;
}

interface PersistedPdfData {
    records: CT3ARecord[];
    fileName: string;
    totalPages: number;
    timestamp: number;
}

export default function PdfPage() {
    const [step, setStep] = useState<PdfStep>('upload');
    const [records, setRecords] = useState<CT3ARecord[]>([]);
    const [pendingRecords, setPendingRecords] = useState<CT3ARecord[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [totalPages, setTotalPages] = useState<number>(0);
    const [error, setError] = useState<string | undefined>();
    const [successMessage, setSuccessMessage] = useState<string | undefined>();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [progress, setProgress] = useState<ProgressState>({
        message: '',
        percent: 0,
        currentPage: 0,
        totalPages: 0,
        recordsFound: 0,
    });

    // Load persisted data on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.PDF_UPLOAD_DATA);
            if (stored) {
                const data: PersistedPdfData = JSON.parse(stored);
                if (data.records && data.records.length > 0) {
                    setRecords(data.records);
                    setFileName(data.fileName);
                    setTotalPages(data.totalPages);
                    setStep('preview');
                }
            }
        } catch (err) {
            console.warn('[PDF Page] Failed to load persisted data:', err);
        }
        setIsHydrated(true);
    }, []);

    // Persist data when records change
    useEffect(() => {
        if (!isHydrated || records.length === 0) return;

        try {
            const data: PersistedPdfData = {
                records,
                fileName,
                totalPages,
                timestamp: Date.now(),
            };
            localStorage.setItem(STORAGE_KEYS.PDF_UPLOAD_DATA, JSON.stringify(data));
        } catch (err) {
            console.warn('[PDF Page] Failed to persist data:', err);
        }
    }, [records, fileName, totalPages, isHydrated]);

    const handleFileSelect = useCallback(async (file: File) => {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
            return;
        }

        setIsProcessing(true);
        setError(undefined);
        setSuccessMessage(undefined);
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
                                    // Store pending records for editing
                                    setPendingRecords(result.allRecords);
                                    setFileName(result.fileName);
                                    setTotalPages(result.totalPages);
                                    // Go to editing step instead of preview
                                    setStep('editing');
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

    // Handler for confirming edited data
    const handleConfirmEditedData = useCallback((confirmedRecords: CT3ARecord[]) => {
        setRecords(confirmedRecords);
        setPendingRecords([]);
        setStep('preview');
    }, []);

    // Handler for canceling edit
    const handleCancelEdit = useCallback(() => {
        setPendingRecords([]);
        setStep('upload');
    }, []);

    // Handler for going back to edit from preview
    const handleBackToEdit = useCallback(() => {
        // Move records to pending for editing
        setPendingRecords(records);
        setStep('editing');
    }, [records]);

    // Handler for saving data
    const handleSaveData = useCallback(async () => {
        if (isSaving || records.length === 0) return;

        setIsSaving(true);
        setError(undefined);
        setSuccessMessage(undefined);

        try {
            const result = await saveCT3AData(records, fileName);
            if (result.success) {
                setSuccessMessage(result.message);
            } else {
                setError(result.error || result.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi khi lưu dữ liệu');
        } finally {
            setIsSaving(false);
        }
    }, [isSaving, records, fileName]);

    const handleReset = useCallback(() => {
        // Clear persisted data
        try {
            localStorage.removeItem(STORAGE_KEYS.PDF_UPLOAD_DATA);
        } catch (err) {
            console.warn('[PDF Page] Failed to clear persisted data:', err);
        }

        setRecords([]);
        setPendingRecords([]);
        setFileName('');
        setTotalPages(0);
        setError(undefined);
        setSuccessMessage(undefined);
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

    // Get step status for indicators
    const getStepStatus = (stepName: string) => {
        const stepOrder = ['upload', 'processing', 'editing', 'preview'];
        const currentIndex = stepOrder.indexOf(step);
        const stepIndex = stepOrder.indexOf(stepName);

        if (step === stepName) return 'current';
        if (stepIndex < currentIndex) return 'completed';
        return 'pending';
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

                    {/* Step Indicators */}
                    <div className="step-indicators">
                        {[
                            { step: 'upload', label: 'Upload', icon: '📤' },
                            { step: 'processing', label: 'Xử lý', icon: '⚙️' },
                            { step: 'editing', label: 'Chỉnh sửa', icon: '✏️' },
                            { step: 'preview', label: 'Xuất dữ liệu', icon: '📊' },
                        ].map(({ step: stepName, label, icon }, idx) => (
                            <React.Fragment key={stepName}>
                                <div
                                    className={`step-item ${getStepStatus(stepName)}`}
                                >
                                    <span>{icon}</span>
                                    <span className="step-label">{label}</span>
                                </div>
                                {idx < 3 && <div className={`step-connector ${getStepStatus(stepName) === 'completed' ? 'completed' : ''}`} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="message-box error">
                            <span>❌ {error}</span>
                            <button onClick={() => setError(undefined)}>✕</button>
                        </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div className="message-box success">
                            <span>✅ {successMessage}</span>
                            <button onClick={() => setSuccessMessage(undefined)}>✕</button>
                        </div>
                    )}

                    {/* Main Content */}
                    <Card className={(step === 'editing' || step === 'preview') ? 'wide-card' : ''}>
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

                        {step === 'editing' && pendingRecords.length > 0 ? (
                            <div className="editing-section">
                                <CT3ADataReviewTable
                                    records={pendingRecords}
                                    onConfirmAll={handleConfirmEditedData}
                                    onCancel={handleCancelEdit}
                                />
                            </div>
                        ) : null}

                        {step === 'preview' ? (
                            <CT3ADataPreview
                                records={records}
                                fileName={fileName}
                                totalPages={totalPages}
                                onReset={handleReset}
                                onBackToEdit={handleBackToEdit}
                                onSaveData={handleSaveData}
                                isSaving={isSaving}
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
                                <li><strong>Kiểm tra và chỉnh sửa</strong> dữ liệu nếu cần</li>
                                <li>Bấm &quot;Lưu Dữ Liệu&quot; hoặc &quot;Xuất Excel&quot; để hoàn tất</li>
                            </ol>
                            <div className="note">
                                <strong>💾 Lưu ý:</strong> Dữ liệu sẽ được tự động lưu lại khi bạn chuyển trang.
                                <br />
                                <strong>⏱️ Thời gian xử lý:</strong> Khoảng 3-5 phút cho file có nhiều trang.
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
                    margin-bottom: 24px;
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

                .step-indicators {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 24px;
                }

                .step-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.3s;
                }

                .step-item.current {
                    background: #2563eb;
                    color: white;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                    transform: scale(1.05);
                }

                .step-item.completed {
                    background: #dcfce7;
                    color: #16a34a;
                }

                .step-item.pending {
                    background: #f3f4f6;
                    color: #9ca3af;
                }

                .step-label {
                    display: none;
                }

                @media (min-width: 640px) {
                    .step-label {
                        display: inline;
                    }
                }

                .step-connector {
                    width: 24px;
                    height: 2px;
                    background: #e5e7eb;
                    transition: background 0.3s;
                }

                .step-connector.completed {
                    background: #86efac;
                }

                .message-box {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                }

                .message-box.error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                }

                .message-box.success {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    color: #16a34a;
                }

                .message-box button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: opacity 0.2s;
                }

                .message-box button:hover {
                    opacity: 1;
                }

                .upload-section {
                    padding: 20px;
                }

                :global(.wide-card) {
                    width: 90vw !important;
                    max-width: 90vw !important;
                    position: relative !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                }

                .editing-section {
                    padding: 20px;
                    min-height: 500px;
                    width: 100%;
                    overflow-x: auto;
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
            `}</style>
        </div>
    );
}
