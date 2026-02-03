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
    BorderStyle,
    HeadingLevel,
    PageOrientation,
} from 'docx';
import { saveAs } from 'file-saver';
import { Household } from '../types/household';
import { PersonInfo } from '../types/residence';

/**
 * Word Export Service
 * Xuất biên bản kiểm tra cư trú ra file Word (.docx)
 */

// Column configuration for the table
const TABLE_COLUMNS = [
    { header: 'STT', width: 5 },
    { header: 'Họ và tên', width: 15 },
    { header: 'Số CCCD', width: 12 },
    { header: 'Ngày sinh', width: 10 },
    { header: 'Giới tính', width: 8 },
    { header: 'Quê quán', width: 15 },
    { header: 'Dân tộc', width: 8 },
    { header: 'Quốc tịch', width: 8 },
    { header: 'Quan hệ với chủ hộ', width: 12 },
    { header: 'Hộ khẩu thường trú', width: 20 },
];

/**
 * Create table border configuration
 */
function createBorder() {
    return {
        style: BorderStyle.SINGLE,
        size: 1,
        color: '000000',
    };
}

/**
 * Create a table cell with text
 */
function createCell(text: string, isHeader = false, widthPercent = 10): TableCell {
    return new TableCell({
        width: {
            size: widthPercent,
            type: WidthType.PERCENTAGE,
        },
        borders: {
            top: createBorder(),
            bottom: createBorder(),
            left: createBorder(),
            right: createBorder(),
        },
        children: [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: text || '-',
                        bold: isHeader,
                        size: isHeader ? 22 : 20, // 11pt and 10pt
                        font: 'Times New Roman',
                    }),
                ],
            }),
        ],
    });
}

/**
 * Create header row for the table
 */
function createHeaderRow(): TableRow {
    return new TableRow({
        children: TABLE_COLUMNS.map((col) =>
            createCell(col.header, true, col.width)
        ),
        tableHeader: true,
    });
}

/**
 * Create data row for a person
 */
function createDataRow(person: PersonInfo, stt: number): TableRow {
    return new TableRow({
        children: [
            createCell(stt.toString(), false, TABLE_COLUMNS[0].width),
            createCell(person.hoTen || '', false, TABLE_COLUMNS[1].width),
            createCell(person.soCCCD || '', false, TABLE_COLUMNS[2].width),
            createCell(person.ngaySinh || '', false, TABLE_COLUMNS[3].width),
            createCell(person.gioiTinh || '', false, TABLE_COLUMNS[4].width),
            createCell(person.queQuan || '', false, TABLE_COLUMNS[5].width),
            createCell(person.danToc || '', false, TABLE_COLUMNS[6].width),
            createCell(person.quocTich || '', false, TABLE_COLUMNS[7].width),
            createCell(person.quanHeVoiChuHo || '', false, TABLE_COLUMNS[8].width),
            createCell(person.hoKhauThuongTru || '', false, TABLE_COLUMNS[9].width),
        ],
    });
}

/**
 * Export household data to Word document
 */
export async function exportHouseholdToWord(household: Household): Promise<void> {
    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: {
                            orientation: PageOrientation.LANDSCAPE,
                        },
                    },
                },
                children: [
                    // Title
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        heading: HeadingLevel.HEADING_1,
                        children: [
                            new TextRun({
                                text: 'BIÊN BẢN KIỂM TRA CƯ TRÚ',
                                bold: true,
                                size: 32, // 16pt
                                font: 'Times New Roman',
                            }),
                        ],
                    }),

                    // Subtitle - Household info
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200, after: 200 },
                        children: [
                            new TextRun({
                                text: `Hộ: ${household.chuHo.hoTen.toUpperCase()}`,
                                bold: true,
                                size: 26, // 13pt
                                font: 'Times New Roman',
                            }),
                        ],
                    }),

                    // Address
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                        children: [
                            new TextRun({
                                text: `Địa chỉ: ${household.chuHo.hoKhauThuongTru || 'Chưa có thông tin'}`,
                                italics: true,
                                size: 22, // 11pt
                                font: 'Times New Roman',
                            }),
                        ],
                    }),

                    // Section title
                    new Paragraph({
                        spacing: { before: 200, after: 200 },
                        children: [
                            new TextRun({
                                text: 'DANH SÁCH NHÂN KHẨU',
                                bold: true,
                                size: 24, // 12pt
                                font: 'Times New Roman',
                            }),
                        ],
                    }),

                    // Table
                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                        },
                        rows: [
                            createHeaderRow(),
                            ...household.allPersons.map((person, index) =>
                                createDataRow(person, index + 1)
                            ),
                        ],
                    }),

                    // Footer - Export date
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 400 },
                        children: [
                            new TextRun({
                                text: `Ngày xuất: ${new Date().toLocaleString('vi-VN')}`,
                                italics: true,
                                size: 20, // 10pt
                                font: 'Times New Roman',
                            }),
                        ],
                    }),
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
