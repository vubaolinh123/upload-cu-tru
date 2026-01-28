import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'blue' | 'white' | 'gray';
    text?: string;
}

export default function LoadingSpinner({
    size = 'md',
    color = 'blue',
    text,
}: LoadingSpinnerProps) {
    const sizes = {
        sm: 'h-6 w-6',
        md: 'h-10 w-10',
        lg: 'h-16 w-16',
        xl: 'h-24 w-24',
    };

    const colors = {
        blue: 'text-blue-600',
        white: 'text-white',
        gray: 'text-gray-600',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                {/* Outer ring */}
                <div
                    className={`
            ${sizes[size]} rounded-full
            border-4 border-gray-200
          `}
                />
                {/* Spinning part */}
                <div
                    className={`
            absolute top-0 left-0
            ${sizes[size]} rounded-full
            border-4 border-transparent
            border-t-current ${colors[color]}
            animate-spin
          `}
                />
                {/* Pulsing center */}
                <div
                    className={`
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            w-2 h-2 rounded-full bg-current ${colors[color]}
            animate-pulse
          `}
                />
            </div>
            {text && (
                <p className={`text-sm font-medium ${colors[color]} animate-pulse`}>
                    {text}
                </p>
            )}
        </div>
    );
}
