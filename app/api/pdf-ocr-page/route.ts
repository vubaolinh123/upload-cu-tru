import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as mupdf from 'mupdf';
import { CT3ARecord } from '../../types/pdfTypes';
import { PDF_OCR_PROMPT, OPENAI_PDF_CONFIG } from '../../lib/pdfOcrConfig';
import { getSession } from '../../lib/pdfSessionStore';

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
 * This endpoint is designed to complete within ~60 seconds
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, pageIndex } = body;

        // Validate input
        if (!sessionId || pageIndex === undefined) {
            return NextResponse.json(
                { success: false, error: 'Missing sessionId or pageIndex' },
                { status: 400 }
            );
        }

        // Get session
        const session = getSession(sessionId);
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Session not found or expired. Please re-upload the PDF.' },
                { status: 404 }
            );
        }

        // Validate page index
        if (pageIndex < 0 || pageIndex >= session.pageCount) {
            return NextResponse.json(
                { success: false, error: `Invalid page index: ${pageIndex}` },
                { status: 400 }
            );
        }

        const pageNum = pageIndex + 1;
        console.log(`[PDF-OCR-Page] Processing page ${pageNum}/${session.pageCount} for session ${sessionId}`);

        // Open PDF document
        const doc = mupdf.Document.openDocument(session.pdfBuffer, 'application/pdf');

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
        { success: false, error: 'Method not allowed. Use POST with sessionId and pageIndex.' },
        { status: 405 }
    );
}
