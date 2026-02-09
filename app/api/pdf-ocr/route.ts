import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import * as mupdf from 'mupdf';
import { CT3ARecord } from '../../types/pdfTypes';
import { PDF_OCR_PROMPT, OPENAI_PDF_CONFIG } from '../../lib/pdfOcrConfig';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Maximum file size: 7MB
const MAX_FILE_SIZE = 7 * 1024 * 1024;

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
 * Helper to create SSE message
 */
function createSSEMessage(data: object): string {
    return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
    const encoder = new TextEncoder();

    // Create a readable stream for SSE
    const stream = new ReadableStream({
        async start(controller) {
            try {
                const formData = await request.formData();
                const file = formData.get('pdf') as File | null;

                if (!file) {
                    controller.enqueue(encoder.encode(createSSEMessage({
                        type: 'error',
                        error: 'No PDF file provided'
                    })));
                    controller.close();
                    return;
                }

                // Validate file type
                if (!file.name.toLowerCase().endsWith('.pdf')) {
                    controller.enqueue(encoder.encode(createSSEMessage({
                        type: 'error',
                        error: 'File must be a PDF'
                    })));
                    controller.close();
                    return;
                }

                // Validate file size (7MB limit)
                if (file.size > MAX_FILE_SIZE) {
                    controller.enqueue(encoder.encode(createSSEMessage({
                        type: 'error',
                        error: 'File quá lớn. Vui lòng chọn file nhỏ hơn 7MB.'
                    })));
                    controller.close();
                    return;
                }

                console.log(`[PDF-OCR] Processing file: ${file.name}, size: ${file.size} bytes`);

                // Send initial progress
                controller.enqueue(encoder.encode(createSSEMessage({
                    type: 'progress',
                    message: 'Đang mở file PDF...',
                    progress: 5,
                    currentPage: 0,
                    totalPages: 0
                })));

                // Convert File to ArrayBuffer
                const arrayBuffer = await file.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);

                // Open PDF with mupdf
                console.log('[PDF-OCR] Opening PDF with mupdf...');
                const doc = mupdf.Document.openDocument(uint8Array, 'application/pdf');
                const pageCount = doc.countPages();

                console.log(`[PDF-OCR] PDF has ${pageCount} pages`);

                if (pageCount === 0) {
                    controller.enqueue(encoder.encode(createSSEMessage({
                        type: 'error',
                        error: 'PDF has no pages'
                    })));
                    controller.close();
                    return;
                }

                // Send page count info
                controller.enqueue(encoder.encode(createSSEMessage({
                    type: 'progress',
                    message: `Tìm thấy ${pageCount} trang. Bắt đầu xử lý...`,
                    progress: 10,
                    currentPage: 0,
                    totalPages: pageCount
                })));

                // Process each page with OpenAI Vision
                const allRecords: CT3ARecord[] = [];
                const pageResults: { pageNumber: number; records: CT3ARecord[]; error?: string }[] = [];

                for (let i = 0; i < pageCount; i++) {
                    const pageNum = i + 1;
                    const progressPercent = 10 + Math.floor((i / pageCount) * 85);

                    // Send rendering progress
                    controller.enqueue(encoder.encode(createSSEMessage({
                        type: 'progress',
                        message: `Đang xử lý trang ${pageNum}/${pageCount}...`,
                        progress: progressPercent,
                        currentPage: pageNum,
                        totalPages: pageCount
                    })));

                    console.log(`[PDF-OCR] Rendering page ${pageNum}/${pageCount}...`);

                    try {
                        // Render page to PNG
                        const pngBuffer = renderPageToImage(doc, i);
                        const base64Image = pngBuffer.toString('base64');

                        console.log(`[PDF-OCR] Sending page ${pageNum} to OpenAI...`);

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
                            console.error(`[PDF-OCR] Failed to parse page ${pageNum}:`, parseError);
                            pageResults.push({
                                pageNumber: pageNum,
                                records: [],
                                error: 'Failed to parse AI response',
                            });
                            continue;
                        }

                        console.log(`[PDF-OCR] Page ${pageNum}: Found ${records.length} records`);

                        pageResults.push({
                            pageNumber: pageNum,
                            records,
                        });
                        allRecords.push(...records);

                        // Send page completion update
                        controller.enqueue(encoder.encode(createSSEMessage({
                            type: 'page_complete',
                            pageNumber: pageNum,
                            recordsFound: records.length,
                            totalRecordsSoFar: allRecords.length
                        })));

                    } catch (pageError) {
                        console.error(`[PDF-OCR] Error processing page ${pageNum}:`, pageError);
                        pageResults.push({
                            pageNumber: pageNum,
                            records: [],
                            error: pageError instanceof Error ? pageError.message : 'Unknown error',
                        });
                    }
                }

                console.log(`[PDF-OCR] Completed. Total records: ${allRecords.length}`);

                // Send final result
                controller.enqueue(encoder.encode(createSSEMessage({
                    type: 'complete',
                    success: true,
                    fileName: file.name,
                    totalPages: pageCount,
                    pages: pageResults,
                    allRecords,
                })));

            } catch (error) {
                console.error('[PDF-OCR] Error:', error);
                controller.enqueue(encoder.encode(createSSEMessage({
                    type: 'error',
                    error: error instanceof Error ? error.message : 'Internal server error'
                })));
            } finally {
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

// Handle unsupported methods
export async function GET() {
    return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed. Use POST to upload PDF.' }),
        {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}
