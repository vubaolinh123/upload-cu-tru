import ExcelJS from 'exceljs';
import { Household } from '../types/household';
import { PersonInfo } from '../types/residence';

/**
 * Excel Export Service
 * Reusable module for exporting household data to Excel
 */

// Column configuration
const COLUMNS: Partial<ExcelJS.Column>[] = [
    { header: 'STT', key: 'stt', width: 6 },
    { header: 'Họ và tên', key: 'hoTen', width: 25 },
    { header: 'Số CCCD', key: 'soCCCD', width: 18 },
    { header: 'Ngày sinh', key: 'ngaySinh', width: 12 },
    { header: 'Giới tính', key: 'gioiTinh', width: 10 },
    { header: 'Quê quán', key: 'queQuan', width: 30 },
    { header: 'Dân tộc', key: 'danToc', width: 10 },
    { header: 'Quốc tịch', key: 'quocTich', width: 12 },
    { header: 'Quan hệ với chủ hộ', key: 'quanHeVoiChuHo', width: 18 },
    { header: 'Hộ khẩu thường trú', key: 'hoKhauThuongTru', width: 45 },
];

// Colors
const HEADER_BG_COLOR = '2563EB'; // Blue-600
const HEADER_TEXT_COLOR = 'FFFFFF';
const ALTERNATE_ROW_COLOR = 'F3F4F6'; // Gray-100
const BORDER_COLOR = '000000';

/**
 * Export a household to Excel file and download
 */
export async function exportHouseholdToExcel(household: Household): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Hệ thống kiểm tra cư trú';
    workbook.created = new Date();

    // Create worksheet
    const worksheet = workbook.addWorksheet('Danh sách nhân khẩu', {
        pageSetup: {
            orientation: 'landscape',
            fitToPage: true,
        },
    });

    // Add title row
    const titleRow = worksheet.addRow([`DANH SÁCH NHÂN KHẨU - HỘ ${household.chuHo.hoTen.toUpperCase()}`]);
    titleRow.font = { bold: true, size: 14 };
    worksheet.mergeCells(1, 1, 1, COLUMNS.length);
    titleRow.alignment = { horizontal: 'center' };
    titleRow.height = 25;

    // Add subtitle with address
    const subtitleRow = worksheet.addRow([`Địa chỉ: ${household.chuHo.hoKhauThuongTru || 'Chưa có thông tin'}`]);
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

    // Add data rows
    household.allPersons.forEach((person, index) => {
        const row = worksheet.addRow(personToRow(person, index + 1));
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
    downloadBlob(buffer, `danh-sach-nhan-khau-${sanitizeFileName(household.chuHo.hoTen)}.xlsx`);
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
    row.height = 20;
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
            vertical: 'middle',
            wrapText: true,
        };
        cell.font = { size: 10 };
    });

    // Center align STT column
    const sttCell = row.getCell(1);
    sttCell.alignment = { horizontal: 'center', vertical: 'middle' };
}

/**
 * Convert PersonInfo to row data
 */
function personToRow(person: PersonInfo, stt: number): (string | number)[] {
    return [
        stt,
        person.hoTen || '',
        person.soCCCD || '',
        person.ngaySinh || '',
        person.gioiTinh || '',
        person.queQuan || '',
        person.danToc || '',
        person.quocTich || '',
        person.quanHeVoiChuHo || '',
        person.hoKhauThuongTru || '',
    ];
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
        .replace(/[^a-z0-9\u00C0-\u024F]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
