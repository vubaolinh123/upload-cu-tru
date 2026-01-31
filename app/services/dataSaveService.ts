import { Household } from '../types/household';
import { PersonInfo } from '../types/residence';

export interface SaveResult {
    success: boolean;
    message: string;
    error?: string;
}

/**
 * API Request types
 */
interface ApiHousehold {
    chuHo: PersonInfo;
    members: PersonInfo[];
    totalPersons: number;
}

interface ApiPayload {
    households: ApiHousehold[];
    metadata: {
        uploadedAt: string;
        totalHouseholds: number;
        totalPersons: number;
        source: string;
    };
}

/**
 * Map frontend Household to API format
 */
function mapHouseholdsToApiFormat(households: Household[]): ApiPayload {
    const totalPersons = households.reduce((sum, h) => sum + h.allPersons.length, 0);

    return {
        households: households.map((h) => ({
            chuHo: h.chuHo,
            members: h.members,
            totalPersons: h.allPersons.length,
        })),
        metadata: {
            uploadedAt: new Date().toISOString(),
            totalHouseholds: households.length,
            totalPersons,
            source: 'ocr-upload',
        },
    };
}

/**
 * Save household data via proxy API
 */
export async function saveHouseholdData(households: Household[]): Promise<SaveResult> {
    try {
        console.log('[Save Service] Preparing data for API...');

        // Map data to API format
        const apiPayload = mapHouseholdsToApiFormat(households);

        console.log('[Save Service] Sending via proxy:', JSON.stringify(apiPayload, null, 2));

        // Call proxy API instead of external API
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
            console.error('[Save Service] API Error:', response.status, responseData);
            return {
                success: false,
                message: 'Lưu dữ liệu thất bại',
                error: responseData?.message || `HTTP ${response.status}`,
            };
        }

        console.log('[Save Service] API Response:', responseData);

        const totalPersons = households.reduce((sum, h) => sum + h.allPersons.length, 0);

        return {
            success: true,
            message: `Đã lưu thành công ${households.length} hộ gia đình (${totalPersons} người)`,
        };
    } catch (error) {
        console.error('[Save Service] Error saving data:', error);
        return {
            success: false,
            message: 'Lưu dữ liệu thất bại',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Save a single household
 */
export async function saveSingleHousehold(household: Household): Promise<SaveResult> {
    return saveHouseholdData([household]);
}
