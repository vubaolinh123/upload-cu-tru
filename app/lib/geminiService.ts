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

type GeminiRequestType = 'image' | 'pdf-page';

const geminiTokenStats = {
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    totalTokens: 0,
    totalRequests: 0,
    imageRequests: 0,
    pdfPageRequests: 0,
};

const EMPTY_VALUE_REGEX = /^(null|undefined|n\/a|na)$/i;
const DATE_VALUE_REGEX = /^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/;

const KNOWN_NATIONALITIES = new Set([
    'viet nam',
    'vietnam',
    'vn',
    'lao',
    'campuchia',
    'cambodia',
    'thai lan',
    'trung quoc',
    'han quoc',
    'nhat ban',
    'hoa ky',
    'my',
    'duc',
    'phap',
    'nga',
    'anh',
    'uc',
    'canada',
    'singapore',
    'malaysia',
    'indonesia',
    'philippines',
    'an do',
    'india',
    'khong quoc tich',
]);

const ADDRESS_STRONG_MARKERS = [
    'duong',
    'so nha',
    'hem',
    'ngo',
    'ngach',
    'can ho',
    'chung cu',
    'toa',
    'khu pho',
    'ap',
    'thon',
    'xom',
    'to dan pho',
];

const ADDRESS_LOCATION_MARKERS = [
    'phuong',
    'xa',
    'quan',
    'huyen',
    'tinh',
    'thanh pho',
    'tp',
];

