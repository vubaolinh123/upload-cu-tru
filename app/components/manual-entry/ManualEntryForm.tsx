'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { PersonInfo } from '../../types/residence';
import { Household } from '../../types/household';
import PersonEntryCard from './PersonEntryCard';

interface HeaderInfo {
    gioLap: string;
    ngayLap: string;
    diaChi: string;
}

interface ManualEntryFormProps {
    onDataChange: (household: Household | null, headerInfo: HeaderInfo) => void;
}

// Default empty person
const createEmptyPerson = (stt: number, isChuHo = false): PersonInfo => ({
    stt,
    hoTen: '',
    soCCCD: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    queQuan: '',
    danToc: 'Kinh',
    quocTich: 'Việt Nam',
    quanHeVoiChuHo: isChuHo ? 'Chủ hộ' : '',
    oDauDen: '',
    hoKhauThuongTru: '',
});

const STORAGE_KEY = 'manual_entry_data';

export default function ManualEntryForm({ onDataChange }: ManualEntryFormProps) {
    const [headerInfo, setHeaderInfo] = useState<HeaderInfo>({
        gioLap: '',
        ngayLap: '',
        diaChi: '',
    });

    const [persons, setPersons] = useState<PersonInfo[]>([createEmptyPerson(1, true)]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.headerInfo) setHeaderInfo(data.headerInfo);
                if (data.persons && data.persons.length > 0) setPersons(data.persons);
            }
        } catch (e) {
            console.warn('Failed to load saved data:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage and notify parent
    useEffect(() => {
        if (!isLoaded) return;

        // Save to localStorage
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ headerInfo, persons }));
        } catch (e) {
            console.warn('Failed to save data:', e);
        }

        // Build household and notify parent
        const chuHo = persons[0];
        if (chuHo && chuHo.hoTen) {
            const household: Household = {
                id: 'manual-entry',
                chuHo,
                members: persons.slice(1),
                allPersons: persons,
            };
            onDataChange(household, headerInfo);
        } else {
            onDataChange(null, headerInfo);
        }
    }, [headerInfo, persons, isLoaded, onDataChange]);

    const handleHeaderChange = (field: keyof HeaderInfo, value: string) => {
        setHeaderInfo(prev => ({ ...prev, [field]: value }));
    };

    const handlePersonChange = useCallback((index: number, updatedPerson: PersonInfo) => {
        setPersons(prev => {
            const newPersons = [...prev];
            newPersons[index] = updatedPerson;
            return newPersons;
        });
    }, []);

    const handleAddPerson = () => {
        setPersons(prev => [...prev, createEmptyPerson(prev.length + 1)]);
    };

    const handleRemovePerson = useCallback((index: number) => {
        if (index === 0) return; // Can't remove chủ hộ
        setPersons(prev => {
            const newPersons = prev.filter((_, i) => i !== index);
            // Re-number
            return newPersons.map((p, i) => ({ ...p, stt: i + 1 }));
        });
    }, []);

    const handleClearAll = () => {
        if (confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu đã nhập?')) {
            setHeaderInfo({ gioLap: '', ngayLap: '', diaChi: '' });
            setPersons([createEmptyPerson(1, true)]);
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    if (!isLoaded) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="manual-entry-form">
            {/* Header Info Section */}
            <div className="section">
                <div className="section-header">
                    <h3>📋 Thông tin biên bản</h3>
                </div>
                <div className="section-content">
                    <div className="header-grid">
                        <div className="form-group">
                            <label>Giờ lập</label>
                            <input
                                type="text"
                                value={headerInfo.gioLap}
                                onChange={(e) => handleHeaderChange('gioLap', e.target.value)}
                                placeholder="VD: 09:00"
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngày lập</label>
                            <input
                                type="text"
                                value={headerInfo.ngayLap}
                                onChange={(e) => handleHeaderChange('ngayLap', e.target.value)}
                                placeholder="VD: 08/02/2026"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Địa chỉ kiểm tra</label>
                            <input
                                type="text"
                                value={headerInfo.diaChi}
                                onChange={(e) => handleHeaderChange('diaChi', e.target.value)}
                                placeholder="Số nhà, đường, phường..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Persons Section */}
            <div className="section">
                <div className="section-header">
                    <h3>👥 Danh sách nhân khẩu ({persons.length} người)</h3>
                    <div className="section-actions">
                        <button type="button" className="btn-clear" onClick={handleClearAll}>
                            🗑️ Xóa tất cả
                        </button>
                    </div>
                </div>
                <div className="section-content">
                    <div className="persons-list">
                        {persons.map((person, index) => (
                            <PersonEntryCard
                                key={`person-${index}`}
                                person={person}
                                index={index}
                                isFirst={index === 0}
                                onChange={(p) => handlePersonChange(index, p)}
                                onRemove={() => handleRemovePerson(index)}
                            />
                        ))}
                    </div>

                    <button type="button" className="btn-add" onClick={handleAddPerson}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Thêm nhân khẩu
                    </button>
                </div>
            </div>

            <style jsx>{`
                .manual-entry-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .section {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                }

                .section-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                }

                .section-actions {
                    display: flex;
                    gap: 8px;
                }

                .section-content {
                    padding: 20px;
                }

                .header-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group.full-width {
                    grid-column: 1 / -1;
                }

                .form-group label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #374151;
                }

                .form-group input {
                    padding: 10px 14px;
                    border: 1px solid #d1d5db;
                    border-radius: 10px;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .persons-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .btn-add {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 14px;
                    border: 2px dashed #d1d5db;
                    border-radius: 12px;
                    background: transparent;
                    color: #6b7280;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-add:hover {
                    border-color: #3b82f6;
                    color: #3b82f6;
                    background: rgba(59, 130, 246, 0.05);
                }

                .btn-clear {
                    padding: 6px 12px;
                    border: none;
                    border-radius: 6px;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-clear:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .loading {
                    text-align: center;
                    padding: 40px;
                    color: #6b7280;
                }

                @media (max-width: 640px) {
                    .header-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
