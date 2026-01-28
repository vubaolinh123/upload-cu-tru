import { PersonInfo } from '../types/residence';
import { getFakeDataForUpload, simulateApiDelay } from '../data/fakeData';

export interface AnalysisResult {
    success: boolean;
    data: PersonInfo[] | null;
    error?: string;
}

/**
 * Mock image analysis service
 * In production, this would call an actual API endpoint
 */
export async function analyzeImage(imageFile: File, uploadIndex: number): Promise<AnalysisResult> {
    try {
        // Simulate API processing time
        await simulateApiDelay(1500);

        // In production, you would:
        // 1. Upload the image to your API
        // 2. Wait for OCR/AI analysis
        // 3. Return the parsed data

        // For now, return fake data based on upload index (cycles through batches)
        const fakeData = getFakeDataForUpload(uploadIndex);

        return {
            success: true,
            data: fakeData,
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi phân tích ảnh',
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
