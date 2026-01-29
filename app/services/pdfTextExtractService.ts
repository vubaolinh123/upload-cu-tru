import { PdfTextData, PdfPageData, PdfExtractionResult } from '../types/pdfTypes';

/**
 * Client-side PDF Text Extraction Service
 * Uses pdfjs-dist legacy build to extract text from PDF files in the browser
 * NOTE: This module uses dynamic imports to avoid SSR issues
 */

/**
 * Progress callback type for tracking extraction progress
 */
export type ProgressCallback = (message: string, progress?: number) => void;

/**
 * Extract all text from a PDF file
 * Returns text content organized by pages
 */
export async function extractTextFromPdf(
    file: File,
    onProgress?: ProgressCallback
): Promise<PdfExtractionResult> {
    const log = (msg: string, progress?: number) => {
        console.log(`[PDF Extract] ${msg}`);
        onProgress?.(msg, progress);
    };

    // Only run on client-side
    if (typeof window === 'undefined') {
        return {
            success: false,
            data: null,
            error: 'PDF extraction is only available in the browser',
        };
    }

    try {
        log('Đang tải thư viện PDF...', 5);

        // Use legacy build which doesn't require DOMMatrix polyfill
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

        // Set worker from CDN - must match exact version 5.4.530
        // Using unpkg which has the exact version
        pdfjs.GlobalWorkerOptions.workerSrc =
            'https://unpkg.com/pdfjs-dist@5.4.530/legacy/build/pdf.worker.min.mjs';

        log('Đang đọc file PDF...', 10);
        const arrayBuffer = await file.arrayBuffer();

        log('Đang phân tích cấu trúc PDF...', 20);
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        const totalPages = pdf.numPages;
        log(`Tìm thấy ${totalPages} trang`, 25);

        const pages: PdfPageData[] = [];

        for (let i = 1; i <= totalPages; i++) {
            const progressPercent = 25 + Math.floor((i / totalPages) * 60);
            log(`Đang trích xuất trang ${i}/${totalPages}...`, progressPercent);

            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Extract text items and join them
            const textItems: string[] = [];
            for (const item of textContent.items) {
                if ('str' in item && typeof item.str === 'string') {
                    textItems.push(item.str);
                }
            }

            const pageText = textItems.join(' ').replace(/\s+/g, ' ').trim();

            pages.push({
                pageNumber: i,
                text: pageText,
            });
        }

        log('Đang hoàn tất...', 95);

        const pdfData: PdfTextData = {
            fileName: file.name,
            totalPages: pdf.numPages,
            pages,
            extractedAt: new Date(),
        };

        log('Hoàn thành!', 100);

        return {
            success: true,
            data: pdfData,
        };
    } catch (error) {
        console.error('[PDF Extract] Error:', error);
        return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to extract text from PDF',
        };
    }
}

/**
 * Validate if file is a PDF
 */
export function isValidPdfFile(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}