function normalizeVietnameseText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .toLowerCase()
        .replace(/[.,;:]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeNullableString(value: unknown): string | null {
    if (value === null || value === undefined) {
        return null;
    }

    const normalized = String(value).trim();
    if (!normalized || EMPTY_VALUE_REGEX.test(normalized)) {
        return null;
    }

    return normalized;
}

function toNullableInteger(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.trunc(value);
    }

    if (typeof value === 'string') {
        const match = value.trim().match(/-?\d+/);
        if (!match) return null;
        const parsed = Number(match[0]);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

function toRequiredPositiveInteger(value: unknown, fallback: number): number {
    const parsed = toNullableInteger(value);
    return parsed !== null && parsed > 0 ? parsed : fallback;
}

function isLikelyNationality(value: string | null): boolean {
    if (!value) return false;
    const normalized = normalizeVietnameseText(value);
    if (!normalized || /\d/.test(normalized)) return false;
    return KNOWN_NATIONALITIES.has(normalized);
}

function isLikelyDetailedAddress(value: string | null): boolean {
    if (!value) return false;

    const normalized = normalizeVietnameseText(value);
    if (!normalized) return false;

    const hasStrongMarker = ADDRESS_STRONG_MARKERS.some((marker) => normalized.includes(marker));
    if (hasStrongMarker) return true;

    const hasLocationMarker = ADDRESS_LOCATION_MARKERS.some((marker) => normalized.includes(marker));
    const digitCount = (value.match(/\d/g) ?? []).length;

    // Chỉ coi là địa chỉ thường trú khi có tín hiệu mạnh (số nhà/đường/đánh số)
    // để tránh nhầm các chuỗi địa danh kiểu "Xã..., Huyện..., Tỉnh..." (thường là quê quán)
    if (digitCount >= 2 && hasLocationMarker) return true;

    return false;
}

function isLikelyHSCTCode(value: string | null): boolean {
    if (!value) return false;

    const normalized = normalizeVietnameseText(value);
    if (!normalized || DATE_VALUE_REGEX.test(value.trim())) return false;
    if (isLikelyNationality(value) || isLikelyDetailedAddress(value)) return false;

    if (normalized.includes('hsct')) return true;

    const digitCount = (value.match(/\d/g) ?? []).length;
    if (digitCount >= 3) return true;

    if (/^[A-Za-z0-9./-]+$/.test(value) && digitCount > 0) {
        return true;
    }

    return false;
}

function applyPdfColumnGuards(record: PDFOCRRecord): { record: PDFOCRRecord; corrections: string[] } {
    const next = { ...record };
    const corrections: string[] = [];

    const quocTichLooksNationality = isLikelyNationality(next.quocTich);
    const quocTichLooksHSCT = isLikelyHSCTCode(next.quocTich);
    const soHSCTLooksNationality = isLikelyNationality(next.soHSCT);

    // Guard 1: Số HSCT <-> Quốc tịch
    if (quocTichLooksHSCT && soHSCTLooksNationality) {
        const temp = next.quocTich;
        next.quocTich = next.soHSCT;
        next.soHSCT = temp;
        corrections.push('swap_soHSCT_quocTich');
    } else if (quocTichLooksHSCT && !next.soHSCT) {
        next.soHSCT = next.quocTich;
        next.quocTich = null;
        corrections.push('move_soHSCT_from_quocTich');
    } else if (!quocTichLooksNationality && !next.quocTich && soHSCTLooksNationality) {
        next.quocTich = next.soHSCT;
        next.soHSCT = null;
        corrections.push('move_quocTich_from_soHSCT');
    }

    const queQuanLooksAddress = isLikelyDetailedAddress(next.queQuan);
    const diaChiLooksAddress = isLikelyDetailedAddress(next.diaChiThuongTru);

    // Guard 2: Quê quán <-> Địa chỉ thường trú
    if (next.queQuan && next.diaChiThuongTru && queQuanLooksAddress && !diaChiLooksAddress) {
        const temp = next.queQuan;
        next.queQuan = next.diaChiThuongTru;
        next.diaChiThuongTru = temp;
        corrections.push('swap_queQuan_diaChiThuongTru');
    } else if (!next.diaChiThuongTru && next.queQuan && queQuanLooksAddress) {
        next.diaChiThuongTru = next.queQuan;
        next.queQuan = null;
        corrections.push('move_diaChiThuongTru_from_queQuan');
    }

    return { record: next, corrections };
}

function normalizePdfRecords(rawRecords: unknown[]): PDFOCRRecord[] {
    const correctionStats = {
        swap_soHSCT_quocTich: 0,
        move_soHSCT_from_quocTich: 0,
        move_quocTich_from_soHSCT: 0,
        swap_queQuan_diaChiThuongTru: 0,
        move_diaChiThuongTru_from_queQuan: 0,
    };

    const normalized = rawRecords.map((rawRecord, index) => {
        const safeRecord = (typeof rawRecord === 'object' && rawRecord !== null
            ? rawRecord
            : {}) as Partial<PDFOCRRecord>;

        const base: PDFOCRRecord = {
            sttChinh: toNullableInteger(safeRecord.sttChinh),
            sttTrongHo: toRequiredPositiveInteger(safeRecord.sttTrongHo, index + 1),
            hoTen: normalizeNullableString(safeRecord.hoTen),
            soDDCN_CCCD: normalizeNullableString(safeRecord.soDDCN_CCCD),
            ngaySinh: normalizeNullableString(safeRecord.ngaySinh),
            gioiTinh: normalizeNullableString(safeRecord.gioiTinh),
            queQuan: normalizeNullableString(safeRecord.queQuan),
            danToc: normalizeNullableString(safeRecord.danToc),
            quocTich: normalizeNullableString(safeRecord.quocTich),
            soHSCT: normalizeNullableString(safeRecord.soHSCT),
            quanHeVoiChuHo: normalizeNullableString(safeRecord.quanHeVoiChuHo),
            oDauDen: normalizeNullableString(safeRecord.oDauDen),
            ngayDen: normalizeNullableString(safeRecord.ngayDen),
            diaChiThuongTru: normalizeNullableString(safeRecord.diaChiThuongTru),
        };

        const guarded = applyPdfColumnGuards(base);
        guarded.corrections.forEach((key) => {
            if (key in correctionStats) {
                correctionStats[key as keyof typeof correctionStats] += 1;
            }
        });

        return guarded.record;
    });

    const totalCorrections = Object.values(correctionStats).reduce((sum, count) => sum + count, 0);
    if (totalCorrections > 0) {
        console.warn('[Gemini] PDF column guards applied:', correctionStats);
    }

    return normalized;
}

function toSafeTokenNumber(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function logGeminiTokenUsage(
    requestType: GeminiRequestType,
    response: unknown,
    context?: { pageNumber?: number }
): void {
    const responseObject = response as {
        usageMetadata?: Record<string, unknown>;
        usage_metadata?: Record<string, unknown>;
    };
    const usageMetadata = responseObject?.usageMetadata ?? responseObject?.usage_metadata;

    const promptTokens = toSafeTokenNumber(usageMetadata?.promptTokenCount);
    const completionTokens = toSafeTokenNumber(usageMetadata?.candidatesTokenCount);
    const totalTokensFromApi = toSafeTokenNumber(
        usageMetadata?.totalTokenCount ?? usageMetadata?.totalTokens ?? usageMetadata?.total_token_count
    );
    const totalTokens = totalTokensFromApi > 0 ? totalTokensFromApi : promptTokens + completionTokens;
    const cachedContentTokens = toSafeTokenNumber(usageMetadata?.cachedContentTokenCount);

    geminiTokenStats.totalRequests += 1;
    geminiTokenStats.totalPromptTokens += promptTokens;
    geminiTokenStats.totalCompletionTokens += completionTokens;
    geminiTokenStats.totalTokens += totalTokens;

    if (requestType === 'image') {
        geminiTokenStats.imageRequests += 1;
    } else {
        geminiTokenStats.pdfPageRequests += 1;
    }

    const requestLabel = requestType === 'image'
        ? 'image upload'
        : `pdf page ${context?.pageNumber ?? 'unknown'}`;

    if (!usageMetadata) {
        console.warn(`[Gemini][Tokens] ${requestLabel}: usageMetadata unavailable`);
    }

    console.log(
        `[Gemini][Tokens] ${requestLabel}: prompt=${promptTokens}, completion=${completionTokens}, total=${totalTokens}, cached=${cachedContentTokens}`
    );
    console.log(
        `[Gemini][Tokens][Cumulative] requests=${geminiTokenStats.totalRequests} (image=${geminiTokenStats.imageRequests}, pdfPages=${geminiTokenStats.pdfPageRequests}), prompt=${geminiTokenStats.totalPromptTokens}, completion=${geminiTokenStats.totalCompletionTokens}, total=${geminiTokenStats.totalTokens}`
    );
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
                temperature: GEMINI_CONFIG.temperature,
                topP: GEMINI_CONFIG.topP,
                topK: GEMINI_CONFIG.topK,
                seed: GEMINI_CONFIG.seed,
            },
        });

        logGeminiTokenUsage('image', response);

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
                temperature: GEMINI_CONFIG.temperature,
                topP: GEMINI_CONFIG.topP,
                topK: GEMINI_CONFIG.topK,
                seed: GEMINI_CONFIG.seed,
            },
        });

            logGeminiTokenUsage('pdf-page', response, { pageNumber });

            const content = response.text || '[]';
            console.log(`[Gemini] Page ${pageNumber} response received, parsing JSON...`);

            const parsedRecords = parseJSONFromResponse<PDFOCRRecord>(content);
            const records = normalizePdfRecords(parsedRecords as unknown[]);
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
