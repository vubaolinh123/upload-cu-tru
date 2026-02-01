'use client';

import React, { useState } from 'react';
import { UserRecord } from '../../types/userManagementTypes';

interface UserTableProps {
    users: UserRecord[];
    isLoading: boolean;
    onEdit: (user: UserRecord) => void;
    onDelete: (user: UserRecord) => void;
}

// Chevron Icon Component
function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
            }}
        >
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    );
}

// Member Row Component
function MemberRow({ member, onEdit, onDelete }: {
    member: UserRecord;
    onEdit: (user: UserRecord) => void;
    onDelete: (user: UserRecord) => void;
}) {
    return (
        <tr className="member-row">
            <td className="center">
                <span className="member-indicator">└─</span>
            </td>
            <td className="name-cell">
                <span className="name member-name">{member.hoTen}</span>
                <span className="mobile-info">
                    {member.ngaySinh} • {member.gioiTinh}
                </span>
            </td>
            <td className="cccd">{member.soCCCD}</td>
            <td className="hide-mobile center">{member.ngaySinh}</td>
            <td className="hide-mobile center">{member.gioiTinh}</td>
            <td className="hide-tablet relation-cell">
                <span className="relation-badge member-badge">{member.quanHeVoiChuHo}</span>
            </td>
            <td className="actions">
                <button
                    className="btn-edit"
                    onClick={() => onEdit(member)}
                    title="Sửa"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button
                    className="btn-delete"
                    onClick={() => onDelete(member)}
                    title="Xóa"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </td>

            <style jsx>{`
                .member-row {
                    background: #f8fafc;
                }
                .member-row:hover td {
                    background: #f1f5f9 !important;
                }
                .member-indicator {
                    color: #9ca3af;
                    font-family: monospace;
                    font-size: 14px;
                }
                .member-name {
                    color: #475569 !important;
                    font-weight: 400 !important;
                    padding-left: 8px;
                }
                .member-badge {
                    background: #e0f2fe !important;
                    color: #0369a1 !important;
                }
            `}</style>
        </tr>
    );
}

// Household Row Component (Chủ hộ)
function HouseholdRow({
    household,
    index,
    isExpanded,
    onToggle,
    onEdit,
    onDelete
}: {
    household: UserRecord;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: (user: UserRecord) => void;
    onDelete: (user: UserRecord) => void;
}) {
    const hasMember = household.members && household.members.length > 0;
    const memberCount = household.members?.length || 0;

    return (
        <>
            <tr className={`household-row ${isExpanded ? 'expanded' : ''}`}>
                <td className="center">{index + 1}</td>
                <td className="name-cell">
                    <div className="name-wrapper">
                        {hasMember && (
                            <button
                                className="expand-btn"
                                onClick={onToggle}
                                title={isExpanded ? 'Thu gọn' : 'Xem thành viên'}
                            >
                                <ChevronIcon isExpanded={isExpanded} />
                            </button>
                        )}
                        <div className="name-content">
                            <span className="name">{household.hoTen}</span>
                            {hasMember && (
                                <span className="member-count">
                                    {memberCount} thành viên
                                </span>
                            )}
                            <span className="mobile-info">
                                {household.ngaySinh} • {household.gioiTinh}
                            </span>
                        </div>
                    </div>
                </td>
                <td className="cccd">{household.soCCCD}</td>
                <td className="hide-mobile center">{household.ngaySinh}</td>
                <td className="hide-mobile center">{household.gioiTinh}</td>
                <td className="hide-tablet relation-cell">
                    <span className="relation-badge owner-badge">{household.quanHeVoiChuHo}</span>
                </td>
                <td className="actions">
                    <button
                        className="btn-edit"
                        onClick={() => onEdit(household)}
                        title="Sửa"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button
                        className="btn-delete"
                        onClick={() => onDelete(household)}
                        title="Xóa"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            </tr>

            {/* Member Rows */}
            {isExpanded && household.members?.map((member) => (
                <MemberRow
                    key={member._id || member.soCCCD}
                    member={member}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}

            <style jsx>{`
                .household-row {
                    background: white;
                }
                .household-row.expanded {
                    background: #fffbeb;
                }
                .household-row.expanded td {
                    border-bottom-color: #fef3c7;
                }
                .household-row:hover td {
                    background: #f8fafc;
                }
                .name-wrapper {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                }
                .expand-btn {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    cursor: pointer;
                    color: #64748b;
                    transition: all 0.2s;
                    margin-top: 2px;
                }
                .expand-btn:hover {
                    background: #e2e8f0;
                    color: #334155;
                }
                .household-row.expanded .expand-btn {
                    background: #fef3c7;
                    border-color: #fde68a;
                    color: #d97706;
                }
                .name-content {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .member-count {
                    display: inline-block;
                    font-size: 11px;
                    color: #6b7280;
                    background: #f3f4f6;
                    padding: 2px 8px;
                    border-radius: 10px;
                    width: fit-content;
                }
                .household-row.expanded .member-count {
                    background: #fef3c7;
                    color: #b45309;
                }
                .relation-cell {
                    white-space: nowrap;
                }
                .relation-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                }
                .owner-badge {
                    background: #dcfce7;
                    color: #166534;
                }
            `}</style>
        </>
    );
}

export default function UserTable({ users, isLoading, onEdit, onDelete }: UserTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

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
                        <th style={{ width: '60px' }}>STT</th>
                        <th>Họ và tên</th>
                        <th>Số CCCD</th>
                        <th className="hide-mobile">Ngày sinh</th>
                        <th className="hide-mobile">Giới tính</th>
                        <th className="hide-tablet">Quan hệ</th>
                        <th style={{ width: '100px' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <HouseholdRow
                            key={user._id || user.client_id}
                            household={user}
                            index={index}
                            isExpanded={expandedRows.has(user._id || user.client_id)}
                            onToggle={() => toggleRow(user._id || user.client_id)}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
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

                .user-table :global(td) {
                    padding: 12px 10px;
                    border-bottom: 1px solid #e5e7eb;
                    color: #475569;
                    vertical-align: top;
                }

                .user-table :global(tr:hover td) {
                    background: #f8fafc;
                }

                .user-table :global(.center) {
                    text-align: center;
                }

                .user-table :global(.name-cell .name) {
                    display: block;
                    font-weight: 500;
                    color: #1f2937;
                }

                .user-table :global(.mobile-info) {
                    display: none;
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 2px;
                }

                .user-table :global(.cccd) {
                    font-family: monospace;
                    font-size: 13px;
                }

                .user-table :global(.actions) {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                }

                .user-table :global(.btn-edit), 
                .user-table :global(.btn-delete) {
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

                .user-table :global(.btn-edit) {
                    background: #eff6ff;
                    color: #2563eb;
                }

                .user-table :global(.btn-edit:hover) {
                    background: #dbeafe;
                }

                .user-table :global(.btn-delete) {
                    background: #fef2f2;
                    color: #dc2626;
                }

                .user-table :global(.btn-delete:hover) {
                    background: #fee2e2;
                }

                @media (max-width: 768px) {
                    :global(.hide-tablet) {
                        display: none;
                    }
                }

                @media (max-width: 640px) {
                    :global(.hide-mobile) {
                        display: none;
                    }

                    .user-table :global(.mobile-info) {
                        display: block;
                    }

                    .user-table th, .user-table :global(td) {
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
