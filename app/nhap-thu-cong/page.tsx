'use client';

import React, { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Header, Container } from '../components/layout';
import { Card, LoadingSpinner } from '../components/ui';
import { Household } from '../types/household';
import { printDocument } from '../services/pdfExportService';
import { exportHouseholdToWord } from '../services/wordExportService';

// Dynamic imports
const ManualEntryForm = dynamic(
    () => import('../components/manual-entry/ManualEntryForm'),
    { loading: () => <LoadingSpinner text="Đang tải..." /> }
);

const ResidenceReportTemplate = dynamic(
    () => import('../components/document/ResidenceReportTemplate'),
    { loading: () => <LoadingSpinner text="Đang tải..." /> }
);

interface HeaderInfo {
    gioLap: string;
    ngayLap: string;
    diaChi: string;
}

type PageStep = 'input' | 'preview';

export default function ManualEntryPage() {
    const [step, setStep] = useState<PageStep>('input');
    const [household, setHousehold] = useState<Household | null>(null);
    const [headerInfo, setHeaderInfo] = useState<HeaderInfo>({
        gioLap: '',
        ngayLap: '',
        diaChi: '',
    });
    const [isExporting, setIsExporting] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handleDataChange = useCallback((newHousehold: Household | null, newHeaderInfo: HeaderInfo) => {
        setHousehold(newHousehold);
        setHeaderInfo(newHeaderInfo);
    }, []);

    const handlePreview = () => {
        if (!household) {
            alert('Vui lòng nhập thông tin chủ hộ trước khi xem trước');
            return;
        }
        setStep('preview');
    };

    const handleBackToEdit = () => {
        setStep('input');
    };

    const handlePrint = () => {
        printDocument('manual-document-preview');
    };

    const handleExportWord = async () => {
        if (!household) return;
        setIsExporting(true);
        try {
            await exportHouseholdToWord(household);
        } catch (error) {
            console.error('Export Word error:', error);
            alert('Lỗi khi xuất Word. Vui lòng thử lại.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header title="Nhập Thủ Công" />

            <main className="py-4">
                <Container>
                    {/* Step indicator */}
                    <div className="step-indicator">
                        <div className={`step ${step === 'input' ? 'active' : ''}`}>
                            <span className="step-number">1</span>
                            <span className="step-label">Nhập liệu</span>
                        </div>
                        <div className="step-line" />
                        <div className={`step ${step === 'preview' ? 'active' : ''}`}>
                            <span className="step-number">2</span>
                            <span className="step-label">Xem & Xuất</span>
                        </div>
                    </div>

                    <Card variant="elevated" padding="md">
                        {step === 'input' && (
                            <div className="input-step">
                                <ManualEntryForm onDataChange={handleDataChange} />

                                <div className="action-bar">
                                    <button
                                        className="btn-preview"
                                        onClick={handlePreview}
                                        disabled={!household}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        Xem trước biên bản
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'preview' && household && (
                            <div className="preview-step">
                                {/* Action buttons */}
                                <div className="preview-actions">
                                    <button className="btn-back" onClick={handleBackToEdit}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 12H5M12 19l-7-7 7-7" />
                                        </svg>
                                        Quay lại sửa
                                    </button>
                                    <div className="export-buttons">
                                        <button className="btn-print" onClick={handlePrint}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="6 9 6 2 18 2 18 9" />
                                                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                                                <rect x="6" y="14" width="12" height="8" />
                                            </svg>
                                            In biên bản
                                        </button>
                                        <button
                                            className="btn-word"
                                            onClick={handleExportWord}
                                            disabled={isExporting}
                                        >
                                            {isExporting ? (
                                                <>
                                                    <span className="spinner" />
                                                    Đang xuất...
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                        <line x1="16" y1="13" x2="8" y2="13" />
                                                        <line x1="16" y1="17" x2="8" y2="17" />
                                                    </svg>
                                                    Xuất Word
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Document Preview */}
                                <div className="document-container" ref={printRef}>
                                    <div id="manual-document-preview">
                                        <ResidenceReportTemplate
                                            household={household}
                                            headerInfo={{
                                                gioLap: headerInfo.gioLap,
                                                ngayLap: headerInfo.ngayLap,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </Container>
            </main>

            <style jsx>{`
                .step-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .step {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
                    opacity: 0.6;
                    transition: all 0.2s;
                }

                .step.active {
                    opacity: 1;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                }

                .step-number {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 50%;
                    font-size: 12px;
                    font-weight: 600;
                }

                .step.active .step-number {
                    background: rgba(255, 255, 255, 0.2);
                }

                .step-label {
                    font-size: 13px;
                    font-weight: 500;
                }

                .step-line {
                    width: 40px;
                    height: 2px;
                    background: #d1d5db;
                }

                .input-step {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .action-bar {
                    display: flex;
                    justify-content: center;
                    padding-top: 10px;
                }

                .btn-preview {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 14px 28px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .btn-preview:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
                }

                .btn-preview:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .preview-step {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .preview-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .export-buttons {
                    display: flex;
                    gap: 10px;
                }

                .btn-back {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 18px;
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-back:hover {
                    background: #e5e7eb;
                }

                .btn-print {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 18px;
                    background: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-print:hover {
                    background: #4f46e5;
                }

                .btn-word {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 18px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-word:hover:not(:disabled) {
                    background: #1d4ed8;
                }

                .btn-word:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .document-container {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                @media (max-width: 640px) {
                    .preview-actions {
                        flex-direction: column;
                    }

                    .export-buttons {
                        width: 100%;
                    }

                    .export-buttons button {
                        flex: 1;
                    }
                }
            `}</style>
        </div>
    );
}
