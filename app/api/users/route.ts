import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://asia-82692522.phoaify.com/webhook';

/**
 * GET - Fetch users with pagination and keyword search
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '10';
        const keyword = searchParams.get('keyword') || '';

        let url = `${API_BASE}/api/v1/dansu/get_user_v2?page=${page}&limit=${limit}`;
        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }

        console.log('[User API Proxy] GET:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('[User API Proxy] Error:', error);
        return NextResponse.json(
            { error: 1, data: [], total: 0, message: 'Proxy error' },
            { status: 500 }
        );
    }
}

/**
 * PUT - Update user by client_id
 */
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { client_id, households } = body;

        if (!client_id) {
            return NextResponse.json(
                { error: 1, message: 'client_id is required' },
                { status: 400 }
            );
        }

        console.log('[User API Proxy] PUT:', client_id);

        const response = await fetch(`${API_BASE}/api/v1/dansu/update_user_v2`, {
            method: 'POST', // API uses POST for update
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ client_id, households }),
        });

        const data = await response.json();

        console.log('[User API Proxy] Update response:', data);

        return NextResponse.json(data);
    } catch (error) {
        console.error('[User API Proxy] Update error:', error);
        return NextResponse.json(
            { error: 1, message: 'Proxy error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE - Remove user by client_id
 */
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { client_id } = body;

        if (!client_id) {
            return NextResponse.json(
                { error: 1, message: 'client_id is required' },
                { status: 400 }
            );
        }

        console.log('[User API Proxy] DELETE:', client_id);

        const response = await fetch(`${API_BASE}/api/v1/dansu/remove`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ client_id }),
        });

        const data = await response.json();

        console.log('[User API Proxy] Delete response:', data);

        return NextResponse.json(data);
    } catch (error) {
        console.error('[User API Proxy] Delete error:', error);
        return NextResponse.json(
            { error: 1, message: 'Proxy error' },
            { status: 500 }
        );
    }
}
