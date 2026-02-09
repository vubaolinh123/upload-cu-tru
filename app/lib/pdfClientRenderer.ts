/**
 * Client-side PDF to Image renderer using pdfjs-dist
 * Renders PDF pages to base64 PNG images
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure worker (required for pdfjs-dist)
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface PdfInfo {
    pageCount: number;
    fileName: string;
}

export interface RenderedPage {
    pageNumber: number;
    imageBase64: string; // Base64 PNG without data: prefix
}

/**
 * Load PDF and get page count
 */
export async function loadPdfInfo(file: File): Promise<PdfInfo> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    return {
        pageCount: pdf.numPages,
        fileName: file.name,
    };
}

/**
 * Render a single PDF page to base64 PNG
 * @param file - PDF file
 * @param pageIndex - 0-based page index
 * @param scale - Render scale (2 = high quality)
 */
export async function renderPageToImage(
    file: File,
    pageIndex: number,
    scale: number = 2
): Promise<RenderedPage> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pageNumber = pageIndex + 1;
    const page = await pdf.getPage(pageNumber);

    // Get viewport at specified scale
    const viewport = page.getViewport({ scale });

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Failed to get canvas context');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render page to canvas
    await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
    }).promise;

    // Convert to base64 PNG (without data: prefix)
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');

    // Cleanup
    canvas.remove();

    return {
        pageNumber,
        imageBase64: base64,
    };
}

/**
 * Render all pages of a PDF to images
 * (For debugging/testing - not used in production)
 */
export async function renderAllPages(
    file: File,
    scale: number = 2,
    onProgress?: (current: number, total: number) => void
): Promise<RenderedPage[]> {
    const info = await loadPdfInfo(file);
    const pages: RenderedPage[] = [];

    for (let i = 0; i < info.pageCount; i++) {
        const page = await renderPageToImage(file, i, scale);
        pages.push(page);
        onProgress?.(i + 1, info.pageCount);
    }

    return pages;
}
