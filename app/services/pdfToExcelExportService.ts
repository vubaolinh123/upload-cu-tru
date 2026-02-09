import ExcelJS from 'exceljs';
import { CT3ARecord } from '../types/pdfTypes';

/**
 * PDF to Excel Export Service
 * Xuất dữ liệu CT3A từ PDF sang Excel với format đẹp
 */

// Column configuration matching CT3A table
const COLUMNS: Partial<ExcelJS.Column>[] = [
    { header: 'STT', key: 'stt', width: 6 },
    { header: 'Họ và tên', key: 'hoTen', width: 20 },
    { header: 'Số ĐDCN/CCCD', key: 'soDDCN_CCCD', width: 16 },
    { header: 'Ngày sinh', key: 'ngaySinh', width: 12 },
    { header: 'Giới tính', key: 'gioiTinh', width: 10 },
    { header: 'Quê quán', key: 'queQuan', width: 25 },
    { header: 'Dân tộc', key: 'danToc', width: 10 },
    { header: 'Quốc tịch', key: 'quocTich', width: 10 },
    { header: 'Số HSCT', key: 'soHSCT', width: 14 },
    { header: 'Quan hệ với chủ hộ', key: 'quanHeVoiChuHo', width: 16 },
    { header: 'Ở đâu đến', key: 'oDauDen', width: 35 },
    { header: 'Ngày đến', key: 'ngayDen', width: 12 },
    { header: 'Địa chỉ thường trú', key: 'diaChiThuongTru', width: 40 },
];

// Colors
const HEADER_BG_COLOR = '1E40AF'; // Blue-800
const HEADER_TEXT_COLOR = 'FFFFFF';
const ALTERNATE_ROW_COLOR = 'EFF6FF'; // Blue-50
const BORDER_COLOR = '94A3B8'; // Slate-400

/**
 * Export CT3A records to Excel file and download
 */
export async function exportCT3AToExcel(
    records: CT3ARecord[],
    fileName: string
): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PDF to Excel Converter';
    workbook.created = new Date();

    // Create worksheet
    const worksheet = workbook.addWorksheet('CT3A Data', {
        pageSetup: {
            orientation: 'landscape',
            fitToPage: true,
            paperSize: 9, // A4
        },
    });

    // Add title row
    const titleRow = worksheet.addRow([`DỮ LIỆU TRÍCH XUẤT TỪ: ${fileName.toUpperCase()}`]);
    titleRow.font = { bold: true, size: 16, color: { argb: HEADER_BG_COLOR } };
    worksheet.mergeCells(1, 1, 1, COLUMNS.length);
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.height = 30;

    // Add subtitle with metadata
    const subtitleRow = worksheet.addRow([
        `Tổng số bản ghi: ${records.length} | Xuất lúc: ${new Date().toLocaleString('vi-VN')}`
    ]);
    subtitleRow.font = { italic: true, size: 11, color: { argb: '6B7280' } };
    worksheet.mergeCells(2, 1, 2, COLUMNS.length);
    subtitleRow.alignment = { horizontal: 'center' };

    // Empty row
    worksheet.addRow([]);

    // Set columns
    worksheet.columns = COLUMNS;

    // Add header row (row 4)
    const headerRow = worksheet.addRow(COLUMNS.map(col => col.header));
    styleHeaderRow(headerRow);

    // Sort records by stt to maintain original PDF order
    const sortedRecords = [...records].sort((a, b) => {
        const sttA = typeof a.stt === 'number' ? a.stt : parseInt(String(a.stt)) || 0;
        const sttB = typeof b.stt === 'number' ? b.stt : parseInt(String(b.stt)) || 0;
        return sttA - sttB;
    });

    // Add data rows
    sortedRecords.forEach((record, index) => {
        const row = worksheet.addRow([
            record.stt || index + 1,
            record.hoTen || '',
            record.soDDCN_CCCD || '',
            record.ngaySinh || '',
            record.gioiTinh || '',
            record.queQuan || '',
            record.danToc || '',
            record.quocTich || '',
            record.soHSCT || '',
            record.quanHeVoiChuHo || '',
            record.oDauDen || '',
            record.ngayDen || '',
            record.diaChiThuongTru || '',
        ]);
        styleDataRow(row, index);
    });

    // Add borders to all data cells
    const lastRowNum = worksheet.rowCount;
    for (let rowNum = 4; rowNum <= lastRowNum; rowNum++) {
        const row = worksheet.getRow(rowNum);
        row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
                top: { style: 'thin', color: { argb: BORDER_COLOR } },
                left: { style: 'thin', color: { argb: BORDER_COLOR } },
                bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
                right: { style: 'thin', color: { argb: BORDER_COLOR } },
            };
        });
    }

    // Freeze header row
    worksheet.views = [
        { state: 'frozen', ySplit: 4 }
    ];

    // Generate file and download
    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(buffer, `ct3a-${sanitizeFileName(fileName)}.xlsx`);
}

/**
 * Style header row
 */
function styleHeaderRow(row: ExcelJS.Row): void {
    row.height = 28;
    row.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: HEADER_BG_COLOR },
        };
        cell.font = {
            bold: true,
            color: { argb: HEADER_TEXT_COLOR },
            size: 11,
        };
        cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
        };
    });
}

/**
 * Style data row with alternating colors
 */
function styleDataRow(row: ExcelJS.Row, index: number): void {
    row.height = 24;
    row.eachCell((cell, colNumber) => {
        // Alternate row color
        if (index % 2 === 1) {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: ALTERNATE_ROW_COLOR },
            };
        }
        cell.alignment = {
            vertical: 'middle',
            wrapText: true,
        };
        cell.font = { size: 10 };

        // Center align specific columns
        if ([1, 4, 5, 7, 8, 10, 12].includes(colNumber)) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
    });
}

/**
 * Download blob as file
 */
function downloadBlob(buffer: ExcelJS.Buffer, filename: string): void {
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
