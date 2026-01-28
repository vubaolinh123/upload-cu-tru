import { ResidenceDocument, PersonInfo } from '../types/residence';

// Fake data batch 1 - NGUYỄN THỊ CẨM NHUNG household
export const fakeDataBatch1: PersonInfo[] = [
    {
        stt: 1,
        hoTen: 'NGUYỄN THỊ CẨM NHUNG',
        soCCCD: '056188002504',
        ngaySinh: '13/11/1988',
        gioiTinh: 'Nữ',
        queQuan: 'Tỉnh Khánh Hòa',
        danToc: 'Kinh',
        quocTich: 'Việt Nam',
        soHSCT: '22402-027531',
        quanHeVoiChuHo: 'Chủ hộ',
        oDauDen: '',
        ngayDen: '18/02/2025',
        diaChiThuongTru: 'Căn hộ chung cư số 201 (tầng 2), Chung cư CT1B, Lô NOXH-01, Khu đô thị mới Phước Long, Phường Nam Nha Trang, Tỉnh Khánh Hóa',
        ngheNghiep: 'Nhân viên văn phòng',
        hktt: 'Tỉnh Khánh Hòa',
    },
    {
        stt: 2,
        hoTen: 'NGUYỄN BẢO PHƯƠNG NHI',
        soCCCD: '056311000986',
        ngaySinh: '26/02/2011',
        gioiTinh: 'Nữ',
        queQuan: 'Xã Bắc Ninh Hòa, Tỉnh Khánh Hòa',
        danToc: 'Kinh',
        quocTich: 'Việt Nam',
        soHSCT: '',
        quanHeVoiChuHo: 'Con',
        oDauDen: '',
        ngayDen: '18/02/2025',
        diaChiThuongTru: 'Căn hộ chung cư số 201 (tầng 2), Chung cư CT1B, Lô NOXH-01, Khu đô thị mới Phước Long, Phường Nam Nha Trang, Tỉnh Khánh Hóa',
        ngheNghiep: 'Học sinh',
        hktt: 'Tỉnh Khánh Hòa',
    },
    {
        stt: 3,
        hoTen: 'NGUYỄN KIÊN LÂM',
        soCCCD: '056217010070',
        ngaySinh: '30/12/2017',
        gioiTinh: 'Nam',
        queQuan: 'Tỉnh Khánh Hòa',
        danToc: 'Kinh',
        quocTich: 'Việt Nam',
        soHSCT: '',
        quanHeVoiChuHo: 'Con',
        oDauDen: '',
        ngayDen: '18/02/2025',
        diaChiThuongTru: 'Căn hộ chung cư số 201 (tầng 2), Chung cư CT1B, Lô NOXH-01, Khu đô thị mới Phước Long, Phường Nam Nha Trang, Tỉnh Khánh Hóa',
        ngheNghiep: 'Học sinh',
        hktt: 'Tỉnh Khánh Hòa',
    },
];

// Fake data batch 2 - PHẠM THỊ NHƯ NGUYỆT household
export const fakeDataBatch2: PersonInfo[] = [
    {
        stt: 1,
        hoTen: 'PHẠM THỊ NHƯ NGUYỆT',
        soCCCD: '056181012212',
        ngaySinh: '03/04/1981',
        gioiTinh: 'Nữ',
        queQuan: 'Xã Bắc Ninh Hòa, Tỉnh Khánh Hòa',
        danToc: 'Kinh',
        quocTich: 'Việt Nam',
        soHSCT: '22402-027800',
        quanHeVoiChuHo: 'Chủ hộ',
        oDauDen: 'THÔN LẠC AN, Xã Ninh Thọ, Thị xã Ninh Hòa, Tỉnh Khánh Hòa',
        ngayDen: '19/09/2024',
        diaChiThuongTru: 'Căn 611 CT1B NOXH-01 khu DTM Phước Long, Phường Nam Nha Trang, Tỉnh Khánh Hóa',
        ngheNghiep: 'Kinh doanh',
        hktt: 'Tỉnh Khánh Hòa',
    },
    {
        stt: 2,
        hoTen: 'NGUYỄN VŨ NGUYỆT MINH',
        soCCCD: '056303012456',
        ngaySinh: '20/02/2003',
        gioiTinh: 'Nữ',
        queQuan: 'Tỉnh Nghệ An',
        danToc: 'Kinh',
        quocTich: 'Việt Nam',
        soHSCT: '',
        quanHeVoiChuHo: 'Con',
        oDauDen: 'THÔN LẠC AN, Xã Ninh Thọ, Thị xã Ninh Hòa, Tỉnh Khánh Hòa',
        ngayDen: '19/09/2024',
        diaChiThuongTru: 'Căn 611 CT1B NOXH-01 khu DTM Phước Long, Phường Nam Nha Trang, Tỉnh Khánh Hóa',
        ngheNghiep: 'Sinh viên',
        hktt: 'Tỉnh Khánh Hòa',
    },
    {
        stt: 3,
        hoTen: 'DƯƠNG PHÚC',
        soCCCD: '056220000174',
        ngaySinh: '20/01/2020',
        gioiTinh: 'Nam',
        queQuan: 'Tỉnh Khánh Hòa',
        danToc: 'Kinh',
        quocTich: 'Việt Nam',
        soHSCT: '',
        quanHeVoiChuHo: 'Con',
        oDauDen: 'THÔN LẠC AN, Xã Ninh Thọ, Thị xã Ninh Hòa, Tỉnh Khánh Hòa',
        ngayDen: '19/09/2024',
        diaChiThuongTru: 'Căn 611 CT1B NOXH-01 khu DTM Phước Long, Phường Nam Nha Trang, Tỉnh Khánh Hóa',
        ngheNghiep: 'Trẻ em',
        hktt: 'Tỉnh Khánh Hòa',
    },
];

