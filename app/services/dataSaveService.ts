import { Household } from '../types/household';

export interface SaveResult {
    success: boolean;
    message: string;
    error?: string;
}

/**
 * Save household data to API
 * TODO: Implement real API call when backend is ready
 */
export async function saveHouseholdData(households: Household[]): Promise<SaveResult> {
    try {
        console.log('[Save Service] Saving data...', households);

        // TODO: Replace with real API call
        // const response = await fetch('/api/save', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ households }),
        // });

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Placeholder success response
        console.log('[Save Service] Data saved successfully (placeholder)');

        return {
            success: true,
            message: `Đã lưu ${households.length} hộ gia đình (${households.reduce((sum, h) => sum + h.allPersons.length, 0)} người)`,
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
