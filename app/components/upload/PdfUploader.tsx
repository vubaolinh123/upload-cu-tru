'use client';

import React, { useCallback, useState, useRef } from 'react';

interface PdfUploaderProps {
    onFileSelect: (file: File) => void;
    isProcessing: boolean;
    error?: string;
}

export default function PdfUploader({ onFileSelect, isProcessing, error }: PdfUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                        <div className="spinner"></div>
                        <p>Đang xử lý PDF...</p>
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
                        <p className="file-hint">Chỉ chấp nhận file PDF, tối đa 5MB</p>
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
            `}</style>
        </div>
    );
}
