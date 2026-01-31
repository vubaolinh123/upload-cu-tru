'use client';

import React from 'react';
import { UserRecord } from '../../types/userManagementTypes';

interface UserTableProps {
    users: UserRecord[];
    isLoading: boolean;
    onEdit: (user: UserRecord) => void;
    onDelete: (user: UserRecord) => void;
}

export default function UserTable({ users, isLoading, onEdit, onDelete }: UserTableProps) {
    if (isLoading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu...</p>
                <style jsx>{`
                    .loading-state {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 60px 20px;
                        color: #6b7280;
                    }
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border: 3px solid #e5e7eb;
                        border-top-color: #2563eb;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 16px;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <p>Không có dữ liệu</p>
                <style jsx>{`
                    .empty-state {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 60px 20px;
                        color: #9ca3af;
                    }
                    .empty-state svg {
                        margin-bottom: 16px;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="table-wrapper">
            <table className="user-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Họ và tên</th>
                        <th>Số CCCD</th>
                        <th className="hide-mobile">Ngày sinh</th>
                        <th className="hide-mobile">Giới tính</th>
                        <th className="hide-tablet">Quan hệ</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user._id || user.client_id}>
                            <td className="center">{index + 1}</td>
                            <td className="name-cell">
                                <span className="name">{user.hoTen}</span>
                                <span className="mobile-info">
                                    {user.ngaySinh} • {user.gioiTinh}
                                </span>
                            </td>
                            <td className="cccd">{user.soCCCD}</td>
                            <td className="hide-mobile center">{user.ngaySinh}</td>
                            <td className="hide-mobile center">{user.gioiTinh}</td>
                            <td className="hide-tablet">{user.quanHeVoiChuHo}</td>
                            <td className="actions">
                                <button
                                    className="btn-edit"
                                    onClick={() => onEdit(user)}
                                    title="Sửa"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => onDelete(user)}
                                    title="Xóa"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style jsx>{`
                .table-wrapper {
                    overflow-x: auto;
                }

                .user-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }

                .user-table th {
                    background: #f1f5f9;
                    padding: 12px 10px;
                    text-align: left;
                    font-weight: 600;
                    color: #334155;
                    border-bottom: 2px solid #e2e8f0;
                    white-space: nowrap;
                }

                .user-table td {
                    padding: 12px 10px;
                    border-bottom: 1px solid #e5e7eb;
                    color: #475569;
                }

                .user-table tr:hover td {
                    background: #f8fafc;
                }

                .center {
                    text-align: center;
                }

                .name-cell .name {
                    display: block;
                    font-weight: 500;
                    color: #1f2937;
                }

                .mobile-info {
                    display: none;
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 2px;
                }

                .cccd {
                    font-family: monospace;
                    font-size: 13px;
                }

                .actions {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                }

                .btn-edit, .btn-delete {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-edit {
                    background: #eff6ff;
                    color: #2563eb;
                }

                .btn-edit:hover {
                    background: #dbeafe;
                }

                .btn-delete {
                    background: #fef2f2;
                    color: #dc2626;
                }

                .btn-delete:hover {
                    background: #fee2e2;
                }

                @media (max-width: 768px) {
                    .hide-tablet {
                        display: none;
                    }
                }

                @media (max-width: 640px) {
                    .hide-mobile {
                        display: none;
                    }

                    .mobile-info {
                        display: block;
                    }

                    .user-table th, .user-table td {
                        padding: 10px 8px;
                    }

                    .user-table {
                        font-size: 13px;
                    }
                }
            `}</style>
        </div>
    );
}
