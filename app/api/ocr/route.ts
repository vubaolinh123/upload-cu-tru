import { NextRequest, NextResponse } from 'next/server';
import { processImageWithGemini } from '../../lib/geminiService';

/**
 * API Route to process image OCR using Gemini Vision API
 */
export async function POST(request: NextRequest) {
    try {
        // Check API key
        const apiKey = process.env.API_KEY_GEMINI;
        if (!apiKey) {
            console.error('[OCR API] Missing API_KEY_GEMINI');
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
        const base64Image = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = imageFile.type || 'image/jpeg';

        console.log(`[OCR API] Image converted to base64, MIME: ${mimeType}`);
        console.log('[OCR API] Sending request to Gemini Vision API...');

        // Process with Gemini
        const parsedData = await processImageWithGemini(base64Image, mimeType);

        if (!parsedData || parsedData.length === 0) {
            console.error('[OCR API] No data parsed from image');
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

        // Return in same format as before for compatibility
        return NextResponse.json({
            error: '0',
            data: parsedData,
            Message: 'Thành công'
        });

    } catch (error) {
        console.error('[OCR API] Error:', error);

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'OCR processing failed' },
            { status: 500 }
        );
    }
}

// Configure route for long-running requests
export const maxDuration = 300; // 5 minutes max
export const dynamic = 'force-dynamic';
