'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { CT3ARecord } from '../../types/pdfTypes';
import CT3ARecordEditor, { ALL_FIELDS } from './CT3ARecordEditor';
import Button from '../ui/Button';

interface PageResult {
    pageNum: number;
    status: 'pending' | 'processing' | 'success' | 'error';
    recordCount: number;
    errorMessage?: string;
    processingTimeMs?: number;
}

interface CT3ADataReviewTableProps {
    records: CT3ARecord[];
    pageResults?: PageResult[];
    totalElapsedSeconds?: number; // Actual wall-clock time (not sum of parallel page times)
    onConfirmAll: (confirmedRecords: CT3ARecord[]) => void;
    onCancel: () => void;
}

interface RecordState {
    record: CT3ARecord;
    isConfirmed: boolean;
    originalIndex: number; // Track original index for final output
}

export default function CT3ADataReviewTable({
    records,
    pageResults,
    totalElapsedSeconds,
    onConfirmAll,
    onCancel,
}: CT3ADataReviewTableProps) {
    // Track state for each record
    const [recordStates, setRecordStates] = useState<RecordState[]>(() =>
        records.map((record, index) => ({ record, isConfirmed: false, originalIndex: index }))
    );

    // Get unique page numbers and create page options
    const pageNumbers = useMemo(() => {
        const pages = new Set<number>();
        records.forEach(r => {
            if (r.pageNumber) pages.add(r.pageNumber);
        });
        return Array.from(pages).sort((a, b) => a - b);
    }, [records]);

    // Current selected page (0 = all pages)
    const [selectedPage, setSelectedPage] = useState<number>(0);

    // Filter records by selected page
    const filteredRecordStates = useMemo(() => {
        if (selectedPage === 0) return recordStates;
        return recordStates.filter(rs => rs.record.pageNumber === selectedPage);
    }, [recordStates, selectedPage]);

    // Check if all records are confirmed
    const allConfirmed = useMemo(() => {
        return recordStates.every((r) => r.isConfirmed);
    }, [recordStates]);

    const confirmedCount = useMemo(() => {
        return recordStates.filter((r) => r.isConfirmed).length;
    }, [recordStates]);

    // Stats for current page view
    const currentPageStats = useMemo(() => {
        const total = filteredRecordStates.length;
        const confirmed = filteredRecordStates.filter(r => r.isConfirmed).length;
        return { total, confirmed };
    }, [filteredRecordStates]);

    const handleRecordChange = useCallback((originalIndex: number, updatedRecord: CT3ARecord) => {
        setRecordStates((prev) => {
            const newStates = [...prev];
            const stateIndex = prev.findIndex(s => s.originalIndex === originalIndex);
            if (stateIndex !== -1) {
                newStates[stateIndex] = { ...newStates[stateIndex], record: updatedRecord };
            }
            return newStates;
        });
    }, []);

    const handleConfirmRecord = useCallback((originalIndex: number) => {
        setRecordStates((prev) => {
            const newStates = [...prev];
            const stateIndex = prev.findIndex(s => s.originalIndex === originalIndex);
            if (stateIndex !== -1) {
                newStates[stateIndex] = { ...newStates[stateIndex], isConfirmed: true };
            }
            return newStates;
        });
    }, []);

    const handleEditRecord = useCallback((originalIndex: number) => {
        setRecordStates((prev) => {
            const newStates = [...prev];
            const stateIndex = prev.findIndex(s => s.originalIndex === originalIndex);
            if (stateIndex !== -1) {
                newStates[stateIndex] = { ...newStates[stateIndex], isConfirmed: false };
            }
            return newStates;
        });
    }, []);

    const handleConfirmAllRecords = useCallback(() => {
        setRecordStates((prev) => prev.map((r) => ({ ...r, isConfirmed: true })));
    }, []);

    const handleConfirmCurrentPage = useCallback(() => {
        if (selectedPage === 0) {
            handleConfirmAllRecords();
            return;
        }
        setRecordStates((prev) => prev.map((r) =>
            r.record.pageNumber === selectedPage ? { ...r, isConfirmed: true } : r
        ));
    }, [selectedPage, handleConfirmAllRecords]);

    const handleComplete = useCallback(() => {
        const confirmedRecords = recordStates.map((r) => r.record);
        onConfirmAll(confirmedRecords);
    }, [recordStates, onConfirmAll]);

    return (
        <div className="review-container">
            {/* Header */}
            <div className="review-header">
                <div className="header-left">
                    <h2>Kiểm tra & Chỉnh sửa Dữ liệu PDF</h2>
                    <p>Chọn trang để xem và chỉnh sửa dữ liệu. Xác nhận từng bản ghi trước khi hoàn tất.</p>
                </div>
                <div className="header-right">
                    <span className="counter">
                        Đã xác nhận: <strong>{confirmedCount}</strong> / {recordStates.length} bản ghi
                    </span>
                </div>
            </div>

            {/* Timing Summary */}
            {(pageResults && pageResults.length > 0) || totalElapsedSeconds ? (
                <div className="timing-summary">
                    <div className="timing-header">
                        <span className="timing-icon">⏱️</span>
                        <span className="timing-title">Thời gian xử lý:</span>
                        <span className="timing-total">
                            Tổng cộng: <strong>
                                {(() => {
                                    // Use actual wall-clock elapsed time, not sum of parallel page times
                                    const totalSeconds = totalElapsedSeconds || 0;
                                    if (totalSeconds < 60) return `${totalSeconds}s`;
                                    const minutes = Math.floor(totalSeconds / 60);
                                    const seconds = totalSeconds % 60;
                                    return `${minutes}m ${seconds}s`;
                                })()}
                            </strong>
                        </span>
                    </div>
                    <div className="timing-pages">
                        {pageResults?.map(pr => (
                            <div
                                key={pr.pageNum}
                                className={`timing-page ${pr.status === 'success' ? 'success' : pr.status === 'error' ? 'error' : ''}`}
                            >
                                <span className="page-label">Trang {pr.pageNum}</span>
                                <span className="page-time">
                                    {pr.processingTimeMs
                                        ? `${(pr.processingTimeMs / 1000).toFixed(1)}s`
                                        : '-'
                                    }
                                </span>
                                <span className="page-records">{pr.recordCount} bản ghi</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Page Selector */}
            {pageNumbers.length > 1 && (
                <div className="page-selector">
                    <span className="selector-label">📄 Chọn trang:</span>
                    <div className="page-tabs">
                        <button
                            className={`page-tab ${selectedPage === 0 ? 'active' : ''}`}
                            onClick={() => setSelectedPage(0)}
                        >
                            Tất cả ({recordStates.length})
                        </button>
                        {pageNumbers.map(pageNum => {
                            const pageRecordCount = recordStates.filter(r => r.record.pageNumber === pageNum).length;
                            const pageConfirmedCount = recordStates.filter(r => r.record.pageNumber === pageNum && r.isConfirmed).length;
                            const isComplete = pageConfirmedCount === pageRecordCount;
                            return (
                                <button
                                    key={pageNum}
                                    className={`page-tab ${selectedPage === pageNum ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                                    onClick={() => setSelectedPage(pageNum)}
                                >
                                    Trang {pageNum} ({pageConfirmedCount}/{pageRecordCount})
                                    {isComplete && <span className="check-icon">✓</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Current page info */}
            <div className="page-info">
                <span>
                    {selectedPage === 0
                        ? `Hiển thị tất cả ${currentPageStats.total} bản ghi`
                        : `Trang ${selectedPage}: ${currentPageStats.total} bản ghi (${currentPageStats.confirmed} đã xác nhận)`
                    }
                </span>
                <Button
                    variant="outline"
                    onClick={handleConfirmCurrentPage}
                    disabled={currentPageStats.confirmed === currentPageStats.total}
                >
                    {selectedPage === 0 ? 'Xác nhận tất cả' : `Xác nhận trang ${selectedPage}`}
                </Button>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="th-stt sticky-col">STT</th>
                            {pageNumbers.length > 1 && <th className="th-page">Trang</th>}
                            {ALL_FIELDS.map(({ key, label, width, minWidth }) => (
                                <th
                                    key={key}
                                    style={{ width, minWidth, maxWidth: width }}
                                >
                                    {label}
                                </th>
                            ))}
                            <th className="th-action sticky-col-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecordStates.map((state) => (
                            <CT3ARecordEditor
                                key={state.originalIndex}
                                record={state.record}
                                index={state.originalIndex}
                                isConfirmed={state.isConfirmed}
                                showPageNumber={pageNumbers.length > 1}
                                onChange={(updated) => handleRecordChange(state.originalIndex, updated)}
                                onConfirm={() => handleConfirmRecord(state.originalIndex)}
                                onEdit={() => handleEditRecord(state.originalIndex)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Note */}
            <p className="note">* Cuộn ngang để xem tất cả các cột. Dữ liệu sẽ được xuất ra Excel với đầy đủ các trường.</p>

            {/* Action buttons */}
            <div className="actions">
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    }
                >
                    Hủy bỏ
                </Button>

                <div className="actions-right">
                    <Button
                        variant="primary"
                        onClick={handleComplete}
                        disabled={!allConfirmed}
                        leftIcon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    >
                        Hoàn tất & Xem dữ liệu
                    </Button>
                </div>
            </div>

            <style jsx>{`
                .review-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 95%;
                    max-width: 95vw;
                    margin: 0 auto;
                    padding: 16px;
                }

                .review-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .header-left h2 {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 4px;
                }

                .header-left p {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0;
                }

                .counter {
                    font-size: 14px;
                    color: #6b7280;
                }

                .counter strong {
                    color: #10b981;
                }

                /* Timing Summary */
                .timing-summary {
                    margin-bottom: 12px;
                    padding: 12px;
                    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
                    border-radius: 8px;
                    border: 1px solid #a7f3d0;
                }

                .timing-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 10px;
                }

                .timing-icon {
                    font-size: 16px;
                }

                .timing-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                }

                .timing-total {
                    margin-left: auto;
                    font-size: 14px;
                    color: #059669;
                }

                .timing-total strong {
                    font-size: 16px;
                    color: #047857;
                }

                .timing-pages {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .timing-page {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    background: white;
                    border-radius: 6px;
                    border: 1px solid #e5e7eb;
                    font-size: 12px;
                }

                .timing-page.success {
                    border-color: #86efac;
                    background: #f0fdf4;
                }

                .timing-page.error {
                    border-color: #fca5a5;
                    background: #fef2f2;
                }

                .timing-page .page-label {
                    font-weight: 500;
                    color: #374151;
                }

                .timing-page .page-time {
                    color: #2563eb;
                    font-weight: 600;
                }

                .timing-page .page-records {
                    color: #6b7280;
                }

                /* Page Selector */
                .page-selector {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    overflow-x: auto;
                }

                .selector-label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #475569;
                    white-space: nowrap;
                }

                .page-tabs {
                    display: flex;
                    gap: 8px;
                    flex-wrap: nowrap;
                }

                .page-tab {
                    padding: 8px 14px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    background: white;
                    font-size: 13px;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .page-tab:hover {
                    border-color: #3b82f6;
                    color: #3b82f6;
                }

                .page-tab.active {
                    background: #3b82f6;
                    border-color: #3b82f6;
                    color: white;
                }

                .page-tab.complete:not(.active) {
                    background: #ecfdf5;
                    border-color: #10b981;
                    color: #10b981;
                }

                .check-icon {
                    font-size: 12px;
                }

                /* Page info */
                .page-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: #eff6ff;
                    border-radius: 6px;
                    margin-bottom: 12px;
                    font-size: 13px;
                    color: #3b82f6;
                }

                .table-wrapper {
                    flex: 1;
                    overflow: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    margin-bottom: 12px;
                    max-height: 55vh;
                }

                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                    table-layout: auto;
                }

                .data-table thead {
                    position: sticky;
                    top: 0;
                    z-index: 20;
                }

                .data-table th {
                    background: #f1f5f9;
                    padding: 10px 6px;
                    text-align: left;
                    font-weight: 600;
                    color: #334155;
                    border-bottom: 2px solid #e2e8f0;
                    white-space: nowrap;
                }

                .th-stt {
                    width: 40px;
                    min-width: 40px;
                    text-align: center;
                }

                .th-page {
                    width: 60px;
                    min-width: 60px;
                    text-align: center;
                }

                .th-action {
                    width: 90px;
                    min-width: 90px;
                    text-align: center;
                }

                .sticky-col {
                    position: sticky;
                    left: 0;
                    background: #f1f5f9;
                    z-index: 25;
                    border-right: 1px solid #e5e7eb;
                }

                .sticky-col-right {
                    position: sticky;
                    right: 0;
                    background: #f1f5f9;
                    z-index: 25;
                    border-left: 1px solid #e5e7eb;
                }

                .note {
                    font-size: 12px;
                    color: #6b7280;
                    margin: 0 0 12px;
                }

                .actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #e5e7eb;
                }

                .actions-right {
                    display: flex;
                    gap: 12px;
                }
            `}</style>
        </div>
    );
}
