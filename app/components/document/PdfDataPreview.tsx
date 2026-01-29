'use client';

import React, { useState } from 'react';
import { PdfTextData } from '../../types/pdfTypes';
import { exportPdfToExcel } from '../../services/pdfToExcelExportService';

interface PdfDataPreviewProps {
    data: PdfTextData;
    onReset: () => void;
}

export default function PdfDataPreview({ data, onReset }: PdfDataPreviewProps) {
    const [editedPages, setEditedPages] = useState(data.pages);
    const [isExporting, setIsExporting] = useState(false);
    const [expandedPage, setExpandedPage] = useState<number | null>(null);

    const handleTextChange = (pageIndex: number, newText: string) => {
        const updated = [...editedPages];
        updated[pageIndex] = { ...updated[pageIndex], text: newText };
        setEditedPages(updated);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const exportData: PdfTextData = {
                ...data,
                pages: editedPages,
            };
            await exportPdfToExcel(exportData);
        } catch (error) {
            console.error('Export error:', error);
            alert('Lỗi khi xuất Excel. Vui lòng thử lại.');
        } finally {
            setIsExporting(false);
        }
    };

    const toggleExpand = (pageNumber: number) => {
        setExpandedPage(expandedPage === pageNumber ? null : pageNumber);
    };

    return (
        <div className="pdf-preview">
            {/* Header */}
            <div className="preview-header">
                <div className="file-info">
                    <h3>{data.fileName}</h3>
                    <span className="page-count">{data.totalPages} trang</span>
                </div>
                <div className="actions">
                    <button className="btn-reset" onClick={onReset}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                            <path d="M21 3v5h-5"></path>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                            <path d="M8 16H3v5"></path>
                        </svg>
                        Upload mới
                    </button>
                    <button
                        className="btn-export"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <>
                                <span className="spinner"></span>
                                Đang xuất...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Xuất Excel
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Pages list */}
            <div className="pages-list">
                {editedPages.map((page, index) => (
                    <div key={page.pageNumber} className="page-item">
                        <div
                            className="page-header"
                            onClick={() => toggleExpand(page.pageNumber)}
                        >
                            <div className="page-title">
                                <span className="page-number">Trang {page.pageNumber}</span>
                                <span className="char-count">
                                    {page.text.length} ký tự
                                </span>
                            </div>
                            <svg
                                className={`expand-icon ${expandedPage === page.pageNumber ? 'expanded' : ''}`}
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>

                        {expandedPage === page.pageNumber && (
                            <div className="page-content">
                                <textarea
                                    value={page.text}
                                    onChange={(e) => handleTextChange(index, e.target.value)}
                                    placeholder="Không có nội dung"
                                    rows={10}
                                />
                            </div>
                        )}

                        {expandedPage !== page.pageNumber && (
                            <div className="page-preview">
                                {page.text.slice(0, 200)}
                                {page.text.length > 200 && '...'}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style jsx>{`
                .pdf-preview {
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                    border-radius: 12px 12px 0 0;
                    color: white;
                }

                .file-info h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }

                .page-count {
                    font-size: 14px;
                    opacity: 0.9;
                }

                .actions {
                    display: flex;
                    gap: 12px;
                }

                .btn-reset, .btn-export {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }

                .btn-reset {
                    background: rgba(255, 255, 255, 0.15);
                    color: white;
                }

                .btn-reset:hover {
                    background: rgba(255, 255, 255, 0.25);
                }

                .btn-export {
                    background: #10b981;
                    color: white;
                }

                .btn-export:hover:not(:disabled) {
                    background: #059669;
                }

                .btn-export:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .pages-list {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-top: none;
                    border-radius: 0 0 12px 12px;
                    max-height: 500px;
                    overflow-y: auto;
                }

                .page-item {
                    border-bottom: 1px solid #e5e7eb;
                }

                .page-item:last-child {
                    border-bottom: none;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .page-header:hover {
                    background: #f9fafb;
                }

                .page-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .page-number {
                    font-weight: 600;
                    color: #1f2937;
                }

                .char-count {
                    font-size: 12px;
                    color: #6b7280;
                    background: #f3f4f6;
                    padding: 2px 8px;
                    border-radius: 12px;
                }

                .expand-icon {
                    color: #6b7280;
                    transition: transform 0.2s;
                }

                .expand-icon.expanded {
                    transform: rotate(180deg);
                }

                .page-preview {
                    padding: 0 20px 16px;
                    color: #6b7280;
                    font-size: 14px;
                    line-height: 1.6;
                }

                .page-content {
                    padding: 0 20px 16px;
                }

                .page-content textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    line-height: 1.6;
                    resize: vertical;
                    font-family: inherit;
                }

                .page-content textarea:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }
            `}</style>
        </div>
    );
}
