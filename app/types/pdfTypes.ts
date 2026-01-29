// Types for PDF Text Extraction Feature

/**
 * Data structure for extracted text from a single PDF page
 */
export interface PdfPageData {
    pageNumber: number;
    text: string;
}

/**
 * Data structure for complete PDF extraction result
 */
export interface PdfTextData {
    fileName: string;
    totalPages: number;
    pages: PdfPageData[];
    extractedAt: Date;
}

/**
 * Result wrapper for PDF extraction operations
 */
export interface PdfExtractionResult {
    success: boolean;
    data: PdfTextData | null;
    error?: string;
}

/**
 * Upload state for PDF files
 */
export interface UploadedPdf {
    id: string;
    file: File;
    fileName: string;
    extractedData: PdfTextData | null;
    isProcessing: boolean;
    error?: string;
}
