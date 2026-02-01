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

        // Get response text first to handle empty/non-JSON responses
        const responseText = await response.text();
        console.log('[Save API Proxy] Response status:', response.status);
        console.log('[Save API Proxy] Response text:', responseText);

        // Try to parse as JSON, handle empty or non-JSON responses
        let data: Record<string, unknown> | null = null;
        if (responseText && responseText.trim()) {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.warn('[Save API Proxy] Response is not JSON:', parseError);
                // If response is not JSON but request succeeded, treat as success
                if (response.ok) {
                    return NextResponse.json({
                        success: true,
                        message: 'Dữ liệu đã được lưu thành công',
                        rawResponse: responseText
                    });
                }
            }
        }

        // Handle empty response
        if (!data && response.ok) {
            return NextResponse.json({
                success: true,
                message: 'Dữ liệu đã được lưu thành công'
            });
        }

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: data?.message || responseText || `HTTP ${response.status}`
                },
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
