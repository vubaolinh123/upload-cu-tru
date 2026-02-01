'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { CT3ARecord } from '../../types/pdfTypes';
import CT3ARecordEditor, { ALL_FIELDS } from './CT3ARecordEditor';
import Button from '../ui/Button';

interface CT3ADataReviewTableProps {
    records: CT3ARecord[];
    onConfirmAll: (confirmedRecords: CT3ARecord[]) => void;
    onCancel: () => void;
}

interface RecordState {
    record: CT3ARecord;
    isConfirmed: boolean;
}

export default function CT3ADataReviewTable({
    records,
    onConfirmAll,
    onCancel,
}: CT3ADataReviewTableProps) {
    // Track state for each record
    const [recordStates, setRecordStates] = useState<RecordState[]>(() =>
        records.map((record) => ({ record, isConfirmed: false }))
    );

    // Check if all records are confirmed
    const allConfirmed = useMemo(() => {
        return recordStates.every((r) => r.isConfirmed);
    }, [recordStates]);

    const confirmedCount = useMemo(() => {
        return recordStates.filter((r) => r.isConfirmed).length;
    }, [recordStates]);

    const handleRecordChange = useCallback((index: number, updatedRecord: CT3ARecord) => {
        setRecordStates((prev) => {
            const newStates = [...prev];
            newStates[index] = { ...newStates[index], record: updatedRecord };
            return newStates;
        });
    }, []);

    const handleConfirmRecord = useCallback((index: number) => {
        setRecordStates((prev) => {
            const newStates = [...prev];
            newStates[index] = { ...newStates[index], isConfirmed: true };
            return newStates;
        });
    }, []);

    const handleEditRecord = useCallback((index: number) => {
        setRecordStates((prev) => {
            const newStates = [...prev];
            newStates[index] = { ...newStates[index], isConfirmed: false };
            return newStates;
        });
    }, []);

    const handleConfirmAllRecords = useCallback(() => {
        setRecordStates((prev) => prev.map((r) => ({ ...r, isConfirmed: true })));
    }, []);

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
                    <p>Vui lòng kiểm tra và chỉnh sửa thông tin đã đọc từ PDF trước khi xuất Excel</p>
                </div>
                <div className="header-right">
                    <span className="counter">
                        Đã xác nhận: <strong>{confirmedCount}</strong> / {recordStates.length} bản ghi
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="th-stt sticky-col">STT</th>
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
                        {recordStates.map((state, index) => (
                            <CT3ARecordEditor
                                key={index}
                                record={state.record}
                                index={index}
                                isConfirmed={state.isConfirmed}
                                onChange={(updated) => handleRecordChange(index, updated)}
                                onConfirm={() => handleConfirmRecord(index)}
                                onEdit={() => handleEditRecord(index)}
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
                        variant="outline"
                        onClick={handleConfirmAllRecords}
                        disabled={allConfirmed}
                    >
                        Xác nhận tất cả
                    </Button>

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
                    width: 100%;
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

                .table-wrapper {
                    flex: 1;
                    overflow: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    margin-bottom: 12px;
                    max-height: 450px;
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
