import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as mupdf from 'mupdf';
import { CT3ARecord } from '../../types/pdfTypes';
import { PDF_OCR_PROMPT, OPENAI_PDF_CONFIG } from '../../lib/pdfOcrConfig';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Convert PDF page to PNG buffer using mupdf
 */
function renderPageToImage(doc: mupdf.Document, pageIndex: number): Buffer {
    const page = doc.loadPage(pageIndex);
    const pixmap = page.toPixmap(
        mupdf.Matrix.scale(2, 2), // 2x scale for better quality
        mupdf.ColorSpace.DeviceRGB,
        false, // no alpha
        true   // with annotations
    );
    const pngBuffer = pixmap.asPNG();
    return Buffer.from(pngBuffer);
}

/**
 * Process a single PDF page with OCR
 * Receives PDF file + pageIndex in FormData (stateless, serverless-compatible)
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('pdf') as File | null;
        const pageIndexStr = formData.get('pageIndex') as string | null;

        // Validate input
        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No PDF file provided' },
                { status: 400 }
            );
        }

        if (pageIndexStr === null || pageIndexStr === undefined) {
            return NextResponse.json(
                { success: false, error: 'Missing pageIndex parameter' },
                { status: 400 }
            );
        }

        const pageIndex = parseInt(pageIndexStr, 10);
        if (isNaN(pageIndex) || pageIndex < 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid pageIndex' },
                { status: 400 }
            );
        }

        // Convert File to Uint8Array
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Open PDF document
        const doc = mupdf.Document.openDocument(uint8Array, 'application/pdf');
        const pageCount = doc.countPages();

        // Validate page index
        if (pageIndex >= pageCount) {
            return NextResponse.json(
                { success: false, error: `Invalid page index: ${pageIndex}. PDF has ${pageCount} pages.` },
                { status: 400 }
            );
        }

        const pageNum = pageIndex + 1;
        console.log(`[PDF-OCR-Page] Processing page ${pageNum}/${pageCount}`);

        // Render page to image
        console.log(`[PDF-OCR-Page] Rendering page ${pageNum}...`);
        const pngBuffer = renderPageToImage(doc, pageIndex);
        const base64Image = pngBuffer.toString('base64');

        // Send to OpenAI for OCR
        console.log(`[PDF-OCR-Page] Sending page ${pageNum} to OpenAI...`);
        const response = await openai.chat.completions.create({
            model: OPENAI_PDF_CONFIG.model,
            max_tokens: OPENAI_PDF_CONFIG.maxTokens,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: PDF_OCR_PROMPT,
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/png;base64,${base64Image}`,
                                detail: 'high',
                            },
                        },
                    ],
                },
            ],
        });

        const content = response.choices[0]?.message?.content || '[]';

        // Parse JSON from response
        let records: CT3ARecord[] = [];
        try {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                records = JSON.parse(jsonMatch[0]);
            }
        } catch (parseError) {
            console.error(`[PDF-OCR-Page] Failed to parse page ${pageNum}:`, parseError);
            return NextResponse.json({
                success: true,
                pageNumber: pageNum,
                records: [],
                error: 'Failed to parse AI response',
            });
        }

        console.log(`[PDF-OCR-Page] Page ${pageNum}: Found ${records.length} records`);

        return NextResponse.json({
            success: true,
            pageNumber: pageNum,
            records,
        });

    } catch (error) {
        console.error('[PDF-OCR-Page] Error:', error);
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
        { success: false, error: 'Method not allowed. Use POST with FormData containing pdf and pageIndex.' },
        { status: 405 }
    );
}
