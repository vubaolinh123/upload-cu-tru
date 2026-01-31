/**
 * OpenAI Prompt for PDF Table OCR (CT3A Format)
 * Dùng để đọc bảng từ ảnh các trang PDF
 */

export const PDF_OCR_PROMPT = `Ảnh này là một trang từ file PDF chứa bảng dữ liệu cư trú.

Hãy đọc TẤT CẢ các hàng trong bảng và trích xuất thông tin theo các cột sau:
- "stt": Số thứ tự
- "hoTen": Họ và tên
- "soDDCN_CCCD": Số ĐDCN/CCCD
- "ngaySinh": Ngày sinh (định dạng DD/MM/YYYY)
- "gioiTinh": Giới tính (Nam/Nữ)
- "queQuan": Quê quán
- "danToc": Dân tộc
- "quocTich": Quốc tịch
- "soHSCT": Số HSCT
- "quanHeVoiChuHo": Quan hệ với chủ hộ
- "oDauDen": Ở đâu đến
- "ngayDen": Ngày đến (định dạng DD/MM/YYYY)
- "diaChiThuongTru": Địa chỉ thường trú

QUAN TRỌNG:
1. Đọc TẤT CẢ các dòng dữ liệu trong bảng, không bỏ sót dòng nào
2. Đọc từ TRÁI sang PHẢI, từ TRÊN xuống DƯỚI
3. Nếu ô nào trống hoặc không đọc được thì gán null
4. Nếu văn bản trong ô bị xuống hàng, ghép các dòng lại
5. KHÔNG thêm thông tin không có trong ảnh
6. Trả về ĐÚNG định dạng JSON, không thêm giải thích

Trả về JSON array với format:
[
  {
    "stt": number,
    "hoTen": string | null,
    "soDDCN_CCCD": string | null,
    "ngaySinh": string | null,
    "gioiTinh": string | null,
    "queQuan": string | null,
    "danToc": string | null,
    "quocTich": string | null,
    "soHSCT": string | null,
    "quanHeVoiChuHo": string | null,
    "oDauDen": string | null,
    "ngayDen": string | null,
    "diaChiThuongTru": string | null
  }
]

Nếu trang không có dữ liệu bảng hoặc chỉ có header, trả về mảng rỗng: []`;

export const OPENAI_PDF_CONFIG = {
    model: 'gpt-4o',
    maxTokens: 16384,
};
