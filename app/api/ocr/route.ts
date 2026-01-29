import { NextRequest, NextResponse } from 'next/server';
import { OPENAI_CONFIG, buildOpenAIRequestBody } from '../../lib/openaiConfig';
import { parseOCRResponse } from '../../lib/openaiParser';

/**
 * API Route to proxy OCR requests to OpenAI
 * Receives image file → converts to base64 → sends to GPT-4o → returns parsed data
 */
export async function POST(request: NextRequest) {
    try {
        // Check API key
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error('[OCR API] Missing OPENAI_API_KEY');
            return NextResponse.json(
                { error: 'Server configuration error: Missing API key' },
                { status: 500 }
            );
        }

        // Get FormData from request
        const formData = await request.formData();
        const imageFile = formData.get('image') as File | null;

        if (!imageFile) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        console.log(`[OCR API] Processing image: ${imageFile.name}, size: ${imageFile.size} bytes`);

        // Convert file to base64
        const arrayBuffer = await imageFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64Image = Buffer.from(binary, 'binary').toString('base64');
        const mimeType = imageFile.type || 'image/jpeg';

        console.log(`[OCR API] Image converted to base64, MIME: ${mimeType}`);

        // Build OpenAI request
        const requestBody = buildOpenAIRequestBody(base64Image, mimeType);

        console.log('[OCR API] Sending request to OpenAI...');

        // Call OpenAI API
        const response = await fetch(OPENAI_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[OCR API] OpenAI error: ${response.status} - ${errorText}`);
            return NextResponse.json(
                { error: `OpenAI API error: ${response.status}` },
                { status: response.status }
            );
        }

        const openaiResponse = await response.json();
        console.log('[OCR API] OpenAI response received');

        // Parse the response to extract person data
        const parsedData = parseOCRResponse(openaiResponse);

        if (!parsedData || parsedData.length === 0) {
            console.error('[OCR API] Failed to parse response');
            return NextResponse.json(
                {
                    error: '0',
                    data: [],
                    Message: 'Không thể đọc dữ liệu từ ảnh',
                    raw: openaiResponse
                },
                { status: 200 }
            );
        }

        console.log(`[OCR API] Parsed ${parsedData.length} persons from image`);

        // Return in same format as before
        return NextResponse.json({
            error: '0',
            data: parsedData,
            Message: 'Thành công'
        });

    } catch (error) {
        console.error('[OCR API] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Proxy error' },
            { status: 500 }
        );
    }
}

// Configure route for long-running requests
export const maxDuration = 300; // 5 minutes max
export const dynamic = 'force-dynamic';
