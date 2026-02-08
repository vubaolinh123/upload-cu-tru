import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    WidthType,
    AlignmentType,
    PageOrientation,
    BorderStyle,
    UnderlineType,
} from 'docx';
import { saveAs } from 'file-saver';
import { Household } from '../types/household';
import { PersonInfo } from '../types/residence';

/**
 * Word Export Service
 * Xuất biên bản kiểm tra cư trú ra file Word (.docx)
 * Format giống 100% template Print
 */

const FIXED_OFFICER_NAME = 'Võ Văn Giáp';
const DOTS = '..........';
const LONG_DOTS = '................................................................';

/**
 * Create text run helper
 */
function text(content: string, options: { bold?: boolean; italic?: boolean; size?: number; underline?: boolean } = {}): TextRun {
    return new TextRun({
        text: content,
        bold: options.bold,
        italics: options.italic,
        size: options.size || 26,
        font: 'Times New Roman',
        underline: options.underline ? { type: UnderlineType.SINGLE } : undefined,
    });
}

/**
 * Create field value or dots if empty
 */
function fieldValue(value: string | undefined, dotCount = 20): string {
    return value?.trim() || '.'.repeat(dotCount);
}

/**
 * Create a simple paragraph
 */
function createParagraph(
    children: TextRun[],
    options: {
        alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
        spacing?: { before?: number; after?: number };
        indent?: number;
    } = {}
): Paragraph {
    return new Paragraph({
        alignment: options.alignment,
        spacing: options.spacing,
        indent: options.indent ? { left: options.indent } : undefined,
        children,
    });
}

/**
 * Create invisible border for table cells
 */
function noBorder() {
    return {
        style: BorderStyle.NONE,
        size: 0,
        color: 'FFFFFF',
    };
}

/**
 * Create header table with two columns
 */
function createHeaderTable(): Table {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: noBorder(),
            bottom: noBorder(),
            left: noBorder(),
            right: noBorder(),
            insideHorizontal: noBorder(),
            insideVertical: noBorder(),
        },
        rows: [
            new TableRow({
                children: [
                    // Left column - Công an
                    new TableCell({
                        width: { size: 45, type: WidthType.PERCENTAGE },
                        borders: {
                            top: noBorder(),
                            bottom: noBorder(),
                            left: noBorder(),
                            right: noBorder(),
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [text('CÔNG AN TỈNH KHÁNH HÒA', { bold: true })],
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [text('CÔNG AN P. NAM NHA TRANG', { bold: true, underline: true })],
                            }),
                        ],
                    }),
                    // Right column - Quốc hiệu
                    new TableCell({
                        width: { size: 55, type: WidthType.PERCENTAGE },
                        borders: {
                            top: noBorder(),
                            bottom: noBorder(),
                            left: noBorder(),
                            right: noBorder(),
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { bold: true })],
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [text('Độc lập – Tự do – Hạnh phúc', { bold: true, underline: true })],
                            }),
                        ],
                    }),
                ],
            }),
        ],
    });
}

/**
 * Create person section
 */
function createPersonSection(person: PersonInfo, index: number): Paragraph[] {
    return [
        createParagraph([
            text(`${index + 1}/ Họ tên: `),
            text(fieldValue(person.hoTen, 40), { bold: !!person.hoTen }),
            text(`; Giới tính: `),
            text(fieldValue(person.gioiTinh, 10), { bold: !!person.gioiTinh }),
        ], { spacing: { before: 100 }, indent: 300 }),

        createParagraph([
            text(`Sinh ngày: `),
            text(fieldValue(person.ngaySinh, 15)),
            text(`; Dân tộc: `),
            text(fieldValue(person.danToc, 12)),
            text(`; Quốc tịch: `),
            text(fieldValue(person.quocTich, 12)),
        ], { indent: 300 }),

        createParagraph([
            text(`Số CCCD/ĐDCN: `),
            text(fieldValue(person.soCCCD, 25)),
        ], { indent: 300 }),

        createParagraph([
            text(`Quê quán: `),
            text(fieldValue(person.queQuan, 60)),
        ], { indent: 300 }),

        createParagraph([
            text(`Quan hệ với chủ hộ: `),
            text(fieldValue(person.quanHeVoiChuHo, 20)),
        ], { indent: 300 }),

        createParagraph([
            text(`Hộ khẩu thường trú: `),
            text(fieldValue(person.hoKhauThuongTru, 60)),
        ], { indent: 300, spacing: { after: 100 } }),
    ];
}

