"use client";

import { ReactNode } from 'react';

interface AdWrapperProps {
    children: ReactNode;
    position?: 'top' | 'bottom' | 'inline';
    showLabel?: boolean;
    className?: string;
}

/**
 * Ad Wrapper Component
 * Wraps ads with proper styling and optional "Advertisement" label
 */
export function AdWrapper({
    children,
    position = 'inline',
    showLabel = true,
    className = ''
}: AdWrapperProps) {
    const positionClasses = {
        top: 'mb-4',
        bottom: 'mt-4',
        inline: 'my-4'
    };

    return (
        <div className={`ad-wrapper ${positionClasses[position]} ${className}`}>
            {showLabel && (
                <p className="text-xs text-gray-400 text-center mb-1 uppercase tracking-wider">
                    Advertisement
                </p>
            )}
            <div className="ad-content bg-gray-50/50 rounded-xl p-2 border border-gray-100/50">
                {children}
            </div>
        </div>
    );
}

/**
 * Placeholder Ad - Shows during development or when ads are disabled
 */
export function PlaceholderAd({
    type = 'banner',
    className = ''
}: {
    type?: 'banner' | 'rectangle' | 'inline';
    className?: string;
}) {
    const sizes = {
        banner: 'h-[90px]',
        rectangle: 'h-[250px] max-w-[300px]',
        inline: 'h-[100px]'
    };

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className={`placeholder-ad ${sizes[type]} ${className} bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300`}>
            <div className="text-center">
                <p className="text-gray-500 text-sm font-medium">Ad Placeholder</p>
                <p className="text-gray-400 text-xs">{type.toUpperCase()}</p>
            </div>
        </div>
    );
}
