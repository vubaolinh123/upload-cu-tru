/**
 * OpenAI API Configuration for OCR
 * Using official OpenAI SDK
 */

export const OPENAI_CONFIG = {
  model: 'gpt-4o',
  maxTokens: 16384, // Model max limit
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

QUAN TRỌNG - THỨ TỰ ĐỌC:
- Đọc từ TRÁI SANG PHẢI, từ TRÊN XUỐNG DƯỚI trong mỗi ô
- Nếu một ô có nhiều dòng (tên dài bị xuống hàng), ghép DÒNG TRÊN TRƯỚC rồi đến DÒNG DƯỚI
- Ví dụ: Nếu trong ô tên thấy "Nguyễn Đức" ở dòng 1 và "Bình" ở dòng 2 → Họ tên đầy đủ là "Nguyễn Đức Bình"
- KHÔNG đọc ngược: "Bình Nguyễn Đức" là SAI
- Họ luôn đứng trước, tên đứng sau (theo thứ tự tiếng Việt)

⚠️ CẢNH BÁO - LỖI THƯỜNG GẶP:
- KHÔNG NHẦM LẪN giữa "ngaySinh" và "hoKhauThuongTru"
- "ngaySinh" chỉ chứa NGÀY THÁNG NĂM SINH với định dạng DD/MM/YYYY (ví dụ: 15/03/1990, 01/12/1985)
- "hoKhauThuongTru" là ĐỊA CHỈ, chứa tên đường, số nhà, phường, quận (ví dụ: "Căn hộ 807, Tòa nhà A, Đường Nguyễn Trãi, Phường 1, Quận 5")
- Nếu dữ liệu là NGÀY (DD/MM/YYYY) → đó là "ngaySinh"
- Nếu dữ liệu là ĐỊA CHỈ (có tên đường, số nhà, phường, quận) → đó là "hoKhauThuongTru"

QUAN TRỌNG - Đọc đúng các cột trong ảnh:
- "stt": Số thứ tự trong ảnh
- "hoTen": Họ và tên
- "soCCCD": Số CCCD/CMND (12 số)
- "ngaySinh": Ngày tháng năm sinh - CHỈ CHỨA NGÀY THÁNG NĂM theo định dạng DD/MM/YYYY (ví dụ: 15/03/1990). KHÔNG BAO GIỜ chứa địa chỉ!
- "gioiTinh": Nam hoặc Nữ
- "queQuan": Quê quán (cột ghi nơi sinh/nguyên quán) - là địa danh cấp tỉnh/huyện
- "danToc": Dân tộc (Kinh, Hoa, Tày, Nùng...)
- "quocTich": Quốc tịch (Việt Nam, ...)
- "quanHeVoiChuHo": Quan hệ với chủ hộ (Chủ hộ, Vợ, Chồng, Con, Con đẻ, Cháu...)
- "oDauDen": Ở đâu đến - địa chỉ nơi ở TRƯỚC ĐÓ (ví dụ: 25 Lô NV07 Khu ĐTM...)
- "hoKhauThuongTru": Hộ khẩu thường trú - ĐỊA CHỈ ĐĂNG KÝ THƯỜNG TRÚ HIỆN TẠI (ví dụ: Căn hộ chung cư số 807, Tòa A, Đường ABC). Đây là ĐỊA CHỈ, KHÔNG PHẢI NGÀY SINH!

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
