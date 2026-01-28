import { PersonInfo } from '../types/residence';
import { OCRAPIResponse } from '../types/apiTypes';
import ocrApiClient from '../lib/axiosConfig';
import { parseApiError } from '../lib/errorHandler';
import { mapOCRResponseToPersonInfo, validateOCRResponse } from '../lib/dataMapper';

export interface AnalysisResult {
    success: boolean;
    data: PersonInfo[] | null;
    error?: string;
}

/**
 * Analyze image using OCR API
 * Note: API may take 2-5 minutes to respond
 */
export async function analyzeImage(
    imageFile: File,
    _uploadIndex: number // kept for compatibility, not used with real API
): Promise<AnalysisResult> {
    try {
        // Create FormData with image
        const formData = new FormData();
        formData.append('image', imageFile);

        console.log('[OCR Service] Sending image to API...');

        // Call OCR API via proxy
        const response = await ocrApiClient.post<OCRAPIResponse>('/ocr', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('[OCR Service] Response received:', response.data);

        // Check API error field
        if (response.data.error !== '0') {
            return {
                success: false,
                data: null,
                error: response.data.Message || 'API trả về lỗi.',
            };
        }

        // Validate data array
        if (!validateOCRResponse(response.data.data)) {
            return {
                success: false,
                data: null,
                error: 'API trả về dữ liệu không hợp lệ hoặc rỗng.',
            };
        }

        // Map response to PersonInfo format
        const personInfoList = mapOCRResponseToPersonInfo(response.data.data);

        console.log(`[OCR Service] Parsed ${personInfoList.length} persons`);

        return {
            success: true,
            data: personInfoList,
        };
    } catch (error) {
        console.error('[OCR Service] Error:', error);
        return {
            success: false,
            data: null,
            error: parseApiError(error),
        };
    }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Định dạng file không hợp lệ. Vui lòng chọn file JPG, PNG, WebP hoặc GIF.',
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.',
        };
    }

    return { valid: true };
}
