'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for localStorage-backed persistent state
 * SSR-safe with useEffect hydration
 * 
 * @param key - localStorage key
 * @param initialValue - default value if nothing in storage
 * @returns [value, setValue, clearValue]
 */
export function usePersistedState<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    // Initialize with initialValue for SSR
    const [state, setState] = useState<T>(initialValue);
    const [isHydrated, setIsHydrated] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                setState(parsed);
            }
        } catch (error) {
            console.warn(`[usePersistedState] Failed to load "${key}":`, error);
        }
        setIsHydrated(true);
    }, [key]);

    // Save to localStorage when state changes (after hydration)
    useEffect(() => {
        if (!isHydrated) return;

        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.warn(`[usePersistedState] Failed to save "${key}":`, error);
            // Handle quota exceeded
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.error('[usePersistedState] Storage quota exceeded');
            }
        }
    }, [key, state, isHydrated]);

    // Clear value from storage
    const clearValue = useCallback(() => {
        try {
            localStorage.removeItem(key);
            setState(initialValue);
        } catch (error) {
            console.warn(`[usePersistedState] Failed to clear "${key}":`, error);
        }
    }, [key, initialValue]);

    return [state, setState, clearValue];
}

/**
 * Type for persisted image upload data
 */
export interface PersistedImageData {
    uploadedImages: Array<{
        id: string;
        preview: string;
        extractedDataCount: number;
    }>;
    accumulatedPersons: unknown[];
    timestamp: number;
}

/**
 * Type for persisted PDF data
 */
export interface PersistedPdfData {
    records: unknown[];
    fileName: string;
    totalPages: number;
    timestamp: number;
}
