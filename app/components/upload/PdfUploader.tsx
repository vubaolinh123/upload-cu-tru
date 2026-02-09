'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';

interface PageResult {
    pageNum: number;
    status: 'pending' | 'processing' | 'success' | 'error';
    recordCount: number;
    errorMessage?: string;
    processingTimeMs?: number;
}

interface ProgressState {
    message: string;
    percent: number;
    currentPage: number;
    totalPages: number;
    recordsFound: number;
}

interface PdfUploaderProps {
    onFileSelect: (file: File) => void;
    isProcessing: boolean;
    error?: string;
    progress?: ProgressState;
    pageResults?: PageResult[];
    onStopProcessing?: () => void;
}

export default function PdfUploader({
    onFileSelect,
    isProcessing,
    error,
    progress,
    pageResults,
    onStopProcessing
}: PdfUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Live elapsed timer
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const startTimeRef = useRef<number | null>(null);

    // Start/reset timer when processing starts/stops
    useEffect(() => {
        if (isProcessing) {
            // Start timer
            startTimeRef.current = Date.now();
            setElapsedSeconds(0);

            const interval = setInterval(() => {
                if (startTimeRef.current) {
                    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                    setElapsedSeconds(elapsed);
                }
            }, 1000);

            return () => clearInterval(interval);
        } else {
            // Reset when not processing
            startTimeRef.current = null;
        }
    }, [isProcessing]);

    // Format elapsed time for display
    const formatElapsedTime = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };

    // Helper function to format total processing time
    const formatTotalTime = (results: PageResult[]): string => {
        const completedPages = results.filter(r => r.status === 'success' || r.status === 'error');
        const totalMs = completedPages.reduce((sum, r) => sum + (r.processingTimeMs || 0), 0);

        if (totalMs === 0) return '0s';

        const totalSeconds = Math.round(totalMs / 1000);
        if (totalSeconds < 60) return `${totalSeconds}s`;

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    };

    // Calculate estimated remaining time
    const getEstimatedRemainingTime = (): string | null => {
        if (!pageResults || pageResults.length === 0) return null;

        const completedPages = pageResults.filter(r => r.status === 'success' || r.status === 'error');
        const pendingPages = pageResults.filter(r => r.status === 'pending' || r.status === 'processing');

        if (completedPages.length === 0 || pendingPages.length === 0) return null;

        const avgTimeMs = completedPages.reduce((sum, r) => sum + (r.processingTimeMs || 0), 0) / completedPages.length;
        const remainingMs = avgTimeMs * pendingPages.length;
        const remainingSeconds = Math.round(remainingMs / 1000);

        if (remainingSeconds < 60) return `~${remainingSeconds}s còn lại`;

        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        return `~${minutes}m ${seconds}s còn lại`;
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.name.toLowerCase().endsWith('.pdf')) {
                setSelectedFileName(file.name);
                onFileSelect(file);
            } else {
                alert('Vui lòng chọn file PDF');
            }
        }
    }, [onFileSelect]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setSelectedFileName(file.name);
            onFileSelect(file);
        }
    }, [onFileSelect]);

    const handleClickUpload = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <div className="pdf-uploader">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInput}
                style={{ display: 'none' }}
            />

            <div
                className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={!isProcessing ? handleClickUpload : undefined}
            >
                {isProcessing ? (
                    <div className="processing-state">
                        {/* Live Timer Badge */}
                        <div className="timer-badge">
                            <span className="timer-icon">⏱️</span>
                            <span className="timer-value">{formatElapsedTime(elapsedSeconds)}</span>
                        </div>

                        {/* Progress Header */}
                        <div className="progress-header">
                            <div className="spinner"></div>
                            <div className="progress-info">
                                <p className="progress-title">
                                    {progress?.message || 'Đang xử lý PDF...'}
                                </p>
                                <p className="progress-stats">
                                    Tổng cộng: <strong>{progress?.recordsFound || 0}</strong> bản ghi
                                    {getEstimatedRemainingTime() && (
                                        <span className="remaining-time">
                                            {' • '}{getEstimatedRemainingTime()}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {progress && progress.totalPages > 0 && (
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${progress.percent}%` }}
                                ></div>
                                <span className="progress-percent">{progress.percent}%</span>
                            </div>
                        )}

                        {/* Page Results Log */}
                        {pageResults && pageResults.length > 0 && (
                            <div className="page-results-log">
                                <div className="log-header">
                                    <span>📋 Chi tiết từng trang:</span>
                                    <span className="total-time">
                                        ⏱️ Tổng: {formatTotalTime(pageResults)}
                                    </span>
                                </div>
                                <div className="log-scroll">
                                    {pageResults.map((result) => (
                                        <div
                                            key={result.pageNum}
                                            className={`log-item ${result.status}`}
                                        >
                                            <span className="log-page">Trang {result.pageNum}</span>
                                            <span className="log-status">
                                                {result.status === 'pending' && '⏳ Đang chờ'}
                                                {result.status === 'processing' && '🔄 Đang xử lý...'}
                                                {result.status === 'success' && (
                                                    <>
                                                        ✅ {result.recordCount} bản ghi
                                                        {result.processingTimeMs && (
                                                            <span className="log-time">
                                                                ({(result.processingTimeMs / 1000).toFixed(1)}s)
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                                {result.status === 'error' && (
                                                    <>
                                                        ❌ Lỗi
                                                        {result.processingTimeMs && (
                                                            <span className="log-time">
                                                                ({(result.processingTimeMs / 1000).toFixed(1)}s)
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stop Button */}
                        {onStopProcessing && (
                            <button
                                className="stop-btn"
                                onClick={onStopProcessing}
                                type="button"
                            >
                                ⏹️ Dừng xử lý (giữ kết quả đã có)
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="upload-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="12" y1="18" x2="12" y2="12"></line>
                                <line x1="9" y1="15" x2="15" y2="15"></line>
                            </svg>
                        </div>
                        <p className="upload-text">
                            Kéo thả file PDF vào đây hoặc <span className="click-text">click để chọn file</span>
                        </p>
                        <p className="file-hint">Chỉ chấp nhận file PDF, tối đa 7MB</p>
                        {selectedFileName && (
                            <p className="selected-file">Đã chọn: {selectedFileName}</p>
                        )}
                    </>
                )}
            </div>

            {error && (
                <div className="error-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <style jsx>{`
                .pdf-uploader {
                    width: 100%;
                }

                .upload-zone {
                    border: 2px dashed #d1d5db;
                    border-radius: 12px;
                    padding: 40px 20px;
                    text-align: center;
                    transition: all 0.3s ease;
                    background: #f9fafb;
                    cursor: pointer;
                }

                .upload-zone:hover {
                    border-color: #2563eb;
                    background: #eff6ff;
                }

                .upload-zone.drag-over {
                    border-color: #2563eb;
                    background: #dbeafe;
                    transform: scale(1.02);
                }

                .upload-zone.processing {
                    background: #f0f9ff;
                    cursor: default;
                }

                .upload-icon {
                    color: #6b7280;
                    margin-bottom: 16px;
                }

                .drag-over .upload-icon {
                    color: #2563eb;
                }

                .upload-text {
                    color: #374151;
                    font-size: 16px;
                    margin-bottom: 8px;
                }

                .click-text {
                    color: #2563eb;
                    font-weight: 500;
                }

                .file-hint {
                    color: #9ca3af;
                    font-size: 14px;
                }

                .selected-file {
                    color: #059669;
                    font-size: 14px;
                    font-weight: 500;
                    margin-top: 12px;
                }

                .processing-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }

                .timer-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    border-radius: 50px;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                    animation: pulse-glow 2s infinite;
                }

                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
                    50% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.6); }
                }

                .timer-icon {
                    font-size: 20px;
                }

                .timer-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: white;
                    font-variant-numeric: tabular-nums;
                    min-width: 60px;
                    text-align: center;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #e5e7eb;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                .error-message {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 12px;
                    padding: 12px;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    color: #dc2626;
                    font-size: 14px;
                }

                /* Progress Header */
                .progress-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .progress-info {
                    text-align: left;
                }

                .progress-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                    margin: 0 0 4px;
                }

                .progress-stats {
                    font-size: 13px;
                    color: #6b7280;
                    margin: 0;
                }

                /* Progress Bar */
                .progress-bar-container {
                    width: 100%;
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    position: relative;
                    overflow: hidden;
                }

                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #2563eb, #3b82f6);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                .progress-percent {
                    position: absolute;
                    right: 8px;
                    top: -20px;
                    font-size: 12px;
                    font-weight: 500;
                    color: #2563eb;
                }

                /* Page Results Log */
                .page-results-log {
                    width: 100%;
                    max-height: 200px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                    background: white;
                }

                .log-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 13px;
                    font-weight: 500;
                    color: #374151;
                }

                .total-time {
                    font-size: 12px;
                    color: #2563eb;
                    font-weight: 600;
                }

                .remaining-time {
                    color: #f59e0b;
                    font-weight: 500;
                }

                .log-time {
                    margin-left: 6px;
                    color: #9ca3af;
                    font-size: 12px;
                    font-weight: 400;
                }

                .log-scroll {
                    max-height: 150px;
                    overflow-y: auto;
                    padding: 4px 0;
                }

                .log-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 12px;
                    font-size: 13px;
                    border-bottom: 1px solid #f3f4f6;
                }

                .log-item:last-child {
                    border-bottom: none;
                }

                .log-item.success {
                    background: #f0fdf4;
                }

                .log-item.error {
                    background: #fef2f2;
                }

                .log-item.processing {
                    background: #eff6ff;
                }

                .log-page {
                    font-weight: 500;
                    color: #374151;
                }

                .log-status {
                    color: #6b7280;
                }

                .log-item.success .log-status {
                    color: #16a34a;
                }

                .log-item.error .log-status {
                    color: #dc2626;
                }

                /* Stop Button */
                .stop-btn {
                    padding: 10px 20px;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    color: #dc2626;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .stop-btn:hover {
                    background: #fee2e2;
                    border-color: #fca5a5;
                }
            `}</style>
        </div>
    );
}
