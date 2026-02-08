'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
    title?: string;
}

const NAV_ITEMS = [
    { href: '/', label: 'Upload Ảnh', icon: '📷', mobileLabel: 'Ảnh' },
    { href: '/pdf', label: 'PDF to Excel', icon: '📄', mobileLabel: 'PDF' },
    { href: '/nhap-thu-cong', label: 'Nhập thủ công', icon: '✍️', mobileLabel: 'Nhập' },
    { href: '/quan-ly', label: 'Quản lý', icon: '📊', mobileLabel: 'QL' },
];

export default function Header({ title = 'Phân Tích Cư Trú' }: HeaderProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo and Title */}
                <Link href="/" className="logo-section">
                    <div className="logo-icon">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <span className="logo-text">{title}</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="desktop-nav">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Navigation - Tabs below header */}
            <nav className="mobile-nav">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`mobile-nav-item ${pathname === item.href ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.mobileLabel}</span>
                    </Link>
                ))}
            </nav>

            {/* Mobile Dropdown Menu (alternative) */}
            {mobileMenuOpen && (
                <div className="mobile-dropdown">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`dropdown-item ${pathname === item.href ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            )}

            <style jsx>{`
                .header {
                    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                    color: white;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .header-container {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                    color: white;
                }

                .logo-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                }

                .logo-icon svg {
                    width: 20px;
                    height: 20px;
                }

                .logo-text {
                    font-size: 18px;
                    font-weight: 700;
                }

                /* Desktop Navigation */
                .desktop-nav {
                    display: flex;
                    gap: 12px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 18px;
                    background: rgba(255, 255, 255, 0.15);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 12px;
                    color: white;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.25);
                    border-color: rgba(255, 255, 255, 0.5);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }

                .nav-item.active {
                    background: white;
                    border-color: white;
                    color: #1e40af;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .nav-icon {
                    font-size: 16px;
                }

                /* Mobile Menu Button */
                .mobile-menu-btn {
                    display: none;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    cursor: pointer;
                }

                /* Mobile Navigation - Tabs */
                .mobile-nav {
                    display: none;
                    background: rgba(0, 0, 0, 0.15);
                    padding: 10px 12px;
                    gap: 8px;
                }

                .mobile-nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 10px 18px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid rgba(255, 255, 255, 0.25);
                    border-radius: 10px;
                    color: rgba(255, 255, 255, 0.9);
                    text-decoration: none;
                    font-size: 11px;
                    font-weight: 600;
                    transition: all 0.2s;
                }

                .mobile-nav-item .nav-icon {
                    font-size: 20px;
                }

                .mobile-nav-item:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.4);
                }

                .mobile-nav-item.active {
                    background: rgba(255, 255, 255, 0.25);
                    border-color: rgba(255, 255, 255, 0.5);
                    color: white;
                }

                /* Mobile Dropdown */
                .mobile-dropdown {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: #1e40af;
                    padding: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .dropdown-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .dropdown-item.active {
                    background: rgba(255, 255, 255, 0.2);
                }

                @media (max-width: 768px) {
                    .desktop-nav {
                        display: none;
                    }

                    .mobile-nav {
                        display: flex;
                        justify-content: center;
                        gap: 8px;
                    }

                    .logo-text {
                        font-size: 16px;
                    }
                }

                @media (max-width: 480px) {
                    .header-container {
                        padding: 10px 12px;
                    }

                    .logo-text {
                        display: none;
                    }

                    .mobile-nav-item {
                        padding: 8px 12px;
                    }
                }
            `}</style>
        </header>
    );
}
