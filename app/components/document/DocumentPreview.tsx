'use client';

import React, { useState } from 'react';
import { ResidenceDocument, PersonInfo } from '../../types/residence';
import ResidenceReportTemplate from './ResidenceReportTemplate';

interface DocumentPreviewProps {
    data: ResidenceDocument;
    accumulatedPersons: PersonInfo[];
}

export default function DocumentPreview({ data, accumulatedPersons }: DocumentPreviewProps) {
    const [scale, setScale] = useState(1);

    const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 1.5));
    const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));
    const resetZoom = () => setScale(1);

    return (
        <div className="w-full h-full flex flex-col">
            {/* Zoom Controls */}
            <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 rounded-t-xl flex-shrink-0">
                <button
                    onClick={zoomOut}
                    className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    title="Thu nhỏ"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>
                <button
                    onClick={resetZoom}
                    className="px-3 py-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-xs font-medium"
                >
                    {Math.round(scale * 100)}%
                </button>
                <button
                    onClick={zoomIn}
                    className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    title="Phóng to"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                <span className="text-xs text-gray-500 ml-2">
                    ({accumulatedPersons.length} nhân khẩu)
                </span>
            </div>

            {/* Document Container with Scroll - takes remaining height */}
            <div className="flex-1 overflow-auto border border-gray-200 border-t-0 rounded-b-xl bg-gray-50 p-3">
                <div
                    className="transition-transform duration-200 origin-top"
                    style={{ transform: `scale(${scale})` }}
                >
                    <ResidenceReportTemplate data={data} accumulatedPersons={accumulatedPersons} />
                </div>
            </div>
        </div>
    );
}
