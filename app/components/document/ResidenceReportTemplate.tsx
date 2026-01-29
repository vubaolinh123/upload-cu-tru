'use client';

import React from 'react';
import { PersonInfo } from '../../types/residence';
import { Household } from '../../types/household';

interface ResidenceReportTemplateProps {
    household: Household;
    headerInfo?: {
        congAnTinh?: string;
        congAnPhuong?: string;
        ngayLap?: string;
        gioLap?: string;
        phuong?: string;
        tinhThanh?: string;
    };
}

// Dotted line using actual dot characters (works in print)
const Dots = ({ count = 20 }: { count?: number }) => (
    <span style={{ letterSpacing: '2px' }}>
        {'.'.repeat(count)}
    </span>
);

// Field with value or dots if empty
const Field = ({ value, dotCount = 15 }: { value?: string; dotCount?: number }) => {
    if (value && value.trim()) {
        return <span style={{ fontWeight: 500 }}>{value}</span>;
    }
    return <Dots count={dotCount} />;
};

// Fixed value for officer name
const FIXED_OFFICER_NAME = 'Võ Văn Giáp';

export default function ResidenceReportTemplate({ household, headerInfo = {} }: ResidenceReportTemplateProps) {
    const {
        congAnTinh = 'KHÁNH HÒA',
        congAnPhuong = 'NAM NHA TRANG',
        ngayLap = '',
        gioLap = '',
        phuong = 'Nam Nha Trang',
        tinhThanh = 'Khánh Hòa',
    } = headerInfo;

    const chuHo = household.chuHo;
    const allPersons = household.allPersons;

    // Địa chỉ lấy từ hoKhauThuongTru của Chủ hộ
    const diaChiChuHo = chuHo.hoKhauThuongTru || '';

    return (
        <div
            id="document-preview"
            style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#000',
                backgroundColor: '#fff',
                padding: '20px 30px',
                maxWidth: '800px',
                margin: '0 auto',
            }}
        >
            {/* Header - với gạch chân */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div style={{ textAlign: 'center', width: '45%' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>CÔNG AN TỈNH {congAnTinh}</p>
                    <p style={{
                        margin: 0,
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px'
                    }}>
                        CÔNG AN P. {congAnPhuong}
                    </p>
                </div>
                <div style={{ textAlign: 'center', width: '55%' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p style={{
                        margin: 0,
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px'
                    }}>
                        Độc lập – Tự do – Hạnh phúc
                    </p>
                </div>
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
                    BIÊN BẢN KIỂM TRA CƯ TRÚ
                </h1>
                <p style={{ margin: 0, fontStyle: 'italic', fontSize: '12px' }}>
                    (V/v Tổng kiểm tra cư trú)
                </p>
            </div>

            {/* Date and Location */}
            <p style={{ margin: '8px 0' }}>
                Hôm nay, vào lúc <Field value={gioLap} dotCount={5} /> giờ <Dots count={5} /> ngày{' '}
                <Field value={ngayLap} dotCount={5} /> tháng <Dots count={3} /> năm 2026
            </p>
            <p style={{ margin: '8px 0' }}>
                Tại địa chỉ: <Field value={diaChiChuHo} dotCount={40} />, phường {phuong}, tỉnh {tinhThanh}.
            </p>

            {/* Officers - Fixed name: Võ Văn Giáp */}
            <p style={{ margin: '8px 0' }}>Chúng tôi gồm:</p>
            <p style={{ margin: '4px 0', paddingLeft: '15px' }}>
                1/ Ông: <span style={{ fontWeight: 500 }}>{FIXED_OFFICER_NAME}</span> ; Chức vụ: <span style={{ fontWeight: 500 }}>Cán bộ CSKV</span>
            </p>
            <p style={{ margin: '4px 0', paddingLeft: '15px' }}>
                2/ Ông: <Dots count={30} /> ; Chức vụ: <Dots count={25} />
            </p>

            {/* Witness */}
            <p style={{ margin: '8px 0' }}>Người chứng kiến (nếu có):</p>
            <p style={{ margin: '4px 0', paddingLeft: '15px' }}>
                Họ tên: <Dots count={30} />; sinh ngày: <Dots count={8} />/<Dots count={8} />/<Dots count={8} />
            </p>

            {/* Household info - Format theo ảnh mẫu */}
            <p style={{ margin: '10px 0' }}>
                Tiến hành lập biên bản kiểm tra cư trú tại căn nhà địa chỉ trên do ông bà:
            </p>
            <p style={{ margin: '4px 0', paddingLeft: '15px' }}>
                Họ và tên: <Field value={chuHo.hoTen} dotCount={40} />; Sinh ngày: <Field value={chuHo.ngaySinh} dotCount={15} />
            </p>
            <p style={{ margin: '4px 0', paddingLeft: '15px' }}>
                Số CCCD: <Field value={chuHo.soCCCD} dotCount={30} /> là <Dots count={30} />
            </p>

            {/* Inspection Results Header */}
            <p
                style={{
                    margin: '15px 0 10px 0',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                }}
            >
                KẾT QUẢ KIỂM TRA
            </p>

            {/* Section 1 - List of residents */}
            <p style={{ margin: '8px 0' }}>
                1.Thời điểm kiểm tra tại căn nhà/phòng số <Dots count={8} /> địa chỉ trên thực tế có{' '}
                <strong>{allPersons.length}</strong> nhân khẩu đang cư trú gồm:
            </p>

            {/* Residents list - Simplified: removed Số HSCT, ở đâu đến, ngày đến */}
            {allPersons.map((person, idx) => (
                <div key={`${person.soCCCD}-${idx}`} style={{ margin: '10px 0', paddingLeft: '15px' }}>
                    <p style={{ margin: '2px 0' }}>
                        {idx + 1}/ Họ tên: <Field value={person.hoTen} dotCount={30} />; Giới tính: <Field value={person.gioiTinh} dotCount={8} />
                    </p>
                    <p style={{ margin: '2px 0' }}>
                        Sinh ngày: <Field value={person.ngaySinh} dotCount={15} />; Dân tộc: <Field value={person.danToc} dotCount={10} />; Quốc tịch: <Field value={person.quocTich} dotCount={12} />
                    </p>
                    <p style={{ margin: '2px 0' }}>
                        Số CCCD/ĐDCN: <Field value={person.soCCCD} dotCount={20} />
                    </p>
                    <p style={{ margin: '2px 0' }}>
                        Quê quán: <Field value={person.queQuan} dotCount={50} />
                    </p>
                    <p style={{ margin: '2px 0' }}>
                        Quan hệ với chủ hộ: <Field value={person.quanHeVoiChuHo} dotCount={15} />
                    </p>
                    <p style={{ margin: '2px 0' }}>
                        Hộ khẩu thường trú: <Field value={person.hoKhauThuongTru} dotCount={50} />
                    </p>
                </div>
            ))}

            {/* Section 2 - Documents provided */}
            <p style={{ margin: '15px 0 5px 0' }}>
                2.Qua kiểm tra những người có thông tin trên đã cung cấp các loại giấy tờ/tài liệu/dữ liệu
                điện tử/ chưa cung cấp các loại giấy tờ liên quan đến việc đăng ký cư trú tại địa chỉ trên gồm:
            </p>
            <p style={{ margin: '5px 0', paddingLeft: '15px' }}>
                <Dots count={80} />
            </p>
            <p style={{ margin: '5px 0', paddingLeft: '15px' }}>
                <Dots count={80} />
            </p>

            {/* Section 3 - Owner's opinion */}
            <p style={{ margin: '15px 0 5px 0' }}>
                3.Ý kiến trình bày của chủ hộ/chủ sở hữu nhà hoặc người có liên quan:
            </p>
            <p style={{ margin: '5px 0', paddingLeft: '15px', textAlign: 'center' }}>
                <Dots count={60} />
            </p>

            {/* Section 4 - Police recommendations */}
            <p style={{ margin: '15px 0 5px 0' }}>
                4. Kiến nghị của Công an phường (nếu có):
            </p>
            <p style={{ margin: '5px 0', paddingLeft: '15px', textAlign: 'center' }}>
                <Dots count={60} />
            </p>

            {/* Conclusion */}
            <p style={{ margin: '15px 0 5px 0' }}>
                Biên bản được lập thành <Dots count={5} /> bản, giao cho chủ hộ/chủ sở hữu/người quản lý và
                người có liên quan 01 bản, 01 bản lưu hồ sơ.
            </p>
            <p style={{ margin: '5px 0' }}>
                Biên bản lập xong lúc <Dots count={5} /> giờ <Dots count={5} /> cùng ngày, đã thông qua
                cho những người có tên trong biên bản nghe, đồng ý nội dung và ký tên xác nhận.
            </p>

            {/* Signatures */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '30px',
                    textAlign: 'center',
                }}
            >
                <div style={{ width: '45%' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Chủ hộ /Chủ sở hữu/Người có</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>liên quan</p>
                    <p style={{ margin: '60px 0 0 0' }}>&nbsp;</p>
                </div>
                <div style={{ width: '45%' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Người lập biên bản</p>
                    <p style={{ margin: '40px 0 0 0' }}>&nbsp;</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{FIXED_OFFICER_NAME}</p>
                </div>
            </div>

            {/* Witness signature */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Người chứng kiến(nếu có)</p>
                <p style={{ margin: '40px 0 0 0' }}>&nbsp;</p>
            </div>
        </div>
    );
}
