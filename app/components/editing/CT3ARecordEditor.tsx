'use client';

import React, { useState, useCallback } from 'react';
import { CT3ARecord } from '../../types/pdfTypes';

interface CT3ARecordEditorProps {
    record: CT3ARecord;
    index: number;
    isConfirmed: boolean;
    showPageNumber?: boolean;
    onChange: (updatedRecord: CT3ARecord) => void;
    onConfirm: () => void;
    onEdit: () => void;
}

// All editable fields with width hints based on typical content size
const ALL_FIELDS: Array<{ key: keyof CT3ARecord; label: string; width: string; minWidth: string }> = [
    { key: 'hoTen', label: 'Họ và tên', width: '160px', minWidth: '140px' },
    { key: 'soDDCN_CCCD', label: 'Số CCCD', width: '120px', minWidth: '100px' },
    { key: 'ngaySinh', label: 'Ngày sinh', width: '100px', minWidth: '90px' },
    { key: 'gioiTinh', label: 'Giới tính', width: '70px', minWidth: '60px' },
    { key: 'queQuan', label: 'Quê quán', width: '160px', minWidth: '120px' },
    { key: 'danToc', label: 'Dân tộc', width: '70px', minWidth: '60px' },
    { key: 'quocTich', label: 'Quốc tịch', width: '80px', minWidth: '70px' },
    { key: 'soHSCT', label: 'Số HSCT', width: '110px', minWidth: '100px' },
    { key: 'quanHeVoiChuHo', label: 'Quan hệ', width: '90px', minWidth: '70px' },
    { key: 'oDauDen', label: 'Ở đâu đến', width: '180px', minWidth: '140px' },
    { key: 'ngayDen', label: 'Ngày đến', width: '100px', minWidth: '90px' },
    { key: 'diaChiThuongTru', label: 'Địa chỉ thường trú', width: '200px', minWidth: '160px' },
];

export default function CT3ARecordEditor({
    record,
    index,
    isConfirmed,
    showPageNumber = false,
    onChange,
    onConfirm,
    onEdit,
}: CT3ARecordEditorProps) {
    const [localRecord, setLocalRecord] = useState<CT3ARecord>(record);

    const handleFieldChange = useCallback((field: keyof CT3ARecord, value: string | number | null) => {
        const updated = { ...localRecord, [field]: value };
        setLocalRecord(updated);
        onChange(updated);
    }, [localRecord, onChange]);

    if (isConfirmed) {
        return (
            <tr className="confirmed-row">
                <td className="stt-cell sticky-col">
                    {record.sttTrongHo || index + 1}
                </td>
                {showPageNumber && (
                    <td className="page-cell">{record.pageNumber || '-'}</td>
                )}
                {ALL_FIELDS.map(({ key, width, minWidth }) => (
                    <td
                        key={key}
                        className="data-cell"
                        style={{ width, minWidth, maxWidth: width }}
                    >
                        <div className="cell-content">
                            {String(localRecord[key] || '-')}
                        </div>
                    </td>
                ))}
                <td className="action-cell sticky-col-right">
                    <button onClick={onEdit} className="btn-edit">
                        Sửa
                    </button>
                </td>

                <style jsx>{`
                    .confirmed-row {
                        background: #f0fdf4;
                    }
                    .confirmed-row:hover {
                        background: #dcfce7;
                    }
                    .stt-cell {
                        padding: 8px;
                        text-align: center;
                        font-size: 13px;
                        font-weight: 500;
                        color: #374151;
                        border-right: 1px solid #e5e7eb;
                        position: sticky;
                        left: 0;
                        background: #f0fdf4;
                        z-index: 5;
                        width: 40px;
                        min-width: 40px;
                    }
                    .data-cell {
                        padding: 8px 6px;
                        font-size: 13px;
                        color: #374151;
                        border-right: 1px solid #e5e7eb;
                    }
                    .cell-content {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .action-cell {
                        padding: 8px;
                        text-align: center;
                        position: sticky;
                        right: 0;
                        background: #f0fdf4;
                        z-index: 5;
                        width: 70px;
                        min-width: 70px;
                    }
                    .btn-edit {
                        padding: 4px 10px;
                        font-size: 12px;
                        background: #e5e7eb;
                        color: #374151;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    .btn-edit:hover {
                        background: #d1d5db;
                    }
                `}</style>
            </tr>
        );
    }

    return (
        <tr className="edit-row">
            <td className="stt-cell sticky-col">
                {record.sttTrongHo || index + 1}
            </td>
            {showPageNumber && (
                <td className="page-cell">{record.pageNumber || '-'}</td>
            )}
            {ALL_FIELDS.map(({ key, width, minWidth }) => (
                <td
                    key={key}
                    className="input-cell"
                    style={{ width, minWidth, maxWidth: width }}
                >
                    <input
                        type="text"
                        value={String(localRecord[key] || '')}
                        onChange={(e) => handleFieldChange(key, e.target.value || null)}
                        className="field-input"
                        style={{ width: '100%' }}
                    />
                </td>
            ))}
            <td className="action-cell sticky-col-right">
                <button onClick={onConfirm} className="btn-confirm">
                    ✓ Xác nhận
                </button>
            </td>

            <style jsx>{`
                .edit-row:hover {
                    background: #eff6ff;
                }
                .stt-cell {
                    padding: 8px;
                    text-align: center;
                    font-size: 13px;
                    font-weight: 500;
                    color: #374151;
                    border-right: 1px solid #e5e7eb;
                    position: sticky;
                    left: 0;
                    background: white;
                    z-index: 5;
                    width: 40px;
                    min-width: 40px;
                }
                .edit-row:hover .stt-cell {
                    background: #eff6ff;
                }
                .input-cell {
                    padding: 4px;
                    border-right: 1px solid #e5e7eb;
                }
                .field-input {
                    padding: 6px 8px;
                    font-size: 13px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                }
                .field-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                }
                .action-cell {
                    padding: 8px;
                    text-align: center;
                    position: sticky;
                    right: 0;
                    background: white;
                    z-index: 5;
                    width: 90px;
                    min-width: 90px;
                }
                .edit-row:hover .action-cell {
                    background: #eff6ff;
                }
                .btn-confirm {
                    padding: 6px 10px;
                    font-size: 12px;
                    background: #10b981;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.2s;
                    white-space: nowrap;
                }
                .btn-confirm:hover {
                    background: #059669;
                }
            `}</style>
        </tr>
    );
}

// Export fields for use in parent component
export { ALL_FIELDS };
