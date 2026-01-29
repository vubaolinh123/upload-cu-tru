/**
 * OpenAI API Configuration for OCR
 */

export const OPENAI_CONFIG = {
    endpoint: 'https://api.openai.com/v1/responses',
    model: 'gpt-4o',
    maxOutputTokens: 70000,
};

/**
 * OCR Prompt template for GPT-4o
 */
export const OCR_PROMPT = `Ảnh tôi đã tải lên trong cuộc trò chuyện này.

Hãy:
1. Đọc toàn bộ nội dung văn bản có trong ảnh (OCR).
2. KHÔNG được từ chối với lý do "không đọc được ảnh".
3. KHÔNG suy đoán, KHÔNG thêm thông tin ngoài ảnh.
4. Nếu trường nào không có dữ liệu thì gán null.
5. Trả kết quả HOÀN TOÀN BẰNG TIẾNG VIỆT.
6. Trả về đúng định dạng JSON dưới đây, không thêm giải thích.

[
  {
    "hoTen": string | null,
    "soCCCD": string | null,
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
]`;

/**
 * Build OpenAI request body for OCR
 */
export function buildOpenAIRequestBody(base64Image: string, mimeType: string = 'image/jpeg') {
    return {
        model: OPENAI_CONFIG.model,
        input: [
            {
                role: 'user',
                content: [
                    {
                        type: 'input_text',
                        text: OCR_PROMPT,
                    },
                    {
                        type: 'input_image',
                        image_url: `data:${mimeType};base64,${base64Image}`,
                    },
                ],
            },
        ],
        max_output_tokens: OPENAI_CONFIG.maxOutputTokens,
    };
}
