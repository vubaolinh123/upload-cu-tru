/**
 * OpenAI API Configuration for OCR
 * Using official OpenAI SDK
 */

export const OPENAI_CONFIG = {
    model: 'gpt-4o',
    maxTokens: 70000,
};

/**
 * OCR Prompt template for GPT-4o
 * Updated to read correct fields from household registration images
 */
export const OCR_PROMPT = `Ảnh tôi đã tải lên trong cuộc trò chuyện này.

Hãy:
1. Đọc toàn bộ nội dung văn bản có trong ảnh (OCR).
2. KHÔNG được từ chối với lý do "không đọc được ảnh".
3. KHÔNG suy đoán, KHÔNG thêm thông tin ngoài ảnh.
4. Nếu trường nào không có dữ liệu thì gán null.
5. Trả kết quả HOÀN TOÀN BẰNG TIẾNG VIỆT.
6. Trả về đúng định dạng JSON dưới đây, không thêm giải thích.

QUAN TRỌNG - Đọc đúng các cột trong ảnh:
- "stt": Số thứ tự trong ảnh
- "hoTen": Họ và tên
- "soCCCD": Số CCCD/CMND
- "ngaySinh": Ngày tháng năm sinh
- "gioiTinh": Nam hoặc Nữ
- "queQuan": Quê quán (cột ghi nơi sinh/nguyên quán)
- "danToc": Dân tộc
- "quocTich": Quốc tịch
- "quanHeVoiChuHo": Quan hệ với chủ hộ (Chủ hộ, Vợ, Chồng, Con, Con đẻ, Cháu...)
- "oDauDen": Ở đâu đến - địa chỉ nơi ở trước đó (ví dụ: 25 Lô NV07 Khu ĐTM...)
- "hoKhauThuongTru": Hộ khẩu thường trú - địa chỉ đăng ký thường trú (ví dụ: Căn hộ chung cư số 807...)

[
  {
    "stt": number,
    "hoTen": string | null,
    "soCCCD": string | null,
    "ngaySinh": string | null,
    "gioiTinh": string | null,
    "queQuan": string | null,
    "danToc": string | null,
    "quocTich": string | null,
    "quanHeVoiChuHo": string | null,
    "oDauDen": string | null,
    "hoKhauThuongTru": string | null
  }
]`;