// Fake data batch 3 - MAI THẾ ĐOÀN household
export const fakeDataBatch3: PersonInfo[] = [
    {
        stt: 1,
        hoTen: 'MAI THẾ ĐOÀN',
        soCCCD: '038054012394',
        ngaySinh: '30/11/1954',
        gioiTinh: 'Nam',
        queQuan: 'Xã Vĩ Vương, Tỉnh Thanh Hóa',
        danToc: 'Kinh',
        quocTich: 'Việt Nam',
        soHSCT: '22402-027878',
        quanHeVoiChuHo: 'Chủ hộ',
        oDauDen: 'SỐ NHÀ 38 ĐƯỜNG NGUYỄN ĐỨC CẢNH, Phường Phước Long, Thành phố Nha Trang, Tỉnh Khánh Hòa',
        ngayDen: '04/10/2024',
        diaChiThuongTru: 'Căn 305 CT1B NOXH-01 KĐTM Phước Long, Phường Nam Nha Trang, Tỉnh Khánh Hóa',
        ngheNghiep: 'Hưu trí',
        hktt: 'Tỉnh Thanh Hóa',
    },
    {
        stt: 2,
        hoTen: 'NGUYỄN THỊ LAI',
        soCCCD: '038155019373',
        ngaySinh: '05/04/1955',
        gioiTinh: 'Nữ',
        queQuan: 'Xã Hà Vương, Tỉnh Thanh Hóa',
        danToc: 'Kinh',
        quocTich: 'Việt Nam',
        soHSCT: '',
        quanHeVoiChuHo: 'Vợ',
        oDauDen: '38 ĐƯỜNG NGUYỄN ĐỨC CẢNH, TỔ 2 PHƯỚC BÌNH, Phường Phước Long, Thành phố Nha Trang, Tỉnh Khánh Hòa',
        ngayDen: '04/10/2024',
        diaChiThuongTru: 'Căn 305 CT1B NOXH-01 KĐTM Phước Long, Phường Nam Nha Trang, Tỉnh Khánh Hóa',
        ngheNghiep: 'Hưu trí',
        hktt: 'Tỉnh Thanh Hóa',
    },
];

// All fake data batches for cycling through on each upload
export const allFakeDataBatches: PersonInfo[][] = [
    fakeDataBatch1,
    fakeDataBatch2,
    fakeDataBatch3,
];

// Get fake data for a specific upload index (cycles through batches)
export const getFakeDataForUpload = (uploadIndex: number): PersonInfo[] => {
    const batchIndex = uploadIndex % allFakeDataBatches.length;
    return allFakeDataBatches[batchIndex];
};

// Base document data (header info that stays the same)
export const baseDocumentData: Omit<ResidenceDocument, 'danhSachNhanKhau'> = {
    header: {
        congAnTinh: 'KHÁNH HÒA',
        congAnPhuong: 'NAM NHA TRANG',
        ngayLap: '28',
        gioLap: '09',
        diaChi: 'Căn hộ chung cư số 201 (tầng 2), Chung cư CT1B, Lô NOXH-01',
        phuong: 'Nam Nha Trang',
        tinhThanh: 'Khánh Hòa',
    },
    nguoiLap: [
        {
            hoTen: 'Tô Nguyên Văn Quốc',
            chucVu: 'Cán bộ CSKV',
        },
    ],
    chuHo: {
        hoTen: 'NGUYỄN THỊ CẨM NHUNG',
        ngaySinh: '13/11/1988',
        soCCCD: '056188002504',
    },
    yKienChuHo: 'Đồng ý với nội dung biên bản kiểm tra cư trú.',
    kienNghiCongAn: 'Không có kiến nghị.',
};

// Function to simulate API delay
export const simulateApiDelay = (ms: number = 2000): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

// Generate unique ID
export const generateId = (): string => {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
