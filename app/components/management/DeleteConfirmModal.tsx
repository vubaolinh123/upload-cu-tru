'use client';

import React from 'react';
import { UserRecord } from '../../types/userManagementTypes';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    user: UserRecord | null;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteConfirmModal({
    isOpen,
    user,
    isDeleting,
    onConfirm,
    onCancel,
}: DeleteConfirmModalProps) {
    if (!isOpen || !user) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>

                <h3 className="modal-title">Xác nhận xóa</h3>

                <p className="modal-message">
                    Bạn có chắc chắn muốn xóa người dùng này?
                </p>

                <div className="user-info">
                    <p><strong>Họ tên:</strong> {user.hoTen}</p>
                    <p><strong>CCCD:</strong> {user.soCCCD}</p>
                </div>

                <p className="warning-text">
                    Hành động này không thể hoàn tác!
                </p>

                <div className="modal-actions">
                    <button
                        className="btn-cancel"
                        onClick={onCancel}
                        disabled={isDeleting}
                    >
                        Hủy
                    </button>
                    <button
                        className="btn-confirm"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <span className="spinner"></span>
                                Đang xóa...
                            </>
                        ) : (
                            'Xóa'
                        )}
                    </button>
                </div>
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
                    padding: 24px;
                    max-width: 400px;
                    width: 100%;
                    text-align: center;
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

                .modal-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 64px;
                    height: 64px;
                    background: #fef2f2;
                    border-radius: 50%;
                    color: #dc2626;
                    margin-bottom: 16px;
                }

                .modal-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0 0 8px;
                }

                .modal-message {
                    color: #6b7280;
                    margin: 0 0 16px;
                }

                .user-info {
                    background: #f9fafb;
                    padding: 12px 16px;
                    border-radius: 8px;
                    text-align: left;
                    margin-bottom: 12px;
                }

                .user-info p {
                    margin: 4px 0;
                    font-size: 14px;
                    color: #374151;
                }

                .warning-text {
                    font-size: 13px;
                    color: #dc2626;
                    margin: 0 0 20px;
                }

                .modal-actions {
                    display: flex;
                    gap: 12px;
                }

                .btn-cancel, .btn-confirm {
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

                .btn-confirm {
                    background: #dc2626;
                    border: none;
                    color: white;
                }

                .btn-confirm:hover:not(:disabled) {
                    background: #b91c1c;
                }

                .btn-cancel:disabled, .btn-confirm:disabled {
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
            `}</style>
        </div>
    );
}
