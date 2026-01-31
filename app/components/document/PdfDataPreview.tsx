'use client';

import React, { useState } from 'react';
import { CT3ARecord } from '../../types/pdfTypes';
import { exportCT3AToExcel } from '../../services/pdfToExcelExportService';

interface CT3ADataPreviewProps {
    records: CT3ARecord[];
    fileName: string;
    totalPages: number;
    onReset: () => void;
}

export default function CT3ADataPreview({
    records,
    fileName,
    totalPages,
    onReset
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
                                <th>STT</th>
                                <th>Họ và tên</th>
                                <th>Số ĐDCN/CCCD</th>
                                <th>Ngày sinh</th>
                                <th>Giới tính</th>
                                <th>Quê quán</th>
                                <th>Quan hệ với chủ hộ</th>
                                <th>Ngày đến</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, index) => (
                                <tr key={index}>
                                    <td className="center">{record.stt || index + 1}</td>
                                    <td>{record.hoTen || '-'}</td>
                                    <td>{record.soDDCN_CCCD || '-'}</td>
                                    <td className="center">{record.ngaySinh || '-'}</td>
                                    <td className="center">{record.gioiTinh || '-'}</td>
                                    <td>{record.queQuan || '-'}</td>
                                    <td className="center">{record.quanHeVoiChuHo || '-'}</td>
                                    <td className="center">{record.ngayDen || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <p className="note">
                * Bảng hiển thị một số cột chính. File Excel sẽ chứa đầy đủ tất cả các cột.
            </p>

            <style jsx>{`
                .ct3a-preview {
                    width: 100%;
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

                .table-container {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-top: none;
                    overflow-x: auto;
                    max-height: 400px;
                    overflow-y: auto;
                }

                .data-table {
                    width: 100%;
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
                }

                .data-table td {
                    padding: 10px;
                    border-bottom: 1px solid #e5e7eb;
                    color: #475569;
                }

                .data-table tr:hover td {
                    background: #f8fafc;
                }

                .data-table .center {
                    text-align: center;
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
