'use client';

import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

export default function Pagination({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    onLimitChange,
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalItems === 0) return null;

    return (
        <div className="pagination">
            <div className="pagination-info">
                Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} -{' '}
                {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}
            </div>

            <div className="pagination-controls">
                <button
                    className="page-btn"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                {getPageNumbers().map((page, idx) => (
                    <button
                        key={idx}
                        className={`page-btn ${page === currentPage ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                        disabled={page === '...'}
                        onClick={() => typeof page === 'number' && onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}

                <button
                    className="page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>

            <div className="limit-select">
                <select
                    value={itemsPerPage}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                >
                    <option value={10}>10 / trang</option>
                    <option value={20}>20 / trang</option>
                    <option value={50}>50 / trang</option>
                </select>
            </div>

            <style jsx>{`
                .pagination {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 0;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .pagination-info {
                    font-size: 13px;
                    color: #6b7280;
                }

                .pagination-controls {
                    display: flex;
                    gap: 4px;
                }

                .page-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 36px;
                    height: 36px;
                    padding: 0 10px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    border-radius: 8px;
                    font-size: 14px;
                    color: #374151;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .page-btn:hover:not(:disabled):not(.dots) {
                    background: #f3f4f6;
                    border-color: #d1d5db;
                }

                .page-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .page-btn.active {
                    background: #2563eb;
                    border-color: #2563eb;
                    color: white;
                }

                .page-btn.dots {
                    border: none;
                    cursor: default;
                }

                .limit-select select {
                    padding: 8px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 13px;
                    color: #374151;
                    background: white;
                    cursor: pointer;
                }

                @media (max-width: 640px) {
                    .pagination {
                        justify-content: center;
                    }

                    .pagination-info {
                        width: 100%;
                        text-align: center;
                    }

                    .page-btn {
                        min-width: 32px;
                        height: 32px;
                        padding: 0 6px;
                        font-size: 13px;
                    }
                }
            `}</style>
        </div>
    );
}
