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
import { CT3ARecord } from '../types/pdfTypes';

/**
 * CT3A Word Export Service
 * Xuất dữ liệu CT3A từ PDF sang file Word (.docx)
 */

// Column configuration matching CT3A table
const TABLE_COLUMNS = [
    { header: 'STT', width: 4 },
    { header: 'Họ và tên', width: 10 },
    { header: 'Số ĐDCN/CCCD', width: 9 },
    { header: 'Ngày sinh', width: 7 },
    { header: 'Giới tính', width: 5 },
    { header: 'Quê quán', width: 10 },
    { header: 'Dân tộc', width: 5 },
    { header: 'Quốc tịch', width: 5 },
    { header: 'Số HSCT', width: 8 },
    { header: 'Quan hệ', width: 6 },
    { header: 'Ở đâu đến', width: 12 },
    { header: 'Ngày đến', width: 7 },
    { header: 'Địa chỉ thường trú', width: 12 },
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
function createCell(text: string, isHeader = false, widthPercent = 8): TableCell {
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
        shading: isHeader ? {
            fill: '1E40AF', // Blue-800
        } : undefined,
        children: [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: text || '-',
                        bold: isHeader,
                        size: isHeader ? 20 : 18, // 10pt and 9pt
                        font: 'Times New Roman',
                        color: isHeader ? 'FFFFFF' : '000000',
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
 * Create data row for a CT3A record
 */
function createDataRow(record: CT3ARecord, index: number): TableRow {
    return new TableRow({
        children: [
            createCell((record.stt || index + 1).toString(), false, TABLE_COLUMNS[0].width),
            createCell(record.hoTen || '', false, TABLE_COLUMNS[1].width),
            createCell(record.soDDCN_CCCD || '', false, TABLE_COLUMNS[2].width),
            createCell(record.ngaySinh || '', false, TABLE_COLUMNS[3].width),
            createCell(record.gioiTinh || '', false, TABLE_COLUMNS[4].width),
            createCell(record.queQuan || '', false, TABLE_COLUMNS[5].width),
            createCell(record.danToc || '', false, TABLE_COLUMNS[6].width),
            createCell(record.quocTich || '', false, TABLE_COLUMNS[7].width),
            createCell(record.soHSCT || '', false, TABLE_COLUMNS[8].width),
            createCell(record.quanHeVoiChuHo || '', false, TABLE_COLUMNS[9].width),
            createCell(record.oDauDen || '', false, TABLE_COLUMNS[10].width),
            createCell(record.ngayDen || '', false, TABLE_COLUMNS[11].width),
            createCell(record.diaChiThuongTru || '', false, TABLE_COLUMNS[12].width),
        ],
    });
}

/**
 * Export CT3A records to Word document
 */
export async function exportCT3AToWord(records: CT3ARecord[], fileName: string): Promise<void> {
    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: {
                            orientation: PageOrientation.LANDSCAPE,
                        },
                        margin: {
                            top: 720, // 0.5 inch
                            right: 720,
                            bottom: 720,
                            left: 720,
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
                                text: 'DỮ LIỆU TRÍCH XUẤT TỪ PDF',
                                bold: true,
                                size: 32, // 16pt
                                font: 'Times New Roman',
                                color: '1E40AF',
                            }),
                        ],
                    }),

                    // File name
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200, after: 100 },
                        children: [
                            new TextRun({
                                text: `File: ${fileName.toUpperCase()}`,
                                bold: true,
                                size: 24, // 12pt
                                font: 'Times New Roman',
                            }),
                        ],
                    }),

                    // Metadata
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 300 },
                        children: [
                            new TextRun({
                                text: `Tổng số bản ghi: ${records.length} | Xuất lúc: ${new Date().toLocaleString('vi-VN')}`,
                                italics: true,
                                size: 20, // 10pt
                                font: 'Times New Roman',
                                color: '6B7280',
                            }),
                        ],
                    }),

                    // Table
                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                        },
                        rows: (() => {
                            // Sort records by stt to maintain original PDF order
                            const sortedRecords = [...records].sort((a, b) => {
                                const sttA = typeof a.stt === 'number' ? a.stt : parseInt(String(a.stt)) || 0;
                                const sttB = typeof b.stt === 'number' ? b.stt : parseInt(String(b.stt)) || 0;
                                return sttA - sttB;
                            });
                            return [
                                createHeaderRow(),
                                ...sortedRecords.map((record, index) =>
                                    createDataRow(record, index)
                                ),
                            ];
                        })(),
                    }),

                    // Footer
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 300 },
                        children: [
                            new TextRun({
                                text: 'Được tạo bởi PDF to Excel Converter',
                                italics: true,
                                size: 18, // 9pt
                                font: 'Times New Roman',
                                color: '9CA3AF',
                            }),
                        ],
                    }),
                ],
            },
        ],
    });

    // Generate and save the document
    const blob = await Packer.toBlob(doc);
    const outputFileName = `ct3a-${sanitizeFileName(fileName)}.docx`;
    saveAs(blob, outputFileName);
}

/**
 * Sanitize filename
 */
function sanitizeFileName(name: string): string {
    return name
        .toLowerCase()
        .replace(/\.pdf$/i, '')
        .replace(/[^a-z0-9\u00C0-\u024F]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
