/**
 * API Types for OCR Service
 */

// Raw person data from OCR API (updated with new fields)
export interface OCRPersonResponse {
    stt: number;
    hoTen: string;
    soCCCD: string;
    ngaySinh: string;
    gioiTinh: string;
    queQuan: string;
    danToc: string;
    quocTich: string;
    quanHeVoiChuHo: string;
    oDauDen: string;
    hoKhauThuongTru: string; // New field - Hộ khẩu thường trú
}

// Actual API response wrapper from OpenAI (after parsing)
export interface OCRAPIResponse {
    error: string; // "0" = success
    data: OCRPersonResponse[];
    Message: string;
}

// API Error response format
export interface APIError {
    message: string;
    code?: string;
    status?: number;
}

// Generic API response wrapper
export interface APIResponse<T> {
    success: boolean;
    data: T | null;
    error?: string;
}
