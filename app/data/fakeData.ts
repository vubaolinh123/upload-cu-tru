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
        quanHeVoiChuHo: 'Chủ hộ',
        oDauDen: '',
        hoKhauThuongTru: 'Căn hộ chung cư số 201 (tầng 2), Chung cư CT1B, Lô NOXH-01, Khu đô thị mới Phước Long, Phường Nam Nha Trang, Tỉnh Khánh Hóa',
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
        quanHeVoiChuHo: 'Con',
        oDauDen: '',
        hoKhauThuongTru: 'Căn hộ chung cư số 201 (tầng 2), Chung cư CT1B, Lô NOXH-01, Khu đô thị mới Phước Long, Phường Nam Nha Trang, Tỉnh Khánh Hóa',
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
        quanHeVoiChuHo: 'Con',
        oDauDen: '',
        hoKhauThuongTru: 'Căn hộ chung cư số 201 (tầng 2), Chung cư CT1B, Lô NOXH-01, Khu đô thị mới Phước Long, Phường Nam Nha Trang, Tỉnh Khánh Hóa',
    },
];

// Fake data batch 2 - ĐINH VĂN NGHĨA household
export const fakeDataBatch2: PersonInfo[] = [
    {
        stt: 1,
        hoTen: 'ĐINH VĂN NGHĨA',
        soCCCD: '056085002111',
        ngaySinh: '15/03/1985',
        gioiTinh: 'Nam',
        queQuan: 'Xã Vạn Thắng, Huyện Vạn Ninh, Tỉnh Khánh Hòa',
        danToc: 'Kinh',
        quocTich: 'Việt Nam',
        quanHeVoiChuHo: 'Chủ hộ',
        oDauDen: '',
        hoKhauThuongTru: 'Căn hộ 301, Chung cư CT2A, Phước Long, Nha Trang',
    },
    {
        stt: 2,
        hoTen: 'NGUYỄN THỊ HỒNG',
        soCCCD: '056088003222',
        ngaySinh: '20/08/1988',
        gioiTinh: 'Nữ',
        queQuan: 'Phường Phước Long, Nha Trang, Khánh Hòa',
        danToc: 'Kinh',
        quocTich: 'Việt Nam',
        quanHeVoiChuHo: 'Vợ',
        oDauDen: '',
        hoKhauThuongTru: 'Căn hộ 301, Chung cư CT2A, Phước Long, Nha Trang',
    },
];

// Fake data batch 3 - TRẦN MINH TUẤN household
export const fakeDataBatch3: PersonInfo[] = [
    {
        stt: 1,
        hoTen: 'TRẦN MINH TUẤN',
        soCCCD: '056090005555',
        ngaySinh: '10/06/1990',
        gioiTinh: 'Nam',
        queQuan: 'Phường Cam Nghĩa, TP Cam Ranh, Khánh Hòa',
        danToc: 'Kinh',
        quocTich: 'Việt Nam',
        quanHeVoiChuHo: 'Chủ hộ',
        oDauDen: 'TP Hồ Chí Minh',
        hoKhauThuongTru: 'Số 15 Đường Lê Hồng Phong, Phường Nam Nha Trang, Khánh Hòa',
    },
];

// Base document data (header info)
export const baseDocumentData: ResidenceDocument = {
    header: {
        congAnTinh: 'KHÁNH HÒA',
        congAnPhuong: 'NAM NHA TRANG',
        ngayLap: '15',
        gioLap: '09',
        diaChi: '',
        phuong: 'Nam Nha Trang',
        tinhThanh: 'Khánh Hòa',
    },
    nguoiLap: [
        {
            hoTen: 'Võ Văn Giáp',
            chucVu: 'Công an viên',
        },
    ],
    chuHo: {
        hoTen: '',
        ngaySinh: '',
        soCCCD: '',
    },
    danhSachNhanKhau: [],
};

// Function to get fake data for a specific upload
export function getFakeDataForUpload(uploadIndex: number): PersonInfo[] {
    const dataSets = [fakeDataBatch1, fakeDataBatch2, fakeDataBatch3];
    return dataSets[uploadIndex % dataSets.length];
}

// Simulate API delay
export function simulateApiDelay(ms: number = 2000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
