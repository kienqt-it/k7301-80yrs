import { stringify } from "csv-stringify/sync";

const COLUMNS = [
  { key: "code", header: "Mã đối chiếu" },
  { key: "name", header: "Họ tên" },
  { key: "phone", header: "Số điện thoại" },
  { key: "amount", header: "Số tiền" },
  { key: "note", header: "Lời nhắn" },
  { key: "submitted_at", header: "Thời gian gửi" },
  { key: "confirmed_at", header: "Thời gian xác nhận" },
];

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function contributionsToCsv(rows) {
  const formattedRows = rows.map((row) => ({
    ...row,
    submitted_at: formatDateTime(row.submitted_at),
    confirmed_at: formatDateTime(row.confirmed_at),
  }));

  const csvBody = stringify(formattedRows, {
    header: true,
    columns: COLUMNS,
  });
  // Thêm BOM để Excel mở file nhận đúng encoding UTF-8 (không bị lỗi dấu tiếng Việt)
  return "﻿" + csvBody;
}
