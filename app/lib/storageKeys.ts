/**
 * Centralized storage keys for localStorage persistence
 */
export const STORAGE_KEYS = {
    /** Image upload page data */
    IMAGE_UPLOAD_DATA: 'upload-anh:image-data',
    /** PDF upload page data */
    PDF_UPLOAD_DATA: 'upload-anh:pdf-data',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
