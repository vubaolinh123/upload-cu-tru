'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImagePreviewProps {
    src: string;
    fileName?: string;
    onRemove: () => void;
    isProcessing?: boolean;
}

/**
 * Format elapsed time as mm:ss
 */
function formatElapsedTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function ImagePreview({
    src,
    fileName,
    onRemove,
    isProcessing = false,
}: ImagePreviewProps) {
    const [elapsedTime, setElapsedTime] = useState(0);

    // Timer for elapsed time when processing
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isProcessing) {
            setElapsedTime(0);
            interval = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        } else {
            setElapsedTime(0);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isProcessing]);

    return (
        <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100 shadow-xl">
            {/* Image Container */}
            <div className="relative aspect-auto min-h-[300px] max-h-[500px]">
                <Image
                    src={src}
                    alt={fileName || 'Uploaded image'}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Processing Overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center text-white px-6">
                            {/* Spinner */}
                            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />

                            {/* Status text */}
                            <p className="text-lg font-medium mb-2">
                                Đang phân tích ảnh...
                            </p>

                            {/* Elapsed time */}
                            <p className="text-3xl font-mono font-bold text-blue-300 mb-3">
                                {formatElapsedTime(elapsedTime)}
                            </p>

                            {/* Warning message */}
                            <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg px-4 py-2 max-w-xs mx-auto">
                                <p className="text-yellow-300 text-sm">
                                    ⏳ API có thể mất 2-5 phút để xử lý
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-medium text-sm truncate max-w-[200px] sm:max-w-[300px]">
                                {fileName || 'Ảnh đã upload'}
                            </p>
                            <p className="text-white/70 text-xs">
                                {isProcessing ? 'Đang xử lý...' : 'Sẵn sàng xử lý'}
                            </p>
                        </div>
                    </div>

                    {/* Remove Button */}
                    {!isProcessing && (
                        <button
                            onClick={onRemove}
                            className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors backdrop-blur-sm group"
                            title="Xóa ảnh"
                        >
                            <svg
                                className="w-5 h-5 text-white group-hover:scale-110 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
