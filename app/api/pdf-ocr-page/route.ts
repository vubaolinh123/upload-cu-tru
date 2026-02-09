import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CT3ARecord } from '../../types/pdfTypes';
import { PDF_OCR_PROMPT, OPENAI_PDF_CONFIG } from '../../lib/pdfOcrConfig';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Process a single PDF page image with OCR
 * Receives base64 PNG image from client-side rendering
 */
export async function POST(request: NextRequest) {
    try {
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

        // Send to OpenAI for OCR
        console.log(`[PDF-OCR-Page] Sending page ${pageNumber} to OpenAI...`);
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
                                url: `data:image/png;base64,${imageBase64}`,
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
            console.error(`[PDF-OCR-Page] Failed to parse page ${pageNumber}:`, parseError);
            return NextResponse.json({
                success: true,
                pageNumber,
                records: [],
                error: 'Failed to parse AI response',
            });
        }

        console.log(`[PDF-OCR-Page] Page ${pageNumber}: Found ${records.length} records`);

        return NextResponse.json({
            success: true,
            pageNumber,
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
        { success: false, error: 'Method not allowed. Use POST with imageBase64 and pageNumber.' },
        { status: 405 }
    );
}
