// Types for PDF to Excel Feature with OpenAI Vision

/**
 * Record từ bảng CT3A trong PDF
 * - sttChinh: STT hàng (2131, 2132...) - dùng để sort
 * - sttTrongHo: STT trong hộ (1=chủ hộ, 2,3,4=thành viên) - giữ nguyên thứ tự
 * - pageNumber: Trang PDF chứa record (dùng cho UI editing)
 */
export interface CT3ARecord {
    sttChinh: number | null;  // STT hàng chính (2131-2149), có thể null nếu PDF không có
    sttTrongHo: number;       // STT trong hộ (1=chủ hộ, 2,3,4=thành viên)
    pageNumber?: number;      // Số trang PDF chứa record này (1-indexed)
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
 * Kết quả extract từ một trang PDF
 */
export interface PdfPageResult {
    pageNumber: number;
    records: CT3ARecord[];
    error?: string;
}

/**
 * Kết quả extract từ toàn bộ PDF
 */
export interface PdfExtractionResult {
    success: boolean;
    fileName: string;
    totalPages: number;
    pages: PdfPageResult[];
    allRecords: CT3ARecord[];
    error?: string;
}

/**
 * Progress callback
 */
export type PdfProgressCallback = (message: string, progress?: number) => void;
