import ExcelJS from "exceljs";
import { formatDateTime, STATUS_LABELS } from "./csvExport.js";

const COLUMNS = [
  { key: "code", header: "Mã đối chiếu", width: 17 },
  { key: "name", header: "Họ tên", width: 26 },
  { key: "phone", header: "Số điện thoại", width: 15 },
  { key: "amount", header: "Số tiền (đồng)", width: 16 },
  { key: "note", header: "Lời nhắn", width: 30 },
  { key: "status", header: "Trạng thái", width: 14 },
  { key: "submitted_at", header: "Thời gian gửi", width: 17 },
  { key: "confirmed_at", header: "Thời gian xác nhận", width: 18 },
];

const THIN_BORDER = {
  top: { style: "thin", color: { argb: "FFB8B2A3" } },
  bottom: { style: "thin", color: { argb: "FFB8B2A3" } },
  left: { style: "thin", color: { argb: "FFB8B2A3" } },
  right: { style: "thin", color: { argb: "FFB8B2A3" } },
};

export async function contributionsToXlsx(rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Đóng góp K7301", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = COLUMNS.map(({ key, header, width }) => ({ key, header, width }));

  const headerRow = sheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF172554" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = THIN_BORDER;
  });

  for (const row of rows) {
    const added = sheet.addRow({
      ...row,
      status: STATUS_LABELS[row.status] || row.status,
      submitted_at: formatDateTime(row.submitted_at),
      confirmed_at: formatDateTime(row.confirmed_at),
    });
    added.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = THIN_BORDER;
      cell.alignment = { vertical: "middle" };
    });
    added.getCell("amount").numFmt = "#,##0";
    added.getCell("amount").alignment = { vertical: "middle", horizontal: "right" };
  }

  return workbook.xlsx.writeBuffer();
}
