import { NextRequest, NextResponse } from 'next/server';

const API_ENDPOINT = 'https://asia-82692522.phoaify.com/webhook/api/v1/dansu/create_user_v2';

/**
 * POST - Save household data via proxy
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('[Save API Proxy] Sending data to:', API_ENDPOINT);
        console.log('[Save API Proxy] Payload:', JSON.stringify(body, null, 2));

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        console.log('[Save API Proxy] Response:', data);

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data?.message || `HTTP ${response.status}` },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('[Save API Proxy] Error:', error);
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : 'Proxy error' },
            { status: 500 }
        );
    }
}
