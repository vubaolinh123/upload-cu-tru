import { NextRequest, NextResponse } from 'next/server';
import { processPdfPageWithGemini } from '../../lib/geminiService';
import { CT3ARecord } from '../../types/pdfTypes';

/**
 * Process a single PDF page image with Gemini Vision OCR
 * Receives base64 PNG image from client-side rendering
 */
export async function POST(request: NextRequest) {
    try {
        // Check API key
        const apiKey = process.env.API_KEY_GEMINI;
        if (!apiKey) {
            console.error('[PDF-OCR-Page] Missing API_KEY_GEMINI');
            return NextResponse.json(
                { success: false, error: 'Server configuration error: Missing API key' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { imageBase64, pageNumber } = body;

        // Validate input
        if (!imageBase64) {
            return NextResponse.json(
                { success: false, error: 'No image provided' },
                { status: 400 }
            );
        }

        if (!pageNumber) {
            return NextResponse.json(
                { success: false, error: 'Missing pageNumber' },
                { status: 400 }
            );
        }

        console.log(`[PDF-OCR-Page] Processing page ${pageNumber} (image size: ${Math.round(imageBase64.length / 1024)}KB)`);

        // Process with Gemini
        const result = await processPdfPageWithGemini(imageBase64, pageNumber);
        const records: CT3ARecord[] = result.records;

        console.log(`[PDF-OCR-Page] Page ${pageNumber}: Found ${records.length} records`);

        return NextResponse.json({
            success: true,
            pageNumber: result.pageNumber,
            records,
        });

    } catch (error) {
        console.error('[PDF-OCR-Page] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'PDF OCR processing failed',
            },
            { status: 500 }
        );
    }
}

// Handle unsupported methods
export async function GET() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST with imageBase64 and pageNumber.' },
        { status: 405 }
    );
}

// Configure route for long-running requests
export const maxDuration = 300; // 5 minutes max
export const dynamic = 'force-dynamic';
