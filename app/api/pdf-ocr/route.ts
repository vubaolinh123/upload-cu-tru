import { NextRequest, NextResponse } from 'next/server';
import * as mupdf from 'mupdf';

// Maximum file size: 7MB
const MAX_FILE_SIZE = 7 * 1024 * 1024;

/**
 * Validate PDF and return page count
 * No session storage - each page request will send the PDF again (serverless-compatible)
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('pdf') as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No PDF file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json(
                { success: false, error: 'File must be a PDF' },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: 'File quá lớn. Vui lòng chọn file nhỏ hơn 7MB.' },
                { status: 400 }
            );
        }

        console.log(`[PDF-OCR] Reading file: ${file.name}, size: ${file.size} bytes`);

        // Convert File to Uint8Array
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Open PDF with mupdf to get page count
        console.log('[PDF-OCR] Opening PDF with mupdf...');
        const doc = mupdf.Document.openDocument(uint8Array, 'application/pdf');
        const pageCount = doc.countPages();

        console.log(`[PDF-OCR] PDF has ${pageCount} pages`);

        if (pageCount === 0) {
            return NextResponse.json(
                { success: false, error: 'PDF has no pages' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            fileName: file.name,
            pageCount,
            message: `PDF validated successfully. Found ${pageCount} pages.`,
        });

    } catch (error) {
        console.error('[PDF-OCR] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
            },
            { status: 500 }
        );
    }
}

// Handle unsupported methods
export async function GET() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to upload PDF.' },
        { status: 405 }
    );
}
