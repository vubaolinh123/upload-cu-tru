'use client';

import React, { useState, useEffect } from 'react';
import { UserRecord } from '../../types/userManagementTypes';

interface EditUserModalProps {
    isOpen: boolean;
    user: UserRecord | null;
    onSave: (data: Partial<UserRecord>) => void | Promise<void>;
    onCancel: () => void;
    isSaving?: boolean;
}

export default function EditUserModal({
    isOpen,
    user,
    onSave,
    onCancel,
    isSaving = false,
}: EditUserModalProps) {
    const [formData, setFormData] = useState<Partial<UserRecord>>({});

    // Initialize form data when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                hoTen: user.hoTen || '',
                soCCCD: user.soCCCD || '',
                ngaySinh: user.ngaySinh || '',
                gioiTinh: user.gioiTinh || '',
                queQuan: user.queQuan || '',
                danToc: user.danToc || '',
                quocTich: user.quocTich || '',
                quanHeVoiChuHo: user.quanHeVoiChuHo || '',
                oDauDen: user.oDauDen || '',
                hoKhauThuongTru: user.hoKhauThuongTru || '',
                members: user.members || [],
            });
        }
    }, [user]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({});
        }
    }, [isOpen]);

    if (!isOpen || !user) return null;

    const handleChange = (field: keyof UserRecord, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Chỉnh sửa thông tin</h3>
                    <button className="close-btn" onClick={onCancel} disabled={isSaving}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Họ và tên <span className="required">*</span></label>
                            <input
                                type="text"
                                value={formData.hoTen || ''}
                                onChange={(e) => handleChange('hoTen', e.target.value)}
                                required
                                disabled={isSaving}
                            />
                        </div>
                        <div className="form-group">
                            <label>Số CCCD <span className="required">*</span></label>
                            <input
                                type="text"
                                value={formData.soCCCD || ''}
                                onChange={(e) => handleChange('soCCCD', e.target.value)}
                                required
                                disabled={isSaving}
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngày sinh</label>
                            <input
                                type="text"
                                value={formData.ngaySinh || ''}
                                onChange={(e) => handleChange('ngaySinh', e.target.value)}
                                placeholder="dd/mm/yyyy"
                                disabled={isSaving}
                            />
                        </div>
                        <div className="form-group">
                            <label>Giới tính</label>
                            <select
                                value={formData.gioiTinh || ''}
                                onChange={(e) => handleChange('gioiTinh', e.target.value)}
                                disabled={isSaving}
                            >
                                <option value="">Chọn</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Quê quán</label>
                            <input
                                type="text"
                                value={formData.queQuan || ''}
                                onChange={(e) => handleChange('queQuan', e.target.value)}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="form-group">
                            <label>Dân tộc</label>
                            <input
                                type="text"
                                value={formData.danToc || ''}
                                onChange={(e) => handleChange('danToc', e.target.value)}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="form-group">
                            <label>Quốc tịch</label>
                            <input
                                type="text"
                                value={formData.quocTich || ''}
                                onChange={(e) => handleChange('quocTich', e.target.value)}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="form-group">
                            <label>Quan hệ với chủ hộ</label>
                            <input
                                type="text"
                                value={formData.quanHeVoiChuHo || ''}
                                onChange={(e) => handleChange('quanHeVoiChuHo', e.target.value)}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Ở đâu đến</label>
                            <input
                                type="text"
                                value={formData.oDauDen || ''}
                                onChange={(e) => handleChange('oDauDen', e.target.value)}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Hộ khẩu thường trú</label>
                            <textarea
                                value={formData.hoKhauThuongTru || ''}
                                onChange={(e) => handleChange('hoKhauThuongTru', e.target.value)}
                                rows={2}
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isSaving}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-save" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <span className="spinner"></span>
                                    Đang lưu...
                                </>
                            ) : (
                                'Lưu thay đổi'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal-content {
                    background: white;
                    border-radius: 16px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: slideIn 0.2s ease;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1f2937;
                }

                .close-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: #f3f4f6;
                    border-radius: 8px;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .close-btn:hover:not(:disabled) {
                    background: #e5e7eb;
                    color: #374151;
                }

                .close-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                form {
                    padding: 24px;
                }

                .form-grid {
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

                label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #374151;
                }

                .required {
                    color: #dc2626;
                }

                input, textarea, select {
                    padding: 10px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    color: #1f2937;
                    background: white;
                    transition: all 0.2s;
                }

                input:focus, textarea:focus, select:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                input:disabled, textarea:disabled, select:disabled {
                    background: #f9fafb;
                    cursor: not-allowed;
                    opacity: 0.7;
                }

                textarea {
                    resize: vertical;
                }

                .modal-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 24px;
                }

                .btn-cancel, .btn-save {
                    flex: 1;
                    padding: 12px 20px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .btn-cancel {
                    background: #f3f4f6;
                    border: 1px solid #e5e7eb;
                    color: #374151;
                }

                .btn-cancel:hover:not(:disabled) {
                    background: #e5e7eb;
                }

                .btn-save {
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    border: none;
                    color: white;
                }

                .btn-save:hover:not(:disabled) {
                    background: linear-gradient(135deg, #1d4ed8, #1e40af);
                }

                .btn-cancel:disabled, .btn-save:disabled {
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

                @media (max-width: 480px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
