/**
 * Gemini API Configuration for OCR
 * Using Google GenAI SDK
 */

import { GoogleGenAI } from '@google/genai';

// Lazy initialize Gemini client
let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.API_KEY_GEMINI;
    if (!apiKey) {
      throw new Error('API_KEY_GEMINI is not configured');
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

/**
 * Gemini Model Configuration for OCR
 * 
 * BEST MODELS FOR OCR (theo đánh giá 2024-2025):
 * 
 * 1. gemini-2.0-flash (RECOMMENDED) - Tốt nhất cho OCR
 *    - Nhanh nhất và rẻ nhất (~25x rẻ hơn 1.5-pro)
 *    - Kết quả OCR nhất quán, thậm chí tốt hơn 2.5-flash trong một số test
 *    - 1 triệu token context
 *    - Lý tưởng cho xử lý batch với nhiều trang
 * 
 * 2. gemini-1.5-pro - Độ chính xác cao nhất
 *    - Hỗ trợ lên tới 10 triệu tokens
 *    - Multimodal mạnh mẽ
 *    - Đắt hơn nhưng phù hợp khi cần độ chính xác tối đa
 * 
 * 3. gemini-2.5-pro - Tốt cho complex reasoning
 *    - Enhanced reasoning và coding
 *    - Tốt cho documents phức tạp
 */
export const GEMINI_CONFIG = {
  // Model tốt nhất cho OCR - nhanh, rẻ, chính xác
  model: 'gemini-2.0-flash',
  maxOutputTokens: 16384,
  // Yêu cầu Gemini trả về JSON thuần túy (không markdown code blocks)
  responseMimeType: 'application/json',
};

/**
 * OCR Prompt template for Image (Household Registration)
 */
export const IMAGE_OCR_PROMPT = `Ảnh tôi đã tải lên trong cuộc trò chuyện này.

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

/**
 * OCR Prompt for PDF Table (CT3A Format)
 */
export const PDF_OCR_PROMPT = `Ảnh này là một trang từ file PDF chứa bảng dữ liệu cư trú.

Hãy đọc TẤT CẢ các hàng trong bảng và trích xuất thông tin theo các cột sau:

⚠️ QUAN TRỌNG - CÓ 2 CỘT STT RIÊNG BIỆT:
- "sttChinh": STT ở CỘT ĐẦU TIÊN bên trái nhất - là số thứ tự hàng LỚN (ví dụ: 1-100000). 
  Nếu cột này không có hoặc trống thì gán null.
- "sttTrongHo": STT ở CỘT THỨ HAI - là số thứ tự trong hộ gia đình (1 = chủ hộ, 2, 3, 4 = thành viên).
  Đây thường là số nhỏ từ 1-10.

Các cột khác:
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
7. GIỮ NGUYÊN THỨ TỰ các dòng như trong ảnh - KHÔNG SẮP XẾP LẠI

Trả về JSON array với format:
[
  {
    "sttChinh": number | null,
    "sttTrongHo": number,
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
