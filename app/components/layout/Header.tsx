import React from 'react';

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

export default function Header({
    title = 'Phân Tích Ảnh Cư Trú',
    subtitle = 'Upload ảnh danh sách cư trú để tạo biên bản kiểm tra tự động',
}: HeaderProps) {
    return (
        <header className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    {/* Logo and Title */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <svg
                                className="w-6 h-6 sm:w-7 sm:h-7"
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
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                                {title}
                            </h1>
                            <p className="text-blue-100 text-xs hidden sm:block">
                                {subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm text-xs">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        <span className="font-medium">Sẵn sàng</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
