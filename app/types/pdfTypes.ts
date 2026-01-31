// Types for PDF to Excel Feature with OpenAI Vision

/**
 * Record từ bảng CT3A trong PDF
 */
export interface CT3ARecord {
    stt: number;
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
