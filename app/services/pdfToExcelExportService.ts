import ExcelJS from 'exceljs';
import { PdfTextData } from '../types/pdfTypes';

/**
 * PDF to Excel Export Service
 * Exports extracted PDF text data to Excel format
 * Option A: Raw text - each page = 1 row in Excel
 */

// Column configuration
const COLUMNS: Partial<ExcelJS.Column>[] = [
    { header: 'STT', key: 'stt', width: 8 },
    { header: 'Trang', key: 'page', width: 10 },
    { header: 'Nội dung', key: 'content', width: 100 },
];

// Colors
const HEADER_BG_COLOR = '2563EB'; // Blue-600
const HEADER_TEXT_COLOR = 'FFFFFF';
const ALTERNATE_ROW_COLOR = 'F3F4F6'; // Gray-100
const BORDER_COLOR = '000000';

/**
 * Export PDF text data to Excel file and download
 */
export async function exportPdfToExcel(pdfData: PdfTextData): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PDF to Excel Converter';
    workbook.created = new Date();

    // Create worksheet
    const worksheet = workbook.addWorksheet('Nội dung PDF', {
        pageSetup: {
            orientation: 'landscape',
            fitToPage: true,
        },
    });

    // Add title row
    const titleRow = worksheet.addRow([`NỘI DUNG TRÍCH XUẤT TỪ: ${pdfData.fileName.toUpperCase()}`]);
    titleRow.font = { bold: true, size: 14 };
    worksheet.mergeCells(1, 1, 1, COLUMNS.length);
    titleRow.alignment = { horizontal: 'center' };
    titleRow.height = 25;

    // Add subtitle with metadata
    const subtitleRow = worksheet.addRow([
        `Tổng số trang: ${pdfData.totalPages} | Trích xuất lúc: ${pdfData.extractedAt.toLocaleString('vi-VN')}`
    ]);
    subtitleRow.font = { italic: true, size: 11 };
    worksheet.mergeCells(2, 1, 2, COLUMNS.length);
    subtitleRow.alignment = { horizontal: 'center' };

    // Empty row
    worksheet.addRow([]);

    // Set columns
    worksheet.columns = COLUMNS;

    // Add header row (row 4)
    const headerRow = worksheet.addRow(COLUMNS.map(col => col.header));
    styleHeaderRow(headerRow);

    // Add data rows - each page = 1 row
    pdfData.pages.forEach((page, index) => {
        const row = worksheet.addRow([
            index + 1,
            `Trang ${page.pageNumber}`,
            page.text,
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

    // Generate file and download
    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(buffer, `pdf-extract-${sanitizeFileName(pdfData.fileName)}.xlsx`);
}

/**
 * Style header row
 */
function styleHeaderRow(row: ExcelJS.Row): void {
    row.height = 22;
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
    row.height = 60; // Taller rows for text content
    row.eachCell((cell) => {
        // Alternate row color
        if (index % 2 === 1) {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: ALTERNATE_ROW_COLOR },
            };
        }
        cell.alignment = {
            vertical: 'top',
            wrapText: true,
        };
        cell.font = { size: 10 };
    });

    // Center align STT and Page columns
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
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
