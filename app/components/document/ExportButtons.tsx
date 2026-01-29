'use client';

import React from 'react';
import Button from '../ui/Button';

interface ExportButtonsProps {
    onExportPDF: () => void;
    onExportExcel: () => void;
    onPrint: () => void;
    isExporting?: boolean;
    onContinueUpload: () => void;
    uploadCount: number;
}

export default function ExportButtons({
    onExportPDF,
    onExportExcel,
    onPrint,
    isExporting = false,
    onContinueUpload,
    uploadCount,
}: ExportButtonsProps) {
    return (
        <div className="flex flex-col gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            {/* Upload count info */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Đã upload: <strong className="text-blue-600">{uploadCount}</strong> ảnh</span>
            </div>

            {/* Buttons row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {/* Continue Upload Button - Primary action */}
                <Button
                    variant="primary"
                    size="md"
                    onClick={onContinueUpload}
                    disabled={isExporting}
                    leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    }
                    className="w-full sm:w-auto"
                >
                    Tiếp tục Upload
                </Button>

                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-gray-300" />

                {/* Export PDF Button */}
                <Button
                    variant="outline"
                    size="md"
                    onClick={onExportPDF}
                    isLoading={isExporting}
                    leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    className="w-full sm:w-auto"
                >
                    Xuất PDF
                </Button>

                {/* Export Excel Button */}
                <Button
                    variant="outline"
                    size="md"
                    onClick={onExportExcel}
                    disabled={isExporting}
                    leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    className="w-full sm:w-auto bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                >
                    Xuất Excel
                </Button>

                {/* Print Button */}
                <Button
                    variant="ghost"
                    size="md"
                    onClick={onPrint}
                    disabled={isExporting}
                    leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                    }
                    className="w-full sm:w-auto"
                >
                    In biên bản
                </Button>
            </div>
        </div>
    );
}
