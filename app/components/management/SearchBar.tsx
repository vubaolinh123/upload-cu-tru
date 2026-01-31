'use client';

import React, { useState, useCallback } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export default function SearchBar({
    onSearch,
    placeholder = 'Tìm theo tên hoặc CCCD...'
}: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    }, [query, onSearch]);

    const handleClear = useCallback(() => {
        setQuery('');
        onSearch('');
    }, [onSearch]);

    return (
        <form className="search-bar" onSubmit={handleSubmit}>
            <div className="search-input-wrapper">
                <svg
                    className="search-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="search-input"
                />
                {query && (
                    <button
                        type="button"
                        className="clear-btn"
                        onClick={handleClear}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
            </div>
            <button type="submit" className="search-btn">
                Tìm kiếm
            </button>

            <style jsx>{`
                .search-bar {
                    display: flex;
                    gap: 12px;
                    width: 100%;
                    max-width: 500px;
                }

                .search-input-wrapper {
                    position: relative;
                    flex: 1;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                    pointer-events: none;
                }

                .search-input {
                    width: 100%;
                    padding: 10px 40px 10px 42px;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 14px;
                    color: #1f2937;
                    transition: all 0.2s;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                .search-input::placeholder {
                    color: #9ca3af;
                }

                .clear-btn {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: #f3f4f6;
                    border-radius: 50%;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .clear-btn:hover {
                    background: #e5e7eb;
                    color: #374151;
                }

                .search-btn {
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .search-btn:hover {
                    background: linear-gradient(135deg, #1d4ed8, #1e40af);
                    transform: translateY(-1px);
                }

                @media (max-width: 480px) {
                    .search-bar {
                        flex-direction: column;
                    }

                    .search-btn {
                        width: 100%;
                    }
                }
            `}</style>
        </form>
    );
}
