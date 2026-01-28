import { OCRPersonResponse } from '../types/apiTypes';
import { PersonInfo } from '../types/residence';

/**
 * Clean string value - handle "null" string and actual null
 */
function cleanValue(value: string | null | undefined): string {
    if (value === null || value === undefined || value === 'null' || value === 'NULL') {
        return '';
    }
    return value.trim();
}

/**
 * Map OCR API response to PersonInfo[] format
 * Handles null values and "null" strings
 */
export function mapOCRResponseToPersonInfo(
    response: OCRPersonResponse[],
    startIndex: number = 1
): PersonInfo[] {
    return response.map((item, index) => ({
        stt: startIndex + index,
        hoTen: cleanValue(item.hoTen),
        soCCCD: cleanValue(item.soCCCD),
        ngaySinh: cleanValue(item.ngaySinh),
        gioiTinh: validateGioiTinh(item.gioiTinh),
        queQuan: cleanValue(item.queQuan),
        danToc: cleanValue(item.danToc) || 'Kinh',
        quocTich: cleanValue(item.quocTich) || 'Việt Nam',
        soHSCT: cleanValue(item.soHSCT),
        quanHeVoiChuHo: cleanValue(item.quanHeVoiChuHo),
        oDauDen: cleanValue(item.oDauDen),
        ngayDen: cleanValue(item.ngayDen),
        diaChiThuongTru: cleanValue(item.diaChiThuongTru),
    }));
}

/**
 * Validate and normalize giới tính value
 */
function validateGioiTinh(value: string): 'Nam' | 'Nữ' {
    const normalized = value?.toLowerCase().trim();
    if (normalized === 'nam') return 'Nam';
    if (normalized === 'nữ' || normalized === 'nu') return 'Nữ';
    return 'Nam'; // Default to Nam if unknown
}

/**
 * Validate OCR response has required data
 */
export function validateOCRResponse(response: unknown): response is OCRPersonResponse[] {
    if (!Array.isArray(response)) {
        return false;
    }

    if (response.length === 0) {
        return false;
    }

    // Check first item has required fields
    const firstItem = response[0];
    return (
        typeof firstItem === 'object' &&
        firstItem !== null &&
        'hoTen' in firstItem &&
        'soCCCD' in firstItem
    );
}
