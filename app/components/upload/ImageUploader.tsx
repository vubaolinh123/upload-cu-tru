'use client';

import React, { useState, useCallback, useRef } from 'react';
import { validateImageFile } from '../../services/imageAnalysisService';

interface ImageUploaderProps {
    onImageSelect: (file: File, preview: string) => void;
    isDisabled?: boolean;
}

export default function ImageUploader({
    onImageSelect,
    isDisabled = false,
}: ImageUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(
        (file: File) => {
            setError(null);
            const validation = validateImageFile(file);

            if (!validation.valid) {
                setError(validation.error || 'File không hợp lệ');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = e.target?.result as string;
                onImageSelect(file, preview);
            };
            reader.readAsDataURL(file);
        },
        [onImageSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        },
        [handleFile]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                handleFile(files[0]);
            }
        },
        [handleFile]
    );

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full">
            <div
                onClick={!isDisabled ? handleClick : undefined}
                onDragOver={!isDisabled ? handleDragOver : undefined}
                onDragLeave={!isDisabled ? handleDragLeave : undefined}
                onDrop={!isDisabled ? handleDrop : undefined}
                className={`
          relative w-full min-h-[300px] sm:min-h-[400px]
          border-2 border-dashed rounded-2xl
          flex flex-col items-center justify-center
          transition-all duration-300 ease-out
          ${isDisabled
                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                        : isDragOver
                            ? 'bg-blue-50 border-blue-500 scale-[1.02]'
                            : 'bg-gradient-to-br from-gray-50 to-blue-50 border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer'
                    }
        `}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                {/* Icon */}
                <div
                    className={`
            p-6 rounded-full mb-6 transition-all duration-300
            ${isDragOver ? 'bg-blue-500 scale-110' : 'bg-blue-100'}
          `}
                >
                    <svg
                        className={`w-12 h-12 sm:w-16 sm:h-16 transition-colors ${isDragOver ? 'text-white' : 'text-blue-600'
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                </div>

                {/* Text */}
                <div className="text-center px-4">
                    <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                        {isDragOver ? 'Thả ảnh vào đây!' : 'Kéo thả ảnh vào đây'}
                    </p>
                    <p className="text-sm sm:text-base text-gray-500 mb-4">
                        hoặc{' '}
                        <span className="text-blue-600 font-medium hover:underline">
                            chọn từ máy tính
                        </span>
                    </p>
                    <p className="text-xs text-gray-400">
                        Hỗ trợ: JPG, PNG, WebP, GIF • Tối đa 10MB
                    </p>
                </div>

                {/* Hidden Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={isDisabled}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <svg
                        className="w-5 h-5 text-red-500 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}
        </div>
    );
}