interface HeaderInfo {
    gioLap?: string;
    ngayLap?: string;
}

/**
 * Export household data to Word document - matching Print template 100%
 */
export async function exportHouseholdToWord(household: Household, headerInfo?: HeaderInfo): Promise<void> {
    const chuHo = household.chuHo;
    const allPersons = household.allPersons;
    const diaChiChuHo = chuHo.hoKhauThuongTru || '';

    // Parse ngayLap format: DD/MM/YYYY
    let ngay = '', thang = '', nam = '2026';
    if (headerInfo?.ngayLap) {
        const parts = headerInfo.ngayLap.split('/');
        if (parts.length >= 1) ngay = parts[0];
        if (parts.length >= 2) thang = parts[1];
        if (parts.length >= 3) nam = parts[2];
    }

    // Parse gioLap format: HH:MM or HH
    let gio = '', phut = '';
    if (headerInfo?.gioLap) {
        const timeParts = headerInfo.gioLap.split(':');
        gio = timeParts[0] || '';
        phut = timeParts[1] || '';
    }

    // Build date/time string
    const gioStr = gio || DOTS;
    const phutStr = phut || DOTS;
    const ngayStr = ngay || DOTS;
    const thangStr = thang || DOTS;
    const namStr = nam;

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: {
                            orientation: PageOrientation.PORTRAIT,
                        },
                        margin: {
                            top: 720,
                            right: 720,
                            bottom: 720,
                            left: 1080,
                        },
                    },
                },
                children: [
                    // ========== HEADER TABLE ==========
                    createHeaderTable(),

                    // Spacing after header
                    createParagraph([text('')], { spacing: { after: 300 } }),

                    // ========== TITLE ==========
                    createParagraph([
                        text('BIÊN BẢN KIỂM TRA CƯ TRÚ', { bold: true, size: 32 }),
                    ], { alignment: AlignmentType.CENTER }),

                    createParagraph([
                        text('(V/v Tổng kiểm tra cư trú)', { italic: true, size: 24 }),
                    ], { alignment: AlignmentType.CENTER, spacing: { after: 300 } }),

                    // ========== DATE & LOCATION ==========
                    createParagraph([
                        text(`Hôm nay, vào lúc ${gioStr} giờ ${phutStr} ngày ${ngayStr} tháng ${thangStr} năm ${namStr}`),
                    ]),

                    createParagraph([
                        text(`Tại địa chỉ: `),
                        text(fieldValue(diaChiChuHo, 50), { bold: !!diaChiChuHo }),
                        text(`, phường Nam Nha Trang, tỉnh Khánh Hòa.`),
                    ], { spacing: { after: 200 } }),

                    // ========== OFFICERS ==========
                    createParagraph([text('Chúng tôi gồm:')]),

                    createParagraph([
                        text(`1/ Ông: `),
                        text(FIXED_OFFICER_NAME, { bold: true }),
                        text(` ; Chức vụ: `),
                        text('Cán bộ CSKV', { bold: true }),
                    ], { indent: 300 }),

                    createParagraph([
                        text(`2/ Ông: ${LONG_DOTS} ; Chức vụ: ${DOTS}`),
                    ], { indent: 300, spacing: { after: 200 } }),

                    // ========== WITNESS ==========
                    createParagraph([text('Người chứng kiến (nếu có):')]),

                    createParagraph([
                        text(`Họ tên: ${LONG_DOTS}; sinh ngày: ${DOTS}/${DOTS}/${DOTS}`),
                    ], { indent: 300, spacing: { after: 200 } }),

                    // ========== HOUSEHOLD OWNER ==========
                    createParagraph([
                        text('Tiến hành lập biên bản kiểm tra cư trú tại căn nhà địa chỉ trên do ông bà:'),
                    ]),

                    createParagraph([
                        text(`Họ và tên: `),
                        text(fieldValue(chuHo.hoTen, 40), { bold: !!chuHo.hoTen }),
                        text(`; Sinh ngày: `),
                        text(fieldValue(chuHo.ngaySinh, 15)),
                    ], { indent: 300 }),

                    createParagraph([
                        text(`Số CCCD: `),
                        text(fieldValue(chuHo.soCCCD, 30)),
                        text(` là `),
                        text('Chủ hộ', { bold: true }),
                    ], { indent: 300, spacing: { after: 300 } }),

                    // ========== INSPECTION RESULTS ==========
                    createParagraph([
                        text('KẾT QUẢ KIỂM TRA', { bold: true, size: 28 }),
                    ], { alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }),

                    // Section 1
                    createParagraph([
                        text(`1. Thời điểm kiểm tra tại căn nhà/phòng số ${DOTS} địa chỉ trên thực tế có `),
                        text(allPersons.length.toString(), { bold: true }),
                        text(` nhân khẩu đang cư trú gồm:`),
                    ], { spacing: { after: 100 } }),

                    // All persons
                    ...allPersons.flatMap((person, idx) => createPersonSection(person, idx)),

                    // Section 2
                    createParagraph([
                        text(`2. Qua kiểm tra những người có thông tin trên đã cung cấp các loại giấy tờ/tài liệu/dữ liệu điện tử/ chưa cung cấp các loại giấy tờ liên quan đến việc đăng ký cư trú tại địa chỉ trên gồm:`),
                    ], { spacing: { before: 200 } }),

                    createParagraph([text(LONG_DOTS + LONG_DOTS)], { indent: 300 }),
                    createParagraph([text(LONG_DOTS + LONG_DOTS)], { indent: 300, spacing: { after: 200 } }),

                    // Section 3
                    createParagraph([
                        text(`3. Ý kiến trình bày của chủ hộ/chủ sở hữu nhà hoặc người có liên quan:`),
                    ]),
                    createParagraph([text(LONG_DOTS)], { alignment: AlignmentType.CENTER, spacing: { after: 200 } }),

                    // Section 4
                    createParagraph([
                        text(`4. Kiến nghị của Công an phường (nếu có):`),
                    ]),
                    createParagraph([text(LONG_DOTS)], { alignment: AlignmentType.CENTER, spacing: { after: 300 } }),

                    // ========== CONCLUSION ==========
                    createParagraph([
                        text(`Biên bản được lập thành ${DOTS} bản, giao cho chủ hộ/chủ sở hữu/người quản lý và người có liên quan 01 bản, 01 bản lưu hồ sơ.`),
                    ]),

                    createParagraph([
                        text(`Biên bản lập xong lúc ${DOTS} giờ ${DOTS} cùng ngày, đã thông qua cho những người có tên trong biên bản nghe, đồng ý nội dung và ký tên xác nhận.`),
                    ], { spacing: { after: 400 } }),

                    // ========== SIGNATURES TABLE ==========
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: noBorder(),
                            bottom: noBorder(),
                            left: noBorder(),
                            right: noBorder(),
                            insideHorizontal: noBorder(),
                            insideVertical: noBorder(),
                        },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: { top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() },
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: [text('Chủ hộ/Chủ sở hữu/Người có', { bold: true })],
                                            }),
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: [text('liên quan', { bold: true })],
                                            }),
                                        ],
                                    }),
                                    new TableCell({
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: { top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() },
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: [text('Người lập biên bản', { bold: true })],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            // Signature space
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: { top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() },
                                        children: [
                                            new Paragraph({ children: [text('')] }),
                                            new Paragraph({ children: [text('')] }),
                                            new Paragraph({ children: [text('')] }),
                                        ],
                                    }),
                                    new TableCell({
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: { top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() },
                                        children: [
                                            new Paragraph({ children: [text('')] }),
                                            new Paragraph({ children: [text('')] }),
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: [text(FIXED_OFFICER_NAME, { bold: true })],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),

                    // Witness signature
                    createParagraph([
                        text('Người chứng kiến (nếu có)', { bold: true }),
                    ], { alignment: AlignmentType.CENTER, spacing: { before: 300 } }),
                ],
            },
        ],
    });

    // Generate and save the document
    const blob = await Packer.toBlob(doc);
    const filename = `bien-ban-kiem-tra-${sanitizeFileName(household.chuHo.hoTen)}.docx`;
    saveAs(blob, filename);
}

/**
 * Sanitize filename
 */
function sanitizeFileName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\u00C0-\u024F]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
