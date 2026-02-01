'use client';

import React, { useState } from 'react';
import { CT3ARecord } from '../../types/pdfTypes';
import { exportCT3AToExcel } from '../../services/pdfToExcelExportService';

// All fields matching the PDF/Excel format
const ALL_FIELDS: Array<{ key: keyof CT3ARecord; label: string }> = [
    { key: 'hoTen', label: 'Họ và tên' },
    { key: 'soDDCN_CCCD', label: 'Số ĐDCN/CCCD' },
    { key: 'ngaySinh', label: 'Ngày sinh' },
    { key: 'gioiTinh', label: 'Giới tính' },
    { key: 'queQuan', label: 'Quê quán' },
    { key: 'danToc', label: 'Dân tộc' },
    { key: 'quocTich', label: 'Quốc tịch' },
    { key: 'soHSCT', label: 'Số HSCT' },
    { key: 'quanHeVoiChuHo', label: 'Quan hệ với chủ hộ' },
    { key: 'oDauDen', label: 'Ở đâu đến' },
    { key: 'ngayDen', label: 'Ngày đến' },
    { key: 'diaChiThuongTru', label: 'Địa chỉ thường trú' },
];

interface CT3ADataPreviewProps {
    records: CT3ARecord[];
    fileName: string;
    totalPages: number;
    onReset: () => void;
    onSaveData?: () => void;
    onBackToEdit?: () => void;
    isSaving?: boolean;
}

export default function CT3ADataPreview({
    records,
    fileName,
    totalPages,
    onReset,
    onSaveData,
    onBackToEdit,
    isSaving = false,
}: CT3ADataPreviewProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportCT3AToExcel(records, fileName);
        } catch (error) {
            console.error('Export error:', error);
            alert('Lỗi khi xuất Excel. Vui lòng thử lại.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="ct3a-preview">
            {/* Header */}
            <div className="preview-header">
                <div className="file-info">
                    <h3>{fileName}</h3>
                    <span className="stats">{totalPages} trang • {records.length} bản ghi</span>
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
                    {onBackToEdit && (
                        <button className="btn-back" onClick={onBackToEdit}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                            <span>Chỉnh sửa</span>
                        </button>
                    )}
                    {onSaveData && (
                        <button
                            className="btn-save"
                            onClick={onSaveData}
                            disabled={isSaving || records.length === 0}
                        >
                            {isSaving ? (
                                <>
                                    <span className="spinner"></span>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                        <polyline points="7 3 7 8 15 8"></polyline>
                                    </svg>
                                    Lưu Dữ Liệu
                                </>
                            )}
                        </button>
                    )}
                    <button
                        className="btn-export"
                        onClick={handleExport}
                        disabled={isExporting || records.length === 0}
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

            {/* Data Table */}
            <div className="table-container">
                {records.length === 0 ? (
                    <div className="empty-state">
                        <p>Không tìm thấy dữ liệu trong PDF</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="sticky-col">STT</th>
                                {ALL_FIELDS.map(({ key, label }) => (
                                    <th key={key}>{label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, index) => (
                                <tr key={index}>
                                    <td className="center sticky-col">{record.stt || index + 1}</td>
                                    {ALL_FIELDS.map(({ key }) => (
                                        <td key={key} className={key === 'gioiTinh' || key === 'ngaySinh' || key === 'ngayDen' ? 'center' : ''}>
                                            {String(record[key] || '-')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <p className="note">
                * Cuộn ngang để xem tất cả các cột. File Excel sẽ chứa đầy đủ tất cả dữ liệu.
            </p>

            <style jsx>{`
                .ct3a-preview {
                    width: 90vw;
                    max-width: 90vw;
                    margin-left: calc(-45vw + 50%);
                }

                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                    border-radius: 12px 12px 0 0;
                    color: white;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .file-info h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }

                .stats {
                    font-size: 14px;
                    opacity: 0.9;
                }

                .actions {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .btn-reset, .btn-export, .btn-save {
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

                .btn-save {
                    background: #3b82f6;
                    color: white;
                }

                .btn-save:hover:not(:disabled) {
                    background: #2563eb;
                }

                .btn-save:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .btn-back {
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
                    background: #f59e0b;
                    color: white;
                }

                .btn-back:hover {
                    background: #d97706;
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

                .table-container {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-top: none;
                    overflow-x: auto;
                    max-height: 500px;
                    overflow-y: auto;
                }

                .data-table {
                    width: 100%;
                    min-width: max-content;
                    border-collapse: collapse;
                    font-size: 13px;
                }

                .data-table th {
                    background: #f1f5f9;
                    padding: 12px 10px;
                    text-align: left;
                    font-weight: 600;
                    color: #334155;
                    position: sticky;
                    top: 0;
                    border-bottom: 2px solid #e2e8f0;
                    white-space: nowrap;
                    z-index: 10;
                }

                .data-table td {
                    padding: 10px;
                    border-bottom: 1px solid #e5e7eb;
                    color: #475569;
                    white-space: nowrap;
                }

                .data-table tr:hover td {
                    background: #f8fafc;
                }

                .data-table .center {
                    text-align: center;
                }

                .sticky-col {
                    position: sticky;
                    left: 0;
                    background: inherit;
                    z-index: 5;
                }

                .data-table th.sticky-col {
                    z-index: 15;
                    background: #f1f5f9;
                }

                .data-table td.sticky-col {
                    background: white;
                }

                .data-table tr:hover td.sticky-col {
                    background: #f8fafc;
                }

                .empty-state {
                    padding: 60px 20px;
                    text-align: center;
                    color: #6b7280;
                }

                .note {
                    padding: 12px 20px;
                    background: #f8fafc;
                    border: 1px solid #e5e7eb;
                    border-top: none;
                    border-radius: 0 0 12px 12px;
                    font-size: 12px;
                    color: #6b7280;
                    margin: 0;
                }
            `}</style>
        </div>
    );
}
