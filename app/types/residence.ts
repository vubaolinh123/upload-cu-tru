// Types for Residence Registration Document

export interface PersonInfo {
    stt: number;
    hoTen: string;
    soCCCD: string;
    ngaySinh: string;
    gioiTinh: 'Nam' | 'Nữ';
    queQuan: string;
    danToc: string;
    quocTich: string;
    soHSCT: string;
    quanHeVoiChuHo: string;
    oDauDen: string;
    ngayDen: string;
    diaChiThuongTru: string;
    ngheNghiep?: string;
    hktt?: string;
}

export interface DocumentHeader {
    congAnTinh: string;
    congAnPhuong: string;
    ngayLap: string;
    gioLap: string;
    diaChi: string;
    phuong: string;
    tinhThanh: string;
}

export interface NguoiLapBienBan {
    hoTen: string;
    chucVu: string;
}

export interface ResidenceDocument {
    header: DocumentHeader;
    nguoiLap: NguoiLapBienBan[];
    nguoiChungKien?: {
        hoTen: string;
        ngaySinh: string;
    };
    chuHo: {
        hoTen: string;
        ngaySinh: string;
        soCCCD: string;
    };
    danhSachNhanKhau: PersonInfo[];
    yKienChuHo?: string;
    kienNghiCongAn?: string;
}

export interface AnalysisResult {
    success: boolean;
    data: ResidenceDocument | null;
    error?: string;
}

export type AppStep = 'upload' | 'analyzing' | 'preview' | 'export';

export interface UploadedImage {
    id: string;
    file: File;
    preview: string;
    extractedData: PersonInfo[];
}
