import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
    children,
    className = '',
    variant = 'default',
    padding = 'md',
}: CardProps) {
    const variants = {
        default: `
      bg-white border border-gray-200
      shadow-sm
    `,
        glass: `
      bg-white/80 backdrop-blur-xl border border-white/20
      shadow-xl shadow-gray-900/5
    `,
        elevated: `
      bg-white border border-gray-100
      shadow-xl shadow-gray-900/10
    `,
    };

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={`
        rounded-2xl transition-all duration-200
        ${variants[variant]}
        ${paddings[padding]}
        ${className}
      `}
        >
            {children}
        </div>
    );
}
