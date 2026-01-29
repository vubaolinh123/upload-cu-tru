import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OPENAI_CONFIG, OCR_PROMPT } from '../../lib/openaiConfig';
import { parseOCRResponseFromSDK } from '../../lib/openaiParser';

/**
 * API Route to proxy OCR requests to OpenAI
 * Using official OpenAI SDK
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

        // Initialize OpenAI client
        const openai = new OpenAI({ apiKey });

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
        const base64Image = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = imageFile.type || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        console.log(`[OCR API] Image converted to base64, MIME: ${mimeType}`);
        console.log('[OCR API] Sending request to OpenAI SDK...');

        // Call OpenAI API using SDK
        const response = await openai.chat.completions.create({
            model: OPENAI_CONFIG.model,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: OCR_PROMPT },
                        {
                            type: 'image_url',
                            image_url: {
                                url: dataUrl,
                                detail: 'high'
                            }
                        },
                    ],
                },
            ],
            max_tokens: OPENAI_CONFIG.maxTokens,
        });

        console.log('[OCR API] OpenAI response received');

        // Parse the response to extract person data
        const parsedData = parseOCRResponseFromSDK(response);

        if (!parsedData || parsedData.length === 0) {
            console.error('[OCR API] Failed to parse response');
            return NextResponse.json(
                {
                    error: '0',
                    data: [],
                    Message: 'Không thể đọc dữ liệu từ ảnh',
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

        // Handle OpenAI specific errors
        if (error instanceof OpenAI.APIError) {
            return NextResponse.json(
                { error: `OpenAI API error: ${error.status} - ${error.message}` },
                { status: error.status || 500 }
            );
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Proxy error' },
            { status: 500 }
        );
    }
}

// Configure route for long-running requests
export const maxDuration = 300; // 5 minutes max
export const dynamic = 'force-dynamic';
