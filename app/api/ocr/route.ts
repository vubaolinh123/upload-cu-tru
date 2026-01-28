import { NextRequest, NextResponse } from 'next/server';

const OCR_API_URL = 'https://asia-82692522.n8nhosting.cloud/webhook/api/v1/heoquay/ocr';

/**
 * API Route to proxy OCR requests
 * Bypasses CORS by making server-side request
 */
export async function POST(request: NextRequest) {
    try {
        // Get FormData from request
        const formData = await request.formData();
        const imageFile = formData.get('image');

        if (!imageFile) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        // Create new FormData for external API
        const externalFormData = new FormData();
        externalFormData.append('image', imageFile);

        console.log('[OCR Proxy] Forwarding request to external API...');

        // Forward request to external OCR API
        const response = await fetch(OCR_API_URL, {
            method: 'POST',
            body: externalFormData,
        });

        if (!response.ok) {
            console.error(`[OCR Proxy] External API error: ${response.status}`);
            return NextResponse.json(
                { error: `External API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('[OCR Proxy] Response received successfully');

        return NextResponse.json(data);
    } catch (error) {
        console.error('[OCR Proxy] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Proxy error' },
            { status: 500 }
        );
    }
}

// Configure route to handle long-running requests
export const maxDuration = 300; // 5 minutes max for Vercel
export const dynamic = 'force-dynamic';
