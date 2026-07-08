export function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}

export function formatPhone(value) {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
}

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function normalizeAmount(value) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}
