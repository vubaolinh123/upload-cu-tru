'use client';

import React, { useState } from 'react';
import { PersonInfo } from '../../types/residence';

interface PersonEntryCardProps {
    person: PersonInfo;
    index: number;
    isFirst: boolean;
    onChange: (person: PersonInfo) => void;
    onRemove: () => void;
}

export default function PersonEntryCard({
    person,
    index,
    isFirst,
    onChange,
    onRemove,
}: PersonEntryCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleFieldChange = (field: keyof PersonInfo, value: string) => {
        onChange({ ...person, [field]: value });
    };

    return (
        <div className="person-card">
            {/* Header */}
            <div className="card-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="header-left">
                    <span className="person-number">{index + 1}</span>
                    <span className="person-name">
                        {person.hoTen || `Nhân khẩu ${index + 1}`}
                    </span>
                    {isFirst && <span className="badge-chuho">Chủ hộ</span>}
                </div>
                <div className="header-right">
                    {!isFirst && (
                        <button
                            type="button"
                            className="btn-remove"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                        </button>
                    )}
                    <button type="button" className="btn-toggle">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="card-content">
                    <div className="form-grid">
                        {/* Row 1 */}
                        <div className="form-group full-width">
                            <label>Họ và tên <span className="required">*</span></label>
                            <input
                                type="text"
                                value={person.hoTen}
                                onChange={(e) => handleFieldChange('hoTen', e.target.value)}
                                placeholder="Nhập họ và tên"
                            />
                        </div>

                        {/* Row 2 */}
                        <div className="form-group">
                            <label>Số CCCD <span className="required">*</span></label>
                            <input
                                type="text"
                                value={person.soCCCD}
                                onChange={(e) => handleFieldChange('soCCCD', e.target.value)}
                                placeholder="Số căn cước"
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngày sinh</label>
                            <input
                                type="text"
                                value={person.ngaySinh}
                                onChange={(e) => handleFieldChange('ngaySinh', e.target.value)}
                                placeholder="DD/MM/YYYY"
                            />
                        </div>
                        <div className="form-group">
                            <label>Giới tính</label>
                            <select
                                value={person.gioiTinh}
                                onChange={(e) => handleFieldChange('gioiTinh', e.target.value as 'Nam' | 'Nữ')}
                            >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </select>
                        </div>

                        {/* Row 3 */}
                        <div className="form-group">
                            <label>Dân tộc</label>
                            <input
                                type="text"
                                value={person.danToc}
                                onChange={(e) => handleFieldChange('danToc', e.target.value)}
                                placeholder="Kinh, Hoa..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Quốc tịch</label>
                            <input
                                type="text"
                                value={person.quocTich}
                                onChange={(e) => handleFieldChange('quocTich', e.target.value)}
                                placeholder="Việt Nam"
                            />
                        </div>
                        <div className="form-group">
                            <label>Quan hệ với chủ hộ</label>
                            <input
                                type="text"
                                value={person.quanHeVoiChuHo}
                                onChange={(e) => handleFieldChange('quanHeVoiChuHo', e.target.value)}
                                placeholder={isFirst ? 'Chủ hộ' : 'Con, Vợ/Chồng...'}
                                disabled={isFirst}
                            />
                        </div>

                        {/* Row 4 */}
                        <div className="form-group full-width">
                            <label>Quê quán</label>
                            <input
                                type="text"
                                value={person.queQuan}
                                onChange={(e) => handleFieldChange('queQuan', e.target.value)}
                                placeholder="Xã/Phường, Quận/Huyện, Tỉnh/Thành phố"
                            />
                        </div>

                        {/* Row 5 */}
                        <div className="form-group full-width">
                            <label>Hộ khẩu thường trú</label>
                            <input
                                type="text"
                                value={person.hoKhauThuongTru}
                                onChange={(e) => handleFieldChange('hoKhauThuongTru', e.target.value)}
                                placeholder="Địa chỉ hộ khẩu thường trú"
                            />
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .person-card {
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    background: white;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    cursor: pointer;
                    user-select: none;
                }

                .card-header:hover {
                    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .person-number {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    background: #3b82f6;
                    color: white;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                }

                .person-name {
                    font-weight: 600;
                    color: #1f2937;
                }

                .badge-chuho {
                    padding: 2px 8px;
                    background: #10b981;
                    color: white;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-remove {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border: none;
                    border-radius: 8px;
                    background: #fee2e2;
                    color: #dc2626;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-remove:hover {
                    background: #fecaca;
                }

                .btn-toggle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border: none;
                    border-radius: 8px;
                    background: transparent;
                    color: #6b7280;
                    cursor: pointer;
                }

                .card-content {
                    padding: 16px;
                    border-top: 1px solid #e5e7eb;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .form-group.full-width {
                    grid-column: 1 / -1;
                }

                .form-group label {
                    font-size: 12px;
                    font-weight: 500;
                    color: #4b5563;
                }

                .required {
                    color: #dc2626;
                }

                .form-group input,
                .form-group select {
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .form-group input:disabled {
                    background: #f3f4f6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
