'use client';

import React from 'react';
import { ResidenceDocument, PersonInfo } from '../../types/residence';

interface ResidenceReportTemplateProps {
    data: ResidenceDocument;
    accumulatedPersons: PersonInfo[];
}

// Dotted line for empty fields
const Dots = ({ width = '100px' }: { width?: string }) => (
    <span style={{ display: 'inline-block', minWidth: width, borderBottom: '1px dotted #000' }}>
        &nbsp;
    </span>
);

// Field with value or dots
const Field = ({ value, width = '100px' }: { value?: string; width?: string }) => (
    <span
        style={{
            display: 'inline-block',
            minWidth: width,
            borderBottom: '1px dotted #000',
            textAlign: 'center',
        }}
    >
        {value || '\u00A0'}
    </span>
);

export default function ResidenceReportTemplate({ data, accumulatedPersons }: ResidenceReportTemplateProps) {
    const { header, nguoiLap, chuHo, yKienChuHo, kienNghiCongAn } = data;
    const persons = accumulatedPersons.length > 0 ? accumulatedPersons : data.danhSachNhanKhau;

    return (
        <div
            id="document-preview"
            style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '13px',
                lineHeight: '1.5',
                color: '#000',
                backgroundColor: '#fff',
                padding: '20px 30px',
                maxWidth: '800px',
                margin: '0 auto',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div style={{ textAlign: 'center', width: '45%' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>CÔNG AN TỈNH {header.congAnTinh}</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>CÔNG AN P. {header.congAnPhuong}</p>
                </div>
                <div style={{ textAlign: 'center', width: '55%' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Độc lập – Tự do – Hạnh phúc</p>
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
                Hôm nay, vào lúc <Field value={header.gioLap} width="30px" /> giờ <Dots width="30px" /> ngày{' '}
                <Field value={header.ngayLap} width="30px" /> tháng <Field value="01" width="30px" /> năm 2026
            </p>
            <p style={{ margin: '8px 0' }}>
                Tại địa chỉ: <Field value={header.diaChi} width="300px" />phường {header.phuong}, tỉnh {header.tinhThanh}.
            </p>

            {/* Officers */}
            <p style={{ margin: '8px 0' }}>Chúng tôi gồm:</p>
            {nguoiLap.map((person, idx) => (
                <p key={idx} style={{ margin: '4px 0', paddingLeft: '15px' }}>
                    {idx + 1}/ Ông: <Field value={person.hoTen} width="150px" /> ; Chức vụ:{' '}
                    <Field value={person.chucVu} width="120px" />
                </p>
            ))}
            <p style={{ margin: '4px 0', paddingLeft: '15px' }}>
                2/ Ông: <Dots width="200px" /> ; Chức vụ: <Dots width="150px" />
            </p>

            {/* Witness */}
            <p style={{ margin: '8px 0' }}>Người chứng kiến (nếu có):</p>
            <p style={{ margin: '4px 0', paddingLeft: '15px' }}>
                Họ tên: <Dots width="200px" />; sinh ngày: <Dots width="50px" />/<Dots width="50px" />/<Dots width="50px" />
            </p>

            {/* Household info */}
            <p style={{ margin: '10px 0' }}>
                Tiến hành lập biên bản kiểm tra cư trú tại căn nhà địa chỉ trên do ông bà:
            </p>
            <p style={{ margin: '4px 0', paddingLeft: '15px' }}>
                Họ và tên: <Field value={chuHo.hoTen} width="200px" />; Sinh ngày:{' '}
                <Field value={chuHo.ngaySinh} width="100px" />
            </p>
            <p style={{ margin: '4px 0', paddingLeft: '15px' }}>
                Số CCCD: <Field value={chuHo.soCCCD} width="150px" />; là: <Field value="Chủ hộ" width="80px" />
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
                1.Thời điểm kiểm tra tại căn nhà/phòng số <Dots width="50px" /> địa chỉ trên thực tế có{' '}
                <strong>{persons.length}</strong> nhân khẩu đang cư trú gồm:
            </p>

            {/* Residents list */}
            {persons.map((person, idx) => (
                <div key={`${person.soCCCD}-${idx}`} style={{ margin: '6px 0', paddingLeft: '15px' }}>
                    <p style={{ margin: '2px 0' }}>
                        {idx + 1}/ Họ tên: <Field value={person.hoTen} width="200px" />; sinh ngày:{' '}
                        <Field value={person.ngaySinh} width="80px" />
                    </p>
                    <p style={{ margin: '2px 0' }}>
                        Số CCCD/ĐDCN: <Field value={person.soCCCD} width="150px" />; ngày cấp:{' '}
                        <Dots width="80px" />
                    </p>
                    <p style={{ margin: '2px 0' }}>
                        HKTT: <Field value={person.hktt || person.queQuan} width="350px" />
                    </p>
                    <p style={{ margin: '2px 0' }}>
                        Nghề nghiệp: <Field value={person.ngheNghiep} width="120px" />; Quan hệ với chủ hộ:{' '}
                        <Field value={person.quanHeVoiChuHo} width="80px" />
                    </p>
                </div>
            ))}

            {/* Section 2 - Documents provided */}
            <p style={{ margin: '15px 0 5px 0' }}>
                2.Qua kiểm tra những người có thông tin trên đã cung cấp các loại giấy tờ/tài liệu/dữ liệu
                điện tử/ chưa cung cấp các loại giấy tờ liên quan đến việc đăng ký cư trú tại địa chỉ trên gồm:
            </p>
            <p style={{ margin: '5px 0', paddingLeft: '15px' }}>
                <Dots width="100%" />
            </p>
            <p style={{ margin: '5px 0', paddingLeft: '15px' }}>
                <Dots width="100%" />
            </p>

            {/* Section 3 - Owner's opinion */}
            <p style={{ margin: '15px 0 5px 0' }}>
                3.Ý kiến trình bày của chủ hộ/chủ sở hữu nhà hoặc người có liên quan:
            </p>
            <p style={{ margin: '5px 0', paddingLeft: '15px' }}>
                <Field value={yKienChuHo} width="100%" />
            </p>

            {/* Section 4 - Police recommendations */}
            <p style={{ margin: '15px 0 5px 0' }}>
                4. Kiến nghị của Công an phường (nếu có):
            </p>
            <p style={{ margin: '5px 0', paddingLeft: '15px' }}>
                <Field value={kienNghiCongAn} width="100%" />
            </p>

            {/* Conclusion */}
            <p style={{ margin: '15px 0 5px 0' }}>
                Biên bản được lập thành <Dots width="30px" /> bản, giao cho chủ hộ/chủ sở hữu/người quản lý và
                người có liên quan 01 bản, 01 bản lưu hồ sơ.
            </p>
            <p style={{ margin: '5px 0' }}>
                Biên bản lập xong lúc <Dots width="30px" /> giờ <Dots width="30px" /> cùng ngày, đã thông qua
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
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{nguoiLap[0]?.hoTen || 'Tô Nguyên Văn Quốc'}</p>
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
