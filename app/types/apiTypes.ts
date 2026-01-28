/**
 * API Types for OCR Service
 */

// Raw person data from OCR API
export interface OCRPersonResponse {
    hoTen: string;
    soCCCD: string;
    ngaySinh: string;
    gioiTinh: string;
    queQuan: string;
    danToc: string;
    quocTich: string;
    soHSCT: string | null;
    quanHeVoiChuHo: string;
    oDauDen: string;
    ngayDen: string;
    diaChiThuongTru: string;
}

// Actual API response wrapper
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
