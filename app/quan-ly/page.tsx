'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/layout';
import { Card } from '../components/ui';
import { UserTable, Pagination, SearchBar, DeleteConfirmModal, EditUserModal } from '../components/management';
import { fetchUsers, deleteUser, updateUser } from '../services/userManagementService';
import { UserRecord } from '../types/userManagementTypes';

export default function QuanLyPage() {
    // State
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Error/Success states
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch users
    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const result = await fetchUsers({
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery,
        });

        if (result.error === 0) {
            setUsers(result.data);
            setTotalUsers(result.total);
        } else {
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        }

        setIsLoading(false);
    }, [currentPage, itemsPerPage, searchQuery]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Handlers
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleLimitChange = useCallback((limit: number) => {
        setItemsPerPage(limit);
        setCurrentPage(1);
    }, []);

    const handleEdit = useCallback((user: UserRecord) => {
        setSelectedUser(user);
        setEditModalOpen(true);
    }, []);

    const handleDelete = useCallback((user: UserRecord) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!selectedUser) return;

        setIsDeleting(true);

        try {
            const result = await deleteUser(selectedUser.client_id);
            console.log('[Page] Delete result:', result);

            // Check for success - handle both number 0 and string "0"
            // Cast to unknown first to allow comparison with both types
            const errorValue = result.error as unknown;
            const isSuccess = errorValue === 0 || errorValue === '0' || !result.error;
            console.log('[Page] Delete isSuccess:', isSuccess);

            if (isSuccess) {
                const userName = selectedUser.hoTen;

                // Close modal first
                setDeleteModalOpen(false);
                setSelectedUser(null);
                setIsDeleting(false);

                // Show success message
                setSuccessMessage(`Đã xóa "${userName}" thành công`);

                // Then refresh list
                await loadUsers();
                console.log('[Page] Delete and refresh complete');
            } else {
                setError(result.message || 'Xóa thất bại. Vui lòng thử lại.');
                setIsDeleting(false);
            }
        } catch (err) {
            console.error('[Page] Delete error:', err);
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
            setIsDeleting(false);
        }
    }, [selectedUser, loadUsers]);

    const handleCancelDelete = useCallback(() => {
        setDeleteModalOpen(false);
        setSelectedUser(null);
    }, []);

    const handleSaveEdit = useCallback(async (data: Partial<UserRecord>) => {
        if (!selectedUser) return;

        setIsSaving(true);
        setError(null); // Clear previous errors

        try {
            const result = await updateUser(selectedUser.client_id, data);
            console.log('[Page] Update result:', result);
            console.log('[Page] result.error:', result.error, 'type:', typeof result.error);

            // Check for success - handle both number 0 and string "0"
            // Cast to unknown first to allow comparison with both types
            const errorValue = result.error as unknown;
            const isSuccess = errorValue === 0 || errorValue === '0' || !result.error;
            console.log('[Page] isSuccess:', isSuccess);

            if (isSuccess) {
                console.log('[Page] Closing modal and refreshing...');
                // Close modal first
                setEditModalOpen(false);
                setSelectedUser(null);
                setIsSaving(false);

                // Show success message
                setSuccessMessage(`Đã cập nhật "${data.hoTen}" thành công`);

                // Then refresh list
                await loadUsers();
                console.log('[Page] Refresh complete');
            } else {
                console.log('[Page] Update failed:', result.message);
                setError(result.message || 'Cập nhật thất bại. Vui lòng thử lại.');
                setIsSaving(false);
            }
        } catch (err) {
            console.error('[Page] Update error:', err);
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
            setIsSaving(false);
        }
    }, [selectedUser, loadUsers]);

    const handleCancelEdit = useCallback(() => {
        setEditModalOpen(false);
        setSelectedUser(null);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <div className="wide-container">
                <div className="page-content">
                    {/* Page Header */}
                    <div className="page-header">
                        <div className="title-section">
                            <h1>📊 Quản lý Dữ liệu Dân số</h1>
                            <p>Xem, sửa và xóa dữ liệu đã lưu</p>
                        </div>
                        <div className="total-badge">
                            Tổng: <strong>{totalUsers}</strong> người
                        </div>
                    </div>

                    {/* Notifications */}
                    {error && (
                        <div className="alert alert-error">
                            <span>{error}</span>
                            <button onClick={() => setError(null)}>×</button>
                        </div>
                    )}

                    {successMessage && (
                        <div className="alert alert-success">
                            <span>{successMessage}</span>
                            <button onClick={() => setSuccessMessage(null)}>×</button>
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="search-section">
                        <SearchBar onSearch={handleSearch} />
                    </div>

                    {/* Data Table */}
                    <Card>
                        <UserTable
                            users={users}
                            isLoading={isLoading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />

                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalUsers}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                            onLimitChange={handleLimitChange}
                        />
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                user={selectedUser}
                isDeleting={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            <EditUserModal
                isOpen={editModalOpen}
                user={selectedUser}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                isSaving={isSaving}
            />

            <style jsx>{`
                .wide-container {
                    width: 80%;
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                .page-content {
                    padding: 24px 0 40px;
                }

                @media (max-width: 1024px) {
                    .wide-container {
                        width: 90%;
                    }
                }

                @media (max-width: 640px) {
                    .wide-container {
                        width: 95%;
                        padding: 0 12px;
                    }
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .title-section h1 {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1e40af;
                    margin: 0 0 4px;
                }

                .title-section p {
                    color: #6b7280;
                    margin: 0;
                }

                .total-badge {
                    padding: 8px 16px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 14px;
                    color: #374151;
                }

                .total-badge strong {
                    color: #2563eb;
                }

                .alert {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border-radius: 10px;
                    margin-bottom: 16px;
                    font-size: 14px;
                }

                .alert-error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                }

                .alert-success {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    color: #16a34a;
                }

                .alert button {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    opacity: 0.7;
                    color: inherit;
                }

                .alert button:hover {
                    opacity: 1;
                }

                .search-section {
                    margin-bottom: 20px;
                }

                @media (max-width: 640px) {
                    .page-header {
                        flex-direction: column;
                    }

                    .title-section h1 {
                        font-size: 24px;
                    }
                }
            `}</style>
        </div>
    );
}
