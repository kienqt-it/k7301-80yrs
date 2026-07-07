import { stringify } from "csv-stringify/sync";

export const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  rejected: "Từ chối",
};

const COLUMNS = [
  { key: "code", header: "Mã đối chiếu" },
  { key: "name", header: "Họ tên" },
  { key: "phone", header: "Số điện thoại" },
  { key: "amount", header: "Số tiền" },
  { key: "note", header: "Lời nhắn" },
  { key: "status", header: "Trạng thái" },
  { key: "submitted_at", header: "Thời gian gửi" },
  { key: "confirmed_at", header: "Thời gian xác nhận" },
];

const VIETNAM_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateTime(value) {
  if (!value) return "";
  const parts = VIETNAM_TIME_FORMATTER.formatToParts(new Date(value)).reduce(
    (acc, part) => ({ ...acc, [part.type]: part.value }),
    {},
  );
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}

export function contributionsToCsv(rows) {
  const formattedRows = rows.map((row) => ({
    ...row,
    status: STATUS_LABELS[row.status] || row.status,
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
