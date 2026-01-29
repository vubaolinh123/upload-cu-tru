'use client';

import React from 'react';
import { PersonInfo } from '../../types/residence';

interface EditablePersonRowProps {
    person: PersonInfo;
    index: number;
    onChange: (index: number, field: keyof PersonInfo, value: string) => void;
    onRemove?: (index: number) => void;
}

const FIELD_LABELS: Record<keyof PersonInfo, string> = {
    stt: 'STT',
    hoTen: 'Họ và tên',
    soCCCD: 'Số CCCD',
    ngaySinh: 'Ngày sinh',
    gioiTinh: 'Giới tính',
    queQuan: 'Quê quán',
    danToc: 'Dân tộc',
    quocTich: 'Quốc tịch',
    quanHeVoiChuHo: 'Quan hệ với chủ hộ',
    oDauDen: 'Ở đâu đến',
    hoKhauThuongTru: 'Hộ khẩu thường trú',
};

// Fields that should have smaller inputs
const SMALL_FIELDS: (keyof PersonInfo)[] = ['stt', 'gioiTinh', 'danToc', 'quocTich'];
const MEDIUM_FIELDS: (keyof PersonInfo)[] = ['soCCCD', 'ngaySinh', 'quanHeVoiChuHo'];
const LARGE_FIELDS: (keyof PersonInfo)[] = ['hoTen', 'queQuan', 'oDauDen', 'hoKhauThuongTru'];

export default function EditablePersonRow({
    person,
    index,
    onChange,
    onRemove,
}: EditablePersonRowProps) {
    const handleChange = (field: keyof PersonInfo, value: string) => {
        onChange(index, field, value);
    };

    const getInputWidth = (field: keyof PersonInfo) => {
        if (SMALL_FIELDS.includes(field)) return 'w-16';
        if (MEDIUM_FIELDS.includes(field)) return 'w-28';
        return 'w-full';
    };

    const validateField = (field: keyof PersonInfo, value: string): boolean => {
        if (!value) return true; // Empty is okay

        switch (field) {
            case 'soCCCD':
                return /^\d{9,12}$/.test(value.replace(/\s/g, ''));
            case 'ngaySinh':
                return /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(value);
            case 'gioiTinh':
                return ['Nam', 'Nữ', 'nam', 'nữ'].includes(value);
            default:
                return true;
        }
    };

    const getFieldError = (field: keyof PersonInfo, value: string): string | null => {
        if (!value) return null;

        switch (field) {
            case 'soCCCD':
                if (!/^\d{9,12}$/.test(value.replace(/\s/g, ''))) {
                    return 'CCCD phải có 9-12 số';
                }
                break;
            case 'hoTen':
                if (value.length < 3) {
                    return 'Tên quá ngắn';
                }
                break;
        }
        return null;
    };

    const renderField = (field: keyof PersonInfo) => {
        const value = String(person[field] ?? '');
        const isValid = validateField(field, value);
        const error = getFieldError(field, value);

        // STT is read-only
        if (field === 'stt') {
            return (
                <div className="text-center font-medium text-gray-700 bg-gray-100 rounded px-2 py-1">
                    {value}
                </div>
            );
        }

        // Gender dropdown
        if (field === 'gioiTinh') {
            return (
                <select
                    value={value}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">--</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                </select>
            );
        }

        return (
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className={`
                        w-full px-2 py-1 border rounded text-sm transition-colors
                        ${!isValid || error
                            ? 'border-red-400 bg-red-50 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }
                    `}
                    placeholder={FIELD_LABELS[field]}
                />
                {error && (
                    <span className="absolute -bottom-4 left-0 text-xs text-red-500">
                        {error}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm hover:shadow-md transition-shadow">
            {/* Row header with remove button */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                <span className="font-medium text-blue-600">
                    Người #{person.stt}: {person.hoTen || '(Chưa có tên)'}
                </span>
                {onRemove && (
                    <button
                        onClick={() => onRemove(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Xóa người này"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(Object.keys(FIELD_LABELS) as (keyof PersonInfo)[]).map((field) => (
                    <div key={field} className={`${LARGE_FIELDS.includes(field) ? 'col-span-2' : ''}`}>
                        <label className="block text-xs text-gray-500 mb-1">
                            {FIELD_LABELS[field]}
                        </label>
                        {renderField(field)}
                    </div>
                ))}
            </div>
        </div>
    );
}
