import { CT3ARecord } from '../types/pdfTypes';

export interface SaveResult {
    success: boolean;
    message: string;
    error?: string;
}

/**
 * API Request types
 */
interface ApiPayload {
    records: CT3ARecord[];
    metadata: {
        uploadedAt: string;
        totalRecords: number;
        source: string;
        fileName?: string;
    };
}

/**
 * Map CT3A records to API format
 */
function mapRecordsToApiFormat(records: CT3ARecord[], fileName?: string): ApiPayload {
    return {
        records,
        metadata: {
            uploadedAt: new Date().toISOString(),
            totalRecords: records.length,
            source: 'pdf-ocr',
            fileName,
        },
    };
}

/**
 * Save CT3A data via proxy API
 */
export async function saveCT3AData(records: CT3ARecord[], fileName?: string): Promise<SaveResult> {
    try {
        console.log('[CT3A Save Service] Preparing data for API...');

        // Map data to API format
        const apiPayload = mapRecordsToApiFormat(records, fileName);

        console.log('[CT3A Save Service] Sending via proxy:', JSON.stringify(apiPayload, null, 2));

        // Call proxy API
        const response = await fetch('/api/save-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiPayload),
        });

        // Parse response
        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
            console.error('[CT3A Save Service] API Error:', response.status, responseData);
            return {
                success: false,
                message: 'Lưu dữ liệu thất bại',
                error: responseData?.message || `HTTP ${response.status}`,
            };
        }

        console.log('[CT3A Save Service] API Response:', responseData);

        return {
            success: true,
            message: `Đã lưu thành công ${records.length} bản ghi từ PDF`,
        };
    } catch (error) {
        console.error('[CT3A Save Service] Error saving data:', error);
        return {
            success: false,
            message: 'Lưu dữ liệu thất bại',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
