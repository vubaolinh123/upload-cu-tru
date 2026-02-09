/**
 * Gemini Vision API Service
 * Handles image and PDF OCR processing using Gemini
 */

import { getGeminiClient, GEMINI_CONFIG, IMAGE_OCR_PROMPT, PDF_OCR_PROMPT } from './geminiConfig';

export interface ImageOCRRecord {
    stt: number;
    hoTen: string | null;
    soCCCD: string | null;
    ngaySinh: string | null;
    gioiTinh: string | null;
    queQuan: string | null;
    danToc: string | null;
    quocTich: string | null;
    quanHeVoiChuHo: string | null;
    oDauDen: string | null;
    hoKhauThuongTru: string | null;
}

export interface PDFOCRRecord {
    sttChinh: number | null;
    sttTrongHo: number;
    hoTen: string | null;
    soDDCN_CCCD: string | null;
    ngaySinh: string | null;
    gioiTinh: string | null;
    queQuan: string | null;
    danToc: string | null;
    quocTich: string | null;
    soHSCT: string | null;
    quanHeVoiChuHo: string | null;
    oDauDen: string | null;
    ngayDen: string | null;
    diaChiThuongTru: string | null;
}

/**
 * Process an image with Gemini Vision for OCR
 * @param imageBase64 - Base64 encoded image (without data: prefix)
 * @param mimeType - Image MIME type (e.g., 'image/png', 'image/jpeg')
 * @returns Array of OCR records
 */
export async function processImageWithGemini(
    imageBase64: string,
    mimeType: string = 'image/png'
): Promise<ImageOCRRecord[]> {
    console.log(`[Gemini] Processing image (size: ${Math.round(imageBase64.length / 1024)}KB, type: ${mimeType})...`);

    try {
        const client = getGeminiClient();

        const response = await client.models.generateContent({
            model: GEMINI_CONFIG.model,
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: IMAGE_OCR_PROMPT },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: imageBase64,
                            },
                        },
                    ],
                },
            ],
            config: {
                maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
                responseMimeType: GEMINI_CONFIG.responseMimeType,
            },
        });

        const content = response.text || '[]';
        console.log(`[Gemini] Response received, parsing JSON...`);

        return parseJSONFromResponse<ImageOCRRecord>(content);
    } catch (error) {
        console.error('[Gemini] Error processing image:', error);
        throw error;
    }
}

/**
 * Process a PDF page image with Gemini Vision for OCR
 * @param imageBase64 - Base64 encoded image (without data: prefix)
 * @param pageNumber - Page number for logging
 * @returns Object with pageNumber and records array
 */
export async function processPdfPageWithGemini(
    imageBase64: string,
    pageNumber: number
): Promise<{ pageNumber: number; records: PDFOCRRecord[] }> {
    console.log(`[Gemini] Processing PDF page ${pageNumber} (size: ${Math.round(imageBase64.length / 1024)}KB)...`);

    const MAX_RETRIES = 3;
    const INITIAL_DELAY_MS = 2000; // 2 seconds

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const client = getGeminiClient();

            const response = await client.models.generateContent({
                model: GEMINI_CONFIG.model,
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: PDF_OCR_PROMPT },
                            {
                                inlineData: {
                                    mimeType: 'image/png',
                                    data: imageBase64,
                                },
                            },
                        ],
                    },
                ],
                config: {
                    maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
                    responseMimeType: GEMINI_CONFIG.responseMimeType,
                },
            });

            const content = response.text || '[]';
            console.log(`[Gemini] Page ${pageNumber} response received, parsing JSON...`);

            const records = parseJSONFromResponse<PDFOCRRecord>(content);
            console.log(`[Gemini] Page ${pageNumber}: Found ${records.length} records`);

            return {
                pageNumber,
                records,
            };
        } catch (error: unknown) {
            const isRateLimitError = error instanceof Error &&
                (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'));

            if (isRateLimitError && attempt < MAX_RETRIES) {
                const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
                console.warn(`[Gemini] Page ${pageNumber}: Rate limited, retrying in ${delayMs / 1000}s (attempt ${attempt}/${MAX_RETRIES})...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                continue;
            }

            console.error(`[Gemini] Error processing PDF page ${pageNumber}:`, error);
            throw error;
        }
    }

    throw new Error(`Failed to process page ${pageNumber} after ${MAX_RETRIES} retries`);
}

/**
 * Parse JSON array from Gemini response text
 * Handles various response formats including markdown code blocks
 */
function parseJSONFromResponse<T>(content: string): T[] {
    try {
        // Step 1: Remove markdown code block delimiters if present
        let cleanedContent = content;

        // Remove ```json or ``` at the start
        cleanedContent = cleanedContent.replace(/^```(?:json)?\s*/i, '');
        // Remove ``` at the end
        cleanedContent = cleanedContent.replace(/\s*```\s*$/i, '');

        // Trim whitespace
        cleanedContent = cleanedContent.trim();

        // Step 2: Try to parse the cleaned content directly
        try {
            const parsed = JSON.parse(cleanedContent);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch {
            // Continue to fallback methods
        }

        // Step 3: Try to find JSON array in the content
        const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch {
                // JSON might be truncated, try to extract complete objects
            }
        }

        // Step 4: Handle truncated JSON - extract complete objects
        const arrayStart = cleanedContent.indexOf('[');
        if (arrayStart !== -1) {
            const jsonPart = cleanedContent.substring(arrayStart);

            // Find all complete objects by matching balanced braces
            const completeObjects: T[] = [];
            let depth = 0;
            let objectStart = -1;

            for (let i = 0; i < jsonPart.length; i++) {
                const char = jsonPart[i];
                if (char === '{') {
                    if (depth === 0) objectStart = i;
                    depth++;
                } else if (char === '}') {
                    depth--;
                    if (depth === 0 && objectStart !== -1) {
                        try {
                            const objStr = jsonPart.substring(objectStart, i + 1);
                            const obj = JSON.parse(objStr);
                            completeObjects.push(obj);
                        } catch {
                            // Skip malformed object
                        }
                        objectStart = -1;
                    }
                }
            }

            if (completeObjects.length > 0) {
                console.log(`[Gemini] Recovered ${completeObjects.length} complete objects from truncated response`);
                return completeObjects;
            }
        }

        console.warn('[Gemini] Could not parse any JSON from response');
        return [];
    } catch (parseError) {
        console.error('[Gemini] Failed to parse JSON response:', parseError);
        console.error('[Gemini] Raw content:', content.substring(0, 500));
        return [];
    }
}
